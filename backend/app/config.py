from __future__ import annotations
from typing import Optional

import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def _split_csv(value: Optional[str], default: list[str]) -> list[str]:
    if not value:
        return default

    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self) -> None:
        self.allowed_origins = _split_csv(
            os.getenv("ALGO_ALLOWED_ORIGINS"),
            ["http://localhost:5173", "http://127.0.0.1:5173"],
        )
        self.database_url = os.getenv("ALGO_DATABASE_URL", "sqlite:///./algoquest.db")
        self.app_secret = os.getenv("ALGO_APP_SECRET", "dev-secret")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.admin_username = os.getenv("ALGO_ADMIN_USERNAME", "admin")
        self.admin_password = os.getenv("ALGO_ADMIN_PASSWORD", "admin123456")
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
        self.supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


settings = Settings()
