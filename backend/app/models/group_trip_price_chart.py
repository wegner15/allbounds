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

    # Relationship with Hotel options / supplements
    hotel_options = relationship(
        "GroupTripPriceChartHotel",
        back_populates="price_chart",
        cascade="all, delete-orphan",
        order_by="GroupTripPriceChartHotel.order_index"
    )


class GroupTripPriceChartHotel(Base):
    __tablename__ = "group_trip_price_chart_hotels"

    id = Column(Integer, primary_key=True, index=True)
    price_chart_id = Column(Integer, ForeignKey("group_trip_price_charts.id", ondelete="CASCADE"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    price_supplement = Column(Float, default=0.0, nullable=False)
    room_type = Column(String(100), nullable=True)
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    price_chart = relationship("GroupTripPriceChart", back_populates="hotel_options")
    hotel = relationship("Hotel")
