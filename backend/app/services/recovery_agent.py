from typing import Any


def generate_proposal(
    payment: dict[str, Any],
    diagnosis: dict[str, Any],
) -> dict[str, Any]:

    root_cause = diagnosis["root_cause"]
    amount = payment.get("amount_inr", 0)
    attempt = payment.get("attempt_number", 1)

    if root_cause == "BANK_TIMEOUT":
        return {
            "action": "RETRY_LATER",
            "proposal": "Retry the payment after a cooling-off period.",
            "retry_after_hours": 12,
            "confidence": 0.91,
        }

    if root_cause == "BALANCE":
        return {
            "action": "RETRY_LATER",
            "proposal": "Retry when sufficient customer balance is likely available.",
            "retry_after_hours": 24,
            "confidence": 0.84,
        }

    if root_cause == "LIMIT_EXCEEDED":
        return {
            "action": "RETRY_LATER",
            "proposal": "Retry after the applicable payment limit resets.",
            "retry_after_hours": 24,
            "confidence": 0.82,
        }

    if root_cause == "REVOKED":
        return {
            "action": "REQUEST_FRESH_MANDATE",
            "proposal": "Request a fresh mandate from the customer.",
            "retry_after_hours": None,
            "confidence": 0.96,
        }

    if root_cause == "EXPIRED_MANDATE":
        return {
            "action": "REQUEST_FRESH_MANDATE",
            "proposal": "Request mandate renewal or a new mandate.",
            "retry_after_hours": None,
            "confidence": 0.97,
        }

    return {
        "action": "ESCALATE",
        "proposal": "Escalate the payment for manual investigation.",
        "retry_after_hours": None,
        "confidence": 0.30,
    }