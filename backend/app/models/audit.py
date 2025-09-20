from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # e.g., "create", "update", "delete", "publish"
    entity_type = Column(String(50), nullable=False)  # e.g., "package", "blog_post"
    entity_id = Column(Integer, nullable=False)
    details = Column(JSON, nullable=True)  # Store changes or additional info
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    # Remove back_populates to break circular dependencies
    user = relationship("User")
