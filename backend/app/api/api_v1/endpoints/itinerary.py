from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

from app.db.database import get_db
from app.models.user import User
from app.schemas.itinerary import (
    ItineraryItemCreate, ItineraryItemUpdate, ItineraryItemResponse,
    ItineraryActivityCreate, ItineraryActivityUpdate, ItineraryActivityResponse,
    ItineraryBulkCreate, ActivityReorderRequest, ItineraryReorderRequest
)
from app.models.itinerary import EntityType
from app.services.itinerary import itinerary_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

# Itinerary Item endpoints
@router.get("/{entity_type}/{entity_id}")
def get_itinerary(
    entity_type: EntityType,
    entity_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get complete itinerary for a package or group trip.
    """
    items = itinerary_service.get_itinerary_by_entity(db, entity_type, entity_id)
    return itinerary_service.format_itinerary_for_response(items)

@router.get("/items/{item_id}", response_model=ItineraryItemResponse)
def get_itinerary_item(
    item_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific itinerary item with activities.
    """
    item = itinerary_service.get_itinerary_item(db, item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary item not found")
    return item

@router.post("/items", response_model=ItineraryItemResponse)
def create_itinerary_item(
    *,
    db: Session = Depends(get_db),
    item_data: ItineraryItemCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create a new itinerary item with activities.
    """
    try:
        return itinerary_service.create_itinerary_item(db, item_data)
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data: Check that referenced hotels and attractions exist"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the itinerary item"
        )

@router.put("/items/{item_id}", response_model=ItineraryItemResponse)
def update_itinerary_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    item_data: ItineraryItemUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an existing itinerary item.
    """
    try:
        item = itinerary_service.update_itinerary_item(db, item_id, item_data)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary item not found")
        return item
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data: Check that referenced hotels and attractions exist"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the itinerary item"
        )

@router.delete("/items/{item_id}")
def delete_itinerary_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an itinerary item and all its activities.
    """
    success = itinerary_service.delete_itinerary_item(db, item_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary item not found")
    return {"message": "Itinerary item deleted successfully"}

# Activity endpoints
@router.post("/items/{item_id}/activities", response_model=ItineraryActivityResponse)
def create_activity(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    activity_data: ItineraryActivityCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Add an activity to an itinerary item.
    """
    activity = itinerary_service.create_activity(db, item_id, activity_data)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary item not found")
    return activity

@router.put("/activities/{activity_id}", response_model=ItineraryActivityResponse)
def update_activity(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    activity_data: ItineraryActivityUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an existing activity.
    """
    activity = itinerary_service.update_activity(db, activity_id, activity_data)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity

@router.delete("/activities/{activity_id}")
def delete_activity(
    *,
    db: Session = Depends(get_db),
    activity_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an activity.
    """
    success = itinerary_service.delete_activity(db, activity_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return {"message": "Activity deleted successfully"}

# Bulk operations
@router.post("/bulk", response_model=List[ItineraryItemResponse])
def bulk_create_itinerary(
    *,
    db: Session = Depends(get_db),
    bulk_data: ItineraryBulkCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create multiple itinerary items at once.
    """
    return itinerary_service.bulk_create_itinerary(db, bulk_data)

# Reordering endpoints
@router.put("/items/{item_id}/activities/reorder")
def reorder_activities(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    reorder_data: ActivityReorderRequest,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Reorder activities within an itinerary item.
    """
    success = itinerary_service.reorder_activities(db, item_id, reorder_data.activity_ids)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to reorder activities")
    return {"message": "Activities reordered successfully"}

@router.put("/{entity_type}/{entity_id}/reorder")
def reorder_itinerary_items(
    *,
    db: Session = Depends(get_db),
    entity_type: EntityType,
    entity_id: int,
    reorder_data: ItineraryReorderRequest,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Reorder itinerary items by updating day numbers.
    """
    success = itinerary_service.reorder_itinerary_items(db, entity_type, entity_id, reorder_data.item_ids)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to reorder itinerary items")
    return {"message": "Itinerary items reordered successfully"}

# Group trip specific endpoint for generating dates
@router.post("/group-trips/{group_trip_id}/generate-dates")
def generate_dates_for_group_trip(
    *,
    db: Session = Depends(get_db),
    group_trip_id: int,
    start_date: str,  # ISO date string
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Generate actual dates for group trip itinerary items based on start date.
    """
    from datetime import datetime
    
    try:
        parsed_date = datetime.fromisoformat(start_date).date()
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid date format")
    
    # Get duration from group trip
    from app.models.group_trip import GroupTrip
    group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
    if not group_trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group trip not found")
    
    duration_days = group_trip.duration_days or 7  # Default to 7 days if not set
    
    success = itinerary_service.generate_dates_for_group_trip(db, group_trip_id, parsed_date, duration_days)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to generate dates")
    
    return {"message": "Dates generated successfully"}
