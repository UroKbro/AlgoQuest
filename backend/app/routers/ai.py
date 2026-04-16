from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from ..ai_service import AIService, get_ai_service
from ..logger import log_info, log_error
from ..repositories import log_ai_usage
from ..schemas import (
    AIBlueprintRequest,
    AIBlueprintResponse,
    AIReviewRequest,
    AIReviewResponse,
    AISocraticRequest,
    AISocraticResponse,
)


router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/review-logic", response_model=AIReviewResponse)
async def review_logic(
    payload: AIReviewRequest,
    profile_id: str = Query(default="guest"),
    service: AIService = Depends(get_ai_service),
) -> AIReviewResponse:
    import time
    start_time = time.perf_counter()
    status = "success"
    
    try:
        result = await service.review_logic(payload.code, payload.focus)
        return AIReviewResponse(
            critique=result.get("critique", "No critique generated."),
            logicScore=result.get("logicScore", 0),
        )
    except Exception as e:
        status = "error"
        log_error("AI Review Logic failed", error=str(e))
        raise
    finally:
        latency = int((time.perf_counter() - start_time) * 1000)
        log_ai_usage(
            profile_id, 
            "review-logic", 
            payload.code[:100], 
            status, 
            latency
        )


@router.post("/socratic-anchor", response_model=AISocraticResponse)
async def socratic_anchor(
    payload: AISocraticRequest,
    profile_id: str = Query(default="guest"),
    service: AIService = Depends(get_ai_service),
) -> AISocraticResponse:
    import time
    start_time = time.perf_counter()
    status = "success"
    
    try:
        hint = await service.socratic_hint(payload.code, payload.problemContext, payload.userQuery)
        return AISocraticResponse(hint=hint)
    except Exception as e:
        status = "error"
        log_error("AI Socratic Anchor failed", error=str(e))
        raise
    finally:
        latency = int((time.perf_counter() - start_time) * 1000)
        log_ai_usage(
            profile_id, 
            "socratic-anchor", 
            payload.problemContext[:100], 
            status, 
            latency
        )


@router.post("/idea-to-syntax", response_model=AIBlueprintResponse)
async def idea_to_syntax(
    payload: AIBlueprintRequest,
    profile_id: str = Query(default="guest"),
    service: AIService = Depends(get_ai_service),
) -> AIBlueprintResponse:
    import time
    start_time = time.perf_counter()
    status = "success"
    
    try:
        result = await service.generate_blueprint(payload.description)
        return AIBlueprintResponse(
            blueprintSlug=result.get("blueprintSlug"),
            title=result.get("title", "Generated Blueprint"),
            starterCode=result.get("starterCode", ""),
            architecture=result.get("architecture", {"nodes": [], "edges": []}),
        )
    except Exception as e:
        status = "error"
        log_error("AI Idea-to-Syntax failed", error=str(e))
        raise
    finally:
        latency = int((time.perf_counter() - start_time) * 1000)
        log_ai_usage(
            profile_id, 
            "idea-to-syntax", 
            payload.description[:100], 
            status, 
            latency
        )
