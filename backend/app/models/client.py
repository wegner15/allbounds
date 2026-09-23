from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    # individual or corporate
    client_type = Column(String(50), nullable=False, default="individual", index=True)

    # Individual details
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)

    # Corporate details
    company_name = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)

    # Contact Info
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    alt_phone = Column(String(50), nullable=True)
    country_of_origin = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(50), nullable=True)

    # Tax & Identification
    tin_number = Column(String(100), nullable=True)
    vat_number = Column(String(100), nullable=True)
    passport_number = Column(String(100), nullable=True)
    nationality = Column(String(100), nullable=True)

    # Preferences & Travel Notes
    dietary_requirements = Column(String(255), nullable=True)
    special_notes = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    invoices = relationship("Invoice", back_populates="client")
    receipts = relationship("PaymentReceipt", back_populates="client")
    bookings = relationship("Booking", back_populates="client")

    @property
    def display_name(self) -> str:
        if self.client_type == "corporate" and self.company_name:
            return self.company_name
        names = [n for n in [self.first_name, self.last_name] if n]
        return " ".join(names) if names else self.email
