import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUDIT_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "audit_logs.json"
)


def _load_records() -> list[dict[str, Any]]:
    if not AUDIT_FILE.exists():
        return []

    try:
        with open(AUDIT_FILE, "r", encoding="utf-8") as file:
            records = json.load(file)
    except (json.JSONDecodeError, OSError, ValueError):
        return []

    if not isinstance(records, list):
        return []

    return records


def log_decision(
    payment_id: str,
    diagnosis: dict[str, Any],
    ai_proposal: dict[str, Any],
    policy: dict[str, Any],
    final_decision: str,
    action: dict[str, Any] | None = None,
) -> dict[str, Any]:

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payment_id": payment_id,
        "diagnosis": diagnosis,
        "ai_proposal": ai_proposal,
        "policy": policy,
        "final_decision": final_decision,
    }

    if action is not None:
        record["action"] = action

    records = _load_records()
    records.append(record)

    AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(AUDIT_FILE, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)

    return record


def log_approval(
    payment_id: str,
    decision: str,
    policy_decision: str,
    action: dict[str, Any] | None = None,
    message: str = "",
) -> dict[str, Any]:
    """Record a human-in-the-loop approval/rejection decision.

    Backward compatible: appends a standalone record and never mutates
    existing decision records written by ``log_decision``.
    """

    record: dict[str, Any] = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "payment_id": payment_id,
        "event": "HUMAN_APPROVAL",
        "decision": decision,
        "policy_decision": policy_decision,
    }

    if action is not None:
        record["action"] = action

    if message:
        record["message"] = message

    records = _load_records()
    records.append(record)

    AUDIT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(AUDIT_FILE, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)

    return record


def get_audit_logs() -> list[dict[str, Any]]:
    return _load_records()
