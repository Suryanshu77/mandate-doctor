"""Action Layer tests: APPROVE executes in simulation mode, BLOCK never executes."""

from app.services.action_layer import execute_action
from app.services.recovery_engine import make_recovery_decision


def test_approve_executes_retry_later():
    result = execute_action(
        payment_id="pay_001",
        proposed_action="RETRY_LATER",
        policy_decision="APPROVE",
        recovery_info={"action": "RETRY_LATER", "retry_after_hours": 12},
    )

    assert result["status"] == "EXECUTED"
    assert result["simulated"] is True
    assert result["action"] == "RETRY_LATER"
    assert result["retry_after_hours"] == 12
    assert result["executed_at"] is not None


def test_approve_executes_fresh_mandate():
    result = execute_action(
        payment_id="pay_002",
        proposed_action="REQUEST_FRESH_MANDATE",
        policy_decision="APPROVE",
        recovery_info={"action": "REQUEST_FRESH_MANDATE"},
    )

    assert result["status"] == "EXECUTED"
    assert result["simulated"] is True
    assert result["action"] == "REQUEST_FRESH_MANDATE"
    assert result["executed_at"] is not None


def test_block_never_executes():
    for action in ("RETRY_LATER", "REQUEST_FRESH_MANDATE"):
        result = execute_action(
            payment_id="pay_003",
            proposed_action=action,
            policy_decision="BLOCK",
            recovery_info={"action": action},
        )

        assert result["status"] == "SKIPPED"
        assert result["simulated"] is True
        assert result["executed_at"] is None


def test_review_never_executes():
    result = execute_action(
        payment_id="pay_004",
        proposed_action="RETRY_LATER",
        policy_decision="REVIEW",
        recovery_info={"action": "RETRY_LATER"},
    )

    assert result["status"] == "SKIPPED"
    assert result["executed_at"] is None


def build_payment(
    payment_id,
    amount_inr,
    failure_code,
    mandate_status="active",
    attempt_number=1,
    previous_successes=0,
    previous_failures=0,
):
    return {
        "payment_id": payment_id,
        "amount_inr": amount_inr,
        "failure_code": failure_code,
        "mandate_status": mandate_status,
        "attempt_number": attempt_number,
        "previous_successes": previous_successes,
        "previous_failures": previous_failures,
    }


def test_end_to_end_approve_executes_action():
    payment = build_payment(
        payment_id="pay_101",
        amount_inr=499,
        failure_code="bank_timeout",
        attempt_number=2,
        previous_successes=8,
        previous_failures=1,
    )

    result = make_recovery_decision(payment)

    assert result["final_decision"] == "APPROVE"
    assert result["action"]["status"] == "EXECUTED"
    assert result["action"]["simulated"] is True
    assert result["action"]["action"] == "RETRY_LATER"


def test_end_to_end_block_does_not_execute():
    payment = build_payment(
        payment_id="pay_102",
        amount_inr=4999,
        failure_code="mandate_revoked",
        mandate_status="revoked",
    )

    result = make_recovery_decision(payment)

    assert result["final_decision"] == "BLOCK"
    assert result["action"]["status"] == "SKIPPED"
    assert result["action"]["executed_at"] is None
