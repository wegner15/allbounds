import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


def generate_supplier_code():
    return f"SUP-{uuid.uuid4().hex[:6].upper()}"


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    supplier_code = Column(String(50), unique=True, index=True, nullable=False, default=generate_supplier_code)
    
    # lodge_hotel, safari_operator, transporter, airline, park_authority, guide, other
    category = Column(String(50), nullable=False, default="lodge_hotel", index=True)

    contact_person = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    whatsapp = Column(String(50), nullable=True)
    physical_address = Column(Text, nullable=True)
    country = Column(String(100), nullable=True, default="Uganda")

    # Financial details
    currency = Column(String(10), nullable=False, default="USD")
    tax_pin_number = Column(String(100), nullable=True)
    
    # Stored bank accounts: [{bank_name, account_name, account_number, swift_code, branch, currency}]
    bank_details = Column(JSON, nullable=True, default=dict)
    # Mobile money details: [{network, number, account_name}]
    mobile_money_details = Column(JSON, nullable=True, default=dict)

    payment_terms = Column(String(100), nullable=True, default="Net 30")  # e.g., Net 30, On Confirmation, 50% Deposit
    rating = Column(Float, nullable=True, default=5.0)
    notes = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    bills = relationship("SupplierBill", back_populates="supplier", cascade="all, delete-orphan")
    payments = relationship("SupplierPayment", back_populates="supplier")
    vouchers = relationship("TravelVoucher", back_populates="supplier")
