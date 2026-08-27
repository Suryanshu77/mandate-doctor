from typing import Any


def evaluate_policy(
    amount_inr: float,
    diagnosis: dict[str, Any],
) -> dict[str, Any]:

    root_cause = diagnosis.get("root_cause")
    recoverable = diagnosis.get("recoverable")
    recommended_action = diagnosis.get("recommended_action")

    # Hard stop conditions
    if root_cause == "REVOKED":
        return {
            "decision": "BLOCK",
            "reason": "Mandate has been revoked.",
            "allowed": False,
            "requires_human_approval": False,
        }

    if root_cause == "EXPIRED_MANDATE":
        return {
            "decision": "BLOCK",
            "reason": "Mandate has expired.",
            "allowed": False,
            "requires_human_approval": False,
        }

    if not recoverable:
        return {
            "decision": "BLOCK",
            "reason": "Payment is not considered safely recoverable.",
            "allowed": False,
            "requires_human_approval": False,
        }

    # High-value transactions require human approval
    if amount_inr > 75000:
        return {
            "decision": "REVIEW",
            "reason": "Amount exceeds the human approval threshold of ₹75,000.",
            "allowed": False,
            "requires_human_approval": True,
        }

    # Unknown diagnosis
    if root_cause == "UNKNOWN":
        return {
            "decision": "REVIEW",
            "reason": "Unknown failure requires human investigation.",
            "allowed": False,
            "requires_human_approval": True,
        }

    # Normal recoverable payment
    return {
        "decision": "APPROVE",
        "reason": f"Recovery action '{recommended_action}' is within policy.",
        "allowed": True,
        "requires_human_approval": False,
    }