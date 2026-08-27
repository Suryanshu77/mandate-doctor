from typing import Any


def diagnose_payment(payment: dict[str, Any]) -> dict[str, Any]:
    """
    Deterministic first-pass diagnosis engine.

    Takes normalized payment/customer information and returns
    a structured diagnosis.
    """

    failure_code = payment.get("failure_code")
    mandate_status = payment.get("mandate_status")
    attempt_number = payment.get("attempt_number", 1)
    previous_failures = payment.get("previous_failures", 0)
    previous_successes = payment.get("previous_successes", 0)
    amount = payment.get("amount_inr", 0)

    # 1. Revoked mandate
    if failure_code in {
        "mandate_revoked",
        "revoked_mandate",
    } or mandate_status == "revoked":

        return {
            "root_cause": "REVOKED",
            "diagnosis": "The customer has revoked the payment mandate.",
            "confidence": 0.99,
            "recoverable": False,
            "recommended_action": "STOP",
            "reason": "A revoked mandate cannot safely be retried.",
        }

    # 2. Expired mandate
    if failure_code in {
        "mandate_expired",
        "expired_mandate",
    } or mandate_status == "expired":

        return {
            "root_cause": "EXPIRED_MANDATE",
            "diagnosis": "The payment mandate has expired.",
            "confidence": 0.99,
            "recoverable": False,
            "recommended_action": "CUSTOMER_ACTION",
            "reason": "The customer needs to renew or recreate the mandate.",
        }

    # 3. Bank timeout
    if failure_code in {
        "bank_timeout",
        "network_timeout",
    }:

        confidence = 0.95

        if attempt_number > 2:
            confidence = 0.90

        return {
            "root_cause": "BANK_TIMEOUT",
            "diagnosis": "The payment attempt encountered a temporary bank or network timeout.",
            "confidence": confidence,
            "recoverable": True,
            "recommended_action": "RETRY_LATER",
            "reason": "Temporary failures may succeed after a cooling-off period.",
        }

    # 4. Balance
    if failure_code in {
        "insufficient_balance",
        "low_balance",
    }:

        return {
            "root_cause": "BALANCE",
            "diagnosis": "The customer appears to have insufficient available balance.",
            "confidence": 0.94,
            "recoverable": True,
            "recommended_action": "RETRY_LATER",
            "reason": "The payment may succeed when sufficient balance becomes available.",
        }

    # 5. Limit exceeded
    if failure_code in {
        "limit_exceeded",
        "mandate_limit_exceeded",
    }:

        return {
            "root_cause": "LIMIT_EXCEEDED",
            "diagnosis": "The payment or mandate limit has been exceeded.",
            "confidence": 0.96,
            "recoverable": True,
            "recommended_action": "CUSTOMER_ACTION",
            "reason": "The customer may need to resolve the applicable payment or mandate limit.",
        }

    # Unknown failure
    return {
        "root_cause": "UNKNOWN",
        "diagnosis": "The payment failure could not be confidently classified.",
        "confidence": 0.30,
        "recoverable": None,
        "recommended_action": "ESCALATE",
        "reason": "Unknown failures require further investigation.",
    }