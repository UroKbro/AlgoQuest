from __future__ import annotations

import base64
import hashlib
import hmac
import json
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from .supabase import get_auth_provider, get_supabase_user_from_token

try:
    from jose import jwt
except ImportError:  # pragma: no cover - exercised in minimal test envs
    jwt = None

try:
    from passlib.context import CryptContext
except ImportError:  # pragma: no cover - exercised in minimal test envs
    CryptContext = None

from .config import settings

pwd_context = (
    CryptContext(schemes=["bcrypt"], deprecated="auto") if CryptContext else None
)

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def _candidate_secrets() -> list[str]:
    candidates = [
        settings.app_secret,
        settings.gemini_api_key,
        "default-secret-for-development",
    ]
    unique_candidates: list[str] = []
    for candidate in candidates:
        if candidate and candidate not in unique_candidates:
            unique_candidates.append(candidate)
    return unique_candidates


def _primary_secret() -> str:
    return settings.app_secret


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if pwd_context is None:
        for secret in _candidate_secrets():
            digest = hashlib.sha256(password_key(plain_password, secret)).hexdigest()
            if hmac.compare_digest(digest, hashed_password):
                return True
        return False
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    if pwd_context is None:
        return hashlib.sha256(password_key(password, _primary_secret())).hexdigest()
    return pwd_context.hash(password)


def password_key(password: str, secret: str) -> bytes:
    return f"{secret}:{password}".encode("utf-8")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=60 * 24)  # 24 hours
    exp_timestamp = int(expire.timestamp())
    to_encode.update({"exp": exp_timestamp})
    secret = _primary_secret()

    if jwt is not None:
        return jwt.encode(to_encode, secret, algorithm=ALGORITHM)

    payload = (
        base64.urlsafe_b64encode(
            json.dumps(to_encode, separators=(",", ":")).encode("utf-8")
        )
        .decode("utf-8")
        .rstrip("=")
    )
    signature = hmac.new(
        secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
    ).hexdigest()
    return f"fallback.{payload}.{signature}"


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        if jwt is not None:
            for secret in _candidate_secrets():
                try:
                    return jwt.decode(token, secret, algorithms=[ALGORITHM])
                except Exception:
                    continue
            return None

        prefix, payload, signature = token.split(".", 2)
        if prefix != "fallback":
            return None

        signature_matches = False
        for secret in _candidate_secrets():
            expected_signature = hmac.new(
                secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
            ).hexdigest()
            if hmac.compare_digest(expected_signature, signature):
                signature_matches = True
                break
        if not signature_matches:
            return None

        padded_payload = payload + "=" * (-len(payload) % 4)
        decoded_payload = json.loads(
            base64.urlsafe_b64decode(padded_payload.encode("utf-8")).decode("utf-8")
        )
        exp = decoded_payload.get("exp")
        if exp is not None and int(exp) < int(datetime.now(timezone.utc).timestamp()):
            return None
        return decoded_payload
    except Exception:
        return None


async def get_current_user_id(token: str | None = Depends(oauth2_scheme)) -> str | None:
    if not token:
        return None

    if get_auth_provider() == "supabase":
        user = await get_supabase_user_from_token(token)
        if user is None:
            return None
        return str(user["id"])

    payload = decode_access_token(token)
    if not payload:
        return None
    subject = payload.get("sub")
    return str(subject) if subject is not None else None
