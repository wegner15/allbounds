from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel


# ==========================================
# SUPPLIER PAYMENT (DISBURSEMENTS)
# ==========================================

class SupplierPaymentBase(BaseModel):
    supplier_bill_id: int
    payment_date: Optional[date] = None
    amount_paid: float
    currency: str = "USD"
    exchange_rate_to_usd: float = 1.0
    payment_method: str = "bank_transfer"  # bank_transfer, mobile_money, card, cash, cheque
    reference_code: str
    disbursed_from_account: Optional[str] = None
    notes: Optional[str] = None


class SupplierPaymentCreate(SupplierPaymentBase):
    pass


class SupplierPaymentResponse(SupplierPaymentBase):
    id: int
    payment_number: str
    supplier_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# SUPPLIER BILL (ACCOUNTS PAYABLE)
# ==========================================

class SupplierBillBase(BaseModel):
    supplier_id: int
    booking_id: Optional[int] = None
    invoice_id: Optional[int] = None
    supplier_reference: Optional[str] = None
    bill_date: date
    due_date: date
    service_date: Optional[date] = None
    currency: str = "USD"
    exchange_rate_to_usd: float = 1.0
    amount_billed: float
    category: str = "accommodation"
    description: Optional[str] = None
    notes: Optional[str] = None
    attachment_url: Optional[str] = None


class SupplierBillCreate(SupplierBillBase):
    pass


class SupplierBillUpdate(BaseModel):
    supplier_id: Optional[int] = None
    booking_id: Optional[int] = None
    invoice_id: Optional[int] = None
    supplier_reference: Optional[str] = None
    bill_date: Optional[date] = None
    due_date: Optional[date] = None
    service_date: Optional[date] = None
    currency: Optional[str] = None
    exchange_rate_to_usd: Optional[float] = None
    amount_billed: Optional[float] = None
    status: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    attachment_url: Optional[str] = None


class SupplierBillResponse(SupplierBillBase):
    id: int
    bill_number: str
    amount_paid: float = 0.0
    balance_payable: float = 0.0
    status: str  # pending, partially_paid, paid, overdue, cancelled
    supplier_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    payments: List[SupplierPaymentResponse] = []

    class Config:
        from_attributes = True
