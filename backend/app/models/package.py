from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# PackageHolidayType model for the association between Package and HolidayType
class PackageHolidayType(Base):
    __tablename__ = "package_holiday_types"
    
    package_id = Column(Integer, ForeignKey("packages.id"), primary_key=True)
    holiday_type_id = Column(Integer, ForeignKey("holiday_types.id"), primary_key=True)

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    duration_days = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)  # Base price
    itinerary = Column(Text, nullable=True)  # Could be JSON or HTML
    inclusions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    image_id = Column(String(255), nullable=True)  # Cloudflare image ID
    slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    country = relationship("Country", back_populates="packages")
    holiday_types = relationship("HolidayType", secondary="package_holiday_types", back_populates="packages")
    media_assets = relationship("MediaAsset", secondary="package_media", back_populates="packages")
    reviews = relationship("Review", back_populates="package")
    
    # Relationships with Hotels and Attractions
    hotels = relationship("Hotel", secondary="package_hotels", back_populates="packages")
    attractions = relationship("Attraction", secondary="package_attractions", back_populates="packages")
    
    # Relationship with Itinerary
    itinerary_items = relationship("ItineraryItem", 
                                   primaryjoin="and_(Package.id == foreign(ItineraryItem.entity_id), ItineraryItem.entity_type == 'package')",
                                   cascade="all, delete-orphan")
