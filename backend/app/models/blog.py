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

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    is_active = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    # Remove back_populates to break circular dependencies
    author = relationship("User")
    tags = relationship("Tag", secondary=blog_post_tags)
    media_assets = relationship("MediaAsset", secondary="blog_post_media")
    seo_meta = relationship("SeoMeta", uselist=False)

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    blog_posts = relationship("BlogPost", secondary=blog_post_tags)
