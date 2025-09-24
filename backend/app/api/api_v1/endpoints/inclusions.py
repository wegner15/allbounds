from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.inclusion_exclusion import InclusionResponse, InclusionCreate, InclusionUpdate
from app.services.inclusion_exclusion import inclusion_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[InclusionResponse])
@router.get("", response_model=List[InclusionResponse])  # Explicit route without trailing slash
def get_inclusions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: str = Query(None, description="Filter inclusions by category")
) -> Any:
    """
    Retrieve all inclusions.
    """
    if category:
        inclusions = inclusion_service.get_inclusions_by_category(db, category=category, skip=skip, limit=limit)
    else:
        inclusions = inclusion_service.get_inclusions(db, skip=skip, limit=limit)
    return inclusions

@router.get("/{inclusion_id}", response_model=InclusionResponse)
def get_inclusion(
    inclusion_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific inclusion by ID.
    """
    inclusion = inclusion_service.get_inclusion(db, inclusion_id=inclusion_id)
    if inclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inclusion not found")
    return inclusion

@router.post("/", response_model=InclusionResponse)
def create_inclusion(
    *,
    db: Session = Depends(get_db),
    inclusion_in: InclusionCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new inclusion.
    """
    inclusion = inclusion_service.create_inclusion(db, inclusion_in)
    return inclusion

@router.put("/{inclusion_id}", response_model=InclusionResponse)
def update_inclusion(
    *,
    db: Session = Depends(get_db),
    inclusion_id: int,
    inclusion_in: InclusionUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an inclusion.
    """
    inclusion = inclusion_service.get_inclusion(db, inclusion_id=inclusion_id)
    if inclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inclusion not found")
    inclusion = inclusion_service.update_inclusion(db, inclusion_id=inclusion_id, inclusion_update=inclusion_in)
    return inclusion

@router.delete("/{inclusion_id}", response_model=InclusionResponse)
def delete_inclusion(
    *,
    db: Session = Depends(get_db),
    inclusion_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an inclusion.
    """
    inclusion = inclusion_service.get_inclusion(db, inclusion_id=inclusion_id)
    if inclusion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inclusion not found")
    inclusion_service.delete_inclusion(db, inclusion_id=inclusion_id)
    return inclusion

@router.post("/package/{package_id}/inclusions/{inclusion_id}", response_model=dict)
def assign_inclusion_to_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    inclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign an inclusion to a package.
    """
    success = inclusion_service.assign_inclusion_to_package(db, package_id=package_id, inclusion_id=inclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or inclusion not found")
    return {"status": "success", "message": f"Inclusion {inclusion_id} assigned to package {package_id}"}

@router.delete("/package/{package_id}/inclusions/{inclusion_id}", response_model=dict)
def remove_inclusion_from_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    inclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove an inclusion from a package.
    """
    success = inclusion_service.remove_inclusion_from_package(db, package_id=package_id, inclusion_id=inclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package, inclusion, or relationship not found")
    return {"status": "success", "message": f"Inclusion {inclusion_id} removed from package {package_id}"}

@router.post("/group-trip/{group_trip_id}/inclusions/{inclusion_id}", response_model=dict)
def assign_inclusion_to_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    inclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign an inclusion to a group trip.
    """
    success = inclusion_service.assign_inclusion_to_group_trip(db, group_trip_id=group_trip_id, inclusion_id=inclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or inclusion not found")
    return {"status": "success", "message": f"Inclusion {inclusion_id} assigned to group trip {group_trip_id}"}

@router.delete("/group-trip/{group_trip_id}/inclusions/{inclusion_id}", response_model=dict)
def remove_inclusion_from_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    inclusion_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove an inclusion from a group trip.
    """
    success = inclusion_service.remove_inclusion_from_group_trip(db, group_trip_id=group_trip_id, inclusion_id=inclusion_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip, inclusion, or relationship not found")
    return {"status": "success", "message": f"Inclusion {inclusion_id} removed from group trip {group_trip_id}"}
