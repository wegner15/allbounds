import uuid
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.sql import func

from app.db.database import Base


def generate_default_partner_code():
    return uuid.uuid4().hex[:6].upper()


class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    partner_code = Column(String(50), unique=True, index=True, nullable=False, default=generate_default_partner_code)
    category = Column(String(50), nullable=False, index=True)  # e.g., 'hotel', 'airline', 'affiliation'
    logo_image_id = Column(String(255), nullable=True)          # Cloudflare Image ID for the partner logo
    website_url = Column(String(255), nullable=True)            # Optional external website link
    discount_percent = Column(Float, nullable=False, default=0.0)
    commission_percent = Column(Float, nullable=False, default=0.0)
    order_index = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
