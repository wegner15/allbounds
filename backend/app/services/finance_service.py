import math
from datetime import datetime, date
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.models.finance import (
    Currency,
    CompanyFinanceSettings,
    Invoice,
    InvoiceLineItem,
    PaymentReceipt,
    TravelVoucher
)
from app.models.supplier_bill import SupplierBill
from app.models.booking import Booking
from app.schemas.finance import (
    CurrencyCreate,
    CurrencyUpdate,
    CompanyFinanceSettingsUpdate,
    InvoiceCreate,
    InvoiceUpdate,
    InvoiceProfitabilityResponse,
    PaymentReceiptCreate,
    TravelVoucherCreate,
    TravelVoucherUpdate,
    FinanceDashboardStats
)
from app.services.email import email_service
from app.services.supplier_service import supplier_service


# ==========================================
# NUMBER TO WORDS CONVERTER
# ==========================================

_ONES = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
]
_TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
]
_SCALES = ["", "Thousand", "Million", "Billion"]


def _convert_hundreds(n: int) -> str:
    parts = []
    h = n // 100
    r = n % 100
    if h > 0:
        parts.append(f"{_ONES[h]} Hundred")
    if r > 0:
        if r < 20:
            parts.append(_ONES[r])
        else:
            tens = r // 10
            ones = r % 10
            if ones > 0:
                parts.append(f"{_TENS[tens]}-{_ONES[ones]}")
            else:
                parts.append(_TENS[tens])
    return " ".join(parts)


def number_to_words(amount: float, currency_code: str = "USD") -> str:
    """
    Converts numeric amount into plain English words.
    e.g. 3500.0, "USD" -> "Three Thousand Five Hundred US Dollars Only"
         150.25, "EUR" -> "One Hundred Fifty Euros and Twenty-Five Cents Only"
    """
    if amount is None or math.isnan(amount):
        return "Zero"

    currency_units = {
        "USD": ("US Dollar", "US Dollars", "Cent", "Cents"),
        "EUR": ("Euro", "Euros", "Cent", "Cents"),
        "GBP": ("British Pound", "British Pounds", "Penny", "Pence"),
        "UGX": ("Uganda Shilling", "Uganda Shillings", "Cent", "Cents"),
        "KES": ("Kenya Shilling", "Kenya Shillings", "Cent", "Cents"),
    }
    unit_single, unit_plural, frac_single, frac_plural = currency_units.get(
        currency_code.upper(), (currency_code, currency_code, "Cent", "Cents")
    )

    is_negative = amount < 0
    abs_amt = abs(amount)
    integer_part = int(abs_amt)
    decimal_part = int(round((abs_amt - integer_part) * 100))

    if integer_part == 0 and decimal_part == 0:
        return f"Zero {unit_plural} Only"

    words_parts = []
    if is_negative:
        words_parts.append("Negative")

    if integer_part == 0:
        words_parts.append("Zero")
    else:
        chunks = []
        val = integer_part
        while val > 0:
            chunks.append(val % 1000)
            val //= 1000

        chunk_words = []
        for idx, chunk in enumerate(chunks):
            if chunk > 0:
                h_words = _convert_hundreds(chunk)
                scale = _SCALES[idx]
                chunk_words.append(f"{h_words} {scale}".strip())
        chunk_words.reverse()
        words_parts.append(" ".join(chunk_words))

    # Add currency unit
    unit_str = unit_single if integer_part == 1 else unit_plural
    words_parts.append(unit_str)

    # Add decimals
    if decimal_part > 0:
        frac_words = _convert_hundreds(decimal_part)
        frac_str = frac_single if decimal_part == 1 else frac_plural
        words_parts.append(f"and {frac_words} {frac_str}")

    words_parts.append("Only")
    return " ".join(words_parts).strip()


