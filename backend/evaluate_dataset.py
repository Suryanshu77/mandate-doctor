from collections import Counter

from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision


records = load_failed_mandates()

results = []

y_true = []
y_pred = []

total_at_risk = 0
total_expected_recovery = 0

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

    results.append(result)

    y_true.append(record.get("root_cause"))
    y_pred.append(result["diagnosis"]["root_cause"])

    total_at_risk += result["recovery_value"]["amount_at_risk"]
    total_expected_recovery += result["recovery_value"]["expected_recovery"]


# Diagnosis accuracy
correct = sum(
    actual == predicted
    for actual, predicted in zip(y_true, y_pred)
)

accuracy = correct / len(y_true) if y_true else 0


# Counts
diagnoses = Counter(y_pred)
actions = Counter(
    r["ai_proposal"]["action"] for r in results
)
decisions = Counter(
    r["final_decision"] for r in results
)


recovery_rate = (
    total_expected_recovery / total_at_risk
    if total_at_risk
    else 0
)


print("\n========== DATASET EVALUATION ==========")
print(f"Total records: {len(results)}")

print("\n========== DIAGNOSIS ==========")
print(f"Correct: {correct}")
print(f"Incorrect: {len(results) - correct}")
print(f"Accuracy: {accuracy:.2%}")

print("\n========== DIAGNOSIS COUNTS ==========")
for diagnosis, count in diagnoses.items():
    print(f"{diagnosis}: {count}")

print("\n========== AI PROPOSALS ==========")
for action, count in actions.items():
    print(f"{action}: {count}")

print("\n========== POLICY DECISIONS ==========")
for decision, count in decisions.items():
    print(f"{decision}: {count}")

print("\n========== REVENUE METRICS ==========")
print(f"Total revenue at risk: ₹{total_at_risk:,.2f}")
print(f"Expected recovery: ₹{total_expected_recovery:,.2f}")
print(f"Expected recovery rate: {recovery_rate:.2%}")
print(
    f"Expected unrecovered amount: "
    f"₹{total_at_risk - total_expected_recovery:,.2f}"
)