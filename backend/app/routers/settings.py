from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..auth_utils import get_current_user_id
from ..repositories import get_settings, upsert_settings
from ..schemas import SettingsResponse, SettingsUpdateRequest


router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def read_settings(
    profile_id: str = Query(default="guest"),
    user_id: str | None = Depends(get_current_user_id),
) -> SettingsResponse:
    target_id = user_id if user_id else profile_id
    return SettingsResponse.model_validate(await get_settings(target_id))


@router.put("", response_model=SettingsResponse)
async def write_settings(
    payload: SettingsUpdateRequest,
    profile_id: str = Query(default="guest"),
    user_id: str | None = Depends(get_current_user_id),
) -> SettingsResponse:
    target_id = user_id if user_id else profile_id
    return SettingsResponse.model_validate(
        await upsert_settings(
            target_id,
            payload.neonIntensity,
            payload.soundVolume,
            payload.motionBlur,
            payload.reducedMotion,
        )
    )
