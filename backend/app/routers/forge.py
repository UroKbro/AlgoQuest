from __future__ import annotations

from fastapi import APIRouter, Query

from ..repositories import (
    create_challenge,
    create_poster,
    list_challenges,
    list_posters,
)
from ..schemas import (
    ChallengeCreateRequest,
    ChallengeResponse,
    PosterCreateRequest,
    PosterResponse,
)


router = APIRouter(prefix="/api/forge", tags=["forge"])


@router.get("/posters", response_model=list[PosterResponse])
async def read_posters(
    profile_id: str = Query(default="guest"),
) -> list[PosterResponse]:
    return [PosterResponse.model_validate(item) for item in list_posters(profile_id)]


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


@router.get("/challenges", response_model=list[ChallengeResponse])
async def read_challenges(
    profile_id: str = Query(default="guest"),
) -> list[ChallengeResponse]:
    return [
        ChallengeResponse.model_validate(item) for item in list_challenges(profile_id)
    ]


@router.post("/challenges", response_model=ChallengeResponse)
async def create_challenge_endpoint(
    payload: ChallengeCreateRequest, profile_id: str = Query(default="guest")
) -> ChallengeResponse:
    challenge = create_challenge(
        profile_id, payload.targetRealm, payload.title, payload.parameters
    )
    return ChallengeResponse.model_validate(challenge)
