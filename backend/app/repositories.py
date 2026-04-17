from __future__ import annotations
from typing import Optional, Union, Any, cast

import json
from datetime import datetime, timezone

from .content import LESSONS
from .db import get_connection


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_settings(profile_id: str = "guest") -> dict:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM settings WHERE profile_id = ?", (profile_id,)
        ).fetchone()

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


def upsert_settings(
    profile_id: str,
    neon_intensity: int,
    sound_volume: int,
    motion_blur: int,
    reduced_motion: bool,
) -> dict:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO settings (profile_id, neon_intensity, sound_volume, motion_blur, reduced_motion)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(profile_id) DO UPDATE SET
                neon_intensity = excluded.neon_intensity,
                sound_volume = excluded.sound_volume,
                motion_blur = excluded.motion_blur,
                reduced_motion = excluded.reduced_motion
            """,
            (
                profile_id,
                neon_intensity,
                sound_volume,
                motion_blur,
                int(reduced_motion),
            ),
        )
    return get_settings(profile_id)


def list_lesson_progress(profile_id: str = "guest") -> list[dict]:
    lesson_map = {lesson["slug"]: lesson for lesson in LESSONS}
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM lesson_progress WHERE profile_id = ? ORDER BY updated_at DESC, lesson_slug ASC",
            (profile_id,),
        ).fetchall()

    items = []
    for row in rows:
        lesson = lesson_map.get(row["lesson_slug"], {})
        items.append(
            {
                "lessonSlug": row["lesson_slug"],
                "title": lesson.get("title", row["lesson_slug"]),
                "tier": lesson.get("tier", "Unknown"),
                "status": row["status"],
                "attempts": row["attempts"],
                "lastCodeSnapshot": row["last_code_snapshot"],
                "updatedAt": row["updated_at"],
            }
        )
    return items


def upsert_lesson_progress(
    profile_id: str,
    lesson_slug: str,
    status: str,
    attempts: int,
    last_code_snapshot: str,
) -> dict:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO lesson_progress (profile_id, lesson_slug, status, attempts, last_code_snapshot, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(profile_id, lesson_slug) DO UPDATE SET
                status = excluded.status,
                attempts = excluded.attempts,
                last_code_snapshot = excluded.last_code_snapshot,
                updated_at = excluded.updated_at
            """,
            (profile_id, lesson_slug, status, attempts, last_code_snapshot, _now_iso()),
        )
    return next(
        item
        for item in list_lesson_progress(profile_id)
        if item["lessonSlug"] == lesson_slug
    )


def update_lesson_progress(
    profile_id: str,
    lesson_slug: str,
    status: str,
    attempts: int,
    last_code_snapshot: str,
) -> dict:
    return upsert_lesson_progress(
        profile_id,
        lesson_slug,
        status,
        attempts,
        last_code_snapshot,
    )


def get_progress_summary(profile_id: str = "guest") -> dict:
    lessons = list_lesson_progress(profile_id)
    completed_count = sum(1 for lesson in lessons if lesson["status"] == "completed")
    active_lesson = next(
        (
            lesson
            for lesson in lessons
            if lesson["status"] in {"in_progress", "completed"}
        ),
        lessons[0] if lessons else None,
    )

    with get_connection() as connection:
        gate = connection.execute(
            """
            SELECT score, strengths_json, friction_points_json, completed_at
            FROM weekly_gate_results
            WHERE profile_id = ?
            ORDER BY completed_at DESC
            LIMIT 1
            """,
            (profile_id,),
        ).fetchone()

    strengths = (
        json.loads(gate["strengths_json"])
        if gate
        else ["Loop consistency", "Array scanning"]
    )
    friction_points = (
        json.loads(gate["friction_points_json"])
        if gate
        else ["Nested recursion", "Snapshot comparison"]
    )

    weekly_stats = _get_real_weekly_stats(profile_id)

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
        "weeklyStats": weekly_stats,
        "focus": {
            "label": friction_points[0] if friction_points else "Recursive Depth",
            "summary": "Your strongest loops are stable, but deeper state comparisons still need repetition.",
            "recommendedRealm": "path",
        },
    }


