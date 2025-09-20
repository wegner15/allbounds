from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.accommodation import AccommodationResponse, AccommodationCreate, AccommodationUpdate, AccommodationWithCountryResponse
from app.services.accommodation import accommodation_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[AccommodationResponse])
def get_accommodations(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all accommodations.
    """
    accommodations = accommodation_service.get_accommodations(db, skip=skip, limit=limit)
    return accommodations

@router.get("/country/{country_id}", response_model=List[AccommodationResponse])
def get_accommodations_by_country(
    country_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve accommodations by country ID.
    """
    accommodations = accommodation_service.get_accommodations_by_country(db, country_id=country_id, skip=skip, limit=limit)
    return accommodations

@router.get("/{accommodation_id}", response_model=AccommodationWithCountryResponse)
def get_accommodation(
    accommodation_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific accommodation by ID.
    """
    accommodation = accommodation_service.get_accommodation(db, accommodation_id=accommodation_id)
    if accommodation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")
    return accommodation

@router.get("/slug/{slug}", response_model=AccommodationWithCountryResponse)
def get_accommodation_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific accommodation by slug.
    """
    accommodation = accommodation_service.get_accommodation_by_slug(db, slug=slug)
    if accommodation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")
    return accommodation

@router.post("/", response_model=AccommodationResponse)
def create_accommodation(
    *,
    db: Session = Depends(get_db),
    accommodation_in: AccommodationCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new accommodation.
    """
    accommodation = accommodation_service.create_accommodation(db, accommodation_in)
    return accommodation

@router.put("/{accommodation_id}", response_model=AccommodationResponse)
def update_accommodation(
    *,
    db: Session = Depends(get_db),
    accommodation_id: int,
    accommodation_in: AccommodationUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an accommodation.
    """
    accommodation = accommodation_service.get_accommodation(db, accommodation_id=accommodation_id)
    if accommodation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")
    accommodation = accommodation_service.update_accommodation(db, accommodation_id=accommodation_id, accommodation_update=accommodation_in)
    return accommodation

@router.delete("/{accommodation_id}", response_model=AccommodationResponse)
def delete_accommodation(
    *,
    db: Session = Depends(get_db),
    accommodation_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an accommodation.
    """
    accommodation = accommodation_service.get_accommodation(db, accommodation_id=accommodation_id)
    if accommodation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Accommodation not found")
    accommodation_service.delete_accommodation(db, accommodation_id=accommodation_id)
    return accommodation
