from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.config import settings


@pytest.fixture
def client(tmp_path: Path):
    database_path = tmp_path / "test.sqlite3"
    original_database_url = settings.database_url
    settings.database_url = f"sqlite:///{database_path}"

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        settings.database_url = original_database_url
