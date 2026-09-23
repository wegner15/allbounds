from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


class SupplierPayment(Base):
    __tablename__ = "supplier_payments"

    id = Column(Integer, primary_key=True, index=True)
    payment_number = Column(String(100), unique=True, index=True, nullable=False)  # e.g. "DISB-2026-0001"

    supplier_bill_id = Column(Integer, ForeignKey("supplier_bills.id", ondelete="CASCADE"), nullable=False, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False, index=True)

    payment_date = Column(Date, nullable=False)
    amount_paid = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)

    # bank_transfer, mobile_money, card, cash, cheque
    payment_method = Column(String(50), nullable=False, default="bank_transfer")
    reference_code = Column(String(150), nullable=False)  # Bank transaction reference or momo ID
    disbursed_from_account = Column(String(150), nullable=True)  # e.g. "Stanbic USD Account", "MTN Momo UGX"

    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    bill = relationship("SupplierBill", back_populates="payments")
    supplier = relationship("Supplier", back_populates="payments")
