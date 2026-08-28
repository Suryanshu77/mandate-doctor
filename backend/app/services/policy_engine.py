from typing import Any

from app.services.settings import get_settings


def evaluate_policy(
    amount_inr: float,
    diagnosis: dict[str, Any],
    attempt_number: int = 1,
) -> dict[str, Any]:

    settings = get_settings()
    root_cause = diagnosis.get("root_cause")
    recoverable = diagnosis.get("recoverable")
    recommended_action = diagnosis.get("recommended_action")

    retry_limit = settings["retry_limit"]
    cooling_off_hours = settings["cooling_off_hours"]
    human_approval_threshold = settings["human_approval_threshold"]
    max_contact_attempts = settings["max_contact_attempts"]
    kill_switch = settings["kill_switch"]

    # Kill switch: recovery execution is globally disabled.
    if kill_switch:
        return {
            "decision": "BLOCK",
            "reason": "Recovery execution is disabled by the kill switch.",
            "allowed": False,
            "requires_human_approval": False,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    # Hard stop conditions
    if root_cause == "REVOKED":
        return {
            "decision": "BLOCK",
            "reason": "Mandate has been revoked.",
            "allowed": False,
            "requires_human_approval": False,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    if root_cause == "EXPIRED_MANDATE":
        return {
            "decision": "BLOCK",
            "reason": "Mandate has expired.",
            "allowed": False,
            "requires_human_approval": False,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    if not recoverable:
        return {
            "decision": "BLOCK",
            "reason": "Payment is not considered safely recoverable.",
            "allowed": False,
            "requires_human_approval": False,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    # Retry limit: block once the payment exceeds the configured maximum
    # number of retries. attempt_number starts at 1 for the initial attempt,
    # so the configured limit allows retry_limit retries AFTER the first,
    # i.e. up to and including attempt (retry_limit + 1).
    if attempt_number > retry_limit + 1:
        return {
            "decision": "BLOCK",
            "reason": (
                "Payment has exceeded the maximum retry limit of "
                f"{retry_limit} attempt(s)."
            ),
            "allowed": False,
            "requires_human_approval": False,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    # High-value transactions require human approval
    if amount_inr > human_approval_threshold:
        return {
            "decision": "REVIEW",
            "reason": (
                "Amount exceeds the human approval threshold of "
                f"₹{human_approval_threshold:,}."
            ),
            "allowed": False,
            "requires_human_approval": True,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    # Unknown diagnosis
    if root_cause == "UNKNOWN":
        return {
            "decision": "REVIEW",
            "reason": "Unknown failure requires human investigation.",
            "allowed": False,
            "requires_human_approval": True,
            "cooling_off_hours": cooling_off_hours,
            "max_contact_attempts": max_contact_attempts,
        }

    # Normal recoverable payment
    return {
        "decision": "APPROVE",
        "reason": f"Recovery action '{recommended_action}' is within policy.",
        "allowed": True,
        "requires_human_approval": False,
        "cooling_off_hours": cooling_off_hours,
        "max_contact_attempts": max_contact_attempts,
    }
