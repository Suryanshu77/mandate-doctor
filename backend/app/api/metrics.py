from fastapi import APIRouter

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision


router = APIRouter(
    prefix="/api/metrics",
    tags=["Metrics"],
)


@router.get("/overview")
def overview_metrics():
    records = load_failed_mandates()

    total_records = len(records)
    total_at_risk = 0.0
    expected_recovery = 0.0

    approve_count = 0
    review_count = 0
    block_count = 0

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

        total_at_risk += result["recovery_value"]["amount_at_risk"]
        expected_recovery += result["recovery_value"]["expected_recovery"]

        decision = result["final_decision"]

        if decision == "APPROVE":
            approve_count += 1
        elif decision == "REVIEW":
            review_count += 1
        elif decision == "BLOCK":
            block_count += 1

    recovery_rate = (
        expected_recovery / total_at_risk
        if total_at_risk
        else 0
    )

    return {
        "total_records": total_records,
        "revenue_at_risk": round(total_at_risk, 2),
        "expected_recovery": round(expected_recovery, 2),
        "expected_recovery_rate": round(recovery_rate * 100, 2),
        "expected_unrecovered": round(
            total_at_risk - expected_recovery,
            2,
        ),
        "decisions": {
            "approve": approve_count,
            "review": review_count,
            "block": block_count,
        },
    }