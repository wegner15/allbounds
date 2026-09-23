from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class SupplierBill(Base):
    __tablename__ = "supplier_bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(100), unique=True, index=True, nullable=False)  # e.g. "BIL-2026-0001"
    supplier_reference = Column(String(100), nullable=True)  # Supplier's external invoice/quote #

    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)

    bill_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    service_date = Column(Date, nullable=True)

    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)

    amount_billed = Column(Float, nullable=False, default=0.0)
    amount_paid = Column(Float, nullable=False, default=0.0)
    balance_payable = Column(Float, nullable=False, default=0.0)

    # pending, partially_paid, paid, overdue, cancelled
    status = Column(String(50), nullable=False, default="pending", index=True)
    # accommodation, transport, permits, flight, guide, activity, other
    category = Column(String(50), nullable=False, default="accommodation")

    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    attachment_url = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    supplier = relationship("Supplier", back_populates="bills")
    booking = relationship("Booking")
    invoice = relationship("Invoice")
    payments = relationship("SupplierPayment", back_populates="bill", cascade="all, delete-orphan")
