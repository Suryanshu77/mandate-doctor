from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.recovery_engine import make_recovery_decision


router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"],
)


class RecoveryRequest(BaseModel):
    payment_id: str
    amount_inr: float
    failure_code: str
    mandate_status: Optional[str] = "active"
    attempt_number: int = 1
    previous_successes: int = 0
    previous_failures: int = 0


@router.post("/decision")
def recovery_decision(request: RecoveryRequest):
    return make_recovery_decision(request.model_dump())