from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.booking import (
    BookingResponse,
    BookingCreate,
    BookingUpdate,
    InquiryResponse,
    InquiryCreate,
    InquiryUpdate,
)
from app.services.booking import booking_service, inquiry_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()


# ===== BOOKING ENDPOINTS =====

@router.get("/", response_model=List[BookingResponse])
def get_bookings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_permission("booking:read"))
) -> Any:
    """
    Retrieve all bookings.
    """
    bookings = booking_service.get_bookings(db, skip=skip, limit=limit)
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("booking:read"))
) -> Any:
    """
    Retrieve a specific booking by ID.
    """
    booking = booking_service.get_booking(db, booking_id=booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


@router.get("/type/{booking_type}", response_model=List[BookingResponse])
def get_bookings_by_type(
    booking_type: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(has_permission("booking:read"))
) -> Any:
    """
    Retrieve bookings by type (package or group_trip).
    """
    if booking_type not in ["package", "group_trip"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking type")
    bookings = booking_service.get_bookings_by_type(db, booking_type, skip=skip, limit=limit)
    return bookings


@router.post("/", response_model=BookingResponse)
def create_booking(
    *,
    db: Session = Depends(get_db),
    booking_in: BookingCreate,
) -> Any:
    """
    Create new booking.
    """
    # Validate booking type
    if booking_in.booking_type not in ["package", "group_trip"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid booking type")

    # Validate travelers count
    total_travelers = len(booking_in.travelers)
    expected_travelers = booking_in.number_of_adults + booking_in.number_of_children

    if total_travelers != expected_travelers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of travelers ({total_travelers}) doesn't match adults ({booking_in.number_of_adults}) + children ({booking_in.number_of_children})"
        )

    # Validate children have ages
    for traveler in booking_in.travelers:
        if traveler.traveler_type == "child" and traveler.age is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="All children must have an age specified"
            )

    booking = booking_service.create_booking(db, booking_in)
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    *,
    db: Session = Depends(get_db),
    booking_id: int,
    booking_in: BookingUpdate,
    current_user: User = Depends(has_permission("booking:update"))
) -> Any:
    """
    Update a booking.
    """
    booking = booking_service.update_booking(db, booking_id=booking_id, booking_update=booking_in)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


@router.delete("/{booking_id}", response_model=BookingResponse)
def delete_booking(
    *,
    db: Session = Depends(get_db),
    booking_id: int,
    current_user: User = Depends(has_permission("booking:delete"))
) -> Any:
    """
    Delete a booking.
    """
    booking = booking_service.get_booking(db, booking_id=booking_id)
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    booking_service.delete_booking(db, booking_id=booking_id)
    return booking


# ===== INQUIRY ENDPOINTS =====

@router.get("/inquiries/", response_model=List[InquiryResponse])
def get_inquiries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    is_read: Optional[bool] = None,
    current_user: User = Depends(has_permission("inquiry:read"))
) -> Any:
    """
    Retrieve all inquiries.
    """
    inquiries = inquiry_service.get_inquiries(db, skip=skip, limit=limit, status=status, is_read=is_read)
    return inquiries


@router.get("/inquiries/{inquiry_id}", response_model=InquiryResponse)
def get_inquiry(
    inquiry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("inquiry:read"))
) -> Any:
    """
    Retrieve a specific inquiry by ID.
    """
    inquiry = inquiry_service.get_inquiry(db, inquiry_id=inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@router.get("/inquiries/unread/", response_model=List[InquiryResponse])
def get_unread_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("inquiry:read"))
) -> Any:
    """
    Retrieve all unread inquiries.
    """
    inquiries = inquiry_service.get_unread_inquiries(db)
    return inquiries


@router.post("/inquiries/", response_model=InquiryResponse)
def create_inquiry(
    *,
    db: Session = Depends(get_db),
    inquiry_in: InquiryCreate,
) -> Any:
    """
    Create new inquiry.
    """
    inquiry = inquiry_service.create_inquiry(db, inquiry_in)
    return inquiry


@router.put("/inquiries/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry(
    *,
    db: Session = Depends(get_db),
    inquiry_id: int,
    inquiry_in: InquiryUpdate,
    current_user: User = Depends(has_permission("inquiry:update"))
) -> Any:
    """
    Update an inquiry.
    """
    inquiry = inquiry_service.update_inquiry(db, inquiry_id=inquiry_id, inquiry_update=inquiry_in)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@router.put("/inquiries/{inquiry_id}/read", response_model=InquiryResponse)
def mark_inquiry_as_read(
    *,
    db: Session = Depends(get_db),
    inquiry_id: int,
    current_user: User = Depends(has_permission("inquiry:update"))
) -> Any:
    """
    Mark an inquiry as read.
    """
    inquiry = inquiry_service.mark_as_read(db, inquiry_id=inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")
    return inquiry


@router.delete("/inquiries/{inquiry_id}", response_model=InquiryResponse)
def delete_inquiry(
    *,
    db: Session = Depends(get_db),
    inquiry_id: int,
    current_user: User = Depends(has_permission("inquiry:delete"))
) -> Any:
    """
    Delete an inquiry.
    """
    inquiry = inquiry_service.get_inquiry(db, inquiry_id=inquiry_id)
    if inquiry is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inquiry not found")

    inquiry_service.delete_inquiry(db, inquiry_id=inquiry_id)
    return inquiry