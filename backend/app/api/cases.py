from typing import Any

from fastapi import APIRouter

from app.services.audit import get_audit_logs
from app.services.recovery_pipeline import get_recovery_cases

router = APIRouter(prefix="/api/cases", tags=["Cases"])


def _latest_human_approvals() -> dict[str, dict[str, Any]]:
    """Map payment_id to its most recent persisted HUMAN_APPROVAL record."""
    latest: dict[str, dict[str, Any]] = {}

    for record in get_audit_logs():
        if record.get("event") != "HUMAN_APPROVAL":
            continue

        payment_id = record.get("payment_id")
        if not payment_id:
            continue

        current = latest.get(payment_id)
        if current is None or record.get("timestamp", "") > current.get("timestamp", ""):
            latest[payment_id] = record

    return latest


@router.get("")
def get_cases():
    cases = get_recovery_cases()
    approvals = _latest_human_approvals()

    enriched = [
        {**case, "human_approval": approvals.get(case["payment_id"])}
        for case in cases
    ]

    return {
        "total": len(enriched),
        "cases": enriched,
    }
