"""Deterministic idempotency store for ingested webhook events.

Razorpay may redeliver the same webhook event. Events are keyed by
``event_type|payment_id`` (a stable identifier for one delivery), and the
key is persisted to JSON so a separate request/process cannot blindly
process the same event twice.

This is intentionally a small prototype mechanism, not an
infrastructure system:

* in-process: a thread lock
* cross-process: a short-lived advisory lock file (``O_CREAT|O_EXCL``)

The store path is configurable so tests can point it at a temporary file
and never touch the production state.
"""

import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

WEBHOOK_EVENTS_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "webhook_events.json"
)

_lock = threading.Lock()
_store_path = WEBHOOK_EVENTS_FILE

_LOCK_TIMEOUT_SECONDS = 5
_LOCK_RETRY_SECONDS = 0.05


def configure_store(path) -> None:
    """Point the idempotency store at an alternate file (tests)."""
    global _store_path
    _store_path = Path(path)


def _current_store_path() -> Path:
    return _store_path


def event_key(event: str, payment_id: str) -> str:
    """Stable idempotency key for one webhook event delivery."""
    return f"{event}|{payment_id}"


def _lock_path() -> Path:
    return Path(str(_current_store_path()) + ".lock")


def _acquire_file_lock() -> None:
    """Create the lock file exclusively; retry briefly, then give up."""
    started = time.time()
    target = _lock_path()

    while True:
        try:
            fd = os.open(target, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.close(fd)
            return
        except FileExistsError:
            if time.time() - started > _LOCK_TIMEOUT_SECONDS:
                raise TimeoutError(
                    "Could not acquire webhook idempotency lock."
                )
            time.sleep(_LOCK_RETRY_SECONDS)


def _release_file_lock() -> None:
    try:
        os.remove(_lock_path())
    except OSError:
        pass


def _load_records() -> dict[str, Any]:
    target = _current_store_path()

    if not target.exists():
        return {}

    try:
        with open(target, "r", encoding="utf-8") as file:
            records = json.load(file)
    except (json.JSONDecodeError, OSError, ValueError):
        return {}

    if not isinstance(records, dict):
        return {}

    return records


def _save_records(records: dict[str, Any]) -> None:
    target = _current_store_path()
    target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, "w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def claim_event(key: str) -> dict[str, Any] | None:
    """Atomically claim ``key`` for processing.

    Returns the existing stored record when the event was already seen
    (a duplicate), or ``None`` when the caller got the claim and may
    process the event.
    """
    with _lock:
        _acquire_file_lock()
        try:
            records = _load_records()

            if key in records:
                return records[key]

            records[key] = {
                "processed_at": _now(),
                "audit_id": None,
            }
            _save_records(records)
            return None
        finally:
            _release_file_lock()


def complete_event(key: str, audit_id: str) -> None:
    """Attach the audit id once processing has persisted its decision."""
    with _lock:
        _acquire_file_lock()
        try:
            records = _load_records()

            if key in records:
                records[key]["audit_id"] = audit_id
                _save_records(records)
        finally:
            _release_file_lock()


def release_event(key: str) -> None:
    """Release a claim so a delivery retry may be reprocessed.

    Called when processing failed before an audit record was persisted,
    otherwise the event would be permanently marked as seen despite
    never being recovered.
    """
    with _lock:
        _acquire_file_lock()
        try:
            records = _load_records()
            records.pop(key, None)
            _save_records(records)
        finally:
            _release_file_lock()


def get_processed_events() -> dict[str, Any]:
    return _load_records()