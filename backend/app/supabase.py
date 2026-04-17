from __future__ import annotations

import re
from typing import Any

import httpx

from .config import settings


def is_supabase_configured() -> bool:
    return bool(
        settings.supabase_url
        and settings.supabase_anon_key
        and settings.supabase_service_role_key
    )


def get_auth_provider() -> str:
    return "supabase" if is_supabase_configured() else "local"


def alias_to_email(username: str) -> str:
    normalized = re.sub(r"[^a-z0-9._-]", "", username.strip().lower())
    if not normalized:
        raise ValueError("Username must contain at least one valid character")
    return f"{normalized}@algoquest.local"


def username_from_supabase_user(user: dict[str, Any]) -> str:
    metadata = user.get("user_metadata") or {}
    if metadata.get("username"):
        return str(metadata["username"])

    email = user.get("email") or ""
    if "@" in email:
        return email.split("@", 1)[0]
    return str(user.get("id", "user"))


def format_user_response(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user["id"]),
        "username": username_from_supabase_user(user),
        "createdAt": user.get("created_at") or user.get("createdAt") or "",
    }


async def _request(
    method: str,
    path: str,
    *,
    api_key: str,
    bearer_token: str | None = None,
    json_payload: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if not settings.supabase_url:
        raise RuntimeError("Supabase URL is not configured")

    headers = {
        "apikey": api_key,
        "Content-Type": "application/json",
    }
    if bearer_token:
        headers["Authorization"] = f"Bearer {bearer_token}"

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.request(
            method,
            f"{settings.supabase_url}/auth/v1{path}",
            headers=headers,
            json=json_payload,
        )

    payload = response.json().copy() if response.content else {}
    if response.is_success:
        return payload

    message = (
        payload.get("msg")
        or payload.get("error_description")
        or payload.get("message")
        or payload.get("error")
    )
    raise RuntimeError(
        message or f"Supabase auth request failed with status {response.status_code}"
    )


async def supabase_signup(username: str, password: str) -> dict[str, Any]:
    email = alias_to_email(username)

    await _request(
        "POST",
        "/admin/users",
        api_key=settings.supabase_service_role_key,
        bearer_token=settings.supabase_service_role_key,
        json_payload={
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {"username": username},
        },
    )

    return await supabase_login(username, password)


async def supabase_login(username: str, password: str) -> dict[str, Any]:
    email = alias_to_email(username)
    payload = await _request(
        "POST",
        "/token?grant_type=password",
        api_key=settings.supabase_anon_key,
        json_payload={"email": email, "password": password},
    )
    user = payload.get("user") or {}
    access_token = payload.get("access_token")
    if not access_token or not user:
        raise RuntimeError("Supabase did not return a valid user session")

    return {
        "accessToken": access_token,
        "tokenType": "bearer",
        "user": format_user_response(user),
    }


async def get_supabase_user_from_token(token: str) -> dict[str, Any] | None:
    if not is_supabase_configured() or not token:
        return None

    try:
        user = await _request(
            "GET",
            "/user",
            api_key=settings.supabase_anon_key,
            bearer_token=token,
        )
    except Exception:
        return None

    if not user.get("id"):
        return None
    return format_user_response(user)
