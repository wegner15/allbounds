from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.hotel import HotelResponse, HotelCreate, HotelUpdate, HotelWithCountryResponse, HotelWithRelationshipsResponse
from app.services.hotel import hotel_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[HotelResponse])
@router.get("", response_model=List[HotelResponse])  # Explicit route without trailing slash
def get_hotels(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all hotels.
    """
    hotels = hotel_service.get_hotels(db, skip=skip, limit=limit)
    return hotels

@router.get("/country/{country_id}")
def get_hotels_by_country(
    country_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve hotels by country ID with cover images.
    """
    hotels = hotel_service.get_hotels_by_country(db, country_id=country_id, skip=skip, limit=limit)
    return hotels

@router.get("/{hotel_id}", response_model=HotelWithCountryResponse)
def get_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific hotel by ID.
    """
    hotel = hotel_service.get_hotel(db, hotel_id=hotel_id)
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    return hotel

@router.get("/slug/{slug}", response_model=HotelWithCountryResponse)
def get_hotel_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific hotel by slug.
    """
    hotel = hotel_service.get_hotel_by_slug(db, slug=slug)
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    return hotel

@router.get("/details/{slug}")
def get_hotel_details_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve hotel details with gallery images by slug.
    """
    hotel_details = hotel_service.get_hotel_details_by_slug(db, slug=slug)
    if hotel_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    return hotel_details

@router.post("/", response_model=HotelResponse)
def create_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_in: HotelCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new hotel.
    """
    hotel = hotel_service.create_hotel(db, hotel_in)
    return hotel

@router.put("/{hotel_id}", response_model=HotelResponse)
def update_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    hotel_in: HotelUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a hotel.
    """
    hotel = hotel_service.get_hotel(db, hotel_id=hotel_id)
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    hotel = hotel_service.update_hotel(db, hotel_id=hotel_id, hotel_update=hotel_in)
    return hotel

@router.delete("/{hotel_id}", response_model=HotelResponse)
def delete_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a hotel.
    """
    hotel = hotel_service.get_hotel(db, hotel_id=hotel_id)
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    hotel_service.delete_hotel(db, hotel_id=hotel_id)
    return hotel

@router.get("/{hotel_id}/relationships", response_model=HotelWithRelationshipsResponse)
def get_hotel_with_relationships(
    hotel_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific hotel with its package and group trip relationships.
    """
    hotel = hotel_service.get_hotel(db, hotel_id=hotel_id)
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    
    # Convert relationships to IDs for the response
    response = HotelWithRelationshipsResponse.from_orm(hotel)
    response.package_ids = [package.id for package in hotel.packages]
    response.group_trip_ids = [group_trip.id for group_trip in hotel.group_trips]
    
    return response

@router.post("/{hotel_id}/packages/{package_id}", response_model=dict)
def assign_package_to_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    package_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign a package to a hotel.
    """
    success = hotel_service.assign_package(db, hotel_id=hotel_id, package_id=package_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel or package not found")
    return {"status": "success", "message": f"Package {package_id} assigned to hotel {hotel_id}"}

@router.delete("/{hotel_id}/packages/{package_id}", response_model=dict)
def remove_package_from_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    package_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a package from a hotel.
    """
    success = hotel_service.remove_package(db, hotel_id=hotel_id, package_id=package_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel, package, or relationship not found")
    return {"status": "success", "message": f"Package {package_id} removed from hotel {hotel_id}"}

@router.post("/{hotel_id}/group-trips/{group_trip_id}", response_model=dict)
def assign_group_trip_to_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign a group trip to a hotel.
    """
    success = hotel_service.assign_group_trip(db, hotel_id=hotel_id, group_trip_id=group_trip_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel or group trip not found")
    return {"status": "success", "message": f"Group trip {group_trip_id} assigned to hotel {hotel_id}"}

@router.delete("/{hotel_id}/group-trips/{group_trip_id}", response_model=dict)
def remove_group_trip_from_hotel(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a group trip from a hotel.
    """
    success = hotel_service.remove_group_trip(db, hotel_id=hotel_id, group_trip_id=group_trip_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel, group trip, or relationship not found")
    return {"status": "success", "message": f"Group trip {group_trip_id} removed from hotel {hotel_id}"}

@router.put("/{hotel_id}/cover-image", response_model=dict)
def set_hotel_cover_image(
    *,
    db: Session = Depends(get_db),
    hotel_id: int,
    image_id: str,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Set the cover image for a hotel using Cloudflare Image ID.
    """
    success = hotel_service.set_cover_image(db, hotel_id=hotel_id, image_id=image_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")
    return {"status": "success", "message": f"Cover image set for hotel {hotel_id}"}
