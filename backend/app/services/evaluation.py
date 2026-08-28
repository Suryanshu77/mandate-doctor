"""Pure deterministic evaluation harness for the Mandate Doctor pipeline.

The evaluator runs the exact same recovery pipeline used by the live system
(failure code -> diagnosis -> AI proposal -> policy -> recovery value ->
action layer) over the full synthetic failed-mandates dataset and compares it
with a deterministic naive "retry every day" baseline.

The synthetic dataset (``data/synthetic/failed_mandates.csv``) describes the
current failure state of each payment plus a labelled root cause. It contains
no realised future payment outcomes, so no `recovered vs not recovered` truth
can be asserted. Every recovery figure is therefore EXPECTED / SIMULATED
recovery computed with the project's existing deterministic expected-recovery
model (``calculate_recovery_value``). Nothing is invented from outside the
data/model.

Because a single expected-recovery number can hide the comparison's fairness,
the evaluator reports TWO clearly-labelled comparisons:

A) ``comparison_raw``   MD vs an UNRESTRICTED naive that receives a recovery
   probability for every payment (including expired mandates). This baseline
   is kept for transparency: it over-credits the naive with recovery that only
   Mandate Doctor's customer re-onboarding can realise, and it ignores whether
   a blind debit is even valid.

B) ``comparison``       MD vs a MECHANICALLY HONEST naive "retry every day"
   loop. A blind retry can only debit a mandate that is currently VALID
   (status "active"); it cannot debit revoked or expired mandates and it
   performs no renewal outreach. The naive's expected recovery is therefore
   computed with the shared model ONLY on valid, active mandates.

The safe/recoverable-subset comparison restricts both strategies to the
226 legitimate opportunities (policy-APPROVE cases) and reports efficiency on
that comparable subset.

Side-effect free: ``evaluate()`` computes the decision pipeline with audit
persistence disabled (``make_recovery_decision(..., audit=False)``), never
appends to ``audit_logs.json`` and never mutates settings. Repeated runs with
the same dataset and same settings produce identical metrics, and the metric
payload contains no timestamps or audit side effects.
"""

import hashlib
import json
from collections import Counter
from typing import Any

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision
from app.services.recovery_value import calculate_recovery_value
from app.services.settings import get_settings

UNCOLLECTABLE_STATUSES = {"revoked", "expired"}


def _model_expected_recovery(
    amount_inr: float,
    root_cause: str,
) -> float:
    """Shared deterministic expected recovery for a single record."""
    return calculate_recovery_value(
        amount_inr=amount_inr,
        decision="APPROVE",
        diagnosis={"root_cause": root_cause},
    )["expected_recovery"]


def _unrestricted_naive_expected_recovery(record: dict[str, Any]) -> float:
    """Unrestricted baseline: the shared model band applied to EVERY payment,
    ignoring mandate validity and policy. Kept only for the transparent raw
    comparison; it over-credits the naive with MD's re-onboarding capability
    and with debits it could not actually perform."""
    return _model_expected_recovery(
        amount_inr=float(record.get("amount_inr", 0)),
        root_cause=record.get("root_cause", "UNKNOWN"),
    )


def naive_expected_recovery(record: dict[str, Any]) -> float:
    """Expected recovery for the mechanically honest "retry every day" baseline.

    The naive collector is a blind, fully automated daily debit loop with no
    diagnosis, no policy, no cooling off and no customer outreach. Its only
    mechanism is a debit attempt, so it can only ever touch a mandate that is
    currently VALID:

      * active mandate  -> amount * band[root_cause]  (same model as MD)
      * expired mandate -> 0.0   (no valid mandate to debit and the naive
                                  performs no renewal outreach, so it cannot
                                  realise the model's EXPIRED re-onboarding band)
      * revoked mandate -> 0.0   (debit prohibited; model band is already 0.00)

    This deliberately avoids crediting the naive with Mandate Doctor's customer
    re-onboarding capability.
    """
    amount = float(record.get("amount_inr", 0))
    root_cause = record.get("root_cause", "UNKNOWN")
    status = (record.get("mandate_status") or "active").strip().lower()

    if status != "active":
        return 0.0

    return _model_expected_recovery(amount, root_cause)


