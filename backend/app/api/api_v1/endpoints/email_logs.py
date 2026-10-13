from typing import Any, List, Optional
import math
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.database import get_db
from app.models.email_log import EmailLog
from app.schemas.email_log import EmailLogResponse, PaginatedEmailLogsResponse
from app.auth.dependencies import get_current_user

router = APIRouter()

@router.get("", response_model=PaginatedEmailLogsResponse)
@router.get("/", response_model=PaginatedEmailLogsResponse)
def read_email_logs(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 20,
    skip: Optional[int] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user = Depends(get_current_user),
) -> Any:
    """
    Retrieve paginated email logs. Accessible by logged-in users (admins).
    """
    if skip is not None and skip > 0:
        page = (skip // limit) + 1

    query = db.query(EmailLog)

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                EmailLog.recipient.ilike(search_pattern),
                EmailLog.subject.ilike(search_pattern),
            )
        )

    if status == "success":
        query = query.filter(EmailLog.response_status >= 200, EmailLog.response_status < 300)
    elif status == "failed":
        query = query.filter(
            or_(
                EmailLog.response_status < 200,
                EmailLog.response_status >= 300,
                EmailLog.response_status.is_(None),
            )
        )

    total = query.count()
    pages = math.ceil(total / limit) if limit > 0 else 0
    calculated_skip = max(0, (page - 1) * limit)
    items = query.order_by(EmailLog.created_at.desc()).offset(calculated_skip).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages,
    }
