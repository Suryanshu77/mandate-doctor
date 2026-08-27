from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.diagnosis import diagnose_payment


router = APIRouter(prefix="/api/diagnosis", tags=["Diagnosis"])


class DiagnosisRequest(BaseModel):
    payment_id: str
    amount_inr: float
    failure_code: str
    mandate_status: Optional[str] = "active"
    attempt_number: int = 1
    previous_successes: int = 0
    previous_failures: int = 0


@router.post("")
def diagnose(request: DiagnosisRequest):
    try:
        result = diagnose_payment(request.model_dump())

        return {
            "payment_id": request.payment_id,
            "amount_inr": request.amount_inr,
            "diagnosis": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )