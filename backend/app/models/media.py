from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Many-to-Many relationship tables for media assets
attraction_media = Table(
    "attraction_media",
    Base.metadata,
    Column("attraction_id", Integer, ForeignKey("attractions.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

accommodation_media = Table(
    "accommodation_media",
    Base.metadata,
    Column("accommodation_id", Integer, ForeignKey("accommodations.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

# hotel_media table is defined in hotel.py to avoid circular imports

package_media = Table(
    "package_media",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

group_trip_media = Table(
    "group_trip_media",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

blog_post_media = Table(
    "blog_post_media",
    Base.metadata,
    Column("blog_post_id", Integer, ForeignKey("blog_posts.id"), primary_key=True),
    Column("media_asset_id", Integer, ForeignKey("media_assets.id"), primary_key=True)
)

class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=True)
    file_path = Column(String(512), nullable=False)  # Path in R2 storage
    storage_key = Column(String(512), nullable=True)  # Storage key in R2
    file_size = Column(Integer, nullable=True)  # Size in bytes
    content_type = Column(String(100), nullable=True)  # MIME type
    width = Column(Integer, nullable=True)  # For images
    height = Column(Integer, nullable=True)  # For images
    alt_text = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    caption = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    entity_type = Column(String(50), nullable=True)  # Type of entity this media belongs to (e.g., 'attraction', 'accommodation')
    entity_id = Column(Integer, nullable=True)  # ID of the entity this media belongs to
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    # Remove back_populates to break circular dependencies
    created_by = relationship("User")
    attractions = relationship("Attraction", secondary=attraction_media)
    accommodations = relationship("Accommodation", secondary=accommodation_media)
    hotels = relationship("Hotel", secondary="hotel_media", back_populates="media_assets")
    activities = relationship("Activity", secondary="activity_media", back_populates="media_assets")
    packages = relationship("Package", secondary=package_media)
    group_trips = relationship("GroupTrip", secondary=group_trip_media)
    blog_posts = relationship("BlogPost", secondary=blog_post_media)
