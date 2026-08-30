"""Focused tests for the LLM-assisted proposal layer.

Run: backend\\venv\\Scripts\\python -m pytest test_llm_proposal.py -v

The LLM is an *added proposal/reasoning capability* only:
- it must return STRICT structured output or the pipeline falls back to the
  existing deterministic proposal;
- any timeout / API error / rate limit / invalid output falls back too;
- it can never override a policy BLOCK, never execute an action directly,
  never expose the API key to the frontend;
- the evaluation harness stays deterministic and needs no API key.
"""

import json
from pathlib import Path

import httpx
import pytest

from app.main import app
from app.services import audit as audit_service
from app.services import settings as settings_service
from app.services import llm_provider
from app.services import recovery_engine
from app.services.recovery_agent import generate_proposal
from app.services.recovery_engine import make_recovery_decision

BACKEND_DIR = Path(__file__).resolve().parent
REPO_ROOT = BACKEND_DIR.parent

VALID_RETRY_JSON = json.dumps({
    "proposed_action": "RETRY_LATER",
    "reason": "Temporary bank timeout; a 12h cooling-off retry is the safest "
              "next intervention.",
    "confidence": 0.87,
    "customer_message": "We'll retry this payment shortly. No action needed.",
    "retry_after_hours": 12,
})

VALID_FRESH_MANDATE_JSON = json.dumps({
    "proposed_action": "REQUEST_FRESH_MANDATE",
    "reason": "The mandate is no longer usable; request a fresh mandate.",
    "confidence": 0.95,
    "customer_message": "Please re-authorize the mandate to continue.",
})


def _payment(
    payment_id="pay_llm_0001",
    amount_inr=499,
    failure_code="bank_timeout",
    mandate_status="active",
    attempt_number=1,
):
    return {
        "payment_id": payment_id,
        "amount_inr": amount_inr,
        "failure_code": failure_code,
        "mandate_status": mandate_status,
        "attempt_number": attempt_number,
        "previous_successes": 0,
        "previous_failures": 0,
    }


@pytest.fixture()
def isolated(tmp_path, monkeypatch):
    """Point settings + audit persistence at temp files and enable the LLM
    path (a fake API key + a stubbed network call)."""
    settings_path = tmp_path / "settings.json"
    audit_path = tmp_path / "audit_logs.json"

    monkeypatch.setattr(settings_service, "SETTINGS_FILE", settings_path)
    monkeypatch.setattr(audit_service, "AUDIT_FILE", audit_path)
    monkeypatch.setenv("AI_PROPOSAL_ENABLED", "true")
    settings_service.save_settings(dict(settings_service.DEFAULTS))

    return {"settings_path": settings_path, "audit_path": audit_path}


