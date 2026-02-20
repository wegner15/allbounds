from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.visa_application import ApplicationStatus
from app.schemas.visa_application import VisaApplicationCreate, VisaApplicationUpdate, VisaApplicationResponse
from app.services.visa_application import visa_application_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.post("/", response_model=VisaApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_visa_application(
    *,
    db: Session = Depends(get_db),
    application_in: VisaApplicationCreate,
) -> Any:
    """
    Create a new visa application form submission (publicly available).
    """
    return visa_application_service.create_application(db, application_in)

@router.get("/", response_model=List[VisaApplicationResponse])
def get_visa_applications(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[ApplicationStatus] = None,
    current_user: User = Depends(has_permission("content:read")),
) -> Any:
    """
    Retrieve visa applications (Admin only).
    """
    return visa_application_service.get_applications(db, skip=skip, limit=limit, status=status)

@router.get("/{application_id}", response_model=VisaApplicationResponse)
def get_visa_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("content:read")),
) -> Any:
    """
    Retrieve a specific visa application by ID (Admin only).
    """
    application = visa_application_service.get_application(db, application_id=application_id)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visa application not found")
    return application

@router.put("/{application_id}", response_model=VisaApplicationResponse)
def update_visa_application(
    *,
    db: Session = Depends(get_db),
    application_id: int,
    application_in: VisaApplicationUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a visa application, primarily for changing status and adding admin notes (Admin only).
    """
    application = visa_application_service.update_application(db, application_id, application_in)
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visa application not found")
    return application
