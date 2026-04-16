from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..repositories import (
    create_challenge,
    create_poster,
    get_challenge,
    list_challenges,
    list_posters,
)
from ..schemas import (
    ChallengeCreateRequest,
    ChallengeListResponse,
    ChallengeResponse,
    PosterCreateRequest,
    PosterListResponse,
    PosterResponse,
)


router = APIRouter(prefix="/api/forge", tags=["forge"])


@router.get("/posters", response_model=PosterListResponse)
async def read_posters(
    profile_id: str = Query(default="guest"),
) -> PosterListResponse:
    items = [PosterResponse.model_validate(item) for item in list_posters(profile_id)]
    return PosterListResponse(items=items)


@router.post("/posters", response_model=PosterResponse)
async def create_poster_endpoint(
    payload: PosterCreateRequest, profile_id: str = Query(default="guest")
) -> PosterResponse:
    poster = create_poster(
        profile_id,
        payload.sourceType,
        payload.sourceRef,
        payload.title,
        payload.payload,
        payload.visibility,
    )
    return PosterResponse.model_validate(poster)


@router.get("/challenges", response_model=ChallengeListResponse)
async def read_challenges(
    profile_id: str = Query(default="guest"),
) -> ChallengeListResponse:
    items = [
        ChallengeResponse.model_validate(item) for item in list_challenges(profile_id)
    ]
    return ChallengeListResponse(items=items)


@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge_endpoint(
    payload: ChallengeCreateRequest, profile_id: str = Query(default="guest")
) -> ChallengeResponse:
    challenge = create_challenge(
        profile_id, payload.targetRealm, payload.title, payload.parameters
    )
    return ChallengeResponse.model_validate(challenge)


@router.get("/challenges/{challenge_id}", response_model=ChallengeResponse)
async def read_challenge(
    challenge_id: int, profile_id: str = Query(default="guest")
) -> ChallengeResponse:
    challenge = get_challenge(challenge_id, profile_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return ChallengeResponse.model_validate(challenge)
