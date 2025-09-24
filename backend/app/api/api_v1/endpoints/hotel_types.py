from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.hotel_type import HotelTypeResponse, HotelTypeCreate, HotelTypeUpdate
from app.services.hotel_type import hotel_type_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[HotelTypeResponse])
@router.get("", response_model=List[HotelTypeResponse])  # Explicit route without trailing slash
def get_hotel_types(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all hotel types.
    """
    hotel_types = hotel_type_service.get_hotel_types(db, skip=skip, limit=limit)
    return hotel_types

@router.get("/{hotel_type_id}", response_model=HotelTypeResponse)
def get_hotel_type(
    hotel_type_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific hotel type by ID.
    """
    hotel_type = hotel_type_service.get_hotel_type(db, hotel_type_id=hotel_type_id)
    if hotel_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel type not found")
    return hotel_type

@router.get("/slug/{slug}", response_model=HotelTypeResponse)
def get_hotel_type_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific hotel type by slug.
    """
    hotel_type = hotel_type_service.get_hotel_type_by_slug(db, slug=slug)
    if hotel_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel type not found")
    return hotel_type

@router.post("/", response_model=HotelTypeResponse)
def create_hotel_type(
    *,
    db: Session = Depends(get_db),
    hotel_type_in: HotelTypeCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new hotel type.
    """
    hotel_type = hotel_type_service.create_hotel_type(db, hotel_type_in)
    return hotel_type

@router.put("/{hotel_type_id}", response_model=HotelTypeResponse)
def update_hotel_type(
    *,
    db: Session = Depends(get_db),
    hotel_type_id: int,
    hotel_type_in: HotelTypeUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a hotel type.
    """
    hotel_type = hotel_type_service.get_hotel_type(db, hotel_type_id=hotel_type_id)
    if hotel_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel type not found")
    hotel_type = hotel_type_service.update_hotel_type(db, hotel_type_id=hotel_type_id, hotel_type_update=hotel_type_in)
    return hotel_type

@router.delete("/{hotel_type_id}", response_model=HotelTypeResponse)
def delete_hotel_type(
    *,
    db: Session = Depends(get_db),
    hotel_type_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a hotel type.
    """
    hotel_type = hotel_type_service.get_hotel_type(db, hotel_type_id=hotel_type_id)
    if hotel_type is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel type not found")
    hotel_type_service.delete_hotel_type(db, hotel_type_id=hotel_type_id)
    return hotel_type
