from fastapi import APIRouter

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision

router = APIRouter(prefix="/api/cases", tags=["Cases"])


@router.get("")
def get_cases():
    records = load_failed_mandates()

    cases = []

    for record in records:
        payment = {
            "payment_id": record.get("payment_id"),
            "amount_inr": float(record.get("amount_inr", 0)),
            "failure_code": record.get("failure_code"),
            "mandate_status": record.get("mandate_status", "active"),
            "attempt_number": int(record.get("attempt_number", 1)),
            "previous_successes": int(record.get("previous_successes", 0)),
            "previous_failures": int(record.get("previous_failures", 0)),
        }

        result = make_recovery_decision(payment)

        cases.append({
            "payment_id": payment["payment_id"],
            "amount_inr": payment["amount_inr"],
            "failure_code": payment["failure_code"],
            "mandate_status": payment["mandate_status"],
            "attempt_number": payment["attempt_number"],
            "previous_successes": payment["previous_successes"],
            "previous_failures": payment["previous_failures"],
            "diagnosis": result["diagnosis"],
            "ai_proposal": result["ai_proposal"],
            "policy": result["policy"],
            "final_decision": result["final_decision"],
            "recovery_value": result["recovery_value"],
            "action": result["action"],
        })

    return {
        "total": len(cases),
        "cases": cases,
    }