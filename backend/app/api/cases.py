from fastapi import APIRouter

from app.services.recovery_pipeline import get_recovery_cases

router = APIRouter(prefix="/api/cases", tags=["Cases"])


@router.get("")
def get_cases():
    cases = get_recovery_cases()

    return {
        "total": len(cases),
        "cases": cases,
    }
