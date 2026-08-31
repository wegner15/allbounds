from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class HotelPriceChart(Base):
    __tablename__ = "hotel_price_charts"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    title = Column(String(100), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    booking_price = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship with Hotel
    hotel = relationship("Hotel", back_populates="price_charts")
    # Relationship with Night Rates
    night_rates = relationship(
        "HotelPriceChartNightRate",
        back_populates="price_chart",
        cascade="all, delete-orphan",
        order_by="HotelPriceChartNightRate.nights"
    )


class HotelPriceChartNightRate(Base):
    __tablename__ = "hotel_price_chart_night_rates"

    id = Column(Integer, primary_key=True, index=True)
    price_chart_id = Column(Integer, ForeignKey("hotel_price_charts.id", ondelete="CASCADE"), nullable=False)
    nights = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)
    price_per_night = Column(Float, nullable=True)
    room_type = Column(String(100), nullable=True)
    meal_plan = Column(String(100), nullable=True)
    is_default = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    price_chart = relationship("HotelPriceChart", back_populates="night_rates")
