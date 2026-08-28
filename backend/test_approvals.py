"""Approval Workflow tests: the /api/approvals endpoint validates payment ids,
enforces policy-first rules, reuses the existing Action Layer, and records audits.

Run: backend\\venv\\Scripts\\python -m pytest test_approvals.py -q
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.recovery_pipeline import get_recovery_cases

client = TestClient(app)


def _pick_case(predicate):
    for case in get_recovery_cases():
        if predicate(case):
            return case
    raise AssertionError("No matching recovery case found in dataset")


def test_approve_executes_action_where_policy_permits():
    # A recoverable, non-blocked case (policy APPROVE or REVIEW) -> executes in sim.
    case = _pick_case(lambda c: c["final_decision"] != "BLOCK")

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "APPROVE"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["payment_id"] == case["payment_id"]
    assert body["decision"] == "APPROVE"
    assert body["action"]["simulated"] is True
    assert body["action"]["status"] == "EXECUTED"


def test_approve_does_not_override_policy_block():
    # Policy-first: an APPROVE on a blocked case never executes the action.
    case = _pick_case(lambda c: c["final_decision"] == "BLOCK")

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "APPROVE"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["decision"] == "APPROVE"
    assert body["policy_decision"] == "BLOCK"
    assert body["action"]["status"] == "SKIPPED"
    assert body["action"]["executed_at"] is None


def test_reject_never_executes():
    # REJECT prevents execution even for a case policy would permit.
    case = _pick_case(lambda c: c["final_decision"] != "BLOCK")

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "REJECT"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["decision"] == "REJECT"
    assert body["action"]["status"] == "SKIPPED"
    assert body["action"]["executed_at"] is None


def test_invalid_payment_id_rejected():
    response = client.post(
        "/api/approvals",
        json={"payment_id": "pay_does_not_exist", "decision": "APPROVE"},
    )

    assert response.status_code == 404
    assert response.json()["detail"]


def test_invalid_decision_rejected():
    case = _pick_case(lambda c: True)

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "MAYBE"},
    )

    assert response.status_code == 400


def test_cases_expose_persisted_human_approval():
    """After a human decision, /api/cases reflects the persisted approval
    so the Approval Queue no longer treats the case as pending."""
    case = _pick_case(lambda c: c["final_decision"] == "BLOCK")

    response = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "REJECT"},
    )
    assert response.status_code == 200

    cases = client.get("/api/cases").json()["cases"]
    refreshed = next(c for c in cases if c["payment_id"] == case["payment_id"])

    human_approval = refreshed["human_approval"]
    assert human_approval is not None
    assert human_approval["event"] == "HUMAN_APPROVAL"
    assert human_approval["decision"] == "REJECT"


def test_latest_human_approval_record_wins():
    """When duplicate approval records exist, the latest decision is what
    the pending queue derives from."""
    case = _pick_case(lambda c: c["final_decision"] == "BLOCK")

    first = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "APPROVE"},
    )
    assert first.status_code == 200

    after_first = client.get("/api/cases").json()["cases"]
    human_approval = next(
        c for c in after_first if c["payment_id"] == case["payment_id"]
    )["human_approval"]
    assert human_approval["decision"] == "APPROVE"

    second = client.post(
        "/api/approvals",
        json={"payment_id": case["payment_id"], "decision": "REJECT"},
    )
    assert second.status_code == 200

    after_second = client.get("/api/cases").json()["cases"]
    human_approval = next(
        c for c in after_second if c["payment_id"] == case["payment_id"]
    )["human_approval"]
    assert human_approval["decision"] == "REJECT"
