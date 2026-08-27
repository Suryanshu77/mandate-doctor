from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.api.diagnosis import router as diagnosis_router
from app.api.cases import router as cases_router
from app.api.audit import router as audit_router
from app.services.recovery_pipeline import get_overview


app = FastAPI(
    title="Mandate Doctor API",
    description="Agentic payment and mandate revenue recovery system",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "mandate-doctor",
    }


@app.get("/api/overview")
def overview():
    return get_overview()


app.include_router(diagnosis_router)
app.include_router(cases_router)
app.include_router(audit_router)


class ApprovalRequest(BaseModel):
    payment_id: str
    decision: str


@app.post("/api/approvals")
def process_approval(request: ApprovalRequest):
    if request.decision not in {"APPROVE", "REJECT"}:
        return {
            "success": False,
            "message": "Invalid decision",
        }

    return {
        "success": True,
        "payment_id": request.payment_id,
        "decision": request.decision,
        "message": f"Approval decision recorded: {request.decision}",
    }