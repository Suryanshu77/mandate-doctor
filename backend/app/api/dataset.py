from fastapi import APIRouter

from app.services.dataset import get_dataset_stats, load_failed_mandates


router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"],
)


@router.get("/stats")
def dataset_stats():
    return get_dataset_stats()


@router.get("/failed-mandates")
def failed_mandates():
    return {
        "count": len(load_failed_mandates()),
        "records": load_failed_mandates(),
    }