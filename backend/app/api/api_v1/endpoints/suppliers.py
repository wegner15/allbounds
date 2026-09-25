from typing import Any, List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.supplier_service import supplier_service
from app.schemas.supplier import (
    SupplierResponse,
    SupplierCreate,
    SupplierUpdate,
    SupplierLedgerResponse,
)
from app.schemas.supplier_bill import (
    SupplierBillResponse,
    SupplierBillCreate,
    SupplierBillUpdate,
    SupplierPaymentResponse,
    SupplierPaymentCreate,
)

router = APIRouter()


# ==========================================
# NUMBER GENERATORS
# ==========================================

@router.get("/next-bill-number")
def get_next_bill_number(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Preview next auto-generated supplier bill number."""
    return {"bill_number": supplier_service.get_next_bill_number(db)}


@router.get("/next-payment-number")
def get_next_payment_number(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Preview next auto-generated disbursement payment number."""
    return {"payment_number": supplier_service.get_next_payment_number(db)}


# ==========================================
# BILLS (ACCOUNTS PAYABLE)
# ==========================================

@router.get("/bills")
def get_bills(
    skip: int = 0,
    limit: int = 50,
    supplier_id: Optional[int] = None,
    invoice_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List supplier bills (payables) with filters."""
    items, total = supplier_service.get_bills(
        db,
        skip=skip,
        limit=limit,
        supplier_id=supplier_id,
        invoice_id=invoice_id,
        status=status,
        search=search,
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("/bills", response_model=SupplierBillResponse)
def create_bill(
    bill_in: SupplierBillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Record a new bill from a supplier."""
    try:
        return supplier_service.create_bill(db, bill_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/bills/{bill_id}", response_model=SupplierBillResponse)
def get_bill(
    bill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get supplier bill details."""
    bill = supplier_service.get_bill(db, bill_id)
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier bill not found")
    return bill


@router.put("/bills/{bill_id}", response_model=SupplierBillResponse)
def update_bill(
    bill_id: int,
    bill_update: SupplierBillUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update supplier bill details."""
    bill = supplier_service.update_bill(db, bill_id, bill_update)
    if not bill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier bill not found")
    return bill


# ==========================================
# PAYMENTS (DISBURSEMENTS)
# ==========================================

@router.post("/payments", response_model=SupplierPaymentResponse)
def create_payment(
    pmt_in: SupplierPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Record a disbursement payment to a supplier."""
    try:
        return supplier_service.create_payment(db, pmt_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==========================================
# SUPPLIERS CRUD
# ==========================================

@router.get("")
def get_suppliers(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """List suppliers with payable metrics and category filters."""
    items, total = supplier_service.get_suppliers(
        db, skip=skip, limit=limit, search=search, category=category, is_active=is_active
    )
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.post("", response_model=SupplierResponse)
def create_supplier(
    supplier_in: SupplierCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Create a new supplier profile."""
    try:
        return supplier_service.create_supplier(db, supplier_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Get full supplier profile and payable balance."""
    supplier = supplier_service.get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return supplier


@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: int,
    supplier_update: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Update supplier profile."""
    supplier = supplier_service.update_supplier(db, supplier_id, supplier_update)
    if not supplier:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Delete or deactivate supplier."""
    success = supplier_service.delete_supplier(db, supplier_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return {"message": "Supplier deleted or archived successfully"}


@router.get("/{supplier_id}/ledger", response_model=SupplierLedgerResponse)
def get_supplier_ledger(
    supplier_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate chronological Ledger Statement for a supplier."""
    ledger = supplier_service.get_supplier_ledger(
        db, supplier_id=supplier_id, start_date=start_date, end_date=end_date
    )
    if not ledger:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found")
    return ledger
