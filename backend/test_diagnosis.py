from app.services.diagnosis import diagnose_payment


test_cases = [
    {
        "payment_id": "pay_001",
        "amount_inr": 499,
        "failure_code": "insufficient_balance",
        "mandate_status": "active",
        "attempt_number": 1,
        "previous_successes": 8,
        "previous_failures": 1,
    },
    {
        "payment_id": "pay_002",
        "amount_inr": 999,
        "failure_code": "bank_timeout",
        "mandate_status": "active",
        "attempt_number": 1,
        "previous_successes": 10,
        "previous_failures": 0,
    },
    {
        "payment_id": "pay_003",
        "amount_inr": 1999,
        "failure_code": "mandate_revoked",
        "mandate_status": "revoked",
        "attempt_number": 1,
        "previous_successes": 5,
        "previous_failures": 2,
    },
    {
        "payment_id": "pay_004",
        "amount_inr": 799,
        "failure_code": "mandate_expired",
        "mandate_status": "expired",
        "attempt_number": 1,
        "previous_successes": 12,
        "previous_failures": 0,
    },
    {
        "payment_id": "pay_005",
        "amount_inr": 4999,
        "failure_code": "limit_exceeded",
        "mandate_status": "active",
        "attempt_number": 2,
        "previous_successes": 15,
        "previous_failures": 1,
    },
]


if __name__ == "__main__":
    for payment in test_cases:
        result = diagnose_payment(payment)

        print("\nPayment:", payment["payment_id"])
        print("Failure:", payment["failure_code"])
        print("Diagnosis:", result["root_cause"])
        print("Confidence:", result["confidence"])
        print("Recoverable:", result["recoverable"])
        print("Action:", result["recommended_action"])