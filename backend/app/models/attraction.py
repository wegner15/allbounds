from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Association tables for many-to-many relationships
package_attractions = Table(
    "package_attractions",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True),
    Column("attraction_id", Integer, ForeignKey("attractions.id"), primary_key=True)
)

group_trip_attractions = Table(
    "group_trip_attractions",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("attraction_id", Integer, ForeignKey("attractions.id"), primary_key=True)
)

class Attraction(Base):
    __tablename__ = "attractions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    address = Column(String(255), nullable=True)  # Physical address
    city = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)  # Geographic coordinates
    longitude = Column(Float, nullable=True)  # Geographic coordinates
    duration_minutes = Column(Integer, nullable=True)  # Typical visit duration
    price = Column(Float, nullable=True)  # Standard admission price
    opening_hours = Column(String(255), nullable=True)  # Operating hours
    image_id = Column(String(255), nullable=True)  # Primary image ID
    cover_image = Column(String(255), nullable=True)  # Cover image file path
    slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    country = relationship("Country", back_populates="attractions")
    media_assets = relationship("MediaAsset", secondary="attraction_media", back_populates="attractions")
    reviews = relationship("Review", back_populates="attraction")
    
    # Relationships with Packages and Group Trips
    packages = relationship("Package", secondary=package_attractions, back_populates="attractions")
    group_trips = relationship("GroupTrip", secondary=group_trip_attractions, back_populates="attractions")
    
    # Relationship with Itinerary
    itinerary_activities = relationship("ItineraryActivity", back_populates="attraction")
    itinerary_items = relationship("ItineraryItem", secondary="itinerary_attractions", back_populates="attractions")

# Note: attraction_media table is defined in media.py
