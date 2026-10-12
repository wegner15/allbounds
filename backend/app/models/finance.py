import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.database import Base


def generate_verification_token():
    return f"ABV-{uuid.uuid4().hex[:8].upper()}"


class Currency(Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(10), unique=True, index=True, nullable=False)  # e.g., 'USD', 'UGX', 'KES', 'EUR', 'GBP'
    name = Column(String(100), nullable=False)                         # e.g., 'US Dollar', 'Uganda Shilling'
    symbol = Column(String(10), nullable=False)                        # e.g., '$', 'USh', 'KSh', '€', '£'
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)  # Rate vs 1 USD (e.g. UGX = 3700.0, EUR = 0.92)
    is_base_currency = Column(Boolean, default=False)                  # USD is base currency
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class CompanyFinanceSettings(Base):
    __tablename__ = "company_finance_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False, default="ALLBOUND VACATIONS")
    legal_company_name = Column(String(255), nullable=False, default="Allbound Travel Services Limited")
    tagline = Column(String(255), nullable=False, default="Your Dream Holiday. Designed. Booked. Perfected.")
    physical_address = Column(Text, nullable=True, default="Plot 335 , Block 13 Najjanankumbi , Entebbe Road, Kampala Uganda")
    phone = Column(String(100), nullable=True, default="+(256) 782 594 008")
    whatsapp = Column(String(100), nullable=True, default="+(256) 782 594 008")
    email = Column(String(255), nullable=True, default="bookings@allboundvacations.com")
    website = Column(String(255), nullable=True, default="allboundvacations.com")
    tin_number = Column(String(100), nullable=True, default="1054173942")
    company_registration_number = Column(String(100), nullable=True, default="80020003146317")
    vat_number = Column(String(100), nullable=True, default="-")
    
    # Stored list of bank accounts
    bank_accounts = Column(JSON, nullable=True, default=list)
    # Stored list of mobile money accounts
    mobile_money_accounts = Column(JSON, nullable=True, default=list)
    card_payment_info = Column(Text, nullable=True)

    # Dynamic line item and supplier category configurations
    invoice_categories = Column(JSON, nullable=True, default=list)
    supplier_categories = Column(JSON, nullable=True, default=list)

    # Standard Notes & Terms templates
    default_invoice_notes = Column(Text, nullable=True)
    default_invoice_terms = Column(Text, nullable=True)
    default_receipt_notice = Column(Text, nullable=True)
    default_voucher_supplier_instructions = Column(Text, nullable=True)
    default_voucher_client_instructions = Column(Text, nullable=True)
    default_voucher_terms = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)
    quote_number = Column(String(100), nullable=True)
    
    # draft, issued, partially_paid, paid, overdue, cancelled
    invoice_status = Column(String(50), nullable=False, default="draft", index=True)
    invoice_date = Column(Date, nullable=False)
    booking_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=False)

    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)

    consultant_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    consultant_name = Column(String(255), nullable=True)
    payment_terms = Column(String(255), nullable=True)

    # Client Info: individual or corporate
    client_type = Column(String(50), nullable=False, default="individual")
    client_details = Column(JSON, nullable=False, default=dict)

    # Trip / Booking Summary
    trip_summary = Column(JSON, nullable=False, default=dict)

    # Financial Totals
    subtotal = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    promotional_discount = Column(Float, nullable=False, default=0.0)
    taxable_amount = Column(Float, nullable=False, default=0.0)
    vat_amount = Column(Float, nullable=False, default=0.0)
    other_taxes_amount = Column(Float, nullable=False, default=0.0)
    service_fee = Column(Float, nullable=False, default=0.0)
    booking_fee = Column(Float, nullable=False, default=0.0)
    payment_processing_fee = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    amount_paid = Column(Float, nullable=False, default=0.0)
    credit_applied = Column(Float, nullable=False, default=0.0)
    balance_due = Column(Float, nullable=False, default=0.0)

    # Snapshot of payment methods active at the time of issuing
    payment_methods_snapshot = Column(JSON, nullable=True)

    notes = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)
    verification_token = Column(String(100), unique=True, index=True, default=generate_verification_token)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    line_items = relationship(
        "InvoiceLineItem",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="InvoiceLineItem.sort_order"
    )
    receipts = relationship(
        "PaymentReceipt",
        back_populates="invoice",
        cascade="all, delete-orphan",
        order_by="PaymentReceipt.created_at.desc()"
    )
    booking = relationship("Booking", foreign_keys=[booking_id])
    consultant = relationship("User", foreign_keys=[consultant_id])
    client = relationship("Client", foreign_keys=[client_id], back_populates="invoices")
    supplier_bills = relationship("SupplierBill", back_populates="invoice")


class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # accommodation, transportation, activities, flights, other
    category = Column(String(50), nullable=False, default="other")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    travel_date = Column(Date, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False, default=0.0)
    discount = Column(Float, nullable=False, default=0.0)
    tax_rate = Column(Float, nullable=False, default=0.0)
    tax_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)

    # Cost & Supplier tracking
    cost_price = Column(Float, nullable=False, default=0.0)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    cost_narration = Column(Text, nullable=True)

    # Category-specific structured data
    metadata_json = Column(JSON, nullable=True, default=dict)
    sort_order = Column(Integer, default=0)

    # Relationship
    invoice = relationship("Invoice", back_populates="line_items")
    supplier = relationship("Supplier")


