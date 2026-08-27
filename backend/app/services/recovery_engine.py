from typing import Any

from app.services.audit import log_decision
from app.services.diagnosis import diagnose_payment
from app.services.recovery_agent import generate_proposal
from app.services.policy_engine import evaluate_policy
from app.services.recovery_value import calculate_recovery_value


def make_recovery_decision(payment: dict[str, Any]) -> dict[str, Any]:

    diagnosis = diagnose_payment(payment)

    proposal = generate_proposal(
        payment=payment,
        diagnosis=diagnosis,
    )

    policy = evaluate_policy(
        amount_inr=payment.get("amount_inr", 0),
        diagnosis=diagnosis,
    )

    final_decision = policy["decision"]

    recovery_value = calculate_recovery_value(
        amount_inr=payment.get("amount_inr", 0),
        decision=final_decision,
        diagnosis=diagnosis,
    )

    audit = log_decision(
        payment_id=payment.get("payment_id"),
        diagnosis=diagnosis,
        ai_proposal=proposal,
        policy=policy,
        final_decision=final_decision,
    )

    return {
        "payment_id": payment.get("payment_id"),
        "amount_inr": payment.get("amount_inr"),
        "diagnosis": diagnosis,
        "ai_proposal": proposal,
        "policy": policy,
        "recovery_value": recovery_value,
        "final_decision": final_decision,
        "audit_id": audit["timestamp"],
    }