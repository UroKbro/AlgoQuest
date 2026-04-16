from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from .auth_utils import decode_access_token
from .repositories import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception
        
    user = get_user_by_id(int(user_id_str))
    if user is None:
        raise credentials_exception
        
    return user


async def get_optional_user(token: str | None = Depends(oauth2_scheme)):
    # This was a bit tricky with OAuth2PasswordBearer as it always extracts or fails
    # But for guest mode we often just use "guest" if no token
    if not token:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None
