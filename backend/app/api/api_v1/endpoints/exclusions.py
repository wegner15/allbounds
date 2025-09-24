from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.inclusion_exclusion import ExclusionResponse, ExclusionCreate, ExclusionUpdate
from app.services.inclusion_exclusion import exclusion_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[ExclusionResponse])
@router.get("", response_model=List[ExclusionResponse])  # Explicit route without trailing slash
def get_exclusions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: str = Query(None, description="Filter exclusions by category")
) -> Any:
    """
    Retrieve all exclusions.
    """
    if category:
        exclusions = exclusion_service.get_exclusions_by_category(db, category=category, skip=skip, limit=limit)
    else:
        exclusions = exclusion_service.get_exclusions(db, skip=skip, limit=limit)
    return exclusions

@router.get("/{exclusion_id}", response_model=ExclusionResponse)
def get_exclusion(
    exclusion_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific exclusion by ID.
    """
    exclusion = exclusion_service.get_exclusion(db, exclusion_id=exclusion_id)
    if exclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exclusion not found")
    return exclusion

@router.post("/", response_model=ExclusionResponse)
def create_exclusion(
    *,
    db: Session = Depends(get_db),
    exclusion_in: ExclusionCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new exclusion.
    """
    exclusion = exclusion_service.create_exclusion(db, exclusion_in)
    return exclusion

@router.put("/{exclusion_id}", response_model=ExclusionResponse)
def update_exclusion(
    *,
    db: Session = Depends(get_db),
    exclusion_id: int,
    exclusion_in: ExclusionUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an exclusion.
    """
    exclusion = exclusion_service.get_exclusion(db, exclusion_id=exclusion_id)
    if exclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exclusion not found")
    exclusion = exclusion_service.update_exclusion(db, exclusion_id=exclusion_id, exclusion_update=exclusion_in)
    return exclusion

@router.delete("/{exclusion_id}", response_model=ExclusionResponse)
def delete_exclusion(
    *,
    db: Session = Depends(get_db),
    exclusion_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an exclusion.
    """
    exclusion = exclusion_service.get_exclusion(db, exclusion_id=exclusion_id)
    if exclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exclusion not found")
    exclusion_service.delete_exclusion(db, exclusion_id=exclusion_id)
    return exclusion

@router.post("/package/{package_id}/exclusions/{exclusion_id}", response_model=dict)
def assign_exclusion_to_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    exclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign an exclusion to a package.
    """
    success = exclusion_service.assign_exclusion_to_package(db, package_id=package_id, exclusion_id=exclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or exclusion not found")
    return {"status": "success", "message": f"Exclusion {exclusion_id} assigned to package {package_id}"}

@router.delete("/package/{package_id}/exclusions/{exclusion_id}", response_model=dict)
def remove_exclusion_from_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    exclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove an exclusion from a package.
    """
    success = exclusion_service.remove_exclusion_from_package(db, package_id=package_id, exclusion_id=exclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package, exclusion, or relationship not found")
    return {"status": "success", "message": f"Exclusion {exclusion_id} removed from package {package_id}"}

@router.post("/group-trip/{group_trip_id}/exclusions/{exclusion_id}", response_model=dict)
def assign_exclusion_to_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    exclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign an exclusion to a group trip.
    """
    success = exclusion_service.assign_exclusion_to_group_trip(db, group_trip_id=group_trip_id, exclusion_id=exclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or exclusion not found")
    return {"status": "success", "message": f"Exclusion {exclusion_id} assigned to group trip {group_trip_id}"}

@router.delete("/group-trip/{group_trip_id}/exclusions/{exclusion_id}", response_model=dict)
def remove_exclusion_from_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    exclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove an exclusion from a group trip.
    """
    success = exclusion_service.remove_exclusion_from_group_trip(db, group_trip_id=group_trip_id, exclusion_id=exclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip, exclusion, or relationship not found")
    return {"status": "success", "message": f"Exclusion {exclusion_id} removed from group trip {group_trip_id}"}
