from app.services.dataset import load_failed_mandates
from app.services.recovery_engine import make_recovery_decision


if __name__ == "__main__":
    records = load_failed_mandates()

    record = records[0]

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

    print("\n========== PAYMENT ==========")
    print(payment)

    print("\n========== DIAGNOSIS ==========")
    print(result["diagnosis"])

    print("\n========== AI PROPOSAL ==========")
    print(result["ai_proposal"])

    print("\n========== POLICY ==========")
    print(result["policy"])

    print("\n========== RECOVERY VALUE ==========")
    print(result["recovery_value"])

    print("\n========== FINAL DECISION ==========")
    print(result["final_decision"])