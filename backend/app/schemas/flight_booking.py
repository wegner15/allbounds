from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, validator
from app.models.flight_booking import TripType, BookingPurpose, ContactMethod

class FlightPassengerBase(BaseModel):
    full_name: str
    dob: date
    gender: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry: Optional[date] = None
    special_assistance: bool = False
    seat_preference: Optional[str] = None
    meal_preference: Optional[str] = None
    passenger_type: str = "adult"

class FlightPassengerCreate(FlightPassengerBase):
    pass

class FlightPassengerResponse(FlightPassengerBase):
    id: int
    booking_id: int

    class Config:
        orm_mode = True

class FlightBookingBase(BaseModel):
    trip_type: TripType
    departure_city: str
    destination_city: str
    departure_date: date
    return_date: Optional[date] = None
    preferred_departure_time: Optional[str] = None
    
    adults: int = 1
    children: int = 0
    infants: int = 0
    
    purpose: BookingPurpose
    
    contact_name: str
    contact_email: EmailStr
    contact_phone: str
    preferred_contact_method: Optional[ContactMethod] = None
    
    travel_budget_range: Optional[str] = None
    is_flexible_dates: bool = False
    
    add_on_services: Optional[List[str]] = None

class FlightBookingCreate(FlightBookingBase):
    passengers: List[FlightPassengerCreate]

    @validator('return_date')
    def validate_return_date(cls, v, values):
        if 'trip_type' in values and values['trip_type'] == TripType.ROUND_TRIP and v is None:
            raise ValueError('return_date is required for Round Trip bookings')
        return v

class FlightBookingUpdate(BaseModel):
    status: str

class FlightBookingResponse(FlightBookingBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime
    passengers: List[FlightPassengerResponse] = []

    class Config:
        orm_mode = True
