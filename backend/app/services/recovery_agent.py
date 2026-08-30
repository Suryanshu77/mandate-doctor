from typing import Any

from app.services.llm_provider import request_llm_proposal


def _deterministic_proposal(
    payment: dict[str, Any],
    diagnosis: dict[str, Any],
) -> dict[str, Any]:
    """Existing deterministic proposal logic (preserved exactly).

    The LLM proposes first when enabled; this function remains the
    behavior-preserving fallback so the pipeline works with no API key,
    a timeout, an API error, invalid model output, or in the evaluation
    harness.
    """

    root_cause = diagnosis["root_cause"]

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


def generate_proposal(
    payment: dict[str, Any],
    diagnosis: dict[str, Any],
    *,
    use_llm: bool = False,
) -> dict[str, Any]:
    """Produce the recovery proposal.

    When ``use_llm`` is enabled the real LLM proposes a recovery
    intervention and its output is strictly validated. Any failure (no key,
    timeout, API error, rate limit, invalid output) falls back to the
    deterministic proposal — current behavior is preserved.

    ``proposal_source`` marks the source in the audit trail / UI:
    ``"llm"`` or ``"deterministic_fallback"``.
    """
    if use_llm:
        llm_proposal = request_llm_proposal(payment, diagnosis)
        if llm_proposal is not None:
            return llm_proposal

    return {
        **_deterministic_proposal(payment, diagnosis),
        "proposal_source": "deterministic_fallback",
    }