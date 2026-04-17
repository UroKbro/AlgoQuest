from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from . import db
from .auth_utils import decode_access_token
from .supabase import get_auth_provider, get_supabase_user_from_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(token: str | None = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    if get_auth_provider() == "supabase":
        user = await get_supabase_user_from_token(token)
        if user is None:
            raise credentials_exception
        return user

    # ---------- Local auth fallback ----------
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user = db.get_local_user_by_id(int(user_id_str))
    except (ValueError, TypeError):
        raise credentials_exception

    if user is None:
        raise credentials_exception

    return {
        "id": user["id"],
        "username": user["username"],
        "createdAt": user["created_at"],
    }


async def get_optional_user(token: str | None = Depends(oauth2_scheme)):
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None
