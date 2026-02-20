from sqlalchemy import Column, Integer, String, Date, DateTime, Boolean, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.db.database import Base

class TripType(str, enum.Enum):
    ONE_WAY = "one_way"
    ROUND_TRIP = "round_trip"
    MULTI_CITY = "multi_city"

class BookingPurpose(str, enum.Enum):
    VISA_RESERVATION = "visa_reservation"
    CONFIRMED_TICKET = "confirmed_ticket"
    PRICE_QUOTE = "price_quote"
    TRAVEL_PLANNING = "travel_planning"

class ContactMethod(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    CALL = "call"

class FlightBooking(Base):
    __tablename__ = "flight_bookings"

    id = Column(Integer, primary_key=True, index=True)
    
    # Trip Details
    trip_type = Column(Enum(TripType), nullable=False)
    departure_city = Column(String(255), nullable=False)
    destination_city = Column(String(255), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)  # Nullable for one-way
    preferred_departure_time = Column(String(50), nullable=True) # Morning, Afternoon, Evening, Flexible
    
    # Passengers Summary
    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)
    infants = Column(Integer, default=0)
    
    # Purpose
    purpose = Column(Enum(BookingPurpose), nullable=False)
    
    # Contact Info
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(100), nullable=False)
    preferred_contact_method = Column(Enum(ContactMethod), nullable=True)
    
    # Options
    travel_budget_range = Column(String(100), nullable=True)
    is_flexible_dates = Column(Boolean, default=False)
    
    # Add-on Services (stored as JSON array of strings)
    add_on_services = Column(JSON, nullable=True)
    
    # Status handling
    status = Column(String(50), default="pending") 
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    passengers = relationship("FlightPassenger", back_populates="booking", cascade="all, delete-orphan")


class FlightPassenger(Base):
    __tablename__ = "flight_passengers"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("flight_bookings.id", ondelete="CASCADE"), nullable=False)
    
    # Details
    full_name = Column(String(255), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(20), nullable=True)
    nationality = Column(String(100), nullable=True)
    
    # Passport matching visa application
    passport_number = Column(String(100), nullable=True)
    passport_expiry = Column(Date, nullable=True)
    
    # Preferences
    special_assistance = Column(Boolean, default=False)
    seat_preference = Column(String(50), nullable=True) # Window, Aisle, No preference
    meal_preference = Column(String(100), nullable=True)
    passenger_type = Column(String(20), default="adult") # adult, child, infant

    # Relationships
    booking = relationship("FlightBooking", back_populates="passengers")
