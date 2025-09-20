from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Many-to-Many relationship table between GroupTrip and HolidayType
group_trip_holiday_types = Table(
    "group_trip_holiday_types",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("holiday_type_id", Integer, ForeignKey("holiday_types.id"), primary_key=True)
)

class GroupTrip(Base):
    __tablename__ = "group_trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    duration_days = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)  # Base price
    min_participants = Column(Integer, nullable=True)  # Minimum number of participants
    max_participants = Column(Integer, nullable=True)  # Maximum number of participants
    itinerary = Column(Text, nullable=True)  # Could be JSON or HTML
    inclusions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    image_id = Column(String(255), nullable=True)  # Cloudflare image ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    country = relationship("Country", back_populates="group_trips")
    holiday_types = relationship("HolidayType", secondary=group_trip_holiday_types, back_populates="group_trips")
    media_assets = relationship("MediaAsset", secondary="group_trip_media", back_populates="group_trips")
    reviews = relationship("Review", back_populates="group_trip")
    departures = relationship("GroupTripDeparture", back_populates="group_trip")
    
    # Relationships with Hotels and Attractions
    hotels = relationship("Hotel", secondary="group_trip_hotels", back_populates="group_trips")
    attractions = relationship("Attraction", secondary="group_trip_attractions", back_populates="group_trips")
    
    # Relationship with Itinerary
    itinerary_items = relationship("ItineraryItem", 
                                   primaryjoin="and_(GroupTrip.id == foreign(ItineraryItem.entity_id), ItineraryItem.entity_type == 'group_trip')",
                                   cascade="all, delete-orphan")

class GroupTripDeparture(Base):
    __tablename__ = "group_trip_departures"

    id = Column(Integer, primary_key=True, index=True)
    group_trip_id = Column(Integer, ForeignKey("group_trips.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    price = Column(Float, nullable=True)  # Price for this specific departure
    available_slots = Column(Integer, nullable=False)
    booked_slots = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    group_trip = relationship("GroupTrip", back_populates="departures")
