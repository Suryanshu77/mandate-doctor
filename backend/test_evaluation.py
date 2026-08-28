"""Evaluation harness tests.

Covers deterministic evaluation, the two labelled comparisons (raw unrestricted
naive and defensible mechanical naive), safe/recoverable-subset efficiency,
uncollectable-case identification, zero policy violations, unsafe-retry and
policy-violation avoidance, repeated-run stability, and the guarantee that
evaluation never writes audit records.

Run: backend\\venv\\Scripts\\python -m pytest test_evaluation.py -q
"""

import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import audit as audit_service
from app.services import settings as settings_service
from app.services.dataset import load_failed_mandates
from app.services.evaluation import evaluate, naive_expected_recovery
from app.services.recovery_engine import make_recovery_decision


@pytest.fixture()
def isolated_env(tmp_path, monkeypatch):
    """Redirect settings + audit persistence to temp files and reset to
    project defaults so evaluation behaves deterministically regardless of
    the developer's current configuration."""
    settings_path = tmp_path / "settings.json"
    audit_path = tmp_path / "audit_logs.json"

    monkeypatch.setattr(settings_service, "SETTINGS_FILE", settings_path)
    monkeypatch.setattr(audit_service, "AUDIT_FILE", audit_path)

    settings_service.save_settings(dict(settings_service.DEFAULTS))
    return {"settings_path": settings_path, "audit_path": audit_path}


@pytest.fixture()
def client(isolated_env):
    return TestClient(app)


def _baseline_metrics(result):
    return result["mandate_doctor"], result["naive_baseline"], result["dataset"]


# --- known baseline ---------------------------------------------------------


def test_evaluation_matches_known_baseline(isolated_env):
    result = evaluate()
    doctor, naive, dataset = _baseline_metrics(result)

    assert dataset["total_records"] == 300
    assert dataset["revenue_at_risk"] == 692500.0
    assert doctor["expected_recovery"] == 289818.3
    assert doctor["expected_recovery_rate"] == 41.85

    assert result["policy_decisions"] == {"APPROVE": 226, "BLOCK": 74}
    assert doctor["recoverable_cases"] == 226
    assert doctor["action_distribution"] == {"EXECUTED": 226, "SKIPPED": 74}
    assert result["diagnosis_accuracy"] == 100.0


# --- deterministic / reproducibility ---------------------------------------


def test_evaluation_is_deterministic(isolated_env):
    first = evaluate()
    second = evaluate()

    assert json.dumps(first, sort_keys=True) == json.dumps(second, sort_keys=True)
    assert first["reproducibility_digest"] == second["reproducibility_digest"]


def test_repeated_evaluation_identical_metrics(isolated_env):
    results = [evaluate() for _ in range(3)]

    signatures = [
        json.dumps(result, sort_keys=True)
        for result in results
    ]

    assert len(set(signatures)) == 1


# --- naive baseline (mechanical / defensible) -----------------------------------


def test_naive_mechanical_baseline_equals_doctor(isolated_env):
    """A mechanically honest retry loop can only debit valid (active) mandates,
    so its expected recovery equals Mandate Doctor's: the only value the
    unrestricted baseline adds is EXPIRED re-onboarding that a retry loop
    cannot realise. Uplift is exactly 0 — a parity result, not a fabricated
    positive number."""
    result = evaluate()
    doctor, naive, _ = _baseline_metrics(result)

    assert naive["expected_recovery"] == doctor["expected_recovery"] == 289818.3
    assert naive["expected_recovery_rate"] == 41.85


