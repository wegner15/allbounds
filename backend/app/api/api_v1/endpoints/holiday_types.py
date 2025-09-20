from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.holiday_type import HolidayType
from app.models.user import User
from app.schemas.holiday_type import HolidayTypeResponse, HolidayTypeCreate, HolidayTypeUpdate
from app.services.holiday_type import holiday_type_service
from app.auth.dependencies import get_current_active_superuser, get_current_user, has_permission
from app.utils.slug import create_slug

class SetCoverImageRequest(BaseModel):
    image_id: str

router = APIRouter()

@router.get("/", response_model=List[HolidayTypeResponse])
@router.get("", response_model=List[HolidayTypeResponse])  # Explicit route without trailing slash
def read_holiday_types(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all holiday types.
    """
    holiday_types = holiday_type_service.get_holiday_types(db, skip=skip, limit=limit)
    return holiday_types

@router.get("/{holiday_type_id}", response_model=HolidayTypeResponse)
def read_holiday_type(
    holiday_type_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific holiday type by ID.
    """
    holiday_type = holiday_type_service.get_holiday_type(db, holiday_type_id=holiday_type_id)
    if holiday_type is None:
        raise HTTPException(status_code=404, detail="Holiday type not found")
    return holiday_type

@router.get("/slug/{slug}", response_model=HolidayTypeResponse)
def read_holiday_type_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific holiday type by slug.
    """
    holiday_type = holiday_type_service.get_holiday_type_by_slug(db, slug=slug)
    if holiday_type is None:
        raise HTTPException(status_code=404, detail="Holiday type not found")
    return holiday_type

@router.post("/", response_model=HolidayTypeResponse)
def create_holiday_type(
    holiday_type_in: HolidayTypeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Create a new holiday type.
    """
    # Generate slug from name if not provided
    if not hasattr(holiday_type_in, "slug") or not holiday_type_in.slug:
        slug = create_slug(holiday_type_in.name)
    else:
        slug = holiday_type_in.slug
        
    # Check if holiday type with this slug already exists
    db_holiday_type = holiday_type_service.get_holiday_type_by_slug(db, slug=slug)
    if db_holiday_type:
        raise HTTPException(
            status_code=400,
            detail=f"Holiday type with slug '{slug}' already exists"
        )
    
    # Create holiday type
    holiday_type = holiday_type_service.create_holiday_type(
        db=db, 
        name=holiday_type_in.name,
        description=holiday_type_in.description,
        slug=slug,
        image_id=holiday_type_in.image_id
    )
    return holiday_type

@router.put("/{holiday_type_id}", response_model=HolidayTypeResponse)
def update_holiday_type(
    holiday_type_id: int,
    holiday_type_in: HolidayTypeUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Update a holiday type.
    """
    holiday_type = holiday_type_service.get_holiday_type(db, holiday_type_id=holiday_type_id)
    if holiday_type is None:
        raise HTTPException(status_code=404, detail="Holiday type not found")
    
    holiday_type = holiday_type_service.update_holiday_type(
        db=db,
        holiday_type_id=holiday_type_id,
        name=holiday_type_in.name,
        description=holiday_type_in.description,
        is_active=holiday_type_in.is_active,
        image_id=holiday_type_in.image_id
    )
    return holiday_type

@router.delete("/{holiday_type_id}", response_model=HolidayTypeResponse)
def delete_holiday_type(
    holiday_type_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Delete a holiday type.
    """
    holiday_type = holiday_type_service.get_holiday_type(db, holiday_type_id=holiday_type_id)
    if holiday_type is None:
        raise HTTPException(status_code=404, detail="Holiday type not found")
    
    holiday_type = holiday_type_service.delete_holiday_type(db, holiday_type_id=holiday_type_id)
    return holiday_type


@router.post("/{holiday_type_id}/cover-image", response_model=HolidayTypeResponse)
def set_holiday_type_cover_image(
    *,
    db: Session = Depends(get_db),
    holiday_type_id: int,
    request: SetCoverImageRequest,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Set the cover image for a holiday type.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Setting cover image for holiday type {holiday_type_id} with image_id {request.image_id}")
    
    holiday_type = holiday_type_service.get_holiday_type(db, holiday_type_id=holiday_type_id)
    if holiday_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Holiday type not found")
    
    # Convert image_id to string if needed
    image_id = str(request.image_id) if request.image_id is not None else None
    
    # Update the holiday type with the new image_id
    updated_holiday_type = holiday_type_service.update_holiday_type(
        db=db,
        holiday_type_id=holiday_type_id,
        image_id=image_id
    )
    
    logger.info(f"Cover image set successfully for holiday type {holiday_type_id}")
    return updated_holiday_type
