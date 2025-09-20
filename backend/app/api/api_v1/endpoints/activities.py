from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.activity import ActivityResponse, ActivityCreate, ActivityUpdate
from app.services.activity import activity_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[ActivityResponse])
def get_activities(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    country_id: int = Query(None, description="Filter activities by country ID"),
) -> Any:
    """
    Retrieve all activities.
    """
    if country_id:
        activities = activity_service.get_activities_by_country(db, country_id=country_id, skip=skip, limit=limit)
    else:
        activities = activity_service.get_activities(db, skip=skip, limit=limit)
    return activities

@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(
    activity_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific activity by ID.
    """
    activity = activity_service.get_activity(db, activity_id=activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity

@router.get("/by-slug/{slug}", response_model=ActivityResponse)
def get_activity_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific activity by slug.
    """
    activity = activity_service.get_activity_by_slug(db, slug=slug)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity

@router.post("/", response_model=ActivityResponse)
def create_activity(
    *,
    db: Session = Depends(get_db),
    activity_in: ActivityCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new activity.
    """
    activity = activity_service.create_activity(db, activity_in)
    return activity

@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    activity_in: ActivityUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an activity.
    """
    activity = activity_service.get_activity(db, activity_id=activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    activity = activity_service.update_activity(db, activity_id=activity_id, activity_update=activity_in)
    return activity

@router.delete("/{activity_id}", response_model=ActivityResponse)
def delete_activity(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an activity.
    """
    activity = activity_service.get_activity(db, activity_id=activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    activity_service.delete_activity(db, activity_id=activity_id)
    return activity

@router.post("/{activity_id}/countries/{country_id}", response_model=ActivityResponse)
def add_activity_to_country(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    country_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add an activity to a country.
    """
    activity = activity_service.add_activity_to_country(db, activity_id=activity_id, country_id=country_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity or country not found")
    return activity

@router.delete("/{activity_id}/countries/{country_id}", response_model=ActivityResponse)
def remove_activity_from_country(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    country_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove an activity from a country.
    """
    activity = activity_service.remove_activity_from_country(db, activity_id=activity_id, country_id=country_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity or country not found")
    return activity

@router.post("/{activity_id}/gallery/{media_id}", response_model=ActivityResponse)
def add_media_to_gallery(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add a media asset to an activity's gallery.
    """
    activity = activity_service.add_media_to_activity_gallery(db, activity_id=activity_id, media_id=media_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity or media not found")
    return activity

@router.delete("/{activity_id}/gallery/{media_id}", response_model=ActivityResponse)
def remove_media_from_gallery(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a media asset from an activity's gallery.
    """
    activity = activity_service.remove_media_from_activity_gallery(db, activity_id=activity_id, media_id=media_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity or media not found")
    return activity
