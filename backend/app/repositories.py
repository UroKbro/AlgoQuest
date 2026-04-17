from __future__ import annotations

from typing import Optional, Any

from datetime import datetime, timezone

import httpx

from .content import LESSONS
from .config import settings


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _headers(prefer: str | None = None) -> dict[str, str]:
    headers = {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


async def _request(
    method: str,
    table: str,
    *,
    params: dict[str, Any] | None = None,
    json_payload: Any = None,
    prefer: str | None = None,
) -> Any:
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise RuntimeError(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.request(
            method,
            f"{settings.supabase_url}/rest/v1/{table}",
            params=params,
            json=json_payload,
            headers=_headers(prefer),
        )

    if response.is_success:
        if not response.content:
            return None
        return response.json()

    try:
        payload = response.json()
    except Exception:
        payload = {}

    message = payload.get("message") or payload.get("details") or payload.get("hint")
    raise RuntimeError(
        message
        or f"Supabase request failed for {table} with status {response.status_code}"
    )


async def _select(
    table: str,
    *,
    filters: dict[str, Any] | None = None,
    order: str | None = None,
    limit: int | None = None,
    maybe_single: bool = False,
) -> Any:
    params: dict[str, Any] = {"select": "*"}
    for key, value in (filters or {}).items():
        params[key] = f"eq.{value}"
    if order:
        params["order"] = order
    if limit is not None:
        params["limit"] = str(limit)

    rows = await _request("GET", table, params=params)
    if maybe_single:
        return rows[0] if rows else None
    return rows


async def _insert(table: str, payload: dict[str, Any]) -> dict[str, Any]:
    rows = await _request(
        "POST", table, json_payload=payload, prefer="return=representation"
    )
    return rows[0]


async def _upsert(
    table: str, payload: dict[str, Any], *, on_conflict: str
) -> dict[str, Any]:
    rows = await _request(
        "POST",
        table,
        params={"on_conflict": on_conflict},
        json_payload=payload,
        prefer="resolution=merge-duplicates,return=representation",
    )
    return rows[0]


async def _update(
    table: str, filters: dict[str, Any], payload: dict[str, Any]
) -> dict[str, Any] | None:
    params = {key: f"eq.{value}" for key, value in filters.items()}
    rows = await _request(
        "PATCH",
        table,
        params=params,
        json_payload=payload,
        prefer="return=representation",
    )
    return rows[0] if rows else None


async def _count(table: str, *, filters: dict[str, Any] | None = None) -> int:
    return len(await _select(table, filters=filters))


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------


async def get_settings(profile_id: str = "guest") -> dict:
    row = await _select(
        "settings", filters={"profile_id": profile_id}, maybe_single=True
    )
    if row is None:
        return {
            "profileId": profile_id,
            "neonIntensity": 72,
            "soundVolume": 40,
            "motionBlur": 24,
            "reducedMotion": False,
        }

    return {
        "profileId": row["profile_id"],
        "neonIntensity": row["neon_intensity"],
        "soundVolume": row["sound_volume"],
        "motionBlur": row["motion_blur"],
        "reducedMotion": bool(row["reduced_motion"]),
    }


async def upsert_settings(
    profile_id: str,
    neon_intensity: int,
    sound_volume: int,
    motion_blur: int,
    reduced_motion: bool,
) -> dict:
    row = await _upsert(
        "settings",
        {
            "profile_id": profile_id,
            "neon_intensity": neon_intensity,
            "sound_volume": sound_volume,
            "motion_blur": motion_blur,
            "reduced_motion": reduced_motion,
        },
        on_conflict="profile_id",
    )
    return {
        "profileId": row["profile_id"],
        "neonIntensity": row["neon_intensity"],
        "soundVolume": row["sound_volume"],
        "motionBlur": row["motion_blur"],
        "reducedMotion": bool(row["reduced_motion"]),
    }


# ---------------------------------------------------------------------------
# Lesson Progress
# ---------------------------------------------------------------------------


async def list_lesson_progress(profile_id: str = "guest") -> list[dict]:
    lesson_map = {lesson["slug"]: lesson for lesson in LESSONS}
    rows = await _select(
        "lesson_progress",
        filters={"profile_id": profile_id},
        order="updated_at.desc,lesson_slug.asc",
    )

    return [
        {
            "lessonSlug": row["lesson_slug"],
            "title": lesson_map.get(row["lesson_slug"], {}).get(
                "title", row["lesson_slug"]
            ),
            "tier": lesson_map.get(row["lesson_slug"], {}).get("tier", "Unknown"),
            "status": row["status"],
            "attempts": row["attempts"],
            "lastCodeSnapshot": row["last_code_snapshot"],
            "updatedAt": row["updated_at"],
        }
        for row in rows
    ]


async def upsert_lesson_progress(
    profile_id: str,
    lesson_slug: str,
    status: str,
    attempts: int,
    last_code_snapshot: str,
) -> dict:
    row = await _upsert(
        "lesson_progress",
        {
            "profile_id": profile_id,
            "lesson_slug": lesson_slug,
            "status": status,
            "attempts": attempts,
            "last_code_snapshot": last_code_snapshot,
            "updated_at": _now_iso(),
        },
        on_conflict="profile_id,lesson_slug",
    )
    lesson_map = {lesson["slug"]: lesson for lesson in LESSONS}
    return {
        "lessonSlug": row["lesson_slug"],
        "title": lesson_map.get(row["lesson_slug"], {}).get(
            "title", row["lesson_slug"]
        ),
        "tier": lesson_map.get(row["lesson_slug"], {}).get("tier", "Unknown"),
        "status": row["status"],
        "attempts": row["attempts"],
        "lastCodeSnapshot": row["last_code_snapshot"],
        "updatedAt": row["updated_at"],
    }


async def update_lesson_progress(
    profile_id: str,
    lesson_slug: str,
    status: str,
    attempts: int,
    last_code_snapshot: str,
) -> dict:
    return await upsert_lesson_progress(
        profile_id, lesson_slug, status, attempts, last_code_snapshot
    )


# ---------------------------------------------------------------------------
# Weekly Gate & Analytics
# ---------------------------------------------------------------------------


async def _latest_gate(profile_id: str) -> dict[str, Any] | None:
    return await _select(
        "weekly_gate_results",
        filters={"profile_id": profile_id},
        order="completed_at.desc",
        limit=1,
        maybe_single=True,
    )


async def get_progress_summary(profile_id: str = "guest") -> dict:
    lessons = await list_lesson_progress(profile_id)
    completed_count = sum(1 for lesson in lessons if lesson["status"] == "completed")
    active_lesson = next(
        (
            lesson
            for lesson in lessons
            if lesson["status"] in {"in_progress", "completed"}
        ),
        lessons[0] if lessons else None,
    )
    gate = await _latest_gate(profile_id)
    friction_points = (
        gate["friction_points_json"]
        if gate
        else ["Nested recursion", "Snapshot comparison"]
    )

    return {
        "continuity": {
            "realm": "dojo",
            "title": active_lesson["title"] if active_lesson else "Loop Mastery",
            "summary": "Resume your latest lesson and carry the result into the Laboratory.",
            "ctaLabel": "Resume Quest",
            "href": "/dojo",
            "visual": {
                "kind": "memory-trace",
                "primaryLabel": "completed lessons",
                "primaryValue": str(completed_count),
                "secondaryLabel": "next focus",
                "secondaryValue": friction_points[0]
                if friction_points
                else "logic drill",
            },
        },
        "weeklyStats": await _get_real_weekly_stats(profile_id),
        "focus": {
            "label": friction_points[0] if friction_points else "Recursive Depth",
            "summary": "Your strongest loops are stable, but deeper state comparisons still need repetition.",
            "recommendedRealm": "path",
        },
    }


async def get_path_analytics(profile_id: str = "guest") -> dict:
    lessons = await list_lesson_progress(profile_id)
    completed_count = sum(1 for lesson in lessons if lesson["status"] == "completed")
    gate = await _latest_gate(profile_id)
    strengths = (
        gate["strengths_json"] if gate else ["Loop consistency", "Array scanning"]
    )
    friction_points = (
        gate["friction_points_json"]
        if gate
        else ["Nested recursion", "Snapshot comparison"]
    )

    return {
        "weeklyFocus": friction_points[0] if friction_points else "Recursive Depth",
        "strengths": strengths,
        "frictionPoints": friction_points,
        "masteryRadar": {
            "logic": min(95, 48 + completed_count * 8),
            "syntax": min(95, 52 + completed_count * 7),
            "efficiency": 58,
            "projects": 34,
            "speed": 61,
        },
        "weeklyGate": {
            "score": gate["score"] if gate else 78,
            "strengths": strengths,
            "frictionPoints": friction_points,
        },
    }


async def get_current_weekly_gate(profile_id: str = "guest") -> dict:
    return {
        "profileId": profile_id,
        "weekStart": "2026-04-13",
        "puzzlesRequired": 3,
        "codeSnippetsRequired": 2,
        "status": "available",
    }


async def submit_weekly_gate(profile_id: str, week_start: str, score: int) -> dict:
    strengths = (
        ["Loop consistency", "Array scanning"]
        if score >= 70
        else ["Persistence", "Basic tracing"]
    )
    friction_points = (
        ["Nested recursion", "Snapshot comparison"]
        if score >= 70
        else ["Loop control", "State updates"]
    )

    await _upsert(
        "weekly_gate_results",
        {
            "profile_id": profile_id,
            "week_start": week_start,
            "score": score,
            "strengths_json": strengths,
            "friction_points_json": friction_points,
            "completed_at": _now_iso(),
        },
        on_conflict="profile_id,week_start",
    )

    return {
        "profileId": profile_id,
        "weekStart": week_start,
        "score": score,
        "strengths": strengths,
        "frictionPoints": friction_points,
    }


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------


async def list_projects(profile_id: str = "guest") -> list[dict]:
    rows = await _select(
        "projects",
        filters={"profile_id": profile_id},
        order="updated_at.desc,id.desc",
    )
    return [_project_row_to_dict(row) for row in rows]


async def create_project(
    profile_id: str,
    blueprint_slug: Optional[str],
    title: str,
    files: dict,
    architecture: dict,
) -> dict:
    row = await _insert(
        "projects",
        {
            "profile_id": profile_id,
            "blueprint_slug": blueprint_slug,
            "title": title,
            "files_json": files,
            "architecture_json": architecture,
            "updated_at": _now_iso(),
        },
    )
    return _project_row_to_dict(row)


async def get_project(project_id: int, profile_id: str = "guest") -> Optional[dict]:
    row = await _select(
        "projects",
        filters={"id": project_id, "profile_id": profile_id},
        maybe_single=True,
    )
    return _project_row_to_dict(row) if row else None


async def update_project(
    project_id: int,
    profile_id: str,
    title: str,
    files: dict,
    architecture: dict,
) -> Optional[dict]:
    row = await _update(
        "projects",
        {"id": project_id, "profile_id": profile_id},
        {
            "title": title,
            "files_json": files,
            "architecture_json": architecture,
            "updated_at": _now_iso(),
        },
    )
    return _project_row_to_dict(row) if row else None


async def build_project_export(
    project_id: int, profile_id: str = "guest"
) -> Optional[dict]:
    project = await get_project(project_id, profile_id)
    if project is None:
        return None
    return {
        "projectId": project["id"],
        "title": project["title"],
        "blueprintSlug": project["blueprintSlug"],
        "manifestVersion": 1,
        "files": project["files"],
        "architecture": project["architecture"],
        "exportedAt": _now_iso(),
    }


# ---------------------------------------------------------------------------
# Forge
# ---------------------------------------------------------------------------


async def list_posters(profile_id: str = "guest") -> list[dict]:
    rows = await _select(
        "logic_posters",
        filters={"profile_id": profile_id},
        order="created_at.desc,id.desc",
    )
    return [_poster_row_to_dict(row) for row in rows]


async def create_poster(
    profile_id: str,
    source_type: str,
    source_ref: Optional[str],
    title: str,
    payload: dict,
    visibility: str,
) -> dict:
    row = await _insert(
        "logic_posters",
        {
            "profile_id": profile_id,
            "source_type": source_type,
            "source_ref": source_ref,
            "title": title,
            "payload_json": payload,
            "visibility": visibility,
        },
    )
    return _poster_row_to_dict(row)


async def list_challenges(profile_id: str = "guest") -> list[dict]:
    rows = await _select(
        "forge_challenges",
        filters={"profile_id": profile_id},
        order="created_at.desc,id.desc",
    )
    return [_challenge_row_to_dict(row) for row in rows]


async def create_challenge(
    profile_id: str, target_realm: str, title: str, parameters: dict
) -> dict:
    row = await _insert(
        "forge_challenges",
        {
            "profile_id": profile_id,
            "target_realm": target_realm,
            "title": title,
            "parameters_json": parameters,
        },
    )
    return _challenge_row_to_dict(row)


async def get_challenge(challenge_id: int, profile_id: str = "guest") -> Optional[dict]:
    row = await _select(
        "forge_challenges",
        filters={"id": challenge_id, "profile_id": profile_id},
        maybe_single=True,
    )
    return _challenge_row_to_dict(row) if row else None


# ---------------------------------------------------------------------------
# AI Usage Logging
# ---------------------------------------------------------------------------


async def log_ai_usage(
    profile_id: str,
    endpoint: str,
    prompt_preview: str,
    status: str,
    latency_ms: int,
) -> None:
    await _insert(
        "ai_usage_logs",
        {
            "profile_id": profile_id,
            "endpoint": endpoint,
            "prompt_preview": prompt_preview,
            "status": status,
            "latency_ms": latency_ms,
            "created_at": _now_iso(),
        },
    )


# ---------------------------------------------------------------------------
# Activity & Notifications
# ---------------------------------------------------------------------------


async def track_activity(
    profile_id: str, event_type: str, metadata: dict | None = None
) -> None:
    await _insert(
        "activity_logs",
        {
            "profile_id": profile_id,
            "event_type": event_type,
            "metadata_json": metadata or {},
            "created_at": _now_iso(),
        },
    )


async def add_notification(
    profile_id: str, title: str, message: str, kind: str = "info"
) -> dict:
    row = await _insert(
        "notifications",
        {
            "profile_id": profile_id,
            "title": title,
            "message": message,
            "kind": kind,
            "is_read": False,
            "created_at": _now_iso(),
        },
    )
    return _notification_row_to_dict(row)


async def list_notifications(profile_id: str, limit: int = 10) -> list[dict]:
    rows = await _select(
        "notifications",
        filters={"profile_id": profile_id},
        order="created_at.desc",
        limit=limit,
    )
    return [_notification_row_to_dict(row) for row in rows]


async def mark_notification_read(notification_id: int, profile_id: str) -> bool:
    row = await _update(
        "notifications",
        {"id": notification_id, "profile_id": profile_id},
        {"is_read": True},
    )
    return row is not None


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------


async def _get_real_weekly_stats(profile_id: str) -> list[dict]:
    solves = await _count(
        "activity_logs",
        filters={"profile_id": profile_id, "event_type": "solve"},
    )
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {
            "day": day,
            "activeMinutes": 15 + (i * 3),
            "logicProblemsSolved": (solves if i == 4 else (1 if i < 4 else 0)),
        }
        for i, day in enumerate(days)
    ]


def _project_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "blueprintSlug": row["blueprint_slug"],
        "title": row["title"],
        "files": row["files_json"],
        "architecture": row["architecture_json"],
        "updatedAt": row["updated_at"],
        "createdAt": row["created_at"],
    }


def _poster_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "sourceType": row["source_type"],
        "sourceRef": row["source_ref"],
        "title": row["title"],
        "payload": row["payload_json"],
        "visibility": row["visibility"],
        "createdAt": row["created_at"],
    }


def _challenge_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "targetRealm": row["target_realm"],
        "title": row["title"],
        "parameters": row["parameters_json"],
        "createdAt": row["created_at"],
    }


def _notification_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "title": row["title"],
        "message": row["message"],
        "kind": row["kind"],
        "isRead": bool(row["is_read"]),
        "createdAt": row["created_at"],
    }
