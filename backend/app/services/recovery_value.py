from typing import Any


def calculate_recovery_value(
    amount_inr: float,
    decision: str,
    diagnosis: dict[str, Any],
) -> dict[str, Any]:

    root_cause = diagnosis.get("root_cause")

    recovery_probability = {
        "BANK_TIMEOUT": 0.75,
        "BALANCE": 0.55,
        "LIMIT_EXCEEDED": 0.40,
        "EXPIRED_MANDATE": 0.20,
        "REVOKED": 0.00,
    }.get(root_cause, 0.10)

    if decision == "BLOCK":
        recovery_probability = 0.0

    expected_recovery = amount_inr * recovery_probability

    return {
        "amount_at_risk": round(amount_inr, 2),
        "recovery_probability": recovery_probability,
        "expected_recovery": round(expected_recovery, 2),
        "potential_loss": round(
            amount_inr - expected_recovery,
            2,
        ),
    }