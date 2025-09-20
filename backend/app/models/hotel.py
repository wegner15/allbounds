from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Define association tables for many-to-many relationships
hotel_media = Table(
    "hotel_media",
    Base.metadata,
    Column("hotel_id", Integer, ForeignKey("hotels.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

package_hotels = Table(
    "package_hotels",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True),
    Column("hotel_id", Integer, ForeignKey("hotels.id"), primary_key=True)
)

group_trip_hotels = Table(
    "group_trip_hotels",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("hotel_id", Integer, ForeignKey("hotels.id"), primary_key=True)
)

class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    stars = Column(Float, nullable=True)  # Hotel star rating
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)  # Geographic coordinates
    longitude = Column(Float, nullable=True)  # Geographic coordinates
    price_category = Column(String(50), nullable=True)  # e.g., Budget, Mid-range, Luxury
    amenities = Column(JSON, nullable=True)  # List of amenities as JSON
    check_in_time = Column(String(50), nullable=True)  # Standard check-in time
    check_out_time = Column(String(50), nullable=True)  # Standard check-out time
    image_id = Column(String(255), nullable=True)  # Primary image ID
    slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    country = relationship("Country", back_populates="hotels")
    media_assets = relationship("MediaAsset", secondary=hotel_media, back_populates="hotels")
    reviews = relationship("Review", back_populates="hotel")
    
    # Relationships with Packages and Group Trips
    packages = relationship("Package", secondary=package_hotels, back_populates="hotels")
    group_trips = relationship("GroupTrip", secondary=group_trip_hotels, back_populates="hotels")
    
    # Relationship with Itinerary
    itinerary_items = relationship("ItineraryItem", secondary="itinerary_hotels", back_populates="hotels")
