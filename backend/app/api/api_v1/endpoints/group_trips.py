from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.group_trip import (
    GroupTripResponse, GroupTripCreate, GroupTripUpdate, GroupTripWithCountryResponse,
    GroupTripHolidayTypeCreate, GroupTripDepartureResponse, GroupTripDepartureCreate,
    GroupTripDepartureUpdate
)
from app.schemas.media import MediaAssetResponse
from pydantic import BaseModel
from app.services.group_trip import group_trip_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[GroupTripResponse])
def get_group_trips(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    country_id: int = Query(None, description="Filter group trips by country ID"),
    featured: bool = Query(None, description="Filter group trips by featured status"),
) -> Any:
    """
    Retrieve all group trips.
    """
    if country_id:
        group_trips = group_trip_service.get_group_trips_by_country(db, country_id=country_id, skip=skip, limit=limit)
    elif featured is not None:
        if featured:
            group_trips = group_trip_service.get_featured_group_trips(db, skip=skip, limit=limit)
        else:
            group_trips = group_trip_service.get_group_trips(db, skip=skip, limit=limit)
    else:
        group_trips = group_trip_service.get_group_trips(db, skip=skip, limit=limit)
    return group_trips

@router.get("/{group_trip_id}", response_model=GroupTripWithCountryResponse)
def get_group_trip(
    group_trip_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific group trip by ID.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    return group_trip

@router.get("/slug/{slug}", response_model=GroupTripWithCountryResponse)
def get_group_trip_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific group trip by slug.
    """
    group_trip = group_trip_service.get_group_trip_by_slug(db, slug=slug)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    return group_trip

@router.get("/details/{slug}")
def get_group_trip_details_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve group trip details with gallery images by slug.
    """
    group_trip_details = group_trip_service.get_group_trip_details_by_slug(db, slug=slug)
    if group_trip_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    return group_trip_details

@router.post("/", response_model=GroupTripResponse)
def create_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_in: GroupTripCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new group trip.
    """
    group_trip = group_trip_service.create_group_trip(db, group_trip_in)
    return group_trip

@router.put("/{group_trip_id}", response_model=GroupTripResponse)
def update_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    group_trip_in: GroupTripUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a group trip.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    group_trip = group_trip_service.update_group_trip(db, group_trip_id=group_trip_id, group_trip_update=group_trip_in)
    return group_trip

@router.delete("/{group_trip_id}", response_model=GroupTripResponse)
def delete_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a group trip.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    group_trip_service.delete_group_trip(db, group_trip_id=group_trip_id)
    return group_trip

@router.post("/{group_trip_id}/publish", response_model=GroupTripResponse)
def publish_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:publish")),
) -> Any:
    """
    Publish a group trip.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    group_trip = group_trip_service.publish_group_trip(db, group_trip_id=group_trip_id)
    return group_trip

@router.post("/{group_trip_id}/unpublish", response_model=GroupTripResponse)
def unpublish_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:publish")),
) -> Any:
    """
    Unpublish a group trip.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    group_trip = group_trip_service.unpublish_group_trip(db, group_trip_id=group_trip_id)
    return group_trip

@router.post("/{group_trip_id}/holiday-types", response_model=GroupTripResponse)
def add_holiday_type_to_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    holiday_type_in: GroupTripHolidayTypeCreate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add a holiday type to a group trip.
    """
    group_trip = group_trip_service.add_holiday_type(
        db, group_trip_id=group_trip_id, holiday_type_id=holiday_type_in.holiday_type_id
    )
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or holiday type not found")
    return group_trip

@router.delete("/{group_trip_id}/holiday-types/{holiday_type_id}", response_model=GroupTripResponse)
def remove_holiday_type_from_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    holiday_type_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a holiday type from a group trip.
    """
    group_trip = group_trip_service.remove_holiday_type(
        db, group_trip_id=group_trip_id, holiday_type_id=holiday_type_id
    )
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or holiday type not found")
    return group_trip

# Group Trip Departure endpoints
@router.get("/{group_trip_id}/departures", response_model=List[GroupTripDepartureResponse])
def get_departures(
    group_trip_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all departures for a specific group trip.
    """
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    
    departures = group_trip_service.get_departures(db, group_trip_id=group_trip_id, skip=skip, limit=limit)
    return departures

@router.get("/{group_trip_id}/departures/{departure_id}", response_model=GroupTripDepartureResponse)
def get_departure(
    group_trip_id: int,
    departure_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific departure by ID.
    """
    departure = group_trip_service.get_departure(db, departure_id=departure_id)
    if departure is None or departure.group_trip_id != group_trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departure not found")
    return departure

@router.post("/{group_trip_id}/departures", response_model=GroupTripDepartureResponse)
def create_departure(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    departure_data: dict,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new departure for a group trip.
    """
    # Ensure the group trip exists
    group_trip = group_trip_service.get_group_trip(db, group_trip_id=group_trip_id)
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    
    # Create the departure data with the group_trip_id
    departure_in = GroupTripDepartureCreate(
        group_trip_id=group_trip_id,
        start_date=departure_data.get("start_date"),
        end_date=departure_data.get("end_date"),
        price=departure_data.get("price"),
        available_slots=departure_data.get("available_slots"),
        booked_slots=departure_data.get("booked_slots", 0)
    )
    
    departure = group_trip_service.create_departure(db, departure_in)
    return departure

@router.put("/{group_trip_id}/departures/{departure_id}", response_model=GroupTripDepartureResponse)
def update_departure(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    departure_id: int,
    departure_in: GroupTripDepartureUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a departure.
    """
    departure = group_trip_service.get_departure(db, departure_id=departure_id)
    if departure is None or departure.group_trip_id != group_trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departure not found")
    
    departure = group_trip_service.update_departure(db, departure_id=departure_id, departure_update=departure_in)
    return departure

@router.delete("/{group_trip_id}/departures/{departure_id}", response_model=GroupTripDepartureResponse)
def delete_departure(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    departure_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a departure.
    """
    departure = group_trip_service.get_departure(db, departure_id=departure_id)
    if departure is None or departure.group_trip_id != group_trip_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Departure not found")
    
    group_trip_service.delete_departure(db, departure_id=departure_id)
    return departure

# Gallery management endpoints
class CoverImageUpdate(BaseModel):
    media_id: int

@router.get("/details/id/{group_trip_id}")
def get_group_trip_details_by_id(
    group_trip_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve group trip details with gallery images by ID.
    """
    group_trip_details = group_trip_service.get_group_trip_details_by_id(db, group_trip_id=group_trip_id)
    if group_trip_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    return group_trip_details

@router.put("/{group_trip_id}/cover-image", response_model=GroupTripResponse)
def set_cover_image(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    cover_image_data: CoverImageUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Set cover image for a group trip.
    """
    group_trip = group_trip_service.set_cover_image(
        db, group_trip_id=group_trip_id, media_id=cover_image_data.media_id
    )
    if group_trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or media not found")
    return group_trip

@router.post("/{group_trip_id}/media/{media_id}", response_model=MediaAssetResponse)
def add_media_to_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add media to group trip gallery.
    """
    media = group_trip_service.add_media(db, group_trip_id=group_trip_id, media_id=media_id)
    if media is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip or media not found")
    return media

@router.delete("/{group_trip_id}/media/{media_id}")
def remove_media_from_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove media from group trip gallery.
    """
    success = group_trip_service.remove_media(db, group_trip_id=group_trip_id, media_id=media_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return {"message": "Media removed successfully"}
