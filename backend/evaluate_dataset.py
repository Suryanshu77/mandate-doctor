"""Run the Mandate Doctor evaluation harness over the full synthetic dataset.

Usage:
    python evaluate_dataset.py

This script is side-effect free: nothing is written to the audit log and no
settings are modified. All recovery figures are EXPECTED / SIMULATED recovery
computed with the project's deterministic recovery model (the synthetic
dataset contains no realised future payment outcomes).
"""

import sys

from app.services.evaluation import evaluate


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except (AttributeError, ValueError):
        pass

    result = evaluate()

    settings = result["settings"]
    doctor = result["mandate_doctor"]
    naive = result["naive_baseline"]
    unrestricted = result["unrestricted_naive"]
    dataset = result["dataset"]
    methodology = result["methodology"]

    print("========== MANDATE DOCTOR DATASET EVALUATION ==========")
    print(f"Dataset: {dataset['name']}  |  Records: {dataset['total_records']}")
    print(f"Revenue at risk: {_money(dataset['revenue_at_risk'])}")
    print(f"Settings: retry_limit={settings['retry_limit']}, "
          f"cooling_off_hours={settings['cooling_off_hours']}, "
          f"human_approval_threshold={settings['human_approval_threshold']}, "
          f"max_contact_attempts={settings['max_contact_attempts']}, "
          f"kill_switch={settings['kill_switch']}")
    print(f"Mode: {result['labelled_as']}")
    print()

    print("========== DIAGNOSIS ==========")
    print(f"Diagnosis accuracy: {result['diagnosis_accuracy']:.2f}%")
    for root_cause, count in result["diagnosis_counts"].items():
        print(f"  {root_cause}: {count}")
    print()

    print("========== POLICY DECISIONS ==========")
    for decision, count in result["policy_decisions"].items():
        print(f"  {decision}: {count}")
    print()

    print("========== ACTION LAYER (simulated) ==========")
    for status, count in doctor["action_distribution"].items():
        print(f"  {status}: {count}")
    print()

    print("========== REVENUE BREAKDOWN ==========")
    breakdown = result["revenue_breakdown"]
    print(f"Revenue at risk:               {_money(breakdown['revenue_at_risk'])}")
    print(f"  Safe recoverable revenue:    {_money(breakdown['safe_recoverable_revenue'])}")
    print(f"  Uncollectable revenue:       {_money(breakdown['uncollectable_revenue'])}")
    print()

    print("========== COMPARISON A: RAW (unrestricted naive, transparent) ==========")
    print(f"Mandate Doctor expected recovery: {_money(doctor['expected_recovery'])} "
          f"({doctor['expected_recovery_rate']:.2f}%)")
    print(f"Unrestricted naive expected:       {_money(unrestricted['expected_recovery'])} "
          f"({unrestricted['expected_recovery_rate']:.2f}%)")
    raw = result["comparison_raw"]
    print(f"Absolute improvement: {_money(raw['absolute_recovery_improvement'])} "
          f"| rate {raw['recovery_rate_improvement_points']:.2f} pp "
          f"| uplift {raw['uplift_percentage_relative_to_naive']:.2f}%")
    print(f"Caveat: {raw['caveat']}")
    print()

    print("========== COMPARISON B: DEFENSIBLE (naive retry on valid mandates only) ==========")
    print(f"Mandate Doctor expected recovery: {_money(doctor['expected_recovery'])} "
          f"({doctor['expected_recovery_rate']:.2f}%)")
    print(f"Naive baseline expected recovery: {_money(naive['expected_recovery'])} "
          f"({naive['expected_recovery_rate']:.2f}%)")
    comp = result["comparison"]
    print(f"Absolute improvement: {_money(comp['absolute_recovery_improvement'])} "
          f"| rate {comp['recovery_rate_improvement_points']:.2f} pp "
          f"| uplift {comp['uplift_percentage_relative_to_naive']:.2f}%")
    print(f"Naive baseline definition: {methodology['naive_baseline_definition']}")
    print()

    print("========== SAFE / RECOVERABLE SUBSET ==========")
    safe = result["safe_recoverable"]
    print(f"Legitimate opportunities: {safe['count']}  "
          f"(exposure {_money(safe['amount_at_risk'])})")
    print(f"  Mandate Doctor expected: {_money(safe['mandate_doctor_expected'])} "
          f"({safe['mandate_doctor_recovery_rate']:.2f}% of safe exposure)")
    print(f"  Naive (same subset):     {_money(safe['naive_expected'])} "
          f"({safe['naive_recovery_rate']:.2f}% of safe exposure)")
    print(f"  Recovery difference: {_money(safe['recovery_difference'])} "
          f"| {safe['recovery_rate_improvement_points']:.2f} pp")
    print()

    print("========== ATTAINABLE EXPECTED RECOVERY ==========")
    print(f"Model-attainable expected recovery (any policy-compliant strategy): "
          f"{_money(result['attainable_expected_recovery'])}")
    print(f"Mandate Doctor share of attainable: "
          f"{result['md_share_of_attainable_percent']:.2f}%")
    print()

    print("========== UNCOLLECTABLE CASES (policy BLOCK, not hazarded) ==========")
    print(f"Count: {result['uncollectable_cases']['count']}  "
          f"Amount: {_money(result['uncollectable_cases']['amount_at_risk'])}")
    for payment in result["uncollectable_cases"]["payments"]:
        print(f"  {payment['payment_id']}  {_money(payment['amount_inr']):>12}  "
              f"{payment['root_cause']:<18} {payment['reason']}")
    print()

    print("========== SAFETY: UNSAFE RETRIES & POLICY VIOLATIONS ==========")
    unsafe = result["unsafe_retries_avoided"]
    print(f"Unsafe/invalid retries avoided by MD: {unsafe['count']}  "
          f"({_money(unsafe['amount_at_risk'])} never hazarded)")
    print(f"Policy violations (Mandate Doctor): {result['policy_violations']['count']}")
    print(f"Policy violations the naive would commit: "
          f"{result['naive_policy_violations']['count']}")
    for detail in result["policy_violations"]["details"]:
        print(f"  {detail}")
    print()

    print("========== BY DIAGNOSIS (doctor vs mechanical naive, expected) ==========")
    print(f"  {'root cause':<16} {'count':>6} {'at risk':>12} "
          f"{'doctor':>14} {'naive':>14}")
    for root_cause, bucket in sorted(
        result["by_diagnosis"].items(),
        key=lambda item: item[1]["amount_at_risk"],
        reverse=True,
    ):
        print(f"  {root_cause:<16} {bucket['count']:>6} "
              f"{_money(bucket['amount_at_risk']):>12} "
              f"{_money(bucket['doctor_expected']):>14} "
              f"{_money(bucket['naive_expected']):>14}")
    print()

    print("========== REPRODUCIBILITY ==========")
    print(f"Result digest (sha256, stable across runs): {result['reproducibility_digest']}")
    print("Re-running with the same dataset and settings produces identical "
          "metrics (no audit records written).")


def _money(value: float) -> str:
    return f"₹{value:,.2f}"


if __name__ == "__main__":
    main()