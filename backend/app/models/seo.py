from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class SeoMeta(Base):
    __tablename__ = "seo_meta"

    id = Column(Integer, primary_key=True, index=True)
    
    # Polymorphic relationship - one of these will be set
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    country_id = Column(Integer, ForeignKey("countries.id"), nullable=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True)
    attraction_id = Column(Integer, ForeignKey("attractions.id"), nullable=True)
    accommodation_id = Column(Integer, ForeignKey("accommodations.id"), nullable=True)
    package_id = Column(Integer, ForeignKey("packages.id"), nullable=True)
    group_trip_id = Column(Integer, ForeignKey("group_trips.id"), nullable=True)
    holiday_type_id = Column(Integer, ForeignKey("holiday_types.id"), nullable=True)
    blog_post_id = Column(Integer, ForeignKey("blog_posts.id"), nullable=True)
    
    title = Column(String(200), nullable=True)  # SEO title
    description = Column(String(500), nullable=True)  # Meta description
    keywords = Column(String(500), nullable=True)  # Meta keywords
    
    # Open Graph
    og_title = Column(String(200), nullable=True)
    og_description = Column(String(500), nullable=True)
    og_image_id = Column(Integer, ForeignKey("media_assets.id"), nullable=True)
    
    canonical_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    og_image = relationship("MediaAsset")
    blog_post = relationship("BlogPost", back_populates="seo_meta")
