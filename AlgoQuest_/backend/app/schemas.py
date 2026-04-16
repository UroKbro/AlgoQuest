from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class Realm(BaseModel):
    slug: str
    name: str
    accent: str
    eyebrow: str
    description: str


class Lesson(BaseModel):
    slug: str
    title: str
    tier: str
    summary: str


class Algorithm(BaseModel):
    slug: str
    name: str
    family: str
    summary: str


class Simulation(BaseModel):
    slug: str
    name: str
    scale: str
    summary: str


class ProjectBlueprint(BaseModel):
    slug: str
    name: str
    difficulty: str
    summary: str


class SettingsResponse(BaseModel):
    profileId: str
    neonIntensity: int = Field(ge=0, le=100)
    soundVolume: int = Field(ge=0, le=100)
    motionBlur: int = Field(ge=0, le=100)
    reducedMotion: bool


class SettingsUpdateRequest(BaseModel):
    neonIntensity: int = Field(ge=0, le=100)
    soundVolume: int = Field(ge=0, le=100)
    motionBlur: int = Field(ge=0, le=100)
    reducedMotion: bool


class LessonProgressResponse(BaseModel):
    lessonSlug: str
    title: str
    tier: str
    status: Literal["not_started", "in_progress", "completed"]
    attempts: int = Field(ge=0)
    lastCodeSnapshot: str
    updatedAt: str


class LessonProgressUpdateRequest(BaseModel):
    status: Literal["not_started", "in_progress", "completed"]
    attempts: int = Field(ge=0)
    lastCodeSnapshot: str = Field(max_length=20000)


class WeeklyGateResponse(BaseModel):
    profileId: str
    weekStart: str
    puzzlesRequired: int | None = None
    codeSnippetsRequired: int | None = None
    status: str | None = None
    score: int | None = Field(default=None, ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    frictionPoints: list[str] = Field(default_factory=list)


class WeeklyGateSubmitRequest(BaseModel):
    score: int = Field(ge=0, le=100)


class ContinuityVisual(BaseModel):
    kind: str
    primaryLabel: str
    primaryValue: str
    secondaryLabel: str
    secondaryValue: str


class ContinuityResponse(BaseModel):
    realm: str
    title: str
    summary: str
    ctaLabel: str
    href: str
    visual: ContinuityVisual


class WeeklyStat(BaseModel):
    day: str
    activeMinutes: int
    logicProblemsSolved: int


class FocusResponse(BaseModel):
    label: str
    summary: str
    recommendedRealm: str


class ProgressSummaryResponse(BaseModel):
    continuity: ContinuityResponse
    weeklyStats: list[WeeklyStat]
    focus: FocusResponse


class PathAnalyticsResponse(BaseModel):
    weeklyFocus: str
    strengths: list[str]
    frictionPoints: list[str]
    masteryRadar: dict[str, int]
    weeklyGate: dict[str, Any]


class ProjectPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    blueprintSlug: str | None = None
    files: dict[str, str] = Field(default_factory=dict)
    architecture: dict[str, Any] = Field(default_factory=dict)


class ProjectResponse(BaseModel):
    id: int
    profileId: str
    blueprintSlug: str | None = None
    title: str
    files: dict[str, str]
    architecture: dict[str, Any]
    updatedAt: str
    createdAt: str


class ProjectExportResponse(BaseModel):
    projectId: int
    title: str
    blueprintSlug: str | None = None
    manifestVersion: int
    files: dict[str, str]
    architecture: dict[str, Any]
    exportedAt: str


class PosterCreateRequest(BaseModel):
    sourceType: str = Field(min_length=1, max_length=60)
    sourceRef: str | None = Field(default=None, max_length=120)
    title: str = Field(min_length=1, max_length=120)
    payload: dict[str, Any] = Field(default_factory=dict)
    visibility: Literal["private", "public"] = "private"


class PosterResponse(BaseModel):
    id: int
    profileId: str
    sourceType: str
    sourceRef: str | None = None
    title: str
    payload: dict[str, Any]
    visibility: str
    createdAt: str


class ChallengeCreateRequest(BaseModel):
    targetRealm: Literal["laboratory", "sandbox"]
    title: str = Field(min_length=1, max_length=120)
    parameters: dict[str, Any] = Field(default_factory=dict)


class ChallengeResponse(BaseModel):
    id: int
    profileId: str
    targetRealm: str
    title: str
    parameters: dict[str, Any]
    createdAt: str


class ErrorResponse(BaseModel):
    detail: str