class FinanceService:
    # ==========================================
    # NUMBER GENERATORS
    # ==========================================

    def get_next_invoice_number(self, db: Session) -> str:
        current_year = datetime.utcnow().year
        prefix = f"INV-{current_year}-"
        last_inv = db.query(Invoice).filter(
            Invoice.invoice_number.like(f"{prefix}%")
        ).order_by(Invoice.id.desc()).first()

        if last_inv and last_inv.invoice_number:
            try:
                last_num_str = last_inv.invoice_number.replace(prefix, "")
                next_num = int(last_num_str) + 1
            except ValueError:
                next_num = 1
        else:
            next_num = 1

        return f"{prefix}{next_num:05d}"

    def get_next_receipt_number(self, db: Session) -> str:
        current_year = datetime.utcnow().year
        prefix = f"AVR-{current_year}-"
        last_rec = db.query(PaymentReceipt).filter(
            PaymentReceipt.receipt_number.like(f"{prefix}%")
        ).order_by(PaymentReceipt.id.desc()).first()

        if last_rec and last_rec.receipt_number:
            try:
                last_num_str = last_rec.receipt_number.replace(prefix, "")
                next_num = int(last_num_str) + 1
            except ValueError:
                next_num = 1
        else:
            next_num = 1

        return f"{prefix}{next_num:06d}"

    def get_next_voucher_number(self, db: Session) -> str:
        current_year = datetime.utcnow().year
        prefix = f"VCH-{current_year}-"
        last_vch = db.query(TravelVoucher).filter(
            TravelVoucher.voucher_number.like(f"{prefix}%")
        ).order_by(TravelVoucher.id.desc()).first()

        if last_vch and last_vch.voucher_number:
            try:
                last_num_str = last_vch.voucher_number.replace(prefix, "")
                next_num = int(last_num_str) + 1
            except ValueError:
                next_num = 1
        else:
            next_num = 1

        return f"{prefix}{next_num:05d}"

    # ==========================================
    # CURRENCY MANAGEMENT
    # ==========================================

    def get_currencies(self, db: Session, active_only: bool = True) -> List[Currency]:
        query = db.query(Currency)
        if active_only:
            query = query.filter(Currency.is_active == True)
        return query.order_by(Currency.is_base_currency.desc(), Currency.code.asc()).all()

    def create_currency(self, db: Session, currency_in: CurrencyCreate) -> Currency:
        existing = db.query(Currency).filter(Currency.code == currency_in.code.upper()).first()
        if existing:
            raise ValueError(f"Currency with code {currency_in.code} already exists")

        if currency_in.is_base_currency:
            # Demote existing base currency
            db.query(Currency).update({Currency.is_base_currency: False})

        currency = Currency(
            code=currency_in.code.upper(),
            name=currency_in.name,
            symbol=currency_in.symbol,
            exchange_rate_to_usd=currency_in.exchange_rate_to_usd,
            is_base_currency=currency_in.is_base_currency,
            is_active=currency_in.is_active
        )
        db.add(currency)
        db.commit()
        db.refresh(currency)
        return currency

    def update_currency(self, db: Session, currency_id: int, currency_update: CurrencyUpdate) -> Optional[Currency]:
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if not currency:
            return None

        update_data = currency_update.dict(exclude_unset=True)
        if update_data.get("is_base_currency"):
            # Demote others
            db.query(Currency).filter(Currency.id != currency_id).update({Currency.is_base_currency: False})

        for field, value in update_data.items():
            setattr(currency, field, value)

        db.commit()
        db.refresh(currency)
        return currency

    def delete_currency(self, db: Session, currency_id: int) -> None:
        currency = db.query(Currency).filter(Currency.id == currency_id).first()
        if not currency:
            raise ValueError("Currency not found")
        if currency.is_base_currency:
            raise ValueError("Cannot delete the base currency. Set another currency as base first.")
        db.delete(currency)
        db.commit()

    # ==========================================
    # COMPANY FINANCE SETTINGS
    # ==========================================

    def get_company_settings(self, db: Session) -> CompanyFinanceSettings:
        settings = db.query(CompanyFinanceSettings).first()
        if not settings:
            settings = CompanyFinanceSettings()
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    def update_company_settings(
        self, db: Session, settings_update: CompanyFinanceSettingsUpdate
    ) -> CompanyFinanceSettings:
        settings = self.get_company_settings(db)
        update_data = settings_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
        db.commit()
        db.refresh(settings)
        return settings

    # ==========================================
    # INVOICE MANAGEMENT
    # ==========================================

    def create_invoice(self, db: Session, invoice_in: InvoiceCreate) -> Invoice:
        invoice_number = invoice_in.invoice_number or self.get_next_invoice_number(db)

        # Snapshot active payment methods if not explicitly provided
        payment_methods = invoice_in.payment_methods_snapshot
        if not payment_methods:
            company_settings = self.get_company_settings(db)
            payment_methods = {
                "bank_accounts": company_settings.bank_accounts or [],
                "mobile_money_accounts": company_settings.mobile_money_accounts or [],
                "card_payment_info": company_settings.card_payment_info or ""
            }

        # Calculate line items if provided
        line_items_data = invoice_in.line_items
        computed_subtotal = 0.0
        for item in line_items_data:
            item_total = (item.quantity * item.unit_price) - item.discount + item.tax_amount
            item.total_amount = max(0.0, item_total)
            computed_subtotal += (item.quantity * item.unit_price)

        subtotal = invoice_in.subtotal if invoice_in.subtotal > 0 else computed_subtotal
        taxable_amount = max(0.0, subtotal - invoice_in.discount_amount - invoice_in.promotional_discount)
        total_amount = (
            taxable_amount
            + invoice_in.vat_amount
            + invoice_in.other_taxes_amount
            + invoice_in.service_fee
            + invoice_in.booking_fee
            + invoice_in.payment_processing_fee
        )
        balance_due = max(0.0, total_amount - invoice_in.credit_applied)

        db_invoice = Invoice(
            invoice_number=invoice_number,
            booking_id=invoice_in.booking_id,
            client_id=invoice_in.client_id,
            quote_number=invoice_in.quote_number,
            invoice_status=invoice_in.invoice_status,
            invoice_date=invoice_in.invoice_date,
            booking_date=invoice_in.booking_date,
            due_date=invoice_in.due_date,
            currency=invoice_in.currency,
            exchange_rate_to_usd=invoice_in.exchange_rate_to_usd,
            consultant_id=invoice_in.consultant_id,
            consultant_name=invoice_in.consultant_name,
            payment_terms=invoice_in.payment_terms,
            client_type=invoice_in.client_type,
            client_details=invoice_in.client_details,
            trip_summary=invoice_in.trip_summary,
            subtotal=subtotal,
            discount_amount=invoice_in.discount_amount,
            promotional_discount=invoice_in.promotional_discount,
            taxable_amount=taxable_amount,
            vat_amount=invoice_in.vat_amount,
            other_taxes_amount=invoice_in.other_taxes_amount,
            service_fee=invoice_in.service_fee,
            booking_fee=invoice_in.booking_fee,
            payment_processing_fee=invoice_in.payment_processing_fee,
            total_amount=total_amount,
            amount_paid=0.0,
            credit_applied=invoice_in.credit_applied,
            balance_due=balance_due,
            payment_methods_snapshot=payment_methods,
            notes=invoice_in.notes,
            terms_and_conditions=invoice_in.terms_and_conditions,
        )
        db.add(db_invoice)
        db.flush()

        for idx, item_data in enumerate(line_items_data):
            db_item = InvoiceLineItem(
                invoice_id=db_invoice.id,
                category=item_data.category,
                title=item_data.title,
                description=item_data.description,
                travel_date=item_data.travel_date,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                discount=item_data.discount,
                tax_rate=item_data.tax_rate,
                tax_amount=item_data.tax_amount,
                total_amount=item_data.total_amount,
                cost_price=getattr(item_data, "cost_price", 0.0),
                supplier_id=getattr(item_data, "supplier_id", None),
                metadata_json=item_data.metadata_json or {},
                sort_order=idx
            )
            db.add(db_item)

        db.commit()
        db.refresh(db_invoice)
        return db_invoice

    def create_invoice_from_booking(
        self,
        db: Session,
        booking_id: int,
        due_date: Optional[date] = None,
        currency: str = "USD",
        payment_terms: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Invoice:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise ValueError(f"Booking #{booking_id} not found")

        company_settings = self.get_company_settings(db)
        inv_date = date.today()
        inv_due_date = due_date or inv_date

        client_details = {
            "full_name": booking.contact_name,
            "email": booking.contact_email,
            "telephone": booking.contact_phone,
            "country": booking.country_of_origin,
            "address": "",
            "company_name": "",
            "contact_person": "",
            "tin_vat": "",
            "purchase_order_number": ""
        }

        package_name = booking.entity_slug.replace("-", " ").title()
        trip_summary = {
            "lead_traveller": booking.contact_name,
            "destinations": "",
            "travel_type": "Safari" if booking.booking_type == "package" else "Group Tour",
            "travel_start_date": None,
            "travel_end_date": None,
            "adults": booking.number_of_adults,
            "children": booking.number_of_children,
            "infants": 0,
            "duration_days": booking.number_of_nights + 1 if booking.number_of_nights else None,
            "duration_nights": booking.number_of_nights,
            "accommodation_category": booking.selected_room_type or "Standard",
            "meal_plan": booking.selected_meal_plan or "Full Board",
            "transportation_type": "Safari Land Cruiser / 4x4",
            "tour_package_name": package_name
        }

        total_price = booking.calculated_total_price or 0.0

        # Build initial line items
        line_items = []
        line_items.append(
            InvoiceLineItem(
                category="accommodation" if booking.selected_hotel_name else "other",
                title=f"{package_name} Package Booking",
                description=f"Travel arrangements for {booking.number_of_adults} adults, {booking.number_of_children} children. Hotel: {booking.selected_hotel_name or 'Selected Hotel'}",
                quantity=1.0,
                unit_price=total_price,
                discount=0.0,
                tax_rate=0.0,
                tax_amount=0.0,
                total_amount=total_price,
                metadata_json={
                    "hotel_name": booking.selected_hotel_name,
                    "room_type": booking.selected_room_type,
                    "meal_plan": booking.selected_meal_plan,
                    "nights": booking.number_of_nights
                },
                sort_order=0
            )
        )

        invoice_number = self.get_next_invoice_number(db)
        invoice = Invoice(
            invoice_number=invoice_number,
            booking_id=booking.id,
            invoice_status="issued",
            invoice_date=inv_date,
            booking_date=booking.created_at.date() if booking.created_at else inv_date,
            due_date=inv_due_date,
            currency=currency,
            exchange_rate_to_usd=1.0,
            payment_terms=payment_terms or company_settings.default_invoice_terms or "Due upon receipt",
            client_type="individual",
            client_details=client_details,
            trip_summary=trip_summary,
            subtotal=total_price,
            discount_amount=0.0,
            promotional_discount=0.0,
            taxable_amount=total_price,
            vat_amount=0.0,
            other_taxes_amount=0.0,
            service_fee=0.0,
            booking_fee=0.0,
            payment_processing_fee=0.0,
            total_amount=total_price,
            amount_paid=0.0,
            credit_applied=0.0,
            balance_due=total_price,
            payment_methods_snapshot={
                "bank_accounts": company_settings.bank_accounts or [],
                "mobile_money_accounts": company_settings.mobile_money_accounts or [],
                "card_payment_info": company_settings.card_payment_info or ""
            },
            notes=notes or company_settings.default_invoice_notes,
            terms_and_conditions=company_settings.default_invoice_terms,
            line_items=line_items
        )

        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        return invoice

    def get_invoices(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        client_search: Optional[str] = None,
        currency: Optional[str] = None
    ) -> Tuple[List[Invoice], int]:
        query = db.query(Invoice)

        if status and status != "all":
            query = query.filter(Invoice.invoice_status == status)

        if currency:
            query = query.filter(Invoice.currency == currency.upper())

        if client_search:
            pattern = f"%{client_search}%"
            query = query.filter(
                or_(
                    Invoice.invoice_number.ilike(pattern),
                    Invoice.quote_number.ilike(pattern),
                    Invoice.client_details["full_name"].astext.ilike(pattern),
                    Invoice.client_details["email"].astext.ilike(pattern),
                    Invoice.client_details["company_name"].astext.ilike(pattern),
                )
            )

        total = query.count()
        invoices = query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit).all()
        return invoices, total

    def get_invoice(self, db: Session, invoice_id: int) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.id == invoice_id).first()

    def get_invoice_by_token(self, db: Session, token: str) -> Optional[Invoice]:
        return db.query(Invoice).filter(Invoice.verification_token == token).first()

    def update_invoice(self, db: Session, invoice_id: int, invoice_update: InvoiceUpdate) -> Optional[Invoice]:
        invoice = self.get_invoice(db, invoice_id)
        if not invoice:
            return None

        update_data = invoice_update.dict(exclude_unset=True)

        # Handle line items replacement if provided
        if "line_items" in update_data:
            new_items = update_data.pop("line_items")
            db.query(InvoiceLineItem).filter(InvoiceLineItem.invoice_id == invoice.id).delete()
            computed_subtotal = 0.0
            for idx, item in enumerate(new_items):
                item_total = (item["quantity"] * item["unit_price"]) - item["discount"] + item["tax_amount"]
                total_amt = max(0.0, item_total)
                db_item = InvoiceLineItem(
                    invoice_id=invoice.id,
                    category=item.get("category", "other"),
                    title=item["title"],
                    description=item.get("description"),
                    travel_date=item.get("travel_date"),
                    quantity=item["quantity"],
                    unit_price=item["unit_price"],
                    discount=item.get("discount", 0.0),
                    tax_rate=item.get("tax_rate", 0.0),
                    tax_amount=item.get("tax_amount", 0.0),
                    total_amount=total_amt,
                    cost_price=item.get("cost_price", 0.0) or 0.0,
                    supplier_id=item.get("supplier_id"),
                    metadata_json=item.get("metadata_json") or {},
                    sort_order=idx
                )
                db.add(db_item)
                computed_subtotal += (item["quantity"] * item["unit_price"])

            if "subtotal" not in update_data:
                update_data["subtotal"] = computed_subtotal

        for field, value in update_data.items():
            setattr(invoice, field, value)

        # Recalculate totals
        taxable = max(0.0, invoice.subtotal - invoice.discount_amount - invoice.promotional_discount)
        invoice.taxable_amount = taxable
        invoice.total_amount = (
            taxable
            + invoice.vat_amount
            + invoice.other_taxes_amount
            + invoice.service_fee
            + invoice.booking_fee
            + invoice.payment_processing_fee
        )
        invoice.balance_due = max(0.0, invoice.total_amount - invoice.amount_paid - invoice.credit_applied)

        # Update status if balance is 0 and was issued/partially_paid
        if invoice.balance_due <= 0.01 and invoice.amount_paid > 0 and invoice.invoice_status != "cancelled":
            invoice.invoice_status = "paid"

        db.commit()
        db.refresh(invoice)
        return invoice

    def delete_invoice(self, db: Session, invoice_id: int) -> bool:
        invoice = self.get_invoice(db, invoice_id)
        if not invoice:
            return False
        db.delete(invoice)
        db.commit()
        return True

    def get_invoice_profitability(self, db: Session, invoice_id: int) -> Optional[InvoiceProfitabilityResponse]:
        invoice = self.get_invoice(db, invoice_id)
        if not invoice:
            return None

        inv_rate = invoice.exchange_rate_to_usd if invoice.exchange_rate_to_usd and invoice.exchange_rate_to_usd > 0 else 1.0
        revenue = invoice.total_amount
        revenue_usd = revenue / inv_rate

        # Get linked supplier bills
        bills = (
            db.query(SupplierBill)
            .filter(
                SupplierBill.invoice_id == invoice.id,
                SupplierBill.status != "cancelled"
            )
            .order_by(SupplierBill.bill_date.desc())
            .all()
        )

        total_expenses_usd = 0.0
        if bills:
            for b in bills:
                b_rate = b.exchange_rate_to_usd if b.exchange_rate_to_usd and b.exchange_rate_to_usd > 0 else 1.0
                total_expenses_usd += (b.amount_billed / b_rate)
        else:
            # Fallback to line item cost prices if no bills yet
            for li in invoice.line_items:
                cost = getattr(li, "cost_price", 0.0) or 0.0
                qty = getattr(li, "quantity", 1.0) or 1.0
                total_expenses_usd += (cost * qty) / inv_rate

        total_expenses = total_expenses_usd * inv_rate
        gross_profit_usd = revenue_usd - total_expenses_usd
        gross_profit = revenue - total_expenses
        margin_percent = (gross_profit_usd / revenue_usd * 100) if revenue_usd > 0 else 0.0

        bill_responses = [supplier_service._build_bill_response(b) for b in bills]

        return InvoiceProfitabilityResponse(
            invoice_id=invoice.id,
            invoice_number=invoice.invoice_number,
            currency=invoice.currency,
            exchange_rate_to_usd=inv_rate,
            total_revenue=round(revenue, 2),
            total_revenue_usd=round(revenue_usd, 2),
            total_expenses=round(total_expenses, 2),
            total_expenses_usd=round(total_expenses_usd, 2),
            gross_profit=round(gross_profit, 2),
            gross_profit_usd=round(gross_profit_usd, 2),
            gross_margin_percent=round(margin_percent, 1),
            bills_count=len(bills),
            supplier_bills=bill_responses,
        )

    # ==========================================
    # PAYMENT RECEIPTS MANAGEMENT
    # ==========================================

    def create_receipt(self, db: Session, receipt_in: PaymentReceiptCreate) -> PaymentReceipt:
        invoice = self.get_invoice(db, receipt_in.invoice_id)
        if not invoice:
            raise ValueError(f"Invoice #{receipt_in.invoice_id} not found")

        receipt_number = receipt_in.receipt_number or self.get_next_receipt_number(db)
        amount_received = receipt_in.amount_received
        currency = receipt_in.currency or invoice.currency
        amount_words = receipt_in.amount_in_words or number_to_words(amount_received, currency)

        # Build payment allocation
        prev_paid = invoice.amount_paid
        invoice_total = invoice.total_amount
        new_paid = prev_paid + amount_received
        remaining_balance = max(0.0, invoice_total - new_paid - invoice.credit_applied)

        package_name = invoice.trip_summary.get("tour_package_name", "Travel Booking")
        allocation = {
            "description": f"{package_name} — Invoice #{invoice.invoice_number}",
            "invoice_amount": invoice_total,
            "previously_paid": prev_paid,
            "this_payment": amount_received,
            "balance": remaining_balance,
            "total_paid": new_paid
        }

        # Auto-fill received_from if empty
        received_from = receipt_in.received_from
        if not received_from:
            client = invoice.client_details
            received_from = {
                "name": client.get("full_name") or client.get("contact_person", ""),
                "company": client.get("company_name", ""),
                "email": client.get("email", ""),
                "phone": client.get("telephone", ""),
                "country": client.get("country", "")
            }

        db_receipt = PaymentReceipt(
            receipt_number=receipt_number,
            invoice_id=invoice.id,
            booking_id=invoice.booking_id,
            client_id=getattr(receipt_in, "client_id", None) or invoice.client_id,
            payment_reference=receipt_in.payment_reference,
            receipt_date=receipt_in.receipt_date,
            payment_date=receipt_in.payment_date,
            amount_received=amount_received,
            amount_in_words=amount_words,
            currency=currency,
            exchange_rate_to_usd=receipt_in.exchange_rate_to_usd,
            payment_method=receipt_in.payment_method,
            payment_provider=receipt_in.payment_provider,
            payment_status=receipt_in.payment_status,
            received_from=received_from,
            payment_allocation=allocation,
            notes=receipt_in.notes
        )
        db.add(db_receipt)

        # Update invoice balance and status
        invoice.amount_paid = new_paid
        invoice.balance_due = remaining_balance
        if remaining_balance <= 0.01:
            invoice.invoice_status = "paid"
        else:
            invoice.invoice_status = "partially_paid"

        db.commit()
        db.refresh(db_receipt)
        return db_receipt

    def get_receipts(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        invoice_id: Optional[int] = None
    ) -> Tuple[List[PaymentReceipt], int]:
        query = db.query(PaymentReceipt)
        if invoice_id:
            query = query.filter(PaymentReceipt.invoice_id == invoice_id)

        total = query.count()
        receipts = query.order_by(PaymentReceipt.created_at.desc()).offset(skip).limit(limit).all()
        return receipts, total

    def get_receipt(self, db: Session, receipt_id: int) -> Optional[PaymentReceipt]:
        return db.query(PaymentReceipt).filter(PaymentReceipt.id == receipt_id).first()

    def get_receipt_by_code(self, db: Session, code: str) -> Optional[PaymentReceipt]:
        return db.query(PaymentReceipt).filter(
            or_(
                PaymentReceipt.verification_code == code,
                PaymentReceipt.receipt_number == code
            )
        ).first()

    # ==========================================
    # TRAVEL VOUCHERS MANAGEMENT
    # ==========================================

    def create_voucher(self, db: Session, voucher_in: TravelVoucherCreate) -> TravelVoucher:
        voucher_number = voucher_in.voucher_number or self.get_next_voucher_number(db)
        company_settings = self.get_company_settings(db)

        emergency_contacts = voucher_in.emergency_contacts or {
            "office_phone": company_settings.phone,
            "whatsapp": company_settings.whatsapp,
            "emergency_24h": company_settings.phone,
            "email": company_settings.email
        }

        db_voucher = TravelVoucher(
            voucher_number=voucher_number,
            booking_id=voucher_in.booking_id,
            invoice_id=voucher_in.invoice_id,
            confirmation_number=voucher_in.confirmation_number,
            version=voucher_in.version or 1,
            voucher_status=voucher_in.voucher_status,
            voucher_type=voucher_in.voucher_type,
            issue_date=voucher_in.issue_date,
            issued_by_id=voucher_in.issued_by_id,
            issued_by_name=voucher_in.issued_by_name,
            supplier_details=voucher_in.supplier_details,
            traveller_details=voucher_in.traveller_details,
            service_details=voucher_in.service_details,
            supplier_instructions=voucher_in.supplier_instructions or company_settings.default_voucher_supplier_instructions,
            client_instructions=voucher_in.client_instructions or company_settings.default_voucher_client_instructions,
            inclusions=voucher_in.inclusions or [],
            exclusions=voucher_in.exclusions or [],
            special_requests=voucher_in.special_requests or [],
            emergency_contacts=emergency_contacts,
            voucher_terms=voucher_in.voucher_terms or company_settings.default_voucher_terms,
        )
        db.add(db_voucher)
        db.commit()
        db.refresh(db_voucher)
        return db_voucher

    def create_voucher_from_booking(
        self,
        db: Session,
        booking_id: int,
        voucher_type: str = "general",
        supplier_details: Optional[Dict[str, Any]] = None,
        issue_date: Optional[date] = None
    ) -> TravelVoucher:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise ValueError(f"Booking #{booking_id} not found")

        company_settings = self.get_company_settings(db)
        iss_date = issue_date or date.today()

        # Travellers info
        travellers_list = [t.full_name for t in booking.travelers] if booking.travelers else [booking.contact_name]
        traveller_details = {
            "lead_traveller": booking.contact_name,
            "travellers_list": travellers_list,
            "adults": booking.number_of_adults,
            "children": booking.number_of_children,
            "children_ages": [t.age for t in booking.travelers if t.traveler_type == "child" and t.age],
            "infants": 0,
            "country_of_origin": booking.country_of_origin
        }

        # Service details tailored by type
        service_details: Dict[str, Any] = {}
        supplier: Dict[str, Any] = supplier_details or {}

        if voucher_type == "accommodation":
            supplier_name = booking.selected_hotel_name or supplier.get("supplier_name", "Partner Hotel")
            supplier = {
                "supplier_name": supplier_name,
                "hotel_name": supplier_name,
                "contact_person": supplier.get("contact_person", "Reservations Manager"),
                "reservation_email": supplier.get("reservation_email", ""),
                "telephone": supplier.get("telephone", ""),
                "address": supplier.get("address", ""),
                "supplier_confirmation_number": supplier.get("supplier_confirmation_number", f"HTL-{booking.id:04d}")
            }
            service_details = {
                "property_name": supplier_name,
                "check_in_date": None,
                "check_out_date": None,
                "number_of_nights": booking.number_of_nights or 1,
                "number_of_rooms": 1,
                "room_type": booking.selected_room_type or "Standard Room",
                "meal_plan": booking.selected_meal_plan or "Full Board",
                "board_basis": booking.selected_meal_plan or "Full Board",
                "special_requests": booking.special_requests or ""
            }
        else:
            supplier = {
                "supplier_name": supplier.get("supplier_name", "Allbound Ground Operations"),
                "company_name": supplier.get("company_name", "Allbound Travel Services Limited"),
                "contact_person": supplier.get("contact_person", "Ground Handler"),
                "reservation_email": supplier.get("reservation_email", company_settings.email),
                "telephone": supplier.get("telephone", company_settings.phone),
                "supplier_confirmation_number": f"OPS-{booking.id:04d}"
            }
            service_details = {
                "package_name": booking.entity_slug.replace("-", " ").title(),
                "duration_nights": booking.number_of_nights,
                "special_requests": booking.special_requests or ""
            }

        special_requests_list = []
        if booking.special_requests:
            special_requests_list.append({
                "request": booking.special_requests,
                "status": "requested"
            })

        voucher_number = self.get_next_voucher_number(db)
        db_voucher = TravelVoucher(
            voucher_number=voucher_number,
            booking_id=booking.id,
            version=1,
            voucher_status="confirmed",
            voucher_type=voucher_type,
            issue_date=iss_date,
            supplier_details=supplier,
            traveller_details=traveller_details,
            service_details=service_details,
            supplier_instructions=company_settings.default_voucher_supplier_instructions,
            client_instructions=company_settings.default_voucher_client_instructions,
            inclusions=["Accommodation as specified", "Meals as specified", "Ground transport and transfers", "Park entry fees"],
            exclusions=["Personal expenses & tips", "Alcoholic beverages", "Travel insurance", "Visa fees"],
            special_requests=special_requests_list,
            emergency_contacts={
                "office_phone": company_settings.phone,
                "whatsapp": company_settings.whatsapp,
                "emergency_24h": company_settings.phone,
                "email": company_settings.email
            },
            voucher_terms=company_settings.default_voucher_terms
        )
        db.add(db_voucher)
        db.commit()
        db.refresh(db_voucher)
        return db_voucher

    def update_voucher(
        self, db: Session, voucher_id: int, voucher_update: TravelVoucherUpdate
    ) -> Optional[TravelVoucher]:
        voucher = self.get_voucher(db, voucher_id)
        if not voucher:
            return None

        update_data = voucher_update.dict(exclude_unset=True)
        bump_version = update_data.pop("bump_version", False)

        if bump_version:
            voucher.version += 1
            if voucher.voucher_status != "cancelled":
                voucher.voucher_status = "amended"

        for field, value in update_data.items():
            setattr(voucher, field, value)

        db.commit()
        db.refresh(voucher)
        return voucher

    def get_vouchers(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        voucher_type: Optional[str] = None,
        status: Optional[str] = None,
        supplier_search: Optional[str] = None
    ) -> Tuple[List[TravelVoucher], int]:
        query = db.query(TravelVoucher)

        if voucher_type and voucher_type != "all":
            query = query.filter(TravelVoucher.voucher_type == voucher_type)

        if status and status != "all":
            query = query.filter(TravelVoucher.voucher_status == status)

        if supplier_search:
            pattern = f"%{supplier_search}%"
            query = query.filter(
                or_(
                    TravelVoucher.voucher_number.ilike(pattern),
                    TravelVoucher.supplier_details["supplier_name"].astext.ilike(pattern),
                    TravelVoucher.traveller_details["lead_traveller"].astext.ilike(pattern),
                )
            )

        total = query.count()
        vouchers = query.order_by(TravelVoucher.created_at.desc()).offset(skip).limit(limit).all()
        return vouchers, total

    def get_voucher(self, db: Session, voucher_id: int) -> Optional[TravelVoucher]:
        return db.query(TravelVoucher).filter(TravelVoucher.id == voucher_id).first()

    def get_voucher_by_code(self, db: Session, code: str) -> Optional[TravelVoucher]:
        return db.query(TravelVoucher).filter(
            or_(
                TravelVoucher.verification_code == code,
                TravelVoucher.voucher_number == code
            )
        ).first()

    # ==========================================
    # DASHBOARD STATS
    # ==========================================

    def get_finance_dashboard_stats(self, db: Session) -> FinanceDashboardStats:
        invoices = db.query(Invoice).all()

        total_invoiced_usd = 0.0
        total_collected_usd = 0.0
        total_outstanding_usd = 0.0
        overdue_count = 0
        status_counts = {
            "draft": 0,
            "issued": 0,
            "partially_paid": 0,
            "paid": 0,
            "overdue": 0,
            "cancelled": 0
        }

        today = date.today()
        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            # Normalize to USD for dashboard aggregate stats
            usd_total = inv.total_amount / rate
            usd_paid = inv.amount_paid / rate
            usd_balance = inv.balance_due / rate

            if inv.invoice_status != "cancelled":
                total_invoiced_usd += usd_total
                total_collected_usd += usd_paid
                total_outstanding_usd += usd_balance

            status_key = inv.invoice_status.lower()
            if status_key in status_counts:
                status_counts[status_key] += 1
            else:
                status_counts[status_key] = 1

            if inv.invoice_status not in ["paid", "cancelled"] and inv.due_date < today:
                overdue_count += 1

        pending_vouchers = db.query(TravelVoucher).filter(
            TravelVoucher.voucher_status.in_(["pending", "amended"])
        ).count()

        recent_receipts = db.query(PaymentReceipt).order_by(PaymentReceipt.created_at.desc()).limit(5).all()
        recent_invoices = db.query(Invoice).order_by(Invoice.created_at.desc()).limit(5).all()

        return FinanceDashboardStats(
            total_invoiced_usd=round(total_invoiced_usd, 2),
            total_collected_usd=round(total_collected_usd, 2),
            total_outstanding_usd=round(total_outstanding_usd, 2),
            overdue_invoices_count=overdue_count,
            pending_vouchers_count=pending_vouchers,
            invoices_by_status=status_counts,
            recent_receipts=recent_receipts,
            recent_invoices=recent_invoices
        )

    # ==========================================
    # EMAIL DISPATCH
    # ==========================================

    def send_invoice_email(
        self,
        db: Session,
        invoice_id: int,
        recipient_email: str,
        recipient_name: Optional[str] = None,
        subject: Optional[str] = None,
        custom_message: Optional[str] = None
    ) -> bool:
        invoice = self.get_invoice(db, invoice_id)
        if not invoice:
            return False

        name = recipient_name or invoice.client_details.get("full_name", "Valued Client")
        email_subject = subject or f"Invoice {invoice.invoice_number} from Allbound Vacations"

        html_body = f"""
        <p>Dear {name},</p>
        <p>{custom_message or 'Please find below the summary of your invoice for your upcoming travel with Allbound Vacations.'}</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
            <p><strong>Due Date:</strong> {invoice.due_date.strftime('%d %b %Y')}</p>
            <p><strong>Total Amount:</strong> {invoice.currency} {invoice.total_amount:,.2f}</p>
            <p><strong>Amount Paid:</strong> {invoice.currency} {invoice.amount_paid:,.2f}</p>
            <p style="font-size: 18px; color: #008080;"><strong>Balance Due: {invoice.currency} {invoice.balance_due:,.2f}</strong></p>
        </div>
        <p>Thank you for choosing Allbound Vacations.</p>
        """

        cta = {
            "url": f"https://allboundvacations.com/verify/invoice/{invoice.verification_token}",
            "text": "View Official Invoice Online"
        }
        content = email_service.generate_html_email(
            title=f"Invoice #{invoice.invoice_number}",
            content_html=html_body,
            call_to_action=cta
        )
        email_service.send_email(recipient_email, email_subject, content)
        return True

    def send_receipt_email(
        self,
        db: Session,
        receipt_id: int,
        recipient_email: str,
        recipient_name: Optional[str] = None,
        subject: Optional[str] = None
    ) -> bool:
        receipt = self.get_receipt(db, receipt_id)
        if not receipt:
            return False

        name = recipient_name or receipt.received_from.get("name", "Valued Client")
        email_subject = subject or f"Payment Receipt {receipt.receipt_number} — Allbound Vacations"

        html_body = f"""
        <p>Dear {name},</p>
        <p>Thank you for your payment. We confirm receipt of the following funds:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Receipt Number:</strong> {receipt.receipt_number}</p>
            <p><strong>Payment Reference:</strong> {receipt.payment_reference}</p>
            <p><strong>Payment Method:</strong> {receipt.payment_method.replace('_', ' ').title()}</p>
            <p><strong>Payment Date:</strong> {receipt.payment_date.strftime('%d %b %Y %H:%M')}</p>
            <p style="font-size: 18px; color: #008080;"><strong>Amount Received: {receipt.currency} {receipt.amount_received:,.2f}</strong></p>
            <p><em>({receipt.amount_in_words})</em></p>
        </div>
        <p>Payment received with thanks. Allocated to referenced booking/invoice.</p>
        """

        cta = {
            "url": f"https://allboundvacations.com/verify/receipt/{receipt.verification_code}",
            "text": "Verify Official Receipt Online"
        }
        content = email_service.generate_html_email(
            title=f"Payment Receipt #{receipt.receipt_number}",
            content_html=html_body,
            call_to_action=cta
        )
        email_service.send_email(recipient_email, email_subject, content)
        return True

    def send_voucher_email(
        self,
        db: Session,
        voucher_id: int,
        recipient_email: str,
        recipient_name: Optional[str] = None,
        subject: Optional[str] = None
    ) -> bool:
        voucher = self.get_voucher(db, voucher_id)
        if not voucher:
            return False

        name = recipient_name or voucher.supplier_details.get("supplier_name", "Service Provider")
        email_subject = subject or f"Travel Voucher {voucher.voucher_number} — Allbound Vacations"

        lead_pax = voucher.traveller_details.get("lead_traveller", "Guests")
        pax_count = voucher.traveller_details.get("adults", 1) + voucher.traveller_details.get("children", 0)

        html_body = f"""
        <p>Dear {name},</p>
        <p>Please find the official service voucher for the following reservation:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p><strong>Voucher Number:</strong> {voucher.voucher_number} (Version {voucher.version:02d})</p>
            <p><strong>Status:</strong> {voucher.voucher_status.upper()}</p>
            <p><strong>Lead Guest:</strong> {lead_pax} ({pax_count} Travellers)</p>
            <p><strong>Service Type:</strong> {voucher.voucher_type.title()}</p>
            <p><strong>Issue Date:</strong> {voucher.issue_date.strftime('%d %b %Y')}</p>
        </div>
        <p>Please render the requested services to the named guests as agreed.</p>
        """

        cta = {
            "url": f"https://allboundvacations.com/verify/voucher/{voucher.verification_code}",
            "text": "Verify Travel Voucher Online"
        }
        content = email_service.generate_html_email(
            title=f"Travel Voucher #{voucher.voucher_number}",
            content_html=html_body,
            call_to_action=cta
        )
        email_service.send_email(recipient_email, email_subject, content)
        return True


finance_service = FinanceService()