def test_naive_baseline_deterministic_per_record(isolated_env):
    values = [naive_expected_recovery(record) for record in load_failed_mandates()]
    assert values == [naive_expected_recovery(record) for record in load_failed_mandates()]

    active = next(r for r in load_failed_mandates() if r["mandate_status"] == "active")
    amount = float(active["amount_inr"])
    probability = {
        "BANK_TIMEOUT": 0.75,
        "BALANCE": 0.55,
        "LIMIT_EXCEEDED": 0.40,
        "EXPIRED_MANDATE": 0.20,
        "REVOKED": 0.00,
        "UNKNOWN": 0.10,
    }[active["root_cause"]]

    assert naive_expected_recovery(active) == round(amount * probability, 2)


def test_naive_cannot_debit_invalid_mandates(isolated_env):
    """Expired and revoked mandates are not debitable; a blind retry loop gets
    nothing from them (no re-onboarding outreach, no valid mandate)."""
    records = load_failed_mandates()

    for record in records:
        if record["mandate_status"] in ("expired", "revoked"):
            assert naive_expected_recovery(record) == 0.0


def test_unrestricted_naive_kept_transparent(isolated_env):
    """The raw comparison is kept so the negative number is not hidden. It is
    labelled as unrestricted and credits the naive with MD's re-onboarding."""
    result = evaluate()
    unrestricted = result["unrestricted_naive"]

    assert unrestricted["expected_recovery"] == 313989.5
    assert unrestricted["expected_recovery_rate"] == 45.34


# --- comparisons ---------------------------------------------------------------


def test_defensible_comparison_is_parity(isolated_env):
    result = evaluate()
    doctor, naive, _ = _baseline_metrics(result)
    comparison = result["comparison"]

    assert comparison["absolute_recovery_improvement"] == 0.0
    assert comparison["recovery_rate_improvement_points"] == 0.0
    assert comparison["uplift_percentage_relative_to_naive"] == 0.0
    assert "valid (active)" in comparison["type"]


def test_raw_comparison_is_negative_and_honest(isolated_env):
    result = evaluate()
    raw = result["comparison_raw"]

    assert raw["absolute_recovery_improvement"] == -24171.2
    assert raw["recovery_rate_improvement_points"] == -3.49
    assert raw["uplift_percentage_relative_to_naive"] == -7.70
    assert raw["caveat"]


# --- safe / recoverable subset ---------------------------------------------------


def test_safe_recoverable_subset_metrics(isolated_env):
    result = evaluate()
    safe = result["safe_recoverable"]

    assert safe["count"] == 226
    assert safe["amount_at_risk"] == 481774.0
    assert safe["mandate_doctor_expected"] == 289818.3
    assert safe["mandate_doctor_recovery_rate"] == 60.16
    assert safe["naive_expected"] == 289818.3
    assert safe["naive_recovery_rate"] == 60.16
    assert safe["recovery_difference"] == 0.0
    assert safe["recovery_rate_improvement_points"] == 0.0


def test_revenue_breakdown(isolated_env):
    result = evaluate()
    breakdown = result["revenue_breakdown"]

    assert breakdown["revenue_at_risk"] == 692500.0
    assert breakdown["safe_recoverable_revenue"] == 481774.0
    assert breakdown["uncollectable_revenue"] == 210726.0


# --- uncollectable cases ------------------------------------------------------


def test_uncollectable_cases_identified(isolated_env):
    result = evaluate()
    uncollectable = result["uncollectable_cases"]

    assert uncollectable["count"] == 74
    assert uncollectable["amount_at_risk"] == 210726.0
    assert len(uncollectable["payments"]) == 74

    payment_ids = {p["payment_id"] for p in uncollectable["payments"]}
    assert len(payment_ids) == 74

    for payment in uncollectable["payments"]:
        assert payment["root_cause"] in {"REVOKED", "EXPIRED_MANDATE"}
        assert "reason" in payment


def test_zero_recovery_probability_cases(isolated_env):
    result = evaluate()
    zero = result["zero_recovery_probability_cases"]

    assert zero["count"] == 74
    assert zero["amount_at_risk"] == 210726.0
    revoked = [p for p in zero["payments"] if p["root_cause"] == "REVOKED"]
    assert len(revoked) == 30


