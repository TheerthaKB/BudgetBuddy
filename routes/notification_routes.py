from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.notification import Notification
from schemas.notification import NotificationCreate, NotificationResponse


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.post("/", response_model=NotificationResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db)
):
    new_notification = Notification(
        user_id=notification.user_id,
        message=notification.message,
        notification_type=notification.notification_type,
        is_read=notification.is_read
    )

    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification


@router.get("/", response_model=list[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db)
):
    return db.query(Notification).all()