"""Razorpay test-mode webhook ingestion tests.

Run: backend\\venv\\Scripts\\python -m pytest test_webhook.py -v

Tests use a TEST webhook secret and redirect the audit + webhook
idempotency stores into a temporary directory so the real production
``audit_logs.json`` is never touched by this suite.
"""

import json

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import audit as audit_module
from app.services import razorpay_webhook as rz
from app.services import webhook_events

TEST_SECRET = "mandate_doctor_test_webhook_secret_123"


@pytest.fixture()
def isolated(tmp_path, monkeypatch):
    """Redirect stores to tmp_path and set a TEST webhook secret."""
    monkeypatch.setenv("RAZORPAY_WEBHOOK_SECRET", TEST_SECRET)

    audit_file = tmp_path / "audit_logs.json"
    events_file = tmp_path / "webhook_events.json"

    original_audit = audit_module.AUDIT_FILE
    original_events = webhook_events.WEBHOOK_EVENTS_FILE

    audit_module.configure_audit_file(audit_file)
    webhook_events.configure_store(events_file)

    yield {
        "secret": TEST_SECRET,
        "audit_file": audit_file,
        "events_file": events_file,
    }

    audit_module.configure_audit_file(original_audit)
    webhook_events.configure_store(original_events)


def make_payment_failed_payload(
    payment_id="pay_webhook_test_0001",
    amount=1499,
    error_reason=None,
    error_description=None,
    error_code=None,
    subscription_status=None,
    event="payment.failed",
):
    entity = {
        "id": payment_id,
        "entity": "payment",
        "amount": amount,
        "currency": "INR",
        "status": "failed",
        "method": "emandate",
        "error_code": error_code,
        "error_description": error_description,
        "error_reason": error_reason,
        "notes": {},
    }

    payload = {
        "entity": "event",
        "account_id": "acc_webhook_test",
        "event": event,
        "contains": ["payment"],
        "payload": {"payment": {"entity": entity}},
        "created_at": 1760000000,
    }

    if subscription_status is not None:
        payload["payload"]["subscription"] = {
            "entity": {"id": "sub_webhook_test", "status": subscription_status}
        }

    return payload


def post_webhook(client, payload, secret, signature=None, raw=None):
    body = raw if raw is not None else json.dumps(payload).encode("utf-8")
    sig = signature if signature is not None else rz.compute_webhook_signature(
        body, secret
    )
    return client.post(
        "/api/webhooks/razorpay",
        content=body,
        headers={"X-Razorpay-Signature": sig},
    )


def load_records(path):
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def _client():
    return TestClient(app)


def test_valid_payment_failed_accepted_and_audited(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        payment_id="pay_wh_valid_0001",
        amount=1499,
        error_reason="insufficient balance",
    )

    response = post_webhook(client, payload, isolated["secret"])

    assert response.status_code == 200
    body = response.json()
    assert body["received"] is True
    assert body["processed"] is True
    assert body["event"] == "payment.failed"
    assert body["payment_id"] == "pay_wh_valid_0001"
    assert body["decision"] == "APPROVE"
    assert body["action_status"] == "EXECUTED"
    assert body["audit_id"]

    records = [
        r for r in load_records(isolated["audit_file"])
        if r["payment_id"] == "pay_wh_valid_0001"
    ]
    assert len(records) == 1
    assert records[0]["final_decision"] == "APPROVE"


def test_duplicate_event_processed_once(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        payment_id="pay_wh_dup_0001",
        amount=499,
        error_reason="insufficient balance",
    )

    first = post_webhook(client, payload, isolated["secret"])
    assert first.status_code == 200
    assert first.json()["processed"] is True

    second = post_webhook(client, payload, isolated["secret"])
    assert second.status_code == 200
    duplicate = second.json()
    assert duplicate["processed"] is False
    assert duplicate["duplicate"] is True
    assert duplicate["event"] == "payment.failed"
    assert duplicate["payment_id"] == "pay_wh_dup_0001"

    records = [
        r for r in load_records(isolated["audit_file"])
        if r["payment_id"] == "pay_wh_dup_0001"
    ]
    assert len(records) == 1


def test_invalid_signature_rejected_no_pipeline(isolated):
    client = _client()
    payload = make_payment_failed_payload(payment_id="pay_wh_badsig_0001")

    response = post_webhook(
        client,
        payload,
        isolated["secret"],
        signature="f" * 64,
    )

    assert response.status_code == 400
    assert response.json()["reason"] == "invalid_signature"

    assert load_records(isolated["audit_file"]) == []
    assert not load_records(isolated["events_file"])


def test_missing_signature_rejected(isolated):
    client = _client()
    payload = make_payment_failed_payload(payment_id="pay_wh_nosig_0001")

    response = post_webhook(client, payload, isolated["secret"], signature="")

    assert response.status_code == 400
    assert response.json()["reason"] == "missing_signature"
    assert load_records(isolated["audit_file"]) == []


def test_unsupported_event_not_processed(isolated):
    client = _client()
    payload = make_payment_failed_payload(event="payment.authorized")

    response = post_webhook(client, payload, isolated["secret"])

    assert response.status_code == 200
    body = response.json()
    assert body["received"] is True
    assert body["processed"] is False
    assert body["reason"] == "unsupported_event"
    assert body["event"] == "payment.authorized"
    assert load_records(isolated["audit_file"]) == []


