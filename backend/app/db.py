from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from .config import settings
from .content import LESSONS


def _database_path() -> Path:
    prefix = "sqlite:///"
    if not settings.database_url.startswith(prefix):
        raise ValueError("Only sqlite:/// database URLs are supported")

    raw_path = settings.database_url.removeprefix(prefix)
    path = Path(raw_path)
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[1] / path
    return path


DATABASE_PATH = _database_path()
_initialized = False


def _connect() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@contextmanager
def get_connection() -> sqlite3.Connection:
    if not _initialized:
        init_db()

    connection = _connect()
    try:
        yield connection
        connection.commit()
    finally:
        connection.close()


def init_db() -> None:
    global _initialized

    connection = _connect()
    try:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS settings (
                profile_id TEXT PRIMARY KEY,
                neon_intensity INTEGER NOT NULL,
                sound_volume INTEGER NOT NULL,
                motion_blur INTEGER NOT NULL,
                reduced_motion INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS lesson_progress (
                profile_id TEXT NOT NULL,
                lesson_slug TEXT NOT NULL,
                status TEXT NOT NULL,
                attempts INTEGER NOT NULL DEFAULT 0,
                last_code_snapshot TEXT NOT NULL DEFAULT '',
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (profile_id, lesson_slug)
            );

            CREATE TABLE IF NOT EXISTS weekly_gate_results (
                profile_id TEXT NOT NULL,
                week_start TEXT NOT NULL,
                score INTEGER NOT NULL,
                strengths_json TEXT NOT NULL,
                friction_points_json TEXT NOT NULL,
                completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (profile_id, week_start)
            );

            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id TEXT NOT NULL,
                blueprint_slug TEXT,
                title TEXT NOT NULL,
                files_json TEXT NOT NULL,
                architecture_json TEXT NOT NULL,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS logic_posters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id TEXT NOT NULL,
                source_type TEXT NOT NULL,
                source_ref TEXT,
                title TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                visibility TEXT NOT NULL DEFAULT 'private',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS forge_challenges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                profile_id TEXT NOT NULL,
                target_realm TEXT NOT NULL,
                title TEXT NOT NULL,
                parameters_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        _seed_defaults(connection)
        connection.commit()
        _initialized = True
    finally:
        connection.close()


def _seed_defaults(connection: sqlite3.Connection) -> None:
    connection.execute(
        """
        INSERT OR IGNORE INTO settings (profile_id, neon_intensity, sound_volume, motion_blur, reduced_motion)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("guest", 72, 40, 24, 0),
    )

    for lesson in LESSONS:
        connection.execute(
            """
            INSERT OR IGNORE INTO lesson_progress (
                profile_id, lesson_slug, status, attempts, last_code_snapshot
            ) VALUES (?, ?, ?, ?, ?)
            """,
            ("guest", lesson["slug"], "not_started", 0, ""),
        )

    connection.execute(
        """
        INSERT OR IGNORE INTO weekly_gate_results (
            profile_id, week_start, score, strengths_json, friction_points_json
        ) VALUES (?, ?, ?, ?, ?)
        """,
        (
            "guest",
            "2026-04-13",
            78,
            json.dumps(["Loop consistency", "Array scanning"]),
            json.dumps(["Nested recursion", "Snapshot comparison"]),
        ),
    )
