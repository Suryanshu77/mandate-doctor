from datetime import datetime, timezone
from typing import Any


AUDIT_LOG: list[dict[str, Any]] = []


def log_decision(
    payment_id: str,
    diagnosis: dict[str, Any],
    ai_proposal: dict[str, Any],
    policy: dict[str, Any],
    final_decision: str,
) -> dict[str, Any]:

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payment_id": payment_id,
        "diagnosis": diagnosis,
        "ai_proposal": ai_proposal,
        "policy": policy,
        "final_decision": final_decision,
    }

    AUDIT_LOG.append(record)

    return record


def get_audit_logs() -> list[dict[str, Any]]:
    return AUDIT_LOG