# --- safety / naive side effects ------------------------------------------------


def test_naive_unsafe_retries_avoided_by_mandate_doctor(isolated_env):
    result = evaluate()
    unsafe = result["unsafe_retries_avoided"]

    assert unsafe["count"] == 74
    assert unsafe["amount_at_risk"] == 210726.0
    assert unsafe["definition"]


def test_policy_violations_delta(isolated_env):
    result = evaluate()

    assert result["policy_violations"]["count"] == 0
    assert result["policy_violations"]["details"] == []
    assert result["naive_policy_violations"]["count"] == 74


def test_attainable_recovery_fully_captured(isolated_env):
    result = evaluate()

    assert result["attainable_expected_recovery"] == 289818.3
    assert result["md_share_of_attainable_percent"] == 100.0


def test_blocked_cases_never_execute_and_revoked_expired_stay_blocked(isolated_env):
    result = evaluate()

    assert result["mandate_doctor"]["action_distribution"] == {
        "EXECUTED": result["policy_decisions"]["APPROVE"],
        "SKIPPED": result["policy_decisions"]["BLOCK"],
    }
    assert result["policy_violations"]["count"] == 0


def test_kill_switch_disables_all_execution(isolated_env):
    settings_service.save_settings({**settings_service.DEFAULTS, "kill_switch": True})

    result = evaluate()

    assert result["policy_decisions"] == {"BLOCK": 300}
    assert result["mandate_doctor"]["action_distribution"] == {"SKIPPED": 300}
    assert result["policy_violations"]["count"] == 0
    assert result["uncollectable_cases"]["count"] == 300
    assert result["unsafe_retries_avoided"]["count"] == 300


def test_human_approval_cannot_override_policy_block(client, isolated_env):
    from app.services.recovery_pipeline import get_recovery_cases

    case = next(
        case for case in get_recovery_cases()
        if case["final_decision"] == "BLOCK"
    )

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "APPROVE"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["policy_decision"] == "BLOCK"
    assert body["action"]["status"] == "SKIPPED"
    assert body["action"]["executed_at"] is None


# --- audit isolation ------------------------------------------------------------


def test_evaluation_does_not_write_audit_records(isolated_env, tmp_path):
    audit_path = isolated_env["audit_path"]

    before = None
    if audit_path.exists():
        before = audit_path.read_text(encoding="utf-8")

    result = evaluate()

    after = audit_path.read_text(encoding="utf-8") if audit_path.exists() else None
    assert after == before or (before is None and after is None)

    assert result["reproducibility_digest"]


def test_audit_flag_on_make_recovery_decision(isolated_env):
    payment = {
        "payment_id": "pay_audit_flag_test",
        "amount_inr": 499,
        "failure_code": "bank_timeout",
        "mandate_status": "active",
        "attempt_number": 1,
    }

    before = audit_service.get_audit_logs()

    pure = make_recovery_decision(payment, audit=False)
    assert pure["audit_id"] is None
    assert audit_service.get_audit_logs() == before

    audited = make_recovery_decision(payment, audit=True)
    assert audited["audit_id"] is not None
    assert len(audit_service.get_audit_logs()) == len(before) + 1


# --- API endpoint ---------------------------------------------------------------


def test_evaluation_endpoint(client):
    response = client.get("/api/evaluation")

    assert response.status_code == 200
    body = response.json()

    assert body["dataset"]["total_records"] == 300
    assert body["mandate_doctor"]["expected_recovery_rate"] == 41.85
    assert body["policy_violations"]["count"] == 0
    assert body["comparison"]["absolute_recovery_improvement"] == 0.0
    assert body["comparison_raw"]["absolute_recovery_improvement"] == -24171.2
    assert body["safe_recoverable"]["amount_at_risk"] == 481774.0
    assert body["unsafe_retries_avoided"]["count"] == 74
    assert body["reproducibility_digest"]