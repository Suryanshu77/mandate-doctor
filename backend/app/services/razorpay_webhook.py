"""Razorpay webhook ingestion helpers for the recovery pipeline.

Scope
-----
This module only *ingests* Razorpay TEST-mode webhook events. It never
calls Razorpay's real payment/order/subscription APIs. Everything
downstream of ingestion remains Mandate Doctor's existing simulation
mode.

Signature verification
----------------------
We verify against the **exact raw request body** (the bytes captured by
the HTTP layer), never against parsed/re-serialized JSON. The signature
is the hex digest of HMAC-SHA256(raw_body, secret), which is what the
official Razorpay SDK (``razorpay.utility.Utility``) implements.

The webhook secret is read from the ``RAZORPAY_WEBHOOK_SECRET``
environment variable (optionally loaded from ``backend/.env``). It is
never logged and never returned in API responses.

Normalization mapping
---------------------
Conversion from a Razorpay payload to the payment record consumed by
``make_recovery_decision`` (the same shape ``_build_payment`` produces
for the synthetic dataset):

    Razorpay field                                  -> Mandate Doctor field
    ---------------                                  -> --------------------
    payload.payment.entity.id                       -> payment_id
    payload.payment.entity.amount (paise) / 100     -> amount_inr
    error_reason / error_description (mapped)       -> failure_code
    payload.subscription.entity.status              -> mandate_status
    (absent, documented safe default)               -> attempt_number = 1
    (absent, documented safe default)               -> previous_successes = 0
    (absent, documented safe default)               -> previous_failures = 0

``amount`` arrives in the smallest currency unit (paise for INR). It is
converted with ``Decimal`` so the division by 100 never suffers from
floating-point corruption.

Fields Razorpay does NOT provide in a failure event (attempt_number,
previous_successes, previous_failures) are given explicit documented
safe defaults rather than being invented. The Mandate Doctor diagnosis
engine only consumes ``failure_code``, ``mandate_status``,
``attempt_number`` and ``amount_inr``; the two "previous_*" counters are
not part of any decision rule today, so 0 is a safe stand-in.

When Razorpay's error signal cannot be confidently mapped to a known
taxonomy code, ``failure_code`` is left as ``None`` (explicitly
"unavailable"). The diagnosis engine then classifies the payment as
UNKNOWN and the policy layer escalates it to human review instead of
silently guessing.
"""

import hashlib
import hmac
import os
from decimal import Decimal
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from razorpay.errors import SignatureVerificationError
from razorpay.utility import Utility

_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(_ENV_FILE)

SUPPORTED_EVENTS = {
    "payment.failed",
    "subscription.charged.failed",
}

# Taxonomy failure codes understood by the diagnosis engine.
# (failure_code keyword, Razorpay textual signals it maps from)
_FAILURE_SIGNALS = (
    ("insufficient_balance", ("insufficient balance", "insufficient funds", "low balance")),
    ("mandate_revoked", ("mandate revoked", "mandate_revoked", "revoked")),
    ("mandate_expired", ("mandate expired", "mandate_expired", "expired")),
    ("bank_timeout", ("timeout", "timed out")),
    ("limit_exceeded", ("limit exceeded", "limits exceeded")),
)

# Razorpay subscription statuses -> mandate_status values the diagnosis
# engine knows how to interpret. Everything else is passed through
# verbatim so no meaning is manufactured.
_SUBSCRIPTION_STATUS_MAP = {
    "expired": "expired",
    "revoked": "revoked",
}


def get_webhook_secret() -> str:
    """Return the configured webhook secret, or an empty string.

    Never logged; only compared in constant time against incoming
    signatures.
    """
    return os.environ.get("RAZORPAY_WEBHOOK_SECRET", "") or ""


def compute_webhook_signature(raw_body: bytes, secret: str) -> str:
    """Produce the Razorpay-style signature for ``raw_body``.

    Identical cryptographic mechanism to the SDK: hex digest of
    HMAC-SHA256 over the exact bytes. Used by tests and the local
    signed-webhook test harness.
    """
    return hmac.new(
        secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()


def verify_webhook_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    """Verify a Razorpay webhook signature against the exact raw body.

    Returns ``True`` only for a genuine signature; returns ``False`` for
    a missing/empty signature, a missing secret, an un-decodable body or
    a mismatched signature (never raises).
    """
    if not raw_body or not signature or not secret:
        return False

    try:
        return Utility().verify_webhook_signature(
            raw_body.decode("utf-8"),
            signature,
            secret,
        )
    except (SignatureVerificationError, UnicodeDecodeError, ValueError, TypeError):
        return False


def _paise_to_inr(amount: Any) -> float:
    """Convert a smallest-currency-unit amount (paise) to INR.

    Uses ``Decimal`` so ``499 -> 4.99`` exactly; the pipeline stores
    amounts as floats rounded to 2 decimals.
    """
    if isinstance(amount, bool) or not isinstance(amount, (int, float, str)):
        raise ValueError(f"Unsupported amount value: {amount!r}")

    if isinstance(amount, str):
        amount = int(amount)

    return round(float(Decimal(str(amount)) / Decimal(100)), 2)


def _extract_payment_entity(payload: dict[str, Any]):
    """Return the Razorpay payment entity if the payload has one."""
    if not isinstance(payload, dict):
        return None

    payment = payload.get("payload", {})
    if not isinstance(payment, dict):
        return None

    entity = payment.get("payment", {}).get("entity")
    return entity if isinstance(entity, dict) else None


def _extract_subscription_entity(payload: dict[str, Any]):
    """Return the Razorpay subscription entity if present (optional)."""
    if not isinstance(payload, dict):
        return None

    payment = payload.get("payload", {})
    if not isinstance(payment, dict):
        return None

    entity = payment.get("subscription", {}).get("entity")
    return entity if isinstance(entity, dict) else None


def _map_failure_code(entity: dict[str, Any]) -> str | None:
    """Map Razorpay error signals onto a taxonomy failure code.

    Returns ``None`` when no signal matches so the pipeline escalates to
    human review instead of guessing.
    """
    error_code = entity.get("error_code")
    error_description = entity.get("error_description")
    error_reason = entity.get("error_reason")

    text = " ".join(
        str(value)
        for value in (error_code, error_description, error_reason)
        if value is not None
    ).lower()

    if not text:
        return None

    for code, signals in _FAILURE_SIGNALS:
        if any(signal in text for signal in signals):
            return code

    return None


def _map_mandate_status(payload: dict[str, Any], entity: dict[str, Any]) -> str:
    """Derive ``mandate_status`` from the subscription entity when present.

    Falls back to the documented safe default ``"active"``.
    """
    subscription = _extract_subscription_entity(payload)

    if subscription and subscription.get("status"):
        status = subscription.get("status")
        return _SUBSCRIPTION_STATUS_MAP.get(status, status)

    return "active"


def normalize_razorpay_event(payload: dict[str, Any]) -> dict[str, Any] | None:
    """Convert a supported Razorpay event payload into a payment record.

    Returns ``None`` when the payload has no usable payment entity so the
    webhook layer can respond without processing.
    """
    entity = _extract_payment_entity(payload)

    if entity is None or not entity.get("id"):
        return None

    return {
        "payment_id": entity["id"],
        "amount_inr": _paise_to_inr(entity.get("amount", 0)),
        "failure_code": _map_failure_code(entity),
        "mandate_status": _map_mandate_status(payload, entity),
        "attempt_number": 1,
        "previous_successes": 0,
        "previous_failures": 0,
    }