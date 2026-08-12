from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class GroupTripPriceChart(Base):
    __tablename__ = "group_trip_price_charts"

    id = Column(Integer, primary_key=True, index=True)
    group_trip_id = Column(Integer, ForeignKey("group_trips.id"), nullable=False)
    title = Column(String(100), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    price = Column(Float, nullable=False)
    booking_price = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with GroupTrip
    group_trip = relationship("GroupTrip", back_populates="price_charts")