@pytest.fixture()
def llm_enabled(isolated, monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    return monkeypatch


def _stub(monkeypatch, content):
    monkeypatch.setattr(
        llm_provider,
        "_call_chat_completion",
        lambda **kwargs: content,
    )


# --- 1. valid LLM structured proposal --------------------------------------


def test_valid_llm_proposal_is_structured(llm_enabled, monkeypatch):
    _stub(monkeypatch, VALID_RETRY_JSON)

    diagnosis = {
        "root_cause": "BANK_TIMEOUT",
        "diagnosis": "Temporary bank or network timeout.",
        "confidence": 0.95,
        "recoverable": True,
        "recommended_action": "RETRY_LATER",
        "reason": "Temporary failures may succeed after a cooling-off period.",
    }

    proposal = generate_proposal(_payment(), diagnosis, use_llm=True)

    assert proposal["proposal_source"] == "llm"
    assert proposal["action"] == "RETRY_LATER"
    assert proposal["retry_after_hours"] == 12
    assert 0.0 <= proposal["confidence"] <= 1.0
    assert "customer_message" in proposal
    assert isinstance(proposal["proposal"], str) and proposal["proposal"].strip()


def test_parser_tolerates_markdown_fence_and_rejects_bad_fields():
    fenced = f"```json\n{VALID_RETRY_JSON}\n```"
    assert llm_provider.parse_structured_output(fenced)["action"] == "RETRY_LATER"

    assert llm_provider.parse_structured_output("not json") is None
    bad_action = {"proposed_action": "CHARGE_NOW", "reason": "x", "confidence": 0.5}
    assert llm_provider.parse_structured_output(json.dumps(bad_action)) is None
    no_reason = {"proposed_action": "RETRY_LATER", "confidence": 0.5}
    assert llm_provider.parse_structured_output(json.dumps(no_reason)) is None
    bad_confidence = {"proposed_action": "RETRY_LATER", "reason": "x", "confidence": 4.0}
    assert llm_provider.parse_structured_output(json.dumps(bad_confidence)) is None
    missing_fields = {"reason": "x", "confidence": 0.5}
    assert llm_provider.parse_structured_output(json.dumps(missing_fields)) is None


# --- 2. invalid LLM output -> deterministic fallback -------------------------


def test_invalid_llm_output_falls_back_to_deterministic(llm_enabled, monkeypatch):
    _stub(monkeypatch, '{"proposed_action": "THIS_IS_NOT_VALID"}')

    payment = _payment(failure_code="bank_timeout")
    diagnosis = {"root_cause": "BANK_TIMEOUT"}

    proposal = generate_proposal(payment, diagnosis, use_llm=True)

    assert proposal["proposal_source"] == "deterministic_fallback"
    assert proposal["action"] == "RETRY_LATER"
    assert proposal["retry_after_hours"] == 12
    assert proposal["confidence"] == 0.91


def test_prose_response_falls_back_to_deterministic(llm_enabled, monkeypatch):
    _stub(monkeypatch, "I think we should retry the payment.")

    proposal = generate_proposal(
        _payment(), {"root_cause": "BALANCE"}, use_llm=True
    )

    assert proposal["proposal_source"] == "deterministic_fallback"
    assert proposal["action"] == "RETRY_LATER"


# --- 3. LLM timeout / API failure -> deterministic fallback -------------------


def test_llm_timeout_falls_back_to_deterministic(llm_enabled, monkeypatch):
    def _timeout(**kwargs):
        raise httpx.TimeoutException("provider timed out", request=kwargs.get("mock_req"))

    monkeypatch.setattr(llm_provider, "_call_chat_completion", _timeout)

    proposal = generate_proposal(
        _payment(), {"root_cause": "BANK_TIMEOUT"}, use_llm=True
    )

    assert proposal["proposal_source"] == "deterministic_fallback"
    assert proposal["action"] == "RETRY_LATER"


def test_llm_rate_limit_or_http_error_falls_back(llm_enabled, monkeypatch):
    def _rate_limit(**kwargs):
        raise httpx.HTTPStatusError(
            "429 rate limited", request=httpx.Request("POST", "http://x"), response=httpx.Response(429)
        )

    monkeypatch.setattr(llm_provider, "_call_chat_completion", _rate_limit)

    assert llm_provider.request_llm_proposal(_payment(), {"root_cause": "BALANCE"}) is None

    proposal = generate_proposal(_payment(), {"root_cause": "LIMIT_EXCEEDED"}, use_llm=True)
    assert proposal["proposal_source"] == "deterministic_fallback"
    assert proposal["action"] == "RETRY_LATER"


def test_llm_disabled_never_calls_network(isolated, monkeypatch):
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    called = {"count": 0}

    def _boom(**kwargs):
        called["count"] += 1
        raise AssertionError("network must not be called when disabled")

    monkeypatch.setattr(llm_provider, "_call_chat_completion", _boom)

    assert llm_provider.is_enabled() is False
    assert llm_provider.request_llm_proposal(_payment(), {"root_cause": "BALANCE"}) is None
    assert called["count"] == 0


# --- 4. LLM cannot override policy BLOCK -------------------------------------


def test_llm_cannot_override_policy_block(llm_enabled, monkeypatch):
    _stub(monkeypatch, VALID_RETRY_JSON)

    payment = _payment(failure_code="mandate_revoked", mandate_status="revoked")

    result = make_recovery_decision(payment, audit=False, use_llm=True)

    # The LLM genuinely proposed RETRY_LATER ...
    assert result["ai_proposal"]["proposal_source"] == "llm"
    assert result["ai_proposal"]["action"] == "RETRY_LATER"
    # ... but the deterministic policy engine decides: BLOCK, nothing executes.
    assert result["final_decision"] == "BLOCK"
    assert result["action"]["status"] == "SKIPPED"
    assert result["action"]["executed_at"] is None


def test_llm_cannot_override_kill_switch(llm_enabled, monkeypatch, isolated):
    _stub(monkeypatch, VALID_RETRY_JSON)
    settings_service.save_settings({**settings_service.DEFAULTS, "kill_switch": True})

    result = make_recovery_decision(_payment(), audit=False, use_llm=True)

    assert result["ai_proposal"]["proposal_source"] == "llm"
    assert result["final_decision"] == "BLOCK"
    assert result["action"]["status"] == "SKIPPED"


# --- 5. LLM cannot directly execute an action --------------------------------


def test_llm_module_has_no_execution_privileges():
    source = (BACKEND_DIR / "app" / "services" / "llm_provider.py").read_text(
        encoding="utf-8"
    )
    # The LLM adapter cannot reference or import anything that would let it
    # execute an action or touch payment/Razorpay APIs.
    assert "execute_action" not in source
    assert "action_layer" not in source
    for line in source.splitlines():
        stripped = line.strip()
        if stripped.startswith(("import ", "from ")):
            assert "razorpay" not in stripped, stripped


def test_execution_happens_only_through_action_layer(llm_enabled, monkeypatch):
    _stub(monkeypatch, VALID_FRESH_MANDATE_JSON)

    calls = []
    original = recovery_engine.execute_action

    def spy(payment_id, proposed_action, policy_decision, recovery_info=None):
        calls.append((proposed_action, policy_decision))
        return original(payment_id, proposed_action, policy_decision, recovery_info)

    monkeypatch.setattr(recovery_engine, "execute_action", spy)

    approved = make_recovery_decision(
        _payment(failure_code="bank_timeout"), audit=False, use_llm=True
    )
    assert approved["final_decision"] == "APPROVE"
    assert approved["action"]["status"] == "EXECUTED"
    assert approved["action"]["simulated"] is True
    assert calls == [("REQUEST_FRESH_MANDATE", "APPROVE")]

    calls.clear()
    blocked = make_recovery_decision(
        _payment(failure_code="mandate_expired", mandate_status="expired"),
        audit=False,
        use_llm=True,
    )
    assert blocked["final_decision"] == "BLOCK"
    assert blocked["action"]["status"] == "SKIPPED"
    assert calls == [("REQUEST_FRESH_MANDATE", "BLOCK")]


# --- 6. API key not exposed to frontend -------------------------------------


def test_api_key_not_exposed_to_frontend():
    frontend_src = REPO_ROOT / "frontend" / "src"
    assert frontend_src.is_dir()

    offenders = []
    for path in frontend_src.rglob("*"):
        if not path.is_file():
            continue
        if not path.suffix.lower() in {".ts", ".tsx", ".js", ".jsx", ".html", ".css"}:
            continue
        content = path.read_text(encoding="utf-8", errors="ignore")
        if "LLM_API_KEY" in content:
            offenders.append(str(path))

    assert offenders == [], f"LLM_API_KEY leaked into frontend: {offenders}"


def test_env_example_contains_only_placeholders():
    env_example = (REPO_ROOT / ".env.example").read_text(encoding="utf-8")
    assert "LLM_API_KEY=" in env_example
    for line in env_example.splitlines():
        key = line.split("=", 1)[0].strip()
        if key == "LLM_API_KEY":
            assert line.strip() == "LLM_API_KEY=", "LLM_API_KEY must remain empty"


def test_api_key_read_from_environment_only():
    source = (BACKEND_DIR / "app" / "services" / "llm_provider.py").read_text(
        encoding="utf-8"
    )
    assert "os.environ" in source
    assert "LLM_API_KEY" in source
    assert "sk-" not in source


# --- 7. evaluation stays deterministic, no API key required ------------------


def test_evaluation_requires_no_api_key(isolated, monkeypatch):
    from app.services.evaluation import evaluate

    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.delenv("AI_PROPOSAL_ENABLED", raising=False)

    result = evaluate()

    assert result["dataset"]["total_records"] == 300
    assert result["mandate_doctor"]["expected_recovery"] == 289818.3
    assert result["policy_decisions"] == {"APPROVE": 226, "BLOCK": 74}
    assert result["policy_violations"]["count"] == 0


def test_evaluation_forced_deterministic_even_with_key(llm_enabled, monkeypatch):
    """Even with the LLM configured and the network stubbed to fail, the
    evaluation harness uses the deterministic proposal path and never calls
    the provider."""
    from app.services.evaluation import evaluate

    def _boom(**kwargs):
        raise AssertionError("evaluation must never call the LLM provider")

    monkeypatch.setattr(llm_provider, "_call_chat_completion", _boom)

    result = evaluate()

    assert result["dataset"]["total_records"] == 300
    assert result["mandate_doctor"]["expected_recovery"] == 289818.3

    payment = _payment()
    decision = make_recovery_decision(payment, audit=False, use_llm=False)
    assert decision["ai_proposal"]["proposal_source"] == "deterministic_fallback"


# --- API surface -------------------------------------------------------------


def test_recovery_decision_endpoint_works_without_llm(isolated, monkeypatch):
    """POST /api/recovery/decision returns 200 (deterministic proposal)
    when no LLM is configured — the app never 500s because the LLM is
    unavailable."""
    from fastapi.testclient import TestClient

    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.delenv("AI_PROPOSAL_ENABLED", raising=False)

    with TestClient(app) as client:
        response = client.post(
            "/api/recovery/decision",
            json={
                "payment_id": "pay_llm_api",
                "amount_inr": 499,
                "failure_code": "bank_timeout",
                "mandate_status": "active",
                "attempt_number": 1,
                "previous_successes": 0,
                "previous_failures": 0,
            },
        )

        assert response.status_code == 200
        body = response.json()
        assert body["final_decision"] == "APPROVE"
        assert body["ai_proposal"]["proposal_source"] == "deterministic_fallback"
        assert body["action"]["status"] == "EXECUTED"