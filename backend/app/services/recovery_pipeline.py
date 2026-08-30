from collections import Counter
from typing import Any

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision


_cached_cases: list[dict[str, Any]] | None = None


def _build_payment(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "payment_id": record.get("payment_id"),
        "amount_inr": float(record.get("amount_inr", 0)),
        "failure_code": record.get("failure_code"),
        "mandate_status": record.get("mandate_status", "active"),
        "attempt_number": int(record.get("attempt_number", 1)),
        "previous_successes": int(record.get("previous_successes", 0)),
        "previous_failures": int(record.get("previous_failures", 0)),
    }


def _compute_cases() -> list[dict[str, Any]]:
    records = load_failed_mandates()

    cases = []

    for record in records:
        payment = _build_payment(record)

        # The bulk/cached pipeline uses the deterministic proposal path (no
        # LLM call per record): fast, reproducible and API-key independent.
        # Live per-payment decisions (e.g. POST /api/recovery/decision or a
        # webhook ingestion) consult the real LLM separately with
        # ``use_llm`` left to its default.
        result = make_recovery_decision(payment, use_llm=False)

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

    return cases


def get_recovery_cases() -> list[dict[str, Any]]:
    """Return all enriched recovery cases, computing them once and caching."""
    global _cached_cases

    if _cached_cases is None:
        _cached_cases = _compute_cases()

    return _cached_cases


def invalidate_cache() -> None:
    """Drop cached policy results so the next read reflects current settings."""
    global _cached_cases
    _cached_cases = None


def get_overview() -> dict[str, Any]:
    """Aggregate overview metrics from the same 300 records used for cases."""
    cases = get_recovery_cases()
    records = load_failed_mandates()

    total_records = len(cases)
    total_at_risk = 0.0
    total_expected_recovery = 0.0

    diagnosis_expected = [
        record.get("root_cause") for record in records
    ]

    for case in cases:
        total_at_risk += case["recovery_value"]["amount_at_risk"]
        total_expected_recovery += case["recovery_value"]["expected_recovery"]

    diagnosis_counts = Counter(
        case["diagnosis"]["root_cause"] for case in cases
    )
    ai_proposals = Counter(
        case["ai_proposal"]["action"] for case in cases
    )
    policy_decisions = Counter(
        case["final_decision"] for case in cases
    )

    correct = sum(
        expected == case["diagnosis"]["root_cause"]
        for expected, case in zip(diagnosis_expected, cases)
    )

    accuracy = (
        correct / total_records if total_records else 0
    )

    recovery_rate = (
        total_expected_recovery / total_at_risk
        if total_at_risk
        else 0
    )

    return {
        "revenue_at_risk": round(total_at_risk, 2),
        "expected_recovery": round(total_expected_recovery, 2),
        "expected_recovery_rate": round(recovery_rate * 100, 2),
        "expected_unrecovered": round(
            total_at_risk - total_expected_recovery,
            2,
        ),
        "approved_recoveries": policy_decisions.get("APPROVE", 0),
        "total_records": total_records,
        "diagnosis_accuracy": round(accuracy * 100, 2),
        "diagnosis_counts": dict(diagnosis_counts),
        "ai_proposals": dict(ai_proposals),
        "policy_decisions": dict(policy_decisions),
    }