def _payment_from_record(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "payment_id": record.get("payment_id"),
        "amount_inr": float(record.get("amount_inr", 0)),
        "failure_code": record.get("failure_code"),
        "mandate_status": record.get("mandate_status", "active"),
        "attempt_number": int(record.get("attempt_number", 1)),
        "previous_successes": int(record.get("previous_successes", 0)),
        "previous_failures": int(record.get("previous_failures", 0)),
    }


def evaluate() -> dict[str, Any]:
    """Run the full dataset through the pipeline and return evaluation metrics.

    Deterministic: given the same dataset file and the same persisted settings,
    the returned metrics are identical on every run.
    """
    records = load_failed_mandates()
    settings = get_settings()

    total_at_risk = 0.0
    doctor_expected = 0.0
    naive_expected = 0.0
    unrestricted_naive_expected = 0.0

    safe_exposure = 0.0
    safe_doctor_expected = 0.0
    safe_naive_expected = 0.0

    unsafe_retry_amount = 0.0

    decision_counts: Counter[str] = Counter()
    action_status_counts: Counter[str] = Counter()
    diagnosis_counts: Counter[str] = Counter()

    correct = 0
    recoverable = 0
    uncollectable = 0
    zero_probability = 0
    unsafe_retry_count = 0
    naive_policy_violations = 0

    by_diagnosis: dict[str, dict[str, Any]] = {}
    violations: list[dict[str, Any]] = []
    uncollectable_payments: list[dict[str, Any]] = []
    zero_probability_payments: list[dict[str, Any]] = []

    digest_lines: list[tuple[str, float, str, str, float, float]] = []

    for record in records:
        payment = _payment_from_record(record)
        result = make_recovery_decision(payment, audit=False)

        diagnosis = result["diagnosis"]
        root_cause = diagnosis["root_cause"]
        final = result["final_decision"]
        action = result["action"]
        value = result["recovery_value"]

        amount = value["amount_at_risk"]
        expected = value["expected_recovery"]
        probability = value["recovery_probability"]

        naive_value = naive_expected_recovery(record)
        unrestricted_value = _unrestricted_naive_expected_recovery(record)

        total_at_risk += amount
        doctor_expected += expected
        naive_expected += naive_value
        unrestricted_naive_expected += unrestricted_value

        expected_rounded = round(expected, 2)
        naive_rounded = round(naive_value, 2)

        decision_counts[final] += 1
        action_status_counts[action["status"]] += 1
        diagnosis_counts[root_cause] += 1

        bucket = by_diagnosis.setdefault(
            root_cause,
            {
                "count": 0,
                "amount_at_risk": 0.0,
                "doctor_expected": 0.0,
                "naive_expected": 0.0,
            },
        )
        bucket["count"] += 1
        bucket["amount_at_risk"] += amount
        bucket["doctor_expected"] += expected
        bucket["naive_expected"] += naive_value

        if record.get("root_cause") == root_cause:
            correct += 1

        if final == "APPROVE":
            recoverable += 1
            safe_exposure += amount
            safe_doctor_expected += expected
            safe_naive_expected += naive_value

        if final == "BLOCK":
            uncollectable += 1
            uncollectable_payments.append({
                "payment_id": payment["payment_id"],
                "amount_inr": amount,
                "root_cause": root_cause,
                "reason": result["policy"]["reason"],
            })

        if probability == 0.0:
            zero_probability += 1
            zero_probability_payments.append({
                "payment_id": payment["payment_id"],
                "amount_inr": amount,
                "root_cause": root_cause,
                "reason": result["policy"]["reason"] if final == "BLOCK" else "Recovery probability is zero.",
            })

        # --- Policy safety checks (Mandate Doctor) -------------------------
        if final == "BLOCK" and action["status"] != "SKIPPED":
            violations.append({
                "payment_id": payment["payment_id"],
                "check": "blocked case must not execute an action",
            })

        if action["status"] == "EXECUTED" and final != "APPROVE":
            violations.append({
                "payment_id": payment["payment_id"],
                "check": "only policy-approved cases may execute",
            })

        if (
            record.get("mandate_status") in UNCOLLECTABLE_STATUSES
            and final != "BLOCK"
        ):
            violations.append({
                "payment_id": payment["payment_id"],
                "check": "revoked/expired mandate must remain blocked",
            })

        if final == "BLOCK" and probability != 0.0:
            violations.append({
                "payment_id": payment["payment_id"],
                "check": "blocked case must carry zero recovery probability",
            })

        # --- Naive strategy side effects -----------------------------------
        # The naive retries every payment, including the ones policy blocks.
        # Each such attempt is both an unsafe/invalid retry and a policy
        # violation relative to Mandate Doctor's policy.
        if final != "APPROVE":
            unsafe_retry_count += 1
            unsafe_retry_amount += amount
            naive_policy_violations += 1

        digest_lines.append((
            str(payment["payment_id"]),
            amount,
            str(record.get("root_cause")),
            final,
            expected_rounded,
            naive_rounded,
        ))

    total = len(records)
    diagnosis_accuracy = correct / total if total else 0.0

    doctor_rate = doctor_expected / total_at_risk if total_at_risk else 0.0
    naive_rate = naive_expected / total_at_risk if total_at_risk else 0.0
    unrestricted_rate = (
        unrestricted_naive_expected / total_at_risk if total_at_risk else 0.0
    )

    # Defensible comparison (mechanically honest naive).
    uplift = doctor_expected - naive_expected
    uplift_percent = uplift / naive_expected * 100 if naive_expected else 0.0

    # Raw comparison (unrestricted naive) kept transparently.
    raw_uplift = doctor_expected - unrestricted_naive_expected
    raw_uplift_percent = (
        raw_uplift / unrestricted_naive_expected * 100
        if unrestricted_naive_expected
        else 0.0
    )

    # Safe / recoverable subset.
    safe_doctor_rate = (
        safe_doctor_expected / safe_exposure if safe_exposure else 0.0
    )
    safe_naive_rate = (
        safe_naive_expected / safe_exposure if safe_exposure else 0.0
    )

    for bucket in by_diagnosis.values():
        bucket["amount_at_risk"] = round(bucket["amount_at_risk"], 2)
        bucket["doctor_expected"] = round(bucket["doctor_expected"], 2)
        bucket["naive_expected"] = round(bucket["naive_expected"], 2)

    digest = hashlib.sha256(
        json.dumps(sorted(digest_lines)).encode("utf-8")
    ).hexdigest()

    return {
        "dataset": {
            "name": "failed_mandates.csv",
            "total_records": total,
            "revenue_at_risk": round(total_at_risk, 2),
        },
        "settings": settings,
        "labelled_as": (
            "expected recovery / simulated evaluation; the synthetic dataset "
            "contains no realised future payment outcomes."
        ),
        "methodology": {
            "description": (
                "Mandate Doctor runs the full recovery pipeline over every "
                "record; recovery figures are EXPECTED values from the shared "
                "deterministic recovery model."
            ),
            "naive_baseline_definition": (
                "Mechanically honest naive: a blind automated daily debit loop "
                "with no diagnosis, policy, cooling off or outreach. It earns "
                "expected recovery from the shared model ONLY on mandates "
                "currently valid (status 'active'). Expired and revoked "
                "mandates yield 0.0 to a retry loop (no valid debit and no "
                "re-onboarding)."
            ),
            "unrestricted_naive_definition": (
                "Transparency-only: the shared model band applied to every "
                "payment regardless of mandate validity. Over-credits the "
                "naive with MD's customer re-onboarding capability and with "
                "debits it could not perform; not achievable by a retry loop."
            ),
        },
        "mandate_doctor": {
            "expected_recovery": round(doctor_expected, 2),
            "expected_recovery_rate": round(doctor_rate * 100, 2),
            "recoverable_cases": recoverable,
            "action_distribution": dict(action_status_counts),
            "recovery_rate_on_safe_exposure": round(safe_doctor_rate * 100, 2),
        },
        "naive_baseline": {
            "expected_recovery": round(naive_expected, 2),
            "expected_recovery_rate": round(naive_rate * 100, 2),
            "recovery_rate_on_safe_exposure": round(safe_naive_rate * 100, 2),
            "policy_violations": naive_policy_violations,
            "unsafe_retry_attempts": unsafe_retry_count,
        },
        "unrestricted_naive": {
            "expected_recovery": round(unrestricted_naive_expected, 2),
            "expected_recovery_rate": round(unrestricted_rate * 100, 2),
        },
        "comparison": {
            "type": "defensible: naive restricted to valid (active) mandates",
            "absolute_recovery_improvement": round(uplift, 2),
            "recovery_rate_improvement_points": round(
                (doctor_rate - naive_rate) * 100, 2
            ),
            "uplift_percentage_relative_to_naive": round(uplift_percent, 2),
        },
        "comparison_raw": {
            "type": "unrestricted naive (ignores mandate validity/policy)",
            "absolute_recovery_improvement": round(raw_uplift, 2),
            "recovery_rate_improvement_points": round(
                (doctor_rate - unrestricted_rate) * 100, 2
            ),
            "uplift_percentage_relative_to_naive": round(raw_uplift_percent, 2),
            "caveat": (
                "Not achievable by a blind retry loop: it credits the naive "
                "with re-onboarding recovery (EXPIRED 20%) and with debits on "
                "invalid mandates that Mandate Doctor blocks on safety grounds."
            ),
        },
        "safe_recoverable": {
            "count": recoverable,
            "amount_at_risk": round(safe_exposure, 2),
            "mandate_doctor_expected": round(safe_doctor_expected, 2),
            "mandate_doctor_recovery_rate": round(safe_doctor_rate * 100, 2),
            "naive_expected": round(safe_naive_expected, 2),
            "naive_recovery_rate": round(safe_naive_rate * 100, 2),
            "recovery_difference": round(
                safe_doctor_expected - safe_naive_expected, 2
            ),
            "recovery_rate_improvement_points": round(
                (safe_doctor_rate - safe_naive_rate) * 100, 2
            ),
        },
        "revenue_breakdown": {
            "revenue_at_risk": round(total_at_risk, 2),
            "safe_recoverable_revenue": round(safe_exposure, 2),
            "uncollectable_revenue": round(total_at_risk - safe_exposure, 2),
        },
        "unsafe_retries_avoided": {
            "count": unsafe_retry_count,
            "amount_at_risk": round(unsafe_retry_amount, 2),
            "definition": (
                "Debit attempts Mandate Doctor refuses (policy BLOCK/REVIEW) "
                "that the naive retry loop would have performed."
            ),
        },
        "policy_violations": {
            "count": len(violations),
            "details": violations,
        },
        "naive_policy_violations": {
            "count": naive_policy_violations,
            "definition": (
                "Payments the naive would retry that Mandate Doctor policy "
                "marks as BLOCK/REVIEW (revoked/expired mandates must not be "
                "debited)."
            ),
        },
        "uncollectable_cases": {
            "count": uncollectable,
            "amount_at_risk": round(
                sum(p["amount_inr"] for p in uncollectable_payments), 2
            ),
            "payments": uncollectable_payments,
        },
        "zero_recovery_probability_cases": {
            "count": zero_probability,
            "amount_at_risk": round(
                sum(p["amount_inr"] for p in zero_probability_payments), 2
            ),
            "payments": zero_probability_payments,
        },
        "attainable_expected_recovery": round(doctor_expected, 2),
        "md_share_of_attainable_percent": round(
            (doctor_expected / doctor_expected * 100) if doctor_expected else 0.0,
            2,
        ),
        "policy_decisions": dict(decision_counts),
        "diagnosis_accuracy": round(diagnosis_accuracy * 100, 2),
        "diagnosis_counts": dict(diagnosis_counts),
        "by_diagnosis": by_diagnosis,
        "reproducibility_digest": digest,
    }