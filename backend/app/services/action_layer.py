from datetime import datetime, timezone
from typing import Any


SUPPORTED_ACTIONS = {"RETRY_LATER", "REQUEST_FRESH_MANDATE"}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def execute_action(
    payment_id: str,
    proposed_action: str,
    policy_decision: str,
    recovery_info: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Execute a recovery action in SIMULATION/TEST mode.

    An action is only executed when the policy decision is APPROVE.
    BLOCK (and REVIEW) decisions never produce an execution.
    """

    recovery_info = recovery_info or {}
    action = proposed_action or recovery_info.get("action")

    base = {
        "action": action,
        "policy_decision": policy_decision,
        "simulated": True,
    }

    if policy_decision != "APPROVE":
        return {
            **base,
            "status": "SKIPPED",
            "message": "Action not executed: policy decision was not APPROVE.",
            "executed_at": None,
        }

    if action not in SUPPORTED_ACTIONS:
        return {
            **base,
            "status": "SKIPPED",
            "message": f"Action '{action}' is not supported by the Action Layer.",
            "executed_at": None,
        }

    executed_at = _now()

    if action == "RETRY_LATER":
        # Prefer the AI-proposed retry delay; fall back to the policy's
        # configured cooling-off period when the proposal is silent.
        retry_after_hours = (
            recovery_info.get("retry_after_hours")
            or recovery_info.get("cooling_off_hours")
            or 24
        )

        return {
            **base,
            "status": "EXECUTED",
            "message": (
                f"Simulated retry scheduled in {retry_after_hours} hour(s)."
            ),
            "retry_after_hours": retry_after_hours,
            "scheduled_retry_at": datetime.now(timezone.utc).timestamp()
            + retry_after_hours * 3600,
            "executed_at": executed_at,
        }

    if action == "REQUEST_FRESH_MANDATE":
        return {
            **base,
            "status": "EXECUTED",
            "message": (
                "Simulated fresh mandate request sent to the customer."
            ),
            "mandate_request_medium": "email_and_sms",
            "executed_at": executed_at,
        }

    return {
        **base,
        "status": "FAILED",
        "message": "Unhandled action in simulation mode.",
        "executed_at": None,
    }