class PaymentReceipt(Base):
    __tablename__ = "payment_receipts"

    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String(100), unique=True, index=True, nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="SET NULL"), nullable=True, index=True)

    payment_reference = Column(String(150), nullable=False)  # Bank txn id, momo txn id, etc.
    receipt_date = Column(Date, nullable=False)
    payment_date = Column(DateTime(timezone=True), nullable=False)
    
    amount_received = Column(Float, nullable=False, default=0.0)
    amount_in_words = Column(String(500), nullable=False)
    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)

    # bank_transfer, mobile_money, card, cash, eft, cheque, other
    payment_method = Column(String(50), nullable=False, default="bank_transfer")
    payment_provider = Column(String(100), nullable=True)
    payment_status = Column(String(50), nullable=False, default="completed")  # completed, cleared, reversed

    received_from = Column(JSON, nullable=False, default=dict)
    payment_allocation = Column(JSON, nullable=False, default=dict)
    verification_code = Column(String(100), unique=True, index=True, default=generate_verification_token)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    invoice = relationship("Invoice", back_populates="receipts")
    booking = relationship("Booking", foreign_keys=[booking_id])
    client = relationship("Client", foreign_keys=[client_id], back_populates="receipts")


class TravelVoucher(Base):
    __tablename__ = "travel_vouchers"

    id = Column(Integer, primary_key=True, index=True)
    voucher_number = Column(String(100), unique=True, index=True, nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    confirmation_number = Column(String(100), nullable=True)

    version = Column(Integer, nullable=False, default=1)
    # confirmed, pending, amended, cancelled
    voucher_status = Column(String(50), nullable=False, default="confirmed")
    # accommodation, transportation, activity, safari, flight, general
    voucher_type = Column(String(50), nullable=False, default="general")

    issue_date = Column(Date, nullable=False)
    issued_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    issued_by_name = Column(String(255), nullable=True)

    supplier_details = Column(JSON, nullable=False, default=dict)
    traveller_details = Column(JSON, nullable=False, default=dict)
    service_details = Column(JSON, nullable=False, default=dict)

    supplier_instructions = Column(Text, nullable=True)
    client_instructions = Column(Text, nullable=True)

    inclusions = Column(JSON, nullable=True, default=list)
    exclusions = Column(JSON, nullable=True, default=list)
    special_requests = Column(JSON, nullable=True, default=list)
    emergency_contacts = Column(JSON, nullable=True, default=dict)

    voucher_terms = Column(Text, nullable=True)
    verification_code = Column(String(100), unique=True, index=True, default=generate_verification_token)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    booking = relationship("Booking", foreign_keys=[booking_id])
    invoice = relationship("Invoice", foreign_keys=[invoice_id])
    issued_by = relationship("User", foreign_keys=[issued_by_id])
    supplier = relationship("Supplier", foreign_keys=[supplier_id], back_populates="vouchers")


def generate_signing_token():
    return f"sgn_{uuid.uuid4().hex}"


class PaymentVoucher(Base):
    __tablename__ = "payment_vouchers"

    id = Column(Integer, primary_key=True, index=True)
    voucher_number = Column(String(100), unique=True, index=True, nullable=False)  # e.g. "PV-2026-00001"

    # pending_signature, signed, disbursed, reconciled, cancelled
    voucher_status = Column(String(50), nullable=False, default="pending_signature")

    # safari_field_advance, fuel_maintenance, park_permits, per_diem_allowance, petty_cash, emergency_expense, operational_expense, other
    category = Column(String(100), nullable=False, default="safari_field_advance")

    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)

    # Optional linkage to tour/safari booking
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)

    # Employee / Beneficiary
    employee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    employee_details = Column(JSON, nullable=False, default=dict)
    # e.g. {"name": "Moses Okello", "role": "Lead Safari Guide", "phone": "+256 78...", "email": "...", "id_number": "...", "payment_account": "MTN MoMo: 078..."}

    # Financial details
    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), nullable=False, default="USD")
    exchange_rate_to_usd = Column(Float, nullable=False, default=1.0)
    amount_in_words = Column(String(500), nullable=True)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Line items breakdown: list of {"item": "...", "quantity": 1, "unit_price": 100, "total": 100, "notes": "..."}
    line_items = Column(JSON, nullable=False, default=list)

    # Management Authorization
    authorized_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    authorized_by_name = Column(String(255), nullable=True)
    authorized_at = Column(DateTime(timezone=True), nullable=True)
    authorized_signature_url = Column(Text, nullable=True)

    # Employee Digital Signature & Audit Trail
    signing_token = Column(String(100), unique=True, index=True, default=generate_signing_token)
    is_signed = Column(Boolean, nullable=False, default=False)
    signed_at = Column(DateTime(timezone=True), nullable=True)
    signed_by_name = Column(String(255), nullable=True)
    signature_data = Column(Text, nullable=True)  # Base64 data URL
    signed_ip_address = Column(String(50), nullable=True)
    signed_user_agent = Column(String(255), nullable=True)
    signer_declaration = Column(Text, nullable=True)

    # Disbursement & Settlement Details
    # cash, mobile_money, bank_transfer, company_card, cheque
    disbursement_method = Column(String(50), nullable=False, default="cash")
    disbursed_from_account = Column(String(150), nullable=True)
    disbursement_reference = Column(String(150), nullable=True)
    disbursed_at = Column(DateTime(timezone=True), nullable=True)

    # Reconciliation / Retirement
    reconciliation_notes = Column(Text, nullable=True)
    actual_amount_spent = Column(Float, nullable=True)
    refund_amount = Column(Float, nullable=True)

    notes = Column(Text, nullable=True)
    terms_and_conditions = Column(Text, nullable=True)
    verification_code = Column(String(100), unique=True, index=True, default=generate_verification_token)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    booking = relationship("Booking", foreign_keys=[booking_id])
    employee = relationship("User", foreign_keys=[employee_id])
    authorized_by = relationship("User", foreign_keys=[authorized_by_id])
