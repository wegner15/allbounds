from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Many-to-Many relationship table between Country and Activity
country_activities = Table(
    "country_activities",
    Base.metadata,
    Column("country_id", Integer, ForeignKey("countries.id"), primary_key=True),
    Column("activity_id", Integer, ForeignKey("activities.id"), primary_key=True),
)

# Association table for Activity and MediaAsset (Gallery)
activity_media = Table(
    "activity_media",
    Base.metadata,
    Column("activity_id", Integer, ForeignKey("activities.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True),
)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    summary = Column(String(255), nullable=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    cover_image_id = Column(Integer, ForeignKey("media_assets.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    countries = relationship("Country", secondary=country_activities, back_populates="activities")
    cover_image = relationship("MediaAsset", foreign_keys=[cover_image_id])
    media_assets = relationship(
        "MediaAsset", secondary=activity_media, back_populates="activities"
    )
    itinerary_items = relationship("ItineraryItem", secondary="itinerary_item_activities", back_populates="linked_activities")

