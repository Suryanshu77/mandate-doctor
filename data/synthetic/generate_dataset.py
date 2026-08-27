import csv
import random
import uuid
from datetime import datetime, timedelta
from pathlib import Path


NUM_RECORDS = 300

FAILURE_DISTRIBUTION = {
    "BALANCE": 0.30,
    "EXPIRED_MANDATE": 0.15,
    "REVOKED": 0.10,
    "BANK_TIMEOUT": 0.30,
    "LIMIT_EXCEEDED": 0.15,
}

FAILURE_CODES = {
    "BALANCE": [
        "insufficient_balance",
        "low_balance",
    ],
    "EXPIRED_MANDATE": [
        "mandate_expired",
        "expired_mandate",
    ],
    "REVOKED": [
        "mandate_revoked",
        "revoked_mandate",
    ],
    "BANK_TIMEOUT": [
        "bank_timeout",
        "network_timeout",
    ],
    "LIMIT_EXCEEDED": [
        "limit_exceeded",
        "mandate_limit_exceeded",
    ],
}


def choose_root_cause():
    categories = list(FAILURE_DISTRIBUTION.keys())
    weights = list(FAILURE_DISTRIBUTION.values())

    return random.choices(categories, weights=weights, k=1)[0]


def generate_customer_history():
    previous_successes = random.randint(0, 20)
    previous_failures = random.randint(0, 5)

    return previous_successes, previous_failures


def generate_record(index):
    root_cause = choose_root_cause()

    failure_code = random.choice(
        FAILURE_CODES[root_cause]
    )

    previous_successes, previous_failures = (
        generate_customer_history()
    )

    amount = random.choice([
        99,
        199,
        299,
        499,
        799,
        999,
        1499,
        1999,
        2499,
        4999,
        9999,
    ])

    attempt_number = random.randint(1, 4)

    mandate_status = "active"

    if root_cause == "EXPIRED_MANDATE":
        mandate_status = "expired"

    elif root_cause == "REVOKED":
        mandate_status = "revoked"

    elif root_cause in ["BALANCE", "BANK_TIMEOUT", "LIMIT_EXCEEDED"]:
        mandate_status = "active"

    created_at = datetime.now() - timedelta(
        days=random.randint(0, 90),
        hours=random.randint(0, 23),
        minutes=random.randint(0, 59),
    )

    return {
        "payment_id": f"pay_test_{uuid.uuid4().hex[:12]}",
        "customer_id": f"cust_{uuid.uuid4().hex[:10]}",
        "subscription_id": f"sub_{uuid.uuid4().hex[:10]}",
        "mandate_id": f"mandate_{uuid.uuid4().hex[:10]}",
        "amount_inr": amount,
        "currency": "INR",
        "failure_code": failure_code,
        "root_cause": root_cause,
        "mandate_status": mandate_status,
        "attempt_number": attempt_number,
        "previous_successes": previous_successes,
        "previous_failures": previous_failures,
        "created_at": created_at.isoformat(),
    }


def generate_dataset():
    random.seed(42)

    records = [
        generate_record(index)
        for index in range(NUM_RECORDS)
    ]

    output_path = Path(__file__).parent / "failed_mandates.csv"

    with open(
        output_path,
        "w",
        newline="",
        encoding="utf-8",
    ) as file:

        writer = csv.DictWriter(
            file,
            fieldnames=records[0].keys(),
        )

        writer.writeheader()
        writer.writerows(records)

    print(f"Generated {len(records)} records.")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    generate_dataset()