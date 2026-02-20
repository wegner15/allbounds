from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth.dependencies import get_current_active_superuser
from app.schemas.flight_booking import FlightBookingCreate, FlightBookingUpdate, FlightBookingResponse
from app.services.flight_booking import flight_booking_service

router = APIRouter()

@router.post("/", response_model=FlightBookingResponse, status_code=status.HTTP_201_CREATED)
def create_flight_booking(
    *,
    db: Session = Depends(deps.get_db),
    booking_in: FlightBookingCreate,
) -> Any:
    """
    Submit a new flight booking or flight quote request.
    Publicly accessible endpoint.
    """
    booking = flight_booking_service.create(db=db, obj_in=booking_in)
    return booking

@router.get("/", response_model=List[FlightBookingResponse])
def get_flight_bookings(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_active_superuser),
) -> Any:
    """
    Retrieve flight bookings. Admin users only.
    """
    bookings = flight_booking_service.get_multi(db, skip=skip, limit=limit)
    return bookings

@router.get("/{id}", response_model=FlightBookingResponse)
def get_flight_booking(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user = Depends(get_current_active_superuser),
) -> Any:
    """
    Get a specific flight booking by id. Admin users only.
    """
    booking = flight_booking_service.get(db=db, id=id)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    return booking

@router.put("/{id}", response_model=FlightBookingResponse)
def update_flight_booking(
    *,
    db: Session = Depends(get_db),
    id: int,
    booking_in: FlightBookingUpdate,
    current_user = Depends(get_current_active_superuser),
) -> Any:
    """
    Update a flight booking's status. Admin users only.
    """
    booking = flight_booking_service.get(db=db, id=id)
    if not booking:
        raise HTTPException(status_code=404, detail="Flight booking not found")
    booking = flight_booking_service.update(db=db, db_obj=booking, obj_in=booking_in)
    return booking
