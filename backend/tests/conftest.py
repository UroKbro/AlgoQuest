from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import settings
import app.db as db
from app.main import app


@pytest.fixture
def db_connection(tmp_path: Path):
    database_path = tmp_path / "test.sqlite3"
    original_database_url = settings.database_url
    settings.database_url = f"sqlite:///{database_path}"
    
    # Force re-initialization for the test database
    db._initialized = False
    
    with db.get_connection() as conn:
        yield conn
    
    settings.database_url = original_database_url


@pytest.fixture
def client(db_connection):
    with TestClient(app) as test_client:
        yield test_client
