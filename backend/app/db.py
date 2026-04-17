from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from .config import settings

_initialized = False
_db_path: str | None = None


def _get_db_path() -> str:
    url = settings.database_url
    if url.startswith("sqlite:///"):
        return url[len("sqlite:///") :]
    return "./algoquest.db"


def init_db() -> None:
    global _initialized, _db_path
    if _initialized:
        return

    _db_path = _get_db_path()
    Path(_db_path).parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(_db_path)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
        """
    )
    conn.commit()
    conn.close()
    _initialized = True


def get_connection() -> sqlite3.Connection:
    if not _initialized:
        init_db()
    conn = sqlite3.connect(_db_path)
    conn.row_factory = sqlite3.Row
    return conn


def create_local_user(username: str, hashed_password: str) -> dict:
    init_db()
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO users (username, hashed_password, created_at) VALUES (?, ?, ?)",
            (username, hashed_password, datetime.now(timezone.utc).isoformat()),
        )
        conn.commit()
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return dict(row)
    finally:
        conn.close()


def get_local_user_by_username(username: str) -> dict | None:
    init_db()
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_local_user_by_id(user_id: int) -> dict | None:
    init_db()
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()
