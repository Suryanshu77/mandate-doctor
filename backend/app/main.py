from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.api.diagnosis import router as diagnosis_router
from app.api.cases import router as cases_router
from app.api.audit import router as audit_router
from app.api.metrics import router as metrics_router
from app.api.evaluation import router as evaluation_router
from app.api.recovery import router as recovery_router
from app.api.settings import router as settings_router
from app.api.webhooks import router as webhooks_router
from app.services.action_layer import execute_action
from app.services.audit import log_approval
from app.services.recovery_pipeline import get_overview, get_recovery_cases


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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": jsonable_encoder(exc.errors()),
        },
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
app.include_router(metrics_router)
app.include_router(evaluation_router)
app.include_router(recovery_router)
app.include_router(settings_router)
app.include_router(webhooks_router)


class ApprovalRequest(BaseModel):
    payment_id: str
    decision: str


@app.post("/api/approvals")
def process_approval(request: ApprovalRequest):
    if request.decision not in {"APPROVE", "REJECT"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid decision; must be APPROVE or REJECT.",
        )

    case = next(
        (
            case
            for case in get_recovery_cases()
            if case["payment_id"] == request.payment_id
        ),
        None,
    )

    if case is None:
        raise HTTPException(
            status_code=404,
            detail="Unknown payment id; could not find a matching recovery case.",
        )

    policy = case["policy"]
    policy_decision = policy["decision"]
    proposal = case["ai_proposal"]
    action_name = proposal.get("action")

    if request.decision == "REJECT":
        # REJECT always prevents execution.
        action_result = execute_action(
            payment_id=request.payment_id,
            proposed_action=action_name,
            policy_decision="BLOCK",
            recovery_info=proposal,
        )
        message = (
            "Recovery action was rejected by the human approver; "
            "no action was executed."
        )
    elif policy_decision == "BLOCK":
        # Policy-first: an APPROVE cannot override a hard policy block.
        action_result = execute_action(
            payment_id=request.payment_id,
            proposed_action=action_name,
            policy_decision="BLOCK",
            recovery_info=proposal,
        )
        message = (
            "Approval received but action was not executed: "
            "policy blocks this recovery."
        )
    else:
        # REVIEW (human approval required) or already policy-approved:
        # approval permits the pending action to proceed in simulation.
        action_result = execute_action(
            payment_id=request.payment_id,
            proposed_action=action_name,
            policy_decision="APPROVE",
            recovery_info=proposal,
        )
        message = (
            "Approval received; recovery action executed in simulation mode."
        )

    log_approval(
        payment_id=request.payment_id,
        decision=request.decision,
        policy_decision=policy_decision,
        action=action_result,
        message=message,
    )

    return {
        "success": True,
        "payment_id": request.payment_id,
        "decision": request.decision,
        "policy_decision": policy_decision,
        "action": action_result,
        "message": message,
    }