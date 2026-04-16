from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from ..auth_utils import create_access_token, get_password_hash, verify_password
from ..repositories import create_user, get_user_by_username
from ..schemas import TokenResponse, UserLoginRequest, UserSignupRequest, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: UserSignupRequest) -> TokenResponse:
    existing = get_user_by_username(payload.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_VALUE,
            detail="Username already registered"
        )
    
    hashed = get_password_hash(payload.password)
    user = create_user(payload.username, hashed)
    
    token = create_access_token(data={"sub": str(user["id"])})
    return TokenResponse(
        accessToken=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest) -> TokenResponse:
    user = get_user_by_username(payload.username)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": str(user["id"])})
    return TokenResponse(
        accessToken=token,
        user=UserResponse.model_validate(user)
    )
