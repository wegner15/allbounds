from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.email_log import EmailLog
from app.schemas.email_log import EmailLogResponse
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[EmailLogResponse])
def read_email_logs(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
) -> Any:
    """
    Retrieve email logs. Accessible by logged-in users (admins).
    """
    logs = db.query(EmailLog).order_by(EmailLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs
