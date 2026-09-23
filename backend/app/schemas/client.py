from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, EmailStr


class ClientBase(BaseModel):
    client_type: str = "individual"  # 'individual' | 'corporate'
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    country_of_origin: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    tin_number: Optional[str] = None
    vat_number: Optional[str] = None
    passport_number: Optional[str] = None
    nationality: Optional[str] = None
    dietary_requirements: Optional[str] = None
    special_notes: Optional[str] = None
    is_active: bool = True


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    client_type: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    country_of_origin: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    tin_number: Optional[str] = None
    vat_number: Optional[str] = None
    passport_number: Optional[str] = None
    nationality: Optional[str] = None
    dietary_requirements: Optional[str] = None
    special_notes: Optional[str] = None
    is_active: Optional[bool] = None


class ClientResponse(ClientBase):
    id: int
    display_name: str
    total_invoiced_usd: float = 0.0
    total_paid_usd: float = 0.0
    outstanding_balance_usd: float = 0.0
    invoices_count: int = 0
    bookings_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StatementTransaction(BaseModel):
    date: date
    type: str  # 'INVOICE' | 'PAYMENT'
    reference_number: str  # e.g. "INV-2026-0001", "REC-2026-0001"
    description: str
    currency: str
    debit: float = 0.0   # Billed amount (increases balance)
    credit: float = 0.0  # Paid amount (decreases balance)
    running_balance: float = 0.0


class ClientStatementResponse(BaseModel):
    client: ClientResponse
    statement_date: date
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    opening_balance: float = 0.0
    total_billed: float = 0.0
    total_paid: float = 0.0
    closing_balance: float = 0.0
    transactions: List[StatementTransaction] = []