def test_malformed_json_rejected_cleanly(isolated):
    client = _client()
    raw = b"{ this is not valid json "

    response = post_webhook(client, None, isolated["secret"], raw=raw)

    assert response.status_code == 400
    assert response.json()["reason"] == "malformed_payload"
    assert load_records(isolated["audit_file"]) == []


def test_signature_does_not_match_reserialized_body(isolated):
    """Signature must be verified against raw bytes, not re-serialized JSON."""
    client = _client()
    payload = make_payment_failed_payload(payment_id="pay_wh_serial_0001")

    raw_body = json.dumps(payload, indent=4).encode("utf-8")
    different_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    signature = rz.compute_webhook_signature(raw_body, isolated["secret"])

    response = client.post(
        "/api/webhooks/razorpay",
        content=different_bytes,
        headers={"X-Razorpay-Signature": signature},
    )

    assert response.status_code == 400
    assert response.json()["reason"] == "invalid_signature"
    assert load_records(isolated["audit_file"]) == []


def test_paise_to_inr_conversion_exact():
    assert rz._paise_to_inr(100) == 1.0
    assert rz._paise_to_inr(1499) == 14.99
    assert rz._paise_to_inr(999) == 9.99
    assert rz._paise_to_inr(1) == 0.01
    assert rz._paise_to_inr(0) == 0.0
    assert rz._paise_to_inr(10000000) == 100000.0


def test_webhook_amount_converts_correctly(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        payment_id="pay_wh_amount_0001",
        amount=1499,
        error_reason="insufficient balance",
    )

    response = post_webhook(client, payload, isolated["secret"])
    assert response.status_code == 200
    assert response.json()["processed"] is True

    records = load_records(isolated["audit_file"])
    record = next(r for r in records if r["payment_id"] == "pay_wh_amount_0001")
    assert record["policy"]["reason"] == "Recovery action 'RETRY_LATER' is within policy."


def test_policy_first_block_preserved(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        payment_id="pay_wh_block_0001",
        amount=999,
        error_reason="mandate revoked",
        subscription_status="revoked",
    )

    response = post_webhook(client, payload, isolated["secret"])

    body = response.json()
    assert body["processed"] is True
    assert body["decision"] == "BLOCK"
    assert body["action_status"] == "SKIPPED"

    records = load_records(isolated["audit_file"])
    record = next(r for r in records if r["payment_id"] == "pay_wh_block_0001")
    assert record["policy"]["decision"] == "BLOCK"
    assert record["action"]["status"] == "SKIPPED"


def test_normalization_mapping_documented_defaults():
    payload = make_payment_failed_payload(
        payment_id="pay_wh_norm_0001",
        amount=499,
        error_reason="insufficient balance",
        subscription_status="active",
    )

    normalized = rz.normalize_razorpay_event(payload)

    assert normalized == {
        "payment_id": "pay_wh_norm_0001",
        "amount_inr": 4.99,
        "failure_code": "insufficient_balance",
        "mandate_status": "active",
        "attempt_number": 1,
        "previous_successes": 0,
        "previous_failures": 0,
    }


def test_unmapped_error_escalates_not_guesses(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        payment_id="pay_wh_unknown_0001",
        amount=499,
        error_code="NACH_A999",
        error_reason="mysterious signal",
    )

    response = post_webhook(client, payload, isolated["secret"])

    body = response.json()
    assert body["processed"] is True
    # Unmapped failures are NOT guessed: existing engine classifies them
    # UNKNOWN (recoverable=None) and the policy layer hard-blocks them.
    assert body["decision"] == "BLOCK"
    assert body["action_status"] == "SKIPPED"


def test_subscription_charged_failed_supported(isolated):
    client = _client()
    payload = make_payment_failed_payload(
        event="subscription.charged.failed",
        payment_id="pay_wh_sub_0001",
        amount=2999,
        error_reason="insufficient balance",
        subscription_status="active",
    )

    response = post_webhook(client, payload, isolated["secret"])

    body = response.json()
    assert body["processed"] is True
    assert body["event"] == "subscription.charged.failed"
    assert body["payment_id"] == "pay_wh_sub_0001"
    assert body["decision"] == "APPROVE"
    assert body["audit_id"]
    assert len(load_records(isolated["audit_file"])) == 1


def test_missing_secret_returns_not_configured(monkeypatch, tmp_path):
    monkeypatch.delenv("RAZORPAY_WEBHOOK_SECRET", raising=False)

    audit_file = tmp_path / "audit_logs.json"
    events_file = tmp_path / "webhook_events.json"
    original_audit = audit_module.AUDIT_FILE
    original_events = webhook_events.WEBHOOK_EVENTS_FILE

    audit_module.configure_audit_file(audit_file)
    webhook_events.configure_store(events_file)

    try:
        client = _client()
        payload = make_payment_failed_payload()
        response = post_webhook(
            client, payload, "any_secret_when_unconfigured"
        )
        assert response.status_code == 500
        assert response.json()["reason"] == "server_not_configured"
        assert not audit_file.exists()
    finally:
        audit_module.configure_audit_file(original_audit)
        webhook_events.configure_store(original_events)