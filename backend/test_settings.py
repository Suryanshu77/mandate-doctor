"""Settings integration tests.

Covers persistence + the policy-settings API, and the effect of persisted
settings on the policy engine / recovery pipeline.
"""

import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import settings as settings_service
from app.services import audit as audit_service
from app.services.policy_engine import evaluate_policy
from app.services.recovery_engine import make_recovery_decision


@pytest.fixture()
def isolated_settings(tmp_path, monkeypatch):
    """Redirect settings persistence to a temp file for each test."""
    file_path = tmp_path / "settings.json"
    monkeypatch.setattr(settings_service, "SETTINGS_FILE", file_path)
    monkeypatch.setattr(
        audit_service, "AUDIT_FILE", tmp_path / "audit_logs.json"
    )
    yield file_path
    if file_path.exists():
        file_path.unlink()


@pytest.fixture()
def client(isolated_settings):
    return TestClient(app)


def _set(settings_dict):
    settings_service.save_settings(settings_dict)


def _defaults():
    return dict(settings_service.DEFAULTS)


# --- persistence ---


def test_get_default_settings(client):
    response = client.get("/api/settings")

    assert response.status_code == 200
    body = response.json()
    for key, value in _defaults().items():
        assert body[key] == value


def test_put_valid_settings(client):
    payload = {
        "retry_limit": 5,
        "cooling_off_hours": 24,
        "human_approval_threshold": 50000,
        "max_contact_attempts": 4,
        "kill_switch": False,
    }

    response = client.put("/api/settings", json=payload)

    assert response.status_code == 200
    assert response.json() == payload


def test_put_invalid_settings_rejected(client):
    invalid_payloads = [
        {"retry_limit": 0, "cooling_off_hours": 12, "human_approval_threshold": 75000, "max_contact_attempts": 2, "kill_switch": False},
        {"retry_limit": 3, "cooling_off_hours": -1, "human_approval_threshold": 75000, "max_contact_attempts": 2, "kill_switch": False},
        {"retry_limit": 3, "cooling_off_hours": 12, "human_approval_threshold": -5, "max_contact_attempts": 2, "kill_switch": False},
        {"retry_limit": 3, "cooling_off_hours": 12, "human_approval_threshold": 75000, "max_contact_attempts": -1, "kill_switch": False},
        {"retry_limit": 3, "cooling_off_hours": 12, "human_approval_threshold": 75000, "max_contact_attempts": 2, "kill_switch": "yes"},
        {"retry_limit": "many", "cooling_off_hours": 12, "human_approval_threshold": 75000, "max_contact_attempts": 2, "kill_switch": False},
    ]

    for payload in invalid_payloads:
        response = client.put("/api/settings", json=payload)
        assert response.status_code == 400


def test_settings_persist_across_separate_calls(client):
    payload = {
        "retry_limit": 7,
        "cooling_off_hours": 48,
        "human_approval_threshold": 25000,
        "max_contact_attempts": 6,
        "kill_switch": True,
    }

    put_response = client.put("/api/settings", json=payload)
    assert put_response.status_code == 200

    get_response = client.get("/api/settings")
    assert get_response.status_code == 200
    assert get_response.json() == payload

    # And directly via the service (separate function call).
    assert settings_service.get_settings() == payload


# --- policy behaviour ---


def _recoverable_payment(amount=499, attempt=1, failure="bank_timeout"):
    return {
        "payment_id": "pay_settings_test",
        "amount_inr": amount,
        "failure_code": failure,
        "mandate_status": "active",
        "attempt_number": attempt,
        "previous_successes": 1,
        "previous_failures": 1,
    }


def test_threshold_affects_policy_decision(isolated_settings):
    _set(_defaults())

    low = evaluate_policy(amount_inr=80000, diagnosis={"root_cause": "BANK_TIMEOUT", "recoverable": True}, attempt_number=1)
    assert low["decision"] == "REVIEW"
    assert low["requires_human_approval"] is True

    _set({**_defaults(), "human_approval_threshold": 150000})

    high = evaluate_policy(amount_inr=80000, diagnosis={"root_cause": "BANK_TIMEOUT", "recoverable": True}, attempt_number=1)
    assert high["decision"] == "APPROVE"


def test_kill_switch_blocks_recovery(isolated_settings):
    _set({**_defaults(), "kill_switch": True})

    result = make_recovery_decision(_recoverable_payment(amount=1000, attempt=1))

    assert result["final_decision"] == "BLOCK"
    assert "kill switch" in result["policy"]["reason"]
    assert result["action"]["status"] == "SKIPPED"
    assert result["action"]["executed_at"] is None


def test_kill_switch_off_allows_recovery(isolated_settings):
    _set(_defaults())

    result = make_recovery_decision(_recoverable_payment(amount=1000, attempt=1))

    assert result["final_decision"] == "APPROVE"
    assert result["action"]["status"] == "EXECUTED"


def test_retry_limit_affects_policy(isolated_settings):
    _set({**_defaults(), "retry_limit": 3})

    # attempt_number starts at 1 for the initial attempt: with a retry limit
    # of 3, attempts 1-4 are allowed and attempt 5+ is blocked.
    within = evaluate_policy(
        amount_inr=1000,
        diagnosis={"root_cause": "BANK_TIMEOUT", "recoverable": True},
        attempt_number=4,
    )
    assert within["decision"] == "APPROVE"

    over = evaluate_policy(
        amount_inr=1000,
        diagnosis={"root_cause": "BANK_TIMEOUT", "recoverable": True},
        attempt_number=5,
    )
    assert over["decision"] == "BLOCK"
    assert "retry limit" in over["reason"]


def test_retry_limit_enforced_through_pipeline(isolated_settings):
    _set({**_defaults(), "retry_limit": 2})

    # With a retry limit of 2, attempts 1-3 are allowed; attempt 4 is blocked.
    result = make_recovery_decision(_recoverable_payment(amount=1000, attempt=4))

    assert result["final_decision"] == "BLOCK"
    assert result["action"]["status"] == "SKIPPED"


def test_default_retry_limit_preserves_baseline(isolated_settings):
    """Default settings must not alter the established baseline: the dataset's
    maximum attempt_number is 4, which a retry limit of 3 must still allow."""
    _set(_defaults())

    # Dataset max attempt number (4) must remain within the default retry limit.
    result = make_recovery_decision(_recoverable_payment(amount=1000, attempt=4))

    assert result["final_decision"] == "APPROVE"
    assert result["action"]["status"] == "EXECUTED"