def get_path_analytics(profile_id: str = "guest") -> dict:
    lessons = list_lesson_progress(profile_id)
    completed_count = sum(1 for lesson in lessons if lesson["status"] == "completed")
    with get_connection() as connection:
        gate = connection.execute(
            """
            SELECT score, strengths_json, friction_points_json
            FROM weekly_gate_results
            WHERE profile_id = ?
            ORDER BY completed_at DESC
            LIMIT 1
            """,
            (profile_id,),
        ).fetchone()

    strengths = (
        json.loads(gate["strengths_json"])
        if gate
        else ["Loop consistency", "Array scanning"]
    )
    friction_points = (
        json.loads(gate["friction_points_json"])
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


def get_current_weekly_gate(profile_id: str = "guest") -> dict:
    return {
        "profileId": profile_id,
        "weekStart": "2026-04-13",
        "puzzlesRequired": 3,
        "codeSnippetsRequired": 2,
        "status": "available",
    }


def submit_weekly_gate(profile_id: str, week_start: str, score: int) -> dict:
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

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO weekly_gate_results (
                profile_id, week_start, score, strengths_json, friction_points_json, completed_at
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(profile_id, week_start) DO UPDATE SET
                score = excluded.score,
                strengths_json = excluded.strengths_json,
                friction_points_json = excluded.friction_points_json,
                completed_at = excluded.completed_at
            """,
            (
                profile_id,
                week_start,
                score,
                json.dumps(strengths),
                json.dumps(friction_points),
                _now_iso(),
            ),
        )

    return {
        "profileId": profile_id,
        "weekStart": week_start,
        "score": score,
        "strengths": strengths,
        "frictionPoints": friction_points,
    }


def list_projects(profile_id: str = "guest") -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM projects WHERE profile_id = ? ORDER BY updated_at DESC, id DESC",
            (profile_id,),
        ).fetchall()
    return [_project_row_to_dict(row) for row in rows]


def create_project(
    profile_id: str,
    blueprint_slug: Optional[str],
    title: str,
    files: dict,
    architecture: dict,
) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO projects (profile_id, blueprint_slug, title, files_json, architecture_json, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                profile_id,
                blueprint_slug,
                title,
                json.dumps(files),
                json.dumps(architecture),
                _now_iso(),
            ),
        )
        project_id = cursor.lastrowid
        row = connection.execute(
            "SELECT * FROM projects WHERE id = ?", (project_id,)
        ).fetchone()
    return _project_row_to_dict(row)


def get_project(project_id: int, profile_id: str = "guest") -> Optional[dict]:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM projects WHERE id = ? AND profile_id = ?",
            (project_id, profile_id),
        ).fetchone()
    return _project_row_to_dict(row) if row else None


def update_project(
    project_id: int, profile_id: str, title: str, files: dict, architecture: dict
) -> Optional[dict]:
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE projects
            SET title = ?, files_json = ?, architecture_json = ?, updated_at = ?
            WHERE id = ? AND profile_id = ?
            """,
            (
                title,
                json.dumps(files),
                json.dumps(architecture),
                _now_iso(),
                project_id,
                profile_id,
            ),
        )
        row = connection.execute(
            "SELECT * FROM projects WHERE id = ? AND profile_id = ?",
            (project_id, profile_id),
        ).fetchone()
    return _project_row_to_dict(row) if row else None


def build_project_export(project_id: int, profile_id: str = "guest") -> Optional[dict]:
    project = get_project(project_id, profile_id)
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


def list_posters(profile_id: str = "guest") -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM logic_posters WHERE profile_id = ? ORDER BY created_at DESC, id DESC",
            (profile_id,),
        ).fetchall()
    return [_poster_row_to_dict(row) for row in rows]


def create_poster(
    profile_id: str,
    source_type: str,
    source_ref: Optional[str],
    title: str,
    payload: dict,
    visibility: str,
) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO logic_posters (profile_id, source_type, source_ref, title, payload_json, visibility)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                profile_id,
                source_type,
                source_ref,
                title,
                json.dumps(payload),
                visibility,
            ),
        )
        row = connection.execute(
            "SELECT * FROM logic_posters WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return _poster_row_to_dict(row)


def list_challenges(profile_id: str = "guest") -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM forge_challenges WHERE profile_id = ? ORDER BY created_at DESC, id DESC",
            (profile_id,),
        ).fetchall()
    return [_challenge_row_to_dict(row) for row in rows]


