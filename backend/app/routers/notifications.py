from __future__ import annotations

from fastapi import APIRouter, Query

from ..repositories import list_notifications, mark_notification_read
from ..schemas import BaseModel

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
    limit: int = Query(default=10)
) -> NotificationListResponse:
    items = list_notifications(profile_id, limit)
    return NotificationListResponse(items=[NotificationResponse.model_validate(i) for i in items])


@router.put("/{notification_id}/read")
async def read_notification(
    notification_id: int,
    profile_id: str = Query(default="guest")
):
    success = mark_notification_read(notification_id, profile_id)
    return {"status": "ok" if success else "error"}
