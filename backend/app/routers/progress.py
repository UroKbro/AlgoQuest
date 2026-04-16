from __future__ import annotations

from fastapi import APIRouter, Query

from ..repositories import (
    get_current_weekly_gate,
    get_path_analytics,
    get_progress_summary,
    list_lesson_progress,
    submit_weekly_gate,
    upsert_lesson_progress,
)
from ..schemas import (
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
) -> ProgressSummaryResponse:
    return ProgressSummaryResponse.model_validate(get_progress_summary(profile_id))


@router.get("/progress/lessons", response_model=list[LessonProgressResponse])
async def read_lesson_progress(
    profile_id: str = Query(default="guest"),
) -> list[LessonProgressResponse]:
    return [
        LessonProgressResponse.model_validate(item)
        for item in list_lesson_progress(profile_id)
    ]


@router.put("/progress/lessons/{lesson_slug}", response_model=LessonProgressResponse)
async def write_lesson_progress(
    lesson_slug: str,
    payload: LessonProgressUpdateRequest,
    profile_id: str = Query(default="guest"),
) -> LessonProgressResponse:
    item = upsert_lesson_progress(
        profile_id,
        lesson_slug,
        payload.status,
        payload.attempts,
        payload.lastCodeSnapshot,
    )
    return LessonProgressResponse.model_validate(item)


@router.get("/progress/weekly-gate/current", response_model=WeeklyGateResponse)
async def read_current_weekly_gate(
    profile_id: str = Query(default="guest"),
) -> WeeklyGateResponse:
    return WeeklyGateResponse.model_validate(get_current_weekly_gate(profile_id))


@router.post(
    "/progress/weekly-gate/{week_start}/submit", response_model=WeeklyGateResponse
)
async def submit_weekly_gate_attempt(
    week_start: str,
    payload: WeeklyGateSubmitRequest,
    profile_id: str = Query(default="guest"),
) -> WeeklyGateResponse:
    return WeeklyGateResponse.model_validate(
        submit_weekly_gate(profile_id, week_start, payload.score)
    )


@router.get("/path/analytics", response_model=PathAnalyticsResponse)
async def read_path_analytics(
    profile_id: str = Query(default="guest"),
) -> PathAnalyticsResponse:
    return PathAnalyticsResponse.model_validate(get_path_analytics(profile_id))