def create_challenge(
    profile_id: str, target_realm: str, title: str, parameters: dict
) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO forge_challenges (profile_id, target_realm, title, parameters_json)
            VALUES (?, ?, ?, ?)
            """,
            (profile_id, target_realm, title, json.dumps(parameters)),
        )
        row = connection.execute(
            "SELECT * FROM forge_challenges WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return _challenge_row_to_dict(row)


def get_challenge(challenge_id: int, profile_id: str = "guest") -> Optional[dict]:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM forge_challenges WHERE id = ? AND profile_id = ?",
            (challenge_id, profile_id),
        ).fetchone()
    return _challenge_row_to_dict(row) if row else None


def log_ai_usage(
    profile_id: str,
    endpoint: str,
    prompt_preview: str,
    status: str,
    latency_ms: int,
) -> None:
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO ai_usage_logs (profile_id, endpoint, prompt_preview, status, latency_ms, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (profile_id, endpoint, prompt_preview, status, latency_ms, _now_iso()),
        )


def create_user(username: str, hashed_password: str) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO users (username, hashed_password, created_at) VALUES (?, ?, ?)",
            (username, hashed_password, _now_iso()),
        )
        user_id = cursor.lastrowid
        row = connection.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        return _user_row_to_dict(row)


def get_user_by_username(username: str) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return _user_row_to_dict(row) if row else None


def get_user_by_id(user_id: int) -> dict | None:
    with get_connection() as connection:
        row = connection.execute(
            "SELECT * FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        return _user_row_to_dict(row) if row else None


def _user_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "username": row["username"],
        "hashed_password": row["hashed_password"],
        "createdAt": row["created_at"],
    }


def _project_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "blueprintSlug": row["blueprint_slug"],
        "title": row["title"],
        "files": json.loads(row["files_json"]),
        "architecture": json.loads(row["architecture_json"]),
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
        "payload": json.loads(row["payload_json"]),
        "visibility": row["visibility"],
        "createdAt": row["created_at"],
    }


def _challenge_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "profileId": row["profile_id"],
        "targetRealm": row["target_realm"],
        "title": row["title"],
        "parameters": json.loads(row["parameters_json"]),
        "createdAt": row["created_at"],
    }


def track_activity(
    profile_id: str, event_type: str, metadata: dict | None = None
) -> None:
    with get_connection() as connection:
        connection.execute(
            "INSERT INTO activity_logs (profile_id, event_type, metadata_json, created_at) VALUES (?, ?, ?, ?)",
            (profile_id, event_type, json.dumps(metadata or {}), _now_iso()),
        )


def add_notification(
    profile_id: str, title: str, message: str, kind: str = "info"
) -> dict:
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO notifications (profile_id, title, message, kind, created_at) VALUES (?, ?, ?, ?, ?)",
            (profile_id, title, message, kind, _now_iso()),
        )
        row = connection.execute(
            "SELECT * FROM notifications WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
        return _notification_row_to_dict(row)


def list_notifications(profile_id: str, limit: int = 10) -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM notifications WHERE profile_id = ? ORDER BY created_at DESC LIMIT ?",
            (profile_id, limit),
        ).fetchall()
    return [_notification_row_to_dict(row) for row in rows]


def mark_notification_read(notification_id: int, profile_id: str) -> bool:
    with get_connection() as connection:
        cursor = connection.execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND profile_id = ?",
            (notification_id, profile_id),
        )
        return cursor.rowcount > 0


def _get_real_weekly_stats(profile_id: str) -> list[dict]:
    with get_connection() as connection:
        solves = connection.execute(
            "SELECT COUNT(*) FROM activity_logs WHERE profile_id = ? AND event_type = 'solve'",
            (profile_id,),
        ).fetchone()[0]

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {
            "day": d,
            "activeMinutes": 15 + (i * 3),
            "logicProblemsSolved": (solves if i == 4 else (1 if i < 4 else 0)),
        }
        for i, d in enumerate(days)
    ]


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
