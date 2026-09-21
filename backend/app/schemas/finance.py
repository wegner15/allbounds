from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import date, datetime


# ==========================================
# CURRENCY SCHEMAS
# ==========================================

class CurrencyBase(BaseModel):
    code: str = Field(..., max_length=10, description="ISO currency code e.g. USD, UGX, KES, EUR, GBP")
    name: str = Field(..., max_length=100, description="Currency name e.g. US Dollar, Uganda Shilling")
    symbol: str = Field(..., max_length=10, description="Currency symbol e.g. $, USh, KSh, €")
    exchange_rate_to_usd: float = Field(default=1.0, gt=0, description="Exchange rate relative to 1 USD")
    is_base_currency: bool = Field(default=False)
    is_active: bool = Field(default=True)


class CurrencyCreate(CurrencyBase):
    pass


class CurrencyUpdate(BaseModel):
    name: Optional[str] = None
    symbol: Optional[str] = None
    exchange_rate_to_usd: Optional[float] = Field(None, gt=0)
    is_base_currency: Optional[bool] = None
    is_active: Optional[bool] = None


class CurrencyResponse(CurrencyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# COMPANY FINANCE SETTINGS SCHEMAS
# ==========================================

class CompanyFinanceSettingsBase(BaseModel):
    company_name: str = "ALLBOUND VACATIONS"
    legal_company_name: str = "Allbound Travel Services Limited"
    tagline: str = "Your Dream Holiday. Designed. Booked. Perfected."
    physical_address: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    tin_number: Optional[str] = None
    company_registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    bank_accounts: List[Dict[str, Any]] = Field(default_factory=list)
    mobile_money_accounts: List[Dict[str, Any]] = Field(default_factory=list)
    card_payment_info: Optional[str] = None
    default_invoice_notes: Optional[str] = None
    default_invoice_terms: Optional[str] = None
    default_receipt_notice: Optional[str] = None
    default_voucher_supplier_instructions: Optional[str] = None
    default_voucher_client_instructions: Optional[str] = None
    default_voucher_terms: Optional[str] = None


class CompanyFinanceSettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    legal_company_name: Optional[str] = None
    tagline: Optional[str] = None
    physical_address: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    tin_number: Optional[str] = None
    company_registration_number: Optional[str] = None
    vat_number: Optional[str] = None
    bank_accounts: Optional[List[Dict[str, Any]]] = None
    mobile_money_accounts: Optional[List[Dict[str, Any]]] = None
    card_payment_info: Optional[str] = None
    default_invoice_notes: Optional[str] = None
    default_invoice_terms: Optional[str] = None
    default_receipt_notice: Optional[str] = None
    default_voucher_supplier_instructions: Optional[str] = None
    default_voucher_client_instructions: Optional[str] = None
    default_voucher_terms: Optional[str] = None


class CompanyFinanceSettingsResponse(CompanyFinanceSettingsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# INVOICE LINE ITEM SCHEMAS
# ==========================================

class InvoiceLineItemBase(BaseModel):
    category: str = Field(default="other", description="accommodation, transportation, activities, flights, other")
    title: str
    description: Optional[str] = None
    travel_date: Optional[date] = None
    quantity: float = 1.0
    unit_price: float = 0.0
    discount: float = 0.0
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    total_amount: float = 0.0
    metadata_json: Optional[Dict[str, Any]] = Field(default_factory=dict)
    sort_order: int = 0


class InvoiceLineItemCreate(InvoiceLineItemBase):
    pass


class InvoiceLineItemResponse(InvoiceLineItemBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True


# ==========================================
# INVOICE SCHEMAS
# ==========================================

class InvoiceBase(BaseModel):
    booking_id: Optional[int] = None
    quote_number: Optional[str] = None
    invoice_status: str = Field(default="draft", description="draft, issued, partially_paid, paid, overdue, cancelled")
    invoice_date: date
    booking_date: Optional[date] = None
    due_date: date
    currency: str = "USD"
    exchange_rate_to_usd: float = 1.0
    consultant_id: Optional[int] = None
    consultant_name: Optional[str] = None
    payment_terms: Optional[str] = None
    client_type: str = Field(default="individual", description="individual or corporate")
    client_details: Dict[str, Any] = Field(default_factory=dict)
    trip_summary: Dict[str, Any] = Field(default_factory=dict)
    subtotal: float = 0.0
    discount_amount: float = 0.0
    promotional_discount: float = 0.0
    taxable_amount: float = 0.0
    vat_amount: float = 0.0
    other_taxes_amount: float = 0.0
    service_fee: float = 0.0
    booking_fee: float = 0.0
    payment_processing_fee: float = 0.0
    total_amount: float = 0.0
    credit_applied: float = 0.0
    payment_methods_snapshot: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    invoice_number: Optional[str] = None  # If None, auto-generated sequentially
    line_items: List[InvoiceLineItemCreate] = Field(default_factory=list)


class InvoiceFromBookingCreate(BaseModel):
    booking_id: int
    due_date: Optional[date] = None
    currency: Optional[str] = "USD"
    payment_terms: Optional[str] = None
    notes: Optional[str] = None


class InvoiceUpdate(BaseModel):
    invoice_status: Optional[str] = None
    quote_number: Optional[str] = None
    invoice_date: Optional[date] = None
    booking_date: Optional[date] = None
    due_date: Optional[date] = None
    currency: Optional[str] = None
    exchange_rate_to_usd: Optional[float] = None
    consultant_id: Optional[int] = None
    consultant_name: Optional[str] = None
    payment_terms: Optional[str] = None
    client_type: Optional[str] = None
    client_details: Optional[Dict[str, Any]] = None
    trip_summary: Optional[Dict[str, Any]] = None
    subtotal: Optional[float] = None
    discount_amount: Optional[float] = None
    promotional_discount: Optional[float] = None
    taxable_amount: Optional[float] = None
    vat_amount: Optional[float] = None
    other_taxes_amount: Optional[float] = None
    service_fee: Optional[float] = None
    booking_fee: Optional[float] = None
    payment_processing_fee: Optional[float] = None
    total_amount: Optional[float] = None
    credit_applied: Optional[float] = None
    payment_methods_snapshot: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    line_items: Optional[List[InvoiceLineItemCreate]] = None


# ==========================================
# PAYMENT RECEIPT SCHEMAS
# ==========================================

class PaymentReceiptBase(BaseModel):
    invoice_id: int
    booking_id: Optional[int] = None
    payment_reference: str
    receipt_date: date
    payment_date: datetime
    amount_received: float = Field(..., gt=0)
    currency: str = "USD"
    exchange_rate_to_usd: float = 1.0
    payment_method: str = Field(default="bank_transfer", description="bank_transfer, mobile_money, card, cash, eft, cheque, other")
    payment_provider: Optional[str] = None
    payment_status: str = Field(default="completed", description="completed, cleared, reversed")
    received_from: Dict[str, Any] = Field(default_factory=dict)
    notes: Optional[str] = None


class PaymentReceiptCreate(PaymentReceiptBase):
    receipt_number: Optional[str] = None  # If None, auto-generated sequentially
    amount_in_words: Optional[str] = None # If None, auto-calculated


class PaymentReceiptResponse(PaymentReceiptBase):
    id: int
    receipt_number: str
    amount_in_words: str
    payment_allocation: Dict[str, Any]
    verification_code: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceResponse(InvoiceBase):
    id: int
    invoice_number: str
    amount_paid: float
    balance_due: float
    verification_token: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    line_items: List[InvoiceLineItemResponse] = Field(default_factory=list)
    receipts: List[PaymentReceiptResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# ==========================================
# TRAVEL VOUCHER SCHEMAS
# ==========================================

class TravelVoucherBase(BaseModel):
    booking_id: Optional[int] = None
    invoice_id: Optional[int] = None
    confirmation_number: Optional[str] = None
    version: int = 1
    voucher_status: str = Field(default="confirmed", description="confirmed, pending, amended, cancelled")
    voucher_type: str = Field(default="general", description="accommodation, transportation, activity, safari, flight, general")
    issue_date: date
    issued_by_id: Optional[int] = None
    issued_by_name: Optional[str] = None
    supplier_details: Dict[str, Any] = Field(default_factory=dict)
    traveller_details: Dict[str, Any] = Field(default_factory=dict)
    service_details: Dict[str, Any] = Field(default_factory=dict)
    supplier_instructions: Optional[str] = None
    client_instructions: Optional[str] = None
    inclusions: List[str] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list)
    special_requests: List[Dict[str, Any]] = Field(default_factory=list)
    emergency_contacts: Optional[Dict[str, Any]] = None
    voucher_terms: Optional[str] = None


class TravelVoucherCreate(TravelVoucherBase):
    voucher_number: Optional[str] = None  # If None, auto-generated


class TravelVoucherFromBookingCreate(BaseModel):
    booking_id: int
    voucher_type: str = "general"
    supplier_details: Optional[Dict[str, Any]] = None
    issue_date: Optional[date] = None


class TravelVoucherUpdate(BaseModel):
    confirmation_number: Optional[str] = None
    voucher_status: Optional[str] = None
    voucher_type: Optional[str] = None
    issue_date: Optional[date] = None
    issued_by_name: Optional[str] = None
    supplier_details: Optional[Dict[str, Any]] = None
    traveller_details: Optional[Dict[str, Any]] = None
    service_details: Optional[Dict[str, Any]] = None
    supplier_instructions: Optional[str] = None
    client_instructions: Optional[str] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    special_requests: Optional[List[Dict[str, Any]]] = None
    emergency_contacts: Optional[Dict[str, Any]] = None
    voucher_terms: Optional[str] = None
    bump_version: bool = False  # If true, increments version number


class TravelVoucherResponse(TravelVoucherBase):
    id: int
    voucher_number: str
    verification_code: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# PUBLIC VERIFICATION SCHEMAS
# ==========================================

class PublicVoucherVerificationResponse(BaseModel):
    is_valid: bool
    voucher_number: str
    booking_number: Optional[str] = None
    version: int
    voucher_status: str
    voucher_type: str
    issue_date: date
    supplier_name: str
    lead_traveller: str
    passenger_count: int
    service_summary: str
    service_dates: str
    verification_timestamp: datetime


class PublicReceiptVerificationResponse(BaseModel):
    is_valid: bool
    receipt_number: str
    invoice_number: Optional[str] = None
    booking_number: Optional[str] = None
    receipt_date: date
    amount_received: float
    currency: str
    payment_method: str
    payment_status: str
    payer_name: str
    verification_timestamp: datetime


# ==========================================
# DASHBOARD STATS & ACTIONS
# ==========================================

class FinanceDashboardStats(BaseModel):
    total_invoiced_usd: float
    total_collected_usd: float
    total_outstanding_usd: float
    overdue_invoices_count: int
    pending_vouchers_count: int
    invoices_by_status: Dict[str, int]
    recent_receipts: List[PaymentReceiptResponse]
    recent_invoices: List[InvoiceResponse]


class SendEmailRequest(BaseModel):
    recipient_email: EmailStr
    recipient_name: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None
    copy_me: bool = True
