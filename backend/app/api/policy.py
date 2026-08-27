from fastapi import APIRouter
from pydantic import BaseModel

from app.services.policy_engine import evaluate_policy


router = APIRouter(prefix="/api/policy", tags=["Policy"])


class PolicyRequest(BaseModel):
    amount_inr: float
    diagnosis: dict


@router.post("")
def evaluate(request: PolicyRequest):
    result = evaluate_policy(
        amount_inr=request.amount_inr,
        diagnosis=request.diagnosis,
    )

    return {
        "amount_inr": request.amount_inr,
        "policy": result,
    }