from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    summary = Column(String(255), nullable=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    image_id = Column(String(255), nullable=True)  # Cloudflare Images ID
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    region = relationship("Region", back_populates="countries")
    media_assets = relationship("MediaAsset", secondary="country_media", back_populates="countries")
    # CRITICAL: lazy='noload' prevents circular loading when accessing country.packages
    attractions = relationship("Attraction", back_populates="country", lazy='noload')
    accommodations = relationship("Accommodation", back_populates="country", lazy='noload')
    hotels = relationship("Hotel", back_populates="country", lazy='noload')
    packages = relationship("Package", back_populates="country", lazy='noload')
    group_trips = relationship("GroupTrip", back_populates="country", lazy='noload')
    activities = relationship("Activity", secondary="country_activities", back_populates="countries", lazy='noload')
    visit_info = relationship("CountryVisitInfo", back_populates="country", uselist=False)
