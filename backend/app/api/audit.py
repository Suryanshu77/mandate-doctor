from fastapi import APIRouter

from app.services.audit import get_audit_logs


router = APIRouter(
    prefix="/api/audit",
    tags=["Audit"],
)


@router.get("")
def audit_logs():
    return {
        "count": len(get_audit_logs()),
        "records": get_audit_logs(),
    }