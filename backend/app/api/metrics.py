from collections import Counter, defaultdict

from fastapi import APIRouter

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision
from app.services.recovery_pipeline import get_recovery_cases


router = APIRouter(
    prefix="/api/metrics",
    tags=["Metrics"],
)


def _humanize(value: str) -> str:
    return value.replace("_", " ").title()


@router.get("/analytics")
def analytics():
    """Aggregate analytics from the same cached 300-record recovery pipeline
    used by /api/overview and /api/cases."""
    cases = get_recovery_cases()

    total = len(cases)
    total_at_risk = 0.0
    total_expected = 0.0
    blocked_at_risk = 0.0

    diagnosis_counts = Counter()
    proposal_counts = Counter()
    decision_counts = Counter()
    action_status_counts = Counter()
    probability_by_diagnosis = defaultdict(list)
    expected_by_diagnosis = Counter()
    at_risk_by_diagnosis = Counter()

    for case in cases:
        diagnosis = case["diagnosis"]["root_cause"]
        at_risk = case["recovery_value"]["amount_at_risk"]
        expected = case["recovery_value"]["expected_recovery"]
        probability = case["recovery_value"]["recovery_probability"]

        total_at_risk += at_risk
        total_expected += expected

        diagnosis_counts[diagnosis] += 1
        proposal_counts[case["ai_proposal"]["action"]] += 1
        decision_counts[case["final_decision"]] += 1
        action_status_counts[case["action"]["status"]] += 1
        probability_by_diagnosis[diagnosis].append(probability)
        expected_by_diagnosis[diagnosis] += expected
        at_risk_by_diagnosis[diagnosis] += at_risk

        if case["final_decision"] == "BLOCK":
            blocked_at_risk += at_risk

    recovery_rate = (
        total_expected / total_at_risk if total_at_risk else 0
    )

    def average(values: list[float]) -> float:
        return round(sum(values) / len(values), 4) if values else 0.0

    recovery_trend = []
    for diagnosis in sorted(
        diagnosis_counts,
        key=lambda key: at_risk_by_diagnosis[key],
        reverse=True,
    ):
        recovery_trend.append({
            "day": _humanize(diagnosis),
            "doctor": round(expected_by_diagnosis[diagnosis], 2),
            "naive": round(at_risk_by_diagnosis[diagnosis], 2),
        })

    return {
        "total_records": total,
        "revenue_at_risk": round(total_at_risk, 2),
        "expected_recovery": round(total_expected, 2),
        "expected_recovery_rate": round(recovery_rate * 100, 2),
        "expected_unrecovered": round(
            total_at_risk - total_expected,
            2,
        ),
        "approved_recoveries": decision_counts.get("APPROVE", 0),
        "blocked_recoveries": decision_counts.get("BLOCK", 0),
        "review_recoveries": decision_counts.get("REVIEW", 0),
        "blocked_at_risk": round(blocked_at_risk, 2),
        "diagnosis_counts": dict(diagnosis_counts),
        "ai_proposals": dict(proposal_counts),
        "policy_decisions": dict(decision_counts),
        "action_distribution": dict(action_status_counts),
        "recovery_probability_by_diagnosis": {
            key: average(values)
            for key, values in probability_by_diagnosis.items()
        },
        "recovery_value_by_diagnosis": {
            key: round(value, 2)
            for key, value in expected_by_diagnosis.items()
        },
        "at_risk_by_diagnosis": {
            key: round(value, 2)
            for key, value in at_risk_by_diagnosis.items()
        },
        "recovery_trend": recovery_trend,
    }


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

        result = make_recovery_decision(payment, use_llm=False)

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