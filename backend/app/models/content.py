from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class ContentPage(Base):
    __tablename__ = "content_pages"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    content = Column(Text, nullable=False)
    meta_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    is_published = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<ContentPage(id={self.id}, title='{self.title}', slug='{self.slug}')>"