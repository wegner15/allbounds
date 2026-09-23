from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, EmailStr


class SupplierBase(BaseModel):
    name: str
    category: str = "lodge_hotel"  # 'lodge_hotel', 'safari_operator', 'transporter', 'airline', 'park_authority', 'guide', 'other'
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    physical_address: Optional[str] = None
    country: Optional[str] = "Uganda"
    currency: str = "USD"
    tax_pin_number: Optional[str] = None
    bank_details: Optional[Dict[str, Any]] = None
    mobile_money_details: Optional[Dict[str, Any]] = None
    payment_terms: Optional[str] = "Net 30"
    rating: Optional[float] = 5.0
    notes: Optional[str] = None
    is_active: bool = True


class SupplierCreate(SupplierBase):
    supplier_code: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    physical_address: Optional[str] = None
    country: Optional[str] = None
    currency: Optional[str] = None
    tax_pin_number: Optional[str] = None
    bank_details: Optional[Dict[str, Any]] = None
    mobile_money_details: Optional[Dict[str, Any]] = None
    payment_terms: Optional[str] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierResponse(SupplierBase):
    id: int
    supplier_code: str
    total_billed_usd: float = 0.0
    total_paid_usd: float = 0.0
    balance_payable_usd: float = 0.0
    pending_bills_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SupplierLedgerTransaction(BaseModel):
    date: date
    type: str  # 'BILL' | 'PAYMENT'
    reference_number: str
    supplier_reference: Optional[str] = None
    description: str
    currency: str
    bill_amount: float = 0.0      # What we owe them
    paid_amount: float = 0.0      # What we disbursed
    running_payable: float = 0.0  # Remaining balance owed


class SupplierLedgerResponse(BaseModel):
    supplier: SupplierResponse
    statement_date: date
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_billed: float = 0.0
    total_paid: float = 0.0
    closing_payable: float = 0.0
    transactions: List[SupplierLedgerTransaction] = []
