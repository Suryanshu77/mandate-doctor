from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, StrictBool, StrictInt

from app.services import settings as settings_service
from app.services.recovery_pipeline import invalidate_cache


router = APIRouter(prefix="/api/settings", tags=["Settings"])


class SettingsPayload(BaseModel):
    retry_limit: StrictInt
    cooling_off_hours: StrictInt
    human_approval_threshold: StrictInt
    max_contact_attempts: StrictInt
    kill_switch: StrictBool


@router.get("")
def get_settings():
    return settings_service.get_settings()


@router.put("")
def update_settings(payload: SettingsPayload):
    data = payload.model_dump()

    errors = settings_service.validate(data)
    if errors:
        raise HTTPException(
            status_code=400,
            detail={"errors": errors},
        )

    saved = settings_service.save_settings(data)

    # Persisted policy changed: drop any cached policy results so the next
    # pipeline run reflects the updated settings immediately.
    invalidate_cache()

    return saved
