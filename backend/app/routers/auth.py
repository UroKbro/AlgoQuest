from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..auth_utils import create_access_token, get_password_hash, verify_password
from .. import db
from ..schemas import TokenResponse, UserLoginRequest, UserResponse, UserSignupRequest
from ..supabase import is_supabase_configured, supabase_login, supabase_signup

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserSignupRequest) -> TokenResponse:
    if is_supabase_configured():
        try:
            result = await supabase_signup(payload.username, payload.password)
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(error),
            )
        return TokenResponse.model_validate(result)

    # ---------- Local auth fallback ----------
    existing = db.get_local_user_by_username(payload.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists",
        )

    hashed = get_password_hash(payload.password)
    user = db.create_local_user(payload.username, hashed)
    token = create_access_token({"sub": str(user["id"]), "username": user["username"]})
    return TokenResponse(
        accessToken=token,
        tokenType="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            createdAt=user["created_at"],
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest) -> TokenResponse:
    if is_supabase_configured():
        try:
            result = await supabase_login(payload.username, payload.password)
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(error),
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenResponse.model_validate(result)

    # ---------- Local auth fallback ----------
    user = db.get_local_user_by_username(payload.username)
    if user is None or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user["id"]), "username": user["username"]})
    return TokenResponse(
        accessToken=token,
        tokenType="bearer",
        user=UserResponse(
            id=user["id"],
            username=user["username"],
            createdAt=user["created_at"],
        ),
    )
