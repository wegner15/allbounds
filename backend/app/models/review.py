from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Float, nullable=False)  # 1-5 stars
    reviewer_name = Column(String(100), nullable=False)
    reviewer_email = Column(String(255), nullable=False)
    
    # Polymorphic relationship - one of these will be set
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=True)
    group_trip_id = Column(Integer, ForeignKey("group_trips.id"), nullable=True)
    accommodation_id = Column(Integer, ForeignKey("accommodations.id"), nullable=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=True)
    
    is_approved = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    package = relationship("Package", back_populates="reviews")
    group_trip = relationship("GroupTrip", back_populates="reviews")
    accommodation = relationship("Accommodation", back_populates="reviews")
    hotel = relationship("Hotel", back_populates="reviews")
    attraction = relationship("Attraction", back_populates="reviews")
    # Remove back_populates to break circular dependencies
    approved_by = relationship("User")
