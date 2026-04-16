from __future__ import annotations

from fastapi import APIRouter, Query

from ..repositories import get_settings, upsert_settings
from ..schemas import SettingsResponse, SettingsUpdateRequest


router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def read_settings(profile_id: str = Query(default="guest")) -> SettingsResponse:
    return SettingsResponse.model_validate(get_settings(profile_id))


@router.put("", response_model=SettingsResponse)
async def write_settings(
    payload: SettingsUpdateRequest, profile_id: str = Query(default="guest")
) -> SettingsResponse:
    return SettingsResponse.model_validate(
        upsert_settings(
            profile_id,
            payload.neonIntensity,
            payload.soundVolume,
            payload.motionBlur,
            payload.reducedMotion,
        )
    )
