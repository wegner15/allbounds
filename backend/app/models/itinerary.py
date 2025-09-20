from sqlalchemy import Column, Integer, String, Text, Date, Time, Boolean, ForeignKey, DateTime, Enum, Numeric, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base

# Association tables for many-to-many relationships
itinerary_hotels = Table(
    'itinerary_hotels',
    Base.metadata,
    Column('itinerary_item_id', Integer, ForeignKey('itinerary_items.id'), primary_key=True),
    Column('hotel_id', Integer, ForeignKey('hotels.id'), primary_key=True)
)

itinerary_attractions = Table(
    'itinerary_attractions', 
    Base.metadata,
    Column('itinerary_item_id', Integer, ForeignKey('itinerary_items.id'), primary_key=True),
    Column('attraction_id', Integer, ForeignKey('attractions.id'), primary_key=True)
)

itinerary_item_activities = Table(
    'itinerary_item_activities',
    Base.metadata,
    Column('itinerary_item_id', Integer, ForeignKey('itinerary_items.id'), primary_key=True),
    Column('activity_id', Integer, ForeignKey('activities.id'), primary_key=True)
)


class EntityType(str, enum.Enum):
    PACKAGE = "package"
    GROUP_TRIP = "group_trip"


class MealType(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"


class ItineraryItem(Base):
    """
    Represents a single day in an itinerary for packages or group trips.
    """
    __tablename__ = "itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(Enum(EntityType, values_callable=lambda obj: [e.value for e in obj]), nullable=False, index=True)
    entity_id = Column(Integer, nullable=False, index=True)
    day_number = Column(Integer, nullable=False)  # Day 1, Day 2, etc.
    date = Column(Date, nullable=True)  # Actual date for group trips with fixed dates
    title = Column(String(255), nullable=False)  # e.g., "Arrival in Paris"
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)  # City/region for travel journey mapping
    latitude = Column(Numeric(10, 8), nullable=True)  # For precise mapping
    longitude = Column(Numeric(11, 8), nullable=True)  # For precise mapping
    accommodation_notes = Column(Text, nullable=True)  # For non-hotel stays or special notes
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    hotels = relationship("Hotel", secondary=itinerary_hotels, back_populates="itinerary_items")
    attractions = relationship("Attraction", secondary=itinerary_attractions, back_populates="itinerary_items")
    # The new relationship to the main Activity model
    linked_activities = relationship("Activity", secondary=itinerary_item_activities, back_populates="itinerary_items")
    # The old relationship for custom, one-off activities
    custom_activities = relationship("ItineraryActivity", back_populates="itinerary_item", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ItineraryItem(id={self.id}, entity_type={self.entity_type}, day_number={self.day_number}, title='{self.title}')>"


class ItineraryActivity(Base):
    """
    Represents individual activities within a day of an itinerary.
    """
    __tablename__ = "itinerary_activities"

    id = Column(Integer, primary_key=True, index=True)
    itinerary_item_id = Column(Integer, ForeignKey("itinerary_items.id"), nullable=False)
    time = Column(Time, nullable=True)  # e.g., 09:00
    activity_title = Column(String(255), nullable=False)
    activity_description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=True)
    duration_hours = Column(Numeric(3, 1), nullable=True)  # e.g., 2.5 hours
    is_meal = Column(Boolean, default=False)
    meal_type = Column(Enum(MealType, values_callable=lambda obj: [e.value for e in obj]), nullable=True)
    order_index = Column(Integer, default=0)  # For sorting activities within a day
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    itinerary_item = relationship("ItineraryItem", back_populates="custom_activities")
    attraction = relationship("Attraction", back_populates="itinerary_activities")

    def __repr__(self):
        return f"<ItineraryActivity(id={self.id}, title='{self.activity_title}', time={self.time})>"
