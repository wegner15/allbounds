from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Accommodation(Base):
    __tablename__ = "accommodations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    summary = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=False)
    stars = Column(Float, nullable=True)  # Hotel star rating
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)  # Geographic coordinates
    longitude = Column(Float, nullable=True)  # Geographic coordinates
    amenities = Column(JSON, nullable=True)  # List of amenities as JSON
    slug = Column(String(100), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    country = relationship("Country", back_populates="accommodations")
    media_assets = relationship("MediaAsset", secondary="accommodation_media", back_populates="accommodations")
    reviews = relationship("Review", back_populates="accommodation")
