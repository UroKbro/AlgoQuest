from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..content import ALGORITHMS, LESSONS, PROJECT_BLUEPRINTS, REALMS, SIMULATIONS


router = APIRouter(prefix="/api", tags=["content"])


@router.get("/realms")
async def list_realms() -> dict[str, list[dict[str, str]]]:
    return {"items": REALMS}


@router.get("/lessons")
async def list_lessons() -> dict[str, list[dict[str, str]]]:
    return {"items": LESSONS}


@router.get("/lessons/{slug}")
async def get_lesson(slug: str) -> dict[str, dict[str, str]]:
    lesson = next((item for item in LESSONS if item["slug"] == slug), None)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return {"item": lesson}


@router.get("/algorithms")
async def list_algorithms() -> dict[str, list[dict[str, str]]]:
    return {"items": ALGORITHMS}


@router.get("/algorithms/{slug}")
async def get_algorithm(slug: str) -> dict[str, dict[str, str]]:
    algorithm = next((item for item in ALGORITHMS if item["slug"] == slug), None)
    if algorithm is None:
        raise HTTPException(status_code=404, detail="Algorithm not found")
    return {"item": algorithm}


@router.get("/simulations")
async def list_simulations() -> dict[str, list[dict[str, str]]]:
    return {"items": SIMULATIONS}


@router.get("/project-blueprints")
async def list_project_blueprints() -> dict[str, list[dict[str, str]]]:
    return {"items": PROJECT_BLUEPRINTS}
