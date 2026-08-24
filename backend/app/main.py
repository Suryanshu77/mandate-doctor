from fastapi import FastAPI

app = FastAPI(
    title="Mandate Doctor API",
    description="Agentic payment and mandate revenue recovery system",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "mandate-doctor",
    }