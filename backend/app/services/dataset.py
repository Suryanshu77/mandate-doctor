import csv
from pathlib import Path


DATASET_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "synthetic"
    / "failed_mandates.csv"
)


def load_failed_mandates() -> list[dict]:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_PATH}"
        )

    with open(DATASET_PATH, "r", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def get_dataset_stats() -> dict:
    records = load_failed_mandates()

    return {
        "total_records": len(records),
        "dataset": "failed_mandates.csv",
    }