from __future__ import annotations

from fastapi import APIRouter

from ..ai_service import get_ai_provider_status
from ..supabase import get_auth_provider


router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "algoquest-backend",
        "ai": get_ai_provider_status(),
        "auth": {"provider": get_auth_provider()},
    }
