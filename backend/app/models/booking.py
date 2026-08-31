from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_type = Column(String(20), nullable=False)  # 'package' or 'group_trip'
    entity_id = Column(Integer, nullable=False)  # ID of the package or group trip
    entity_slug = Column(String(255), nullable=False)  # Slug for easy reference

    # Contact Information
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(50), nullable=False)
    country_of_origin = Column(String(100), nullable=False)

    # Travelers
    number_of_adults = Column(Integer, nullable=False, default=1)
    number_of_children = Column(Integer, nullable=False, default=0)

    # Additional Details
    special_requests = Column(Text, nullable=True)
    source = Column(String(100), nullable=False)  # How they found us (website, social, referral, etc.)

    # Status
    status = Column(String(50), nullable=False, default='pending')  # pending, confirmed, cancelled, completed

    # Partner/Promo Referral
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True)
    partner_code = Column(String(50), nullable=True)

    # Selected Price Chart & Accommodation Options
    price_chart_id = Column(Integer, nullable=True)
    selected_hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    selected_hotel_name = Column(String(255), nullable=True)
    selected_hotel_supplement = Column(Float, default=0.0, nullable=True)
    selected_room_type = Column(String(100), nullable=True)
    selected_meal_plan = Column(String(100), nullable=True)
    number_of_nights = Column(Integer, nullable=True)
    calculated_total_price = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    travelers = relationship("BookingTraveler", backref="booking", cascade="all, delete-orphan")
    partner = relationship("Partner", backref="bookings")


class BookingTraveler(Base):
    __tablename__ = "booking_travelers"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)

    # Traveler details
    traveler_type = Column(String(20), nullable=False)  # 'adult' or 'child'
    full_name = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)  # Required for children, optional for adults

    # Relationship is handled by backref in Booking model