from fastapi import APIRouter

from app.services.evaluation import evaluate


router = APIRouter(
    prefix="/api/evaluation",
    tags=["Evaluation"],
)


@router.get("")
def evaluation_results():
    """Return the evaluation harness results for the full dataset.

    The evaluation is deterministic and side-effect free: it computes the
    recovery pipeline without writing audit records and without modifying
    settings."""

    return evaluate()