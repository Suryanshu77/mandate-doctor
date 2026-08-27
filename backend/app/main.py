from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.diagnosis import router as diagnosis_router

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
    return {
        "revenue_at_risk": 692500.00,
        "expected_recovery": 289818.30,
        "expected_recovery_rate": 41.85,
        "expected_unrecovered": 402681.70,
        "approved_recoveries": 226,
        "total_records": 300,
        "diagnosis_accuracy": 100.0,
        "diagnosis_counts": {
            "BANK_TIMEOUT": 98,
            "LIMIT_EXCEEDED": 48,
            "REVOKED": 30,
            "BALANCE": 80,
            "EXPIRED_MANDATE": 44,
        },
        "ai_proposals": {
            "RETRY_LATER": 226,
            "REQUEST_FRESH_MANDATE": 74,
        },
        "policy_decisions": {
            "APPROVE": 226,
            "BLOCK": 74,
        },
    }


app.include_router(diagnosis_router)