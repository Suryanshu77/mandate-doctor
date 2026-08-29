"""Razorpay webhook ingestion endpoint.

POST /api/webhooks/razorpay

Accepts the raw request body plus the ``X-Razorpay-Signature`` header,
verifies the signature against the exact raw bytes, then feeds
supported payment-failure events into the existing recovery pipeline.

No real payment/recovery API calls are made anywhere in this flow;
Action Layer behaviour remains simulation mode.
"""

import json
from typing import Any

from fastapi import APIRouter, Header, Request
from fastapi.responses import JSONResponse

from app.services import razorpay_webhook as rz
from app.services.recovery_engine import make_recovery_decision
from app.services.webhook_events import (
    claim_event,
    complete_event,
    event_key,
    release_event,
)

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


def _reject(status_code: int, reason: str, **extra: Any) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "received": True,
            "processed": False,
            "reason": reason,
            **extra,
        },
    )


@router.post("/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(default=""),
):
    secret = rz.get_webhook_secret()

    if not secret:
        return _reject(500, "server_not_configured")

    signature = (x_razorpay_signature or "").strip()

    if not signature:
        return _reject(400, "missing_signature")

    raw_body = await request.body()

    if not rz.verify_webhook_signature(raw_body, signature, secret):
        return _reject(400, "invalid_signature")

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
        return _reject(400, "malformed_payload")

    event = payload.get("event") if isinstance(payload, dict) else None

    if event not in rz.SUPPORTED_EVENTS:
        return {
            "received": True,
            "processed": False,
            "reason": "unsupported_event",
            "event": event,
        }

    payment = rz.normalize_razorpay_event(payload)

    if payment is None or not payment.get("payment_id"):
        return _reject(400, "missing_payment_entity", event=event)

    payment_id = payment["payment_id"]
    key = event_key(event, payment_id)

    existing = claim_event(key)

    if existing is not None:
        return {
            "received": True,
            "processed": False,
            "duplicate": True,
            "event": event,
            "payment_id": payment_id,
        }

    try:
        decision = make_recovery_decision(payment)
    except Exception:
        release_event(key)
        return _reject(500, "processing_error", event=event, payment_id=payment_id)

    audit_id = decision.get("audit_id")
    complete_event(key, audit_id)

    return {
        "received": True,
        "processed": True,
        "event": event,
        "payment_id": payment_id,
        "decision": decision.get("final_decision"),
        "action_status": decision.get("action", {}).get("status"),
        "audit_id": audit_id,
    }