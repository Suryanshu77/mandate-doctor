from typing import Any

from app.services.action_layer import execute_action
from app.services.audit import log_decision
from app.services.diagnosis import diagnose_payment
from app.services.llm_provider import is_enabled
from app.services.recovery_agent import generate_proposal
from app.services.policy_engine import evaluate_policy
from app.services.recovery_value import calculate_recovery_value


def make_recovery_decision(
    payment: dict[str, Any],
    audit: bool = True,
    use_llm: bool | None = None,
) -> dict[str, Any]:
    """Compute the full recovery decision for a payment.

    ``audit`` controls whether the decision is persisted to the audit log.
    The evaluation harness calls this with ``audit=False`` so it never
    appends duplicate records to ``audit_logs.json``.

    ``use_llm`` controls whether the proposal layer consults the real LLM.
    When ``None`` it resolves from server-side configuration (enabled only
    when ``LLM_API_KEY`` is set). Bulk/reproducible paths (evaluation,
    the cached case pipeline) pass ``use_llm=False`` so they stay fast,
    deterministic and API-key-independent. The LLM can only ever propose:
    the policy engine decides and the action layer executes only when the
    policy says APPROVE.
    """

    if use_llm is None:
        use_llm = is_enabled()

    diagnosis = diagnose_payment(payment)

    proposal = generate_proposal(
        payment=payment,
        diagnosis=diagnosis,
        use_llm=use_llm,
    )

    policy = evaluate_policy(
        amount_inr=payment.get("amount_inr", 0),
        diagnosis=diagnosis,
        attempt_number=payment.get("attempt_number", 1),
    )

    final_decision = policy["decision"]

    recovery_value = calculate_recovery_value(
        amount_inr=payment.get("amount_inr", 0),
        decision=final_decision,
        diagnosis=diagnosis,
    )

    action = execute_action(
        payment_id=payment.get("payment_id"),
        proposed_action=proposal.get("action"),
        policy_decision=final_decision,
        recovery_info={
            **proposal,
            "cooling_off_hours": policy.get("cooling_off_hours"),
        },
    )

    audit_id = None

    if audit:
        audit_record = log_decision(
            payment_id=payment.get("payment_id"),
            diagnosis=diagnosis,
            ai_proposal=proposal,
            policy=policy,
            final_decision=final_decision,
            action=action,
        )
        audit_id = audit_record["timestamp"]

    return {
        "payment_id": payment.get("payment_id"),
        "amount_inr": payment.get("amount_inr"),
        "diagnosis": diagnosis,
        "ai_proposal": proposal,
        "policy": policy,
        "recovery_value": recovery_value,
        "final_decision": final_decision,
        "action": action,
        "audit_id": audit_id,
    }