from typing import Optional
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

# Many-to-Many relationship table between BlogPost and Tag
blog_post_tags = Table(
    "blog_post_tags",
    Base.metadata,
    Column("blog_post_id", Integer, ForeignKey("blog_posts.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True)
)

# ---------------------------------------------------------------------------
# Entity ↔ Tag pivot tables (defined here alongside the Tag model to keep all
# tag-related association tables in one place and avoid circular imports)
# ---------------------------------------------------------------------------
package_tags = Table(
    "package_tags",
    Base.metadata,
    Column("package_id", Integer, ForeignKey("packages.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id",     Integer, ForeignKey("tags.id",     ondelete="CASCADE"), primary_key=True),
)

hotel_tags = Table(
    "hotel_tags",
    Base.metadata,
    Column("hotel_id", Integer, ForeignKey("hotels.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id",   Integer, ForeignKey("tags.id",   ondelete="CASCADE"), primary_key=True),
)

activity_tags = Table(
    "activity_tags",
    Base.metadata,
    Column("activity_id", Integer, ForeignKey("activities.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id",      Integer, ForeignKey("tags.id",       ondelete="CASCADE"), primary_key=True),
)

attraction_tags = Table(
    "attraction_tags",
    Base.metadata,
    Column("attraction_id", Integer, ForeignKey("attractions.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id",        Integer, ForeignKey("tags.id",        ondelete="CASCADE"), primary_key=True),
)

group_trip_tags = Table(
    "group_trip_tags",
    Base.metadata,
    Column("group_trip_id", Integer, ForeignKey("group_trips.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id",        Integer, ForeignKey("tags.id",        ondelete="CASCADE"), primary_key=True),
)

# Many-to-Many relationship table between BlogPost and Package (Tour)
blog_post_packages = Table(
    "blog_post_packages",
    Base.metadata,
    Column("blog_post_id", Integer, ForeignKey("blog_posts.id"), primary_key=True),
    Column("package_id", Integer, ForeignKey("packages.id"), primary_key=True)
)

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(String(1000), nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    cover_image_id = Column(String(255), nullable=True)  # Cloudflare Images ID
    is_active = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    # Remove back_populates to break circular dependencies
    author = relationship("User", overlaps="blog_posts")
    tags = relationship("Tag", secondary=blog_post_tags, overlaps="blog_posts")
    media_assets = relationship("MediaAsset", secondary="blog_post_media", overlaps="blog_posts")
    packages = relationship("Package", secondary=blog_post_packages, back_populates="blog_posts")
    seo_meta = relationship("SeoMeta", uselist=False)
    
    @property
    def cover_image_url(self) -> Optional[str]:
        """
        Generate the cover image URL from cover_image_id if available.
        """
        if self.cover_image_id:
            from app.core.cloudflare_config import cloudflare_settings
            return f"{cloudflare_settings.delivery_url}/{self.cover_image_id}/medium"
        return None

class Tag(Base):
    """Shared content tag used for filtering across all entity types."""
    __tablename__ = "tags"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    slug        = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    # Grouping field — e.g. 'audience', 'pace', 'environment', 'budget'
    category    = Column(String(50), nullable=True, index=True)
    icon        = Column(String(100), nullable=True)   # emoji or icon name
    color       = Column(String(20), nullable=True)    # hex color, e.g. '#4CAF50'
    order_index = Column(Integer, nullable=False, default=0)
    is_active   = Column(Boolean, nullable=False, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    blog_posts  = relationship("BlogPost",  secondary=blog_post_tags,  overlaps="tags")
    packages    = relationship("Package",   secondary=package_tags,    back_populates="tags", lazy="noload")
    hotels      = relationship("Hotel",     secondary=hotel_tags,      back_populates="tags", lazy="noload")
    activities  = relationship("Activity",  secondary=activity_tags,   back_populates="tags", lazy="noload")
    attractions = relationship("Attraction",secondary=attraction_tags, back_populates="tags", lazy="noload")
    group_trips = relationship("GroupTrip", secondary=group_trip_tags, back_populates="tags", lazy="noload")
