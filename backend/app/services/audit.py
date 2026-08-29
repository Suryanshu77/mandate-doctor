import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUDIT_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "audit_logs.json"
)

_audit_file = AUDIT_FILE


def configure_audit_file(path) -> None:
    """Point the audit store at an alternate file.

    Used by tests/isolated runs so webhook fixtures never pollute the
    real production ``audit_logs.json``. Passing the original back in
    restores default behavior.
    """
    global _audit_file
    _audit_file = Path(path)


def _current_audit_file() -> Path:
    return _audit_file


def _load_records() -> list[dict[str, Any]]:
    target = _current_audit_file()

    if not target.exists():
        return []

    try:
        with open(target, "r", encoding="utf-8") as file:
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

    target = _current_audit_file()
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8") as file:
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

    target = _current_audit_file()
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)

    return record


def get_audit_logs() -> list[dict[str, Any]]:
    return _load_records()
