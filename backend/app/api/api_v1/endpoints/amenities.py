from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.amenity import AmenityResponse, AmenityCreate, AmenityUpdate, PaginatedAmenityResponse
from app.services.amenity import amenity_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=PaginatedAmenityResponse)
@router.get("", response_model=PaginatedAmenityResponse)  # Explicit route without trailing slash
def get_amenities(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,  # Default to 10 as requested (implied by "pagination")
    include_inactive: bool = False,
) -> Any:
    """
    Retrieve all amenities.
    """
    skip = (page - 1) * limit
    items, total = amenity_service.get_amenities(db, skip=skip, limit=limit, include_inactive=include_inactive)
    
    import math
    pages = math.ceil(total / limit) if limit > 0 else 0
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages
    }

@router.get("/{amenity_id}", response_model=AmenityResponse)
def get_amenity(
    amenity_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific amenity by ID.
    """
    amenity = amenity_service.get_amenity(db, amenity_id=amenity_id)
    if amenity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Amenity not found")
    return amenity

@router.get("/category/{category}", response_model=List[AmenityResponse])
def get_amenities_by_category(
    category: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve amenities by category.
    """
    amenities = amenity_service.get_amenities_by_category(db, category=category)
    return amenities

@router.post("/", response_model=AmenityResponse)
def create_amenity(
    *,
    db: Session = Depends(get_db),
    amenity_in: AmenityCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new amenity.
    """
    # Check if amenity with same name already exists
    existing_amenity = amenity_service.get_amenity_by_name(db, name=amenity_in.name)
    if existing_amenity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amenity with this name already exists"
        )
    
    amenity = amenity_service.create_amenity(db, amenity_in)
    return amenity

@router.put("/{amenity_id}", response_model=AmenityResponse)
def update_amenity(
    *,
    db: Session = Depends(get_db),
    amenity_id: int,
    amenity_in: AmenityUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an amenity.
    """
    amenity = amenity_service.get_amenity(db, amenity_id=amenity_id)
    if amenity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Amenity not found")
    
    # Check if name is being updated and if it conflicts with existing amenity
    if amenity_in.name and amenity_in.name != amenity.name:
        existing_amenity = amenity_service.get_amenity_by_name(db, name=amenity_in.name)
        if existing_amenity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Amenity with this name already exists"
            )
    
    amenity = amenity_service.update_amenity(db, amenity_id=amenity_id, amenity_update=amenity_in)
    return amenity

@router.delete("/{amenity_id}", response_model=AmenityResponse)
def delete_amenity(
    *,
    db: Session = Depends(get_db),
    amenity_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an amenity (soft delete).
    """
    amenity = amenity_service.get_amenity(db, amenity_id=amenity_id)
    if amenity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Amenity not found")
    amenity_service.delete_amenity(db, amenity_id=amenity_id)
    return amenity
