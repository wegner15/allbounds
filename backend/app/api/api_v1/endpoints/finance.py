from typing import Any, List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.finance_service import finance_service
from app.schemas.finance import (
    CurrencyResponse,
    CurrencyCreate,
    CurrencyUpdate,
    CompanyFinanceSettingsResponse,
    CompanyFinanceSettingsUpdate,
    InvoiceResponse,
    InvoiceCreate,
    InvoiceFromBookingCreate,
    InvoiceUpdate,
    PaymentReceiptResponse,
    PaymentReceiptCreate,
    TravelVoucherResponse,
    TravelVoucherCreate,
    TravelVoucherFromBookingCreate,
    TravelVoucherUpdate,
    PublicVoucherVerificationResponse,
    PublicReceiptVerificationResponse,
    FinanceDashboardStats,
    SendEmailRequest
)

router = APIRouter()


# ==========================================
# CURRENCIES ENDPOINTS
# ==========================================

@router.get("/currencies", response_model=List[CurrencyResponse])
def get_currencies(
    active_only: bool = True,
    db: Session = Depends(get_db)
) -> Any:
    """List supported currencies with exchange rates relative to USD."""
    return finance_service.get_currencies(db, active_only=active_only)


@router.post("/currencies", response_model=CurrencyResponse)
def create_currency(
    currency_in: CurrencyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Add a new currency and its exchange rate to USD."""
    try:
        return finance_service.create_currency(db, currency_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/currencies/{currency_id}", response_model=CurrencyResponse)
def update_currency(
    currency_id: int,
    currency_update: CurrencyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update currency rate or status."""
    currency = finance_service.update_currency(db, currency_id, currency_update)
    if not currency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Currency not found")
    return currency


@router.delete("/currencies/{currency_id}")
def delete_currency(
    currency_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete a currency. Base currencies cannot be deleted."""
    try:
        finance_service.delete_currency(db, currency_id)
        return {"message": "Currency deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==========================================
# COMPANY FINANCE SETTINGS
# ==========================================

@router.get("/settings", response_model=CompanyFinanceSettingsResponse)
def get_company_finance_settings(
    db: Session = Depends(get_db)
) -> Any:
    """Get company finance profile, banking details, and default notes."""
    return finance_service.get_company_settings(db)


@router.put("/settings", response_model=CompanyFinanceSettingsResponse)
def update_company_finance_settings(
    settings_in: CompanyFinanceSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update company finance settings."""
    return finance_service.update_company_settings(db, settings_in)


# ==========================================
# DASHBOARD STATS
# ==========================================

@router.get("/stats", response_model=FinanceDashboardStats)
def get_finance_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get aggregate financial metrics, recent invoices, and receipts."""
    return finance_service.get_finance_dashboard_stats(db)


# ==========================================
# INVOICE ENDPOINTS
# ==========================================

@router.get("/invoices/next-number")
def get_next_invoice_number(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Preview the next auto-generated invoice number without creating an invoice."""
    return {"invoice_number": finance_service.get_next_invoice_number(db)}


@router.get("/invoices")
def get_invoices(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    client_search: Optional[str] = None,
    currency: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List invoices with pagination and search filters."""
    invoices, total = finance_service.get_invoices(
        db, skip=skip, limit=limit, status=status, client_search=client_search, currency=currency
    )
    return {
        "items": [InvoiceResponse.from_orm(inv) for inv in invoices],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/invoices", response_model=InvoiceResponse)
def create_invoice(
    invoice_in: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a new manual invoice."""
    if not invoice_in.consultant_id:
        invoice_in.consultant_id = current_user.id
        invoice_in.consultant_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
    return finance_service.create_invoice(db, invoice_in)


@router.post("/invoices/from-booking", response_model=InvoiceResponse)
def create_invoice_from_booking(
    request_in: InvoiceFromBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """1-Click generate invoice from an existing booking."""
    try:
        return finance_service.create_invoice_from_booking(
            db,
            booking_id=request_in.booking_id,
            due_date=request_in.due_date,
            currency=request_in.currency or "USD",
            payment_terms=request_in.payment_terms,
            notes=request_in.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get full details of a specific invoice."""
    invoice = finance_service.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.get("/invoices/by-token/{token}", response_model=InvoiceResponse)
def get_invoice_by_token(
    token: str,
    db: Session = Depends(get_db)
) -> Any:
    """Public / client view of invoice via secure token."""
    invoice = finance_service.get_invoice_by_token(db, token)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.put("/invoices/{invoice_id}", response_model=InvoiceResponse)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update invoice line items, terms, or status."""
    invoice = finance_service.update_invoice(db, invoice_id, invoice_update)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return invoice


@router.delete("/invoices/{invoice_id}")
def delete_invoice(
    invoice_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Delete an invoice."""
    success = finance_service.delete_invoice(db, invoice_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return {"message": f"Invoice #{invoice_id} deleted successfully"}


@router.post("/invoices/{invoice_id}/send-email")
def send_invoice_email(
    invoice_id: int,
    email_req: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Send invoice link and summary via email."""
    success = finance_service.send_invoice_email(
        db,
        invoice_id=invoice_id,
        recipient_email=email_req.recipient_email,
        recipient_name=email_req.recipient_name,
        subject=email_req.subject,
        custom_message=email_req.message
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    return {"message": "Invoice email dispatched successfully"}


# ==========================================
# PAYMENT RECEIPTS ENDPOINTS
# ==========================================

@router.get("/receipts")
def get_receipts(
    skip: int = 0,
    limit: int = 50,
    invoice_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List payment receipts with pagination."""
    receipts, total = finance_service.get_receipts(db, skip=skip, limit=limit, invoice_id=invoice_id)
    return {
        "items": [PaymentReceiptResponse.from_orm(r) for r in receipts],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/receipts", response_model=PaymentReceiptResponse)
def create_receipt(
    receipt_in: PaymentReceiptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Record payment and automatically allocate against invoice."""
    try:
        return finance_service.create_receipt(db, receipt_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/receipts/{receipt_id}", response_model=PaymentReceiptResponse)
def get_receipt(
    receipt_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get payment receipt details."""
    receipt = finance_service.get_receipt(db, receipt_id)
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")
    return receipt


@router.post("/receipts/{receipt_id}/send-email")
def send_receipt_email(
    receipt_id: int,
    email_req: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Send payment receipt via email."""
    success = finance_service.send_receipt_email(
        db,
        receipt_id=receipt_id,
        recipient_email=email_req.recipient_email,
        recipient_name=email_req.recipient_name,
        subject=email_req.subject
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receipt not found")
    return {"message": "Receipt email dispatched successfully"}


# ==========================================
# TRAVEL VOUCHERS ENDPOINTS
# ==========================================

@router.get("/vouchers")
def get_vouchers(
    skip: int = 0,
    limit: int = 50,
    voucher_type: Optional[str] = None,
    status: Optional[str] = None,
    supplier_search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """List travel vouchers."""
    vouchers, total = finance_service.get_vouchers(
        db, skip=skip, limit=limit, voucher_type=voucher_type, status=status, supplier_search=supplier_search
    )
    return {
        "items": [TravelVoucherResponse.from_orm(v) for v in vouchers],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.post("/vouchers", response_model=TravelVoucherResponse)
def create_voucher(
    voucher_in: TravelVoucherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Create a travel voucher."""
    if not voucher_in.issued_by_id:
        voucher_in.issued_by_id = current_user.id
        voucher_in.issued_by_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
    return finance_service.create_voucher(db, voucher_in)


@router.post("/vouchers/from-booking", response_model=TravelVoucherResponse)
def create_voucher_from_booking(
    req_in: TravelVoucherFromBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """1-Click generate travel voucher from booking."""
    try:
        return finance_service.create_voucher_from_booking(
            db,
            booking_id=req_in.booking_id,
            voucher_type=req_in.voucher_type,
            supplier_details=req_in.supplier_details,
            issue_date=req_in.issue_date
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/vouchers/{voucher_id}", response_model=TravelVoucherResponse)
def get_voucher(
    voucher_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Get full details of a specific travel voucher."""
    voucher = finance_service.get_voucher(db, voucher_id)
    if not voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voucher not found")
    return voucher


@router.put("/vouchers/{voucher_id}", response_model=TravelVoucherResponse)
def update_voucher(
    voucher_id: int,
    voucher_update: TravelVoucherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Update voucher or bump version."""
    voucher = finance_service.update_voucher(db, voucher_id, voucher_update)
    if not voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voucher not found")
    return voucher


@router.post("/vouchers/{voucher_id}/send-email")
def send_voucher_email(
    voucher_id: int,
    email_req: SendEmailRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    """Send travel voucher to supplier or client via email."""
    success = finance_service.send_voucher_email(
        db,
        voucher_id=voucher_id,
        recipient_email=email_req.recipient_email,
        recipient_name=email_req.recipient_name,
        subject=email_req.subject
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Voucher not found")
    return {"message": "Voucher email dispatched successfully"}


# ==========================================
# PUBLIC VERIFICATION ENDPOINTS
# ==========================================

@router.get("/verify/voucher/{code}", response_model=PublicVoucherVerificationResponse)
def verify_voucher_code(
    code: str,
    db: Session = Depends(get_db)
) -> Any:
    """Public verification endpoint for QR code scans on travel vouchers."""
    voucher = finance_service.get_voucher_by_code(db, code)
    if not voucher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid voucher verification code")

    lead_traveller = voucher.traveller_details.get("lead_traveller", "Valued Guest")
    pax_count = voucher.traveller_details.get("adults", 1) + voucher.traveller_details.get("children", 0)

    # Summarize service
    service_summary = voucher.service_details.get("property_name") or voucher.service_details.get("package_name") or f"{voucher.voucher_type.title()} Service"
    dates_summary = f"Issued on {voucher.issue_date.strftime('%d %b %Y')}"
    if voucher.service_details.get("check_in_date"):
        dates_summary = f"{voucher.service_details.get('check_in_date')} to {voucher.service_details.get('check_out_date', '')}"

    return PublicVoucherVerificationResponse(
        is_valid=voucher.voucher_status != "cancelled",
        voucher_number=voucher.voucher_number,
        booking_number=f"ABV-BK-{voucher.booking_id:05d}" if voucher.booking_id else None,
        version=voucher.version,
        voucher_status=voucher.voucher_status,
        voucher_type=voucher.voucher_type,
        issue_date=voucher.issue_date,
        supplier_name=voucher.supplier_details.get("supplier_name", "Allbound Partner"),
        lead_traveller=lead_traveller,
        passenger_count=pax_count,
        service_summary=service_summary,
        service_dates=dates_summary,
        verification_timestamp=datetime.utcnow()
    )


@router.get("/verify/receipt/{code}", response_model=PublicReceiptVerificationResponse)
def verify_receipt_code(
    code: str,
    db: Session = Depends(get_db)
) -> Any:
    """Public verification endpoint for QR code scans on payment receipts."""
    receipt = finance_service.get_receipt_by_code(db, code)
    if not receipt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid receipt verification code")

    payer_name = receipt.received_from.get("name") or receipt.received_from.get("company", "Client")
    inv_num = receipt.invoice.invoice_number if receipt.invoice else None

    return PublicReceiptVerificationResponse(
        is_valid=receipt.payment_status != "reversed",
        receipt_number=receipt.receipt_number,
        invoice_number=inv_num,
        booking_number=f"ABV-BK-{receipt.booking_id:05d}" if receipt.booking_id else None,
        receipt_date=receipt.receipt_date,
        amount_received=receipt.amount_received,
        currency=receipt.currency,
        payment_method=receipt.payment_method.replace("_", " ").title(),
        payment_status=receipt.payment_status,
        payer_name=payer_name,
        verification_timestamp=datetime.utcnow()
    )
