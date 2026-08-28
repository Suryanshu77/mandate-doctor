from fastapi import APIRouter
from pydantic import BaseModel

from app.services.policy_engine import evaluate_policy


router = APIRouter(prefix="/api/policy", tags=["Policy"])


class PolicyRequest(BaseModel):
    amount_inr: float
    diagnosis: dict
    attempt_number: int = 1


@router.post("")
def evaluate(request: PolicyRequest):
    result = evaluate_policy(
        amount_inr=request.amount_inr,
        diagnosis=request.diagnosis,
        attempt_number=request.attempt_number,
    )

    return {
        "amount_inr": request.amount_inr,
        "attempt_number": request.attempt_number,
        "policy": result,
    }
