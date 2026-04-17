from __future__ import annotations

from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from ..auth_utils import get_current_user_id
from ..repositories import list_notifications, mark_notification_read

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class NotificationResponse(BaseModel):
    id: int
    profileId: str
    title: str
    message: str
    kind: str
    isRead: bool
    createdAt: str


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    profile_id: str = Query(default="guest"),
    limit: int = Query(default=10),
    user_id: str | None = Depends(get_current_user_id),
) -> NotificationListResponse:
    target_id = user_id if user_id else profile_id
    items = await list_notifications(target_id, limit)
    return NotificationListResponse(
        items=[NotificationResponse.model_validate(i) for i in items]
    )


@router.put("/{notification_id}/read")
async def read_notification(
    notification_id: int,
    profile_id: str = Query(default="guest"),
    user_id: str | None = Depends(get_current_user_id),
):
    target_id = user_id if user_id else profile_id
    success = await mark_notification_read(notification_id, target_id)
    return {"status": "ok" if success else "error"}
