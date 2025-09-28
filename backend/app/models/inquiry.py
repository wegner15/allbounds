from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func

from app.db.database import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)

    # Contact Information
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    country_of_origin = Column(String(100), nullable=True)

    # Inquiry Details
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)

    # Source tracking
    source = Column(String(100), nullable=False)  # How they found us

    # Status
    status = Column(String(50), nullable=False, default='new')  # new, in_progress, resolved, closed
    is_read = Column(Boolean, nullable=False, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())