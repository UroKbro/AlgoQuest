from __future__ import annotations

from collections import defaultdict
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.config import settings
import app.db as db
from app.main import app


# ---------------------------------------------------------------------------
# In-memory mock for the Supabase REST API used by repositories._request
# ---------------------------------------------------------------------------


class InMemorySupabaseStore:
    """
    Replaces ``repositories._request`` during tests so that all data-layer
    operations run against a plain Python dict instead of a live Supabase
    instance.
    """

    def __init__(self) -> None:
        self._tables: dict[str, list[dict]] = defaultdict(list)
        self._counters: dict[str, int] = defaultdict(int)

    # -- helpers ----------------------------------------------------------

    def _next_id(self, table: str) -> int:
        self._counters[table] += 1
        return self._counters[table]

    @staticmethod
    def _matches(row: dict, params: dict) -> bool:
        for key, value in params.items():
            if key in ("select", "order", "limit", "on_conflict"):
                continue
            if isinstance(value, str) and value.startswith("eq."):
                expected = value[3:]
                actual = row.get(key)
                if str(actual) != str(expected):
                    return False
        return True

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()

    # -- mock entry point -------------------------------------------------

    async def request(
        self,
        method: str,
        table: str,
        *,
        params: dict | None = None,
        json_payload=None,
        prefer: str | None = None,
    ):
        params = params or {}
        prefer = prefer or ""

        if method == "GET":
            rows = [
                deepcopy(r) for r in self._tables[table] if self._matches(r, params)
            ]
            if "limit" in params:
                rows = rows[: int(params["limit"])]
            return rows

        if method == "POST":
            payload = deepcopy(json_payload) if json_payload else {}

            # --- UPSERT (merge-duplicates) ---
            if "resolution=merge-duplicates" in prefer:
                on_conflict_keys = params.get("on_conflict", "").split(",")
                existing = None
                for row in self._tables[table]:
                    if all(
                        str(row.get(k)) == str(payload.get(k)) for k in on_conflict_keys
                    ):
                        existing = row
                        break

                if existing:
                    existing.update(payload)
                    return [deepcopy(existing)]

                # Fall through to insert
                if "id" not in payload:
                    payload["id"] = self._next_id(table)
                payload.setdefault("created_at", self._now_iso())
                payload.setdefault("is_read", False)
                self._tables[table].append(payload)
                return [deepcopy(payload)]

            # --- Normal INSERT ---
            if "id" not in payload:
                payload["id"] = self._next_id(table)
            payload.setdefault("created_at", self._now_iso())
            payload.setdefault("is_read", False)
            self._tables[table].append(payload)

            if "return=representation" in prefer:
                return [deepcopy(payload)]
            return None

        if method == "PATCH":
            updated = []
            for row in self._tables[table]:
                if self._matches(row, params):
                    row.update(json_payload or {})
                    updated.append(row)
            if "return=representation" in prefer:
                return [deepcopy(r) for r in updated]
            return None

        return None


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def supabase_store():
    """Expose the in-memory store so tests can inspect persisted data."""
    return InMemorySupabaseStore()


@pytest.fixture()
def db_connection(tmp_path: Path):
    """
    Creates a temporary SQLite database for local-auth tests.
    Disables Supabase so the app falls back to local auth.
    """
    database_path = tmp_path / "test.sqlite3"

    # Save originals
    orig = {
        "database_url": settings.database_url,
        "supabase_url": settings.supabase_url,
        "supabase_anon_key": settings.supabase_anon_key,
        "supabase_service_role_key": settings.supabase_service_role_key,
    }
    orig_initialized = db._initialized
    orig_db_path = db._db_path

    # Reconfigure for test
    settings.database_url = f"sqlite:///{database_path}"
    settings.supabase_url = None
    settings.supabase_anon_key = None
    settings.supabase_service_role_key = None
    db._initialized = False

    db.init_db()
    conn = db.get_connection()

    yield conn

    conn.close()

    # Restore originals
    settings.database_url = orig["database_url"]
    settings.supabase_url = orig["supabase_url"]
    settings.supabase_anon_key = orig["supabase_anon_key"]
    settings.supabase_service_role_key = orig["supabase_service_role_key"]
    db._initialized = orig_initialized
    db._db_path = orig_db_path


@pytest.fixture()
def client(db_connection, supabase_store):
    """
    FastAPI TestClient with:
    - Local auth (Supabase disabled, SQLite for users)
    - In-memory Supabase store for all data-layer operations
    """
    with patch("app.repositories._request", new=supabase_store.request):
        with TestClient(app) as test_client:
            yield test_client
