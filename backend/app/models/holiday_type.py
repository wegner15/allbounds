from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base
# Import the package module but not specific classes to avoid circular imports
from app.models.group_trip import group_trip_holiday_types

class HolidayType(Base):
    __tablename__ = "holiday_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    image_id = Column(String(255), nullable=True)  # Cloudflare Images ID
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    packages = relationship("Package", secondary="package_holiday_types", back_populates="holiday_types")
    group_trips = relationship("GroupTrip", secondary=group_trip_holiday_types, back_populates="holiday_types")
