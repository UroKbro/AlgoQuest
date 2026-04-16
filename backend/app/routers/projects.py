from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ..repositories import (
    build_project_export,
    create_project,
    get_project,
    list_projects,
    update_project,
)
from ..schemas import (
    ProjectExportResponse,
    ProjectListResponse,
    ProjectPayload,
    ProjectResponse,
)


router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
async def read_projects(
    profile_id: str = Query(default="guest"),
) -> ProjectListResponse:
    items = [ProjectResponse.model_validate(item) for item in list_projects(profile_id)]
    return ProjectListResponse(items=items)


@router.post("", response_model=ProjectResponse)
async def create_project_endpoint(
    payload: ProjectPayload, profile_id: str = Query(default="guest")
) -> ProjectResponse:
    project = create_project(
        profile_id,
        payload.blueprintSlug,
        payload.title,
        payload.files,
        payload.architecture,
    )
    return ProjectResponse.model_validate(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def read_project(
    project_id: int, profile_id: str = Query(default="guest")
) -> ProjectResponse:
    project = get_project(project_id, profile_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project_endpoint(
    project_id: int, payload: ProjectPayload, profile_id: str = Query(default="guest")
) -> ProjectResponse:
    project = update_project(
        project_id, profile_id, payload.title, payload.files, payload.architecture
    )
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.model_validate(project)


@router.post("/{project_id}/export", response_model=ProjectExportResponse)
async def export_project(
    project_id: int, profile_id: str = Query(default="guest")
) -> ProjectExportResponse:
    manifest = build_project_export(project_id, profile_id)
    if manifest is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectExportResponse.model_validate(manifest)
