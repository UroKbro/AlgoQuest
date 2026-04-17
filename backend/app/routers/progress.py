from __future__ import annotations

from fastapi import APIRouter, Query, Depends
from ..dependencies import get_optional_user
from ..repositories import (
    add_notification,
    get_current_weekly_gate,
    get_path_analytics,
    get_progress_summary,
    list_lesson_progress,
    submit_weekly_gate,
    track_activity,
    update_lesson_progress,
)
from ..schemas import (
    LessonProgressListResponse,
    LessonProgressResponse,
    LessonProgressUpdateRequest,
    PathAnalyticsResponse,
    ProgressSummaryResponse,
    WeeklyGateResponse,
    WeeklyGateSubmitRequest,
)


router = APIRouter(prefix="/api", tags=["progress"])


@router.get("/progress/summary", response_model=ProgressSummaryResponse)
async def read_progress_summary(
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> ProgressSummaryResponse:
    target_id = str(user["id"]) if user else profile_id
    return ProgressSummaryResponse.model_validate(await get_progress_summary(target_id))


@router.get("/progress/lessons", response_model=LessonProgressListResponse)
async def read_lesson_progress(
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> LessonProgressListResponse:
    target_id = str(user["id"]) if user else profile_id
    items = [
        LessonProgressResponse.model_validate(item)
        for item in await list_lesson_progress(target_id)
    ]
    return LessonProgressListResponse(items=items)


@router.put("/progress/lessons/{lesson_slug}", response_model=LessonProgressResponse)
async def write_lesson_progress(
    lesson_slug: str,
    payload: LessonProgressUpdateRequest,
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> LessonProgressResponse:
    target_id = str(user["id"]) if user else profile_id
    item = await update_lesson_progress(
        target_id,
        lesson_slug,
        payload.status,
        payload.attempts,
        payload.lastCodeSnapshot,
    )

    if payload.status == "completed":
        await track_activity(target_id, "solve", {"lesson_id": lesson_slug})
        await add_notification(
            target_id,
            "Mastery Gained",
            f"You have successfully conquered {lesson_slug}.",
            "success",
        )

    return LessonProgressResponse.model_validate(item)


@router.get("/progress/weekly-gate/current", response_model=WeeklyGateResponse)
async def read_current_weekly_gate(
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> WeeklyGateResponse:
    target_id = str(user["id"]) if user else profile_id
    return WeeklyGateResponse.model_validate(await get_current_weekly_gate(target_id))


@router.post(
    "/progress/weekly-gate/{week_start}/submit", response_model=WeeklyGateResponse
)
async def submit_weekly_gate_attempt(
    week_start: str,
    payload: WeeklyGateSubmitRequest,
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> WeeklyGateResponse:
    target_id = str(user["id"]) if user else profile_id
    return WeeklyGateResponse.model_validate(
        await submit_weekly_gate(target_id, week_start, payload.score)
    )


@router.get("/path/analytics", response_model=PathAnalyticsResponse)
async def read_path_analytics(
    profile_id: str = Query(default="guest"),
    user: dict | None = Depends(get_optional_user),
) -> PathAnalyticsResponse:
    target_id = str(user["id"]) if user else profile_id
    return PathAnalyticsResponse.model_validate(await get_path_analytics(target_id))
