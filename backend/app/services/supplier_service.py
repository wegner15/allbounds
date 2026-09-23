from datetime import date, datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from app.models.supplier import Supplier
from app.models.supplier_bill import SupplierBill
from app.models.supplier_payment import SupplierPayment
from app.schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
    SupplierLedgerResponse,
    SupplierLedgerTransaction,
)
from app.schemas.supplier_bill import (
    SupplierBillCreate,
    SupplierBillUpdate,
    SupplierBillResponse,
    SupplierPaymentCreate,
    SupplierPaymentResponse,
)


class SupplierService:
    # ==========================================
    # NUMBER GENERATORS
    # ==========================================
    def get_next_bill_number(self, db: Session) -> str:
        current_year = date.today().year
        prefix = f"BIL-{current_year}-"
        last_bill = (
            db.query(SupplierBill)
            .filter(SupplierBill.bill_number.like(f"{prefix}%"))
            .order_by(desc(SupplierBill.id))
            .first()
        )
        if last_bill and last_bill.bill_number.startswith(prefix):
            try:
                seq = int(last_bill.bill_number.split("-")[-1]) + 1
            except ValueError:
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    def get_next_payment_number(self, db: Session) -> str:
        current_year = date.today().year
        prefix = f"DISB-{current_year}-"
        last_pmt = (
            db.query(SupplierPayment)
            .filter(SupplierPayment.payment_number.like(f"{prefix}%"))
            .order_by(desc(SupplierPayment.id))
            .first()
        )
        if last_pmt and last_pmt.payment_number.startswith(prefix):
            try:
                seq = int(last_pmt.payment_number.split("-")[-1]) + 1
            except ValueError:
                seq = 1
        else:
            seq = 1
        return f"{prefix}{seq:04d}"

    # ==========================================
    # SUPPLIERS CRUD
    # ==========================================
    def get_suppliers(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        category: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[SupplierResponse], int]:
        query = db.query(Supplier)

        if is_active is not None:
            query = query.filter(Supplier.is_active == is_active)

        if category:
            query = query.filter(Supplier.category == category)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Supplier.name.ilike(s),
                    Supplier.supplier_code.ilike(s),
                    Supplier.contact_person.ilike(s),
                    Supplier.email.ilike(s),
                    Supplier.phone.ilike(s),
                )
            )

        total = query.count()
        suppliers = query.order_by(Supplier.name.asc()).offset(skip).limit(limit).all()

        results: List[SupplierResponse] = []
        for sup in suppliers:
            resp = self._build_supplier_response(db, sup)
            results.append(resp)

        return results, total

    def get_supplier(self, db: Session, supplier_id: int) -> Optional[SupplierResponse]:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return None
        return self._build_supplier_response(db, supplier)

    def create_supplier(self, db: Session, supplier_in: SupplierCreate) -> SupplierResponse:
        data = supplier_in.dict()
        if not data.get("supplier_code"):
            # Auto-generate code
            initials = "".join([w[0] for w in data["name"].split()[:2]]).upper() or "SUP"
            count = db.query(Supplier).count() + 1
            data["supplier_code"] = f"SUP-{initials}-{count:03d}"

        supplier = Supplier(**data)
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
        return self._build_supplier_response(db, supplier)

    def update_supplier(
        self, db: Session, supplier_id: int, supplier_update: SupplierUpdate
    ) -> Optional[SupplierResponse]:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return None

        update_data = supplier_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(supplier, key, value)

        db.commit()
        db.refresh(supplier)
        return self._build_supplier_response(db, supplier)

    def delete_supplier(self, db: Session, supplier_id: int) -> bool:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return False

        has_bills = db.query(SupplierBill).filter(SupplierBill.supplier_id == supplier_id).count() > 0
        if has_bills:
            supplier.is_active = False
            db.commit()
        else:
            db.delete(supplier)
            db.commit()
        return True

    # ==========================================
    # SUPPLIER BILLS (PAYABLES)
    # ==========================================
    def create_bill(self, db: Session, bill_in: SupplierBillCreate) -> SupplierBillResponse:
        bill_data = bill_in.dict()
        bill_number = self.get_next_bill_number(db)

        bill = SupplierBill(
            bill_number=bill_number,
            supplier_id=bill_data["supplier_id"],
            booking_id=bill_data.get("booking_id"),
            invoice_id=bill_data.get("invoice_id"),
            supplier_reference=bill_data.get("supplier_reference"),
            bill_date=bill_data["bill_date"],
            due_date=bill_data["due_date"],
            service_date=bill_data.get("service_date"),
            currency=bill_data.get("currency", "USD"),
            exchange_rate_to_usd=bill_data.get("exchange_rate_to_usd", 1.0),
            amount_billed=bill_data["amount_billed"],
            amount_paid=0.0,
            balance_payable=bill_data["amount_billed"],
            status="pending",
            category=bill_data.get("category", "accommodation"),
            description=bill_data.get("description"),
            notes=bill_data.get("notes"),
            attachment_url=bill_data.get("attachment_url"),
        )
        db.add(bill)
        db.commit()
        db.refresh(bill)
        return self._build_bill_response(bill)

    def get_bills(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        supplier_id: Optional[int] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[SupplierBillResponse], int]:
        query = db.query(SupplierBill)

        if supplier_id:
            query = query.filter(SupplierBill.supplier_id == supplier_id)

        if status:
            query = query.filter(SupplierBill.status == status)

        if search:
            s = f"%{search.strip()}%"
            query = query.join(Supplier).filter(
                or_(
                    SupplierBill.bill_number.ilike(s),
                    SupplierBill.supplier_reference.ilike(s),
                    Supplier.name.ilike(s),
                    SupplierBill.description.ilike(s),
                )
            )

        total = query.count()
        bills = query.order_by(SupplierBill.bill_date.desc()).offset(skip).limit(limit).all()

        return [self._build_bill_response(b) for b in bills], total

    def get_bill(self, db: Session, bill_id: int) -> Optional[SupplierBillResponse]:
        bill = db.query(SupplierBill).filter(SupplierBill.id == bill_id).first()
        if not bill:
            return None
        return self._build_bill_response(bill)

    def update_bill(
        self, db: Session, bill_id: int, bill_update: SupplierBillUpdate
    ) -> Optional[SupplierBillResponse]:
        bill = db.query(SupplierBill).filter(SupplierBill.id == bill_id).first()
        if not bill:
            return None

        update_data = bill_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(bill, key, value)

        # Recalculate balance
        bill.balance_payable = max(0.0, bill.amount_billed - bill.amount_paid)
        if bill.balance_payable == 0.0:
            bill.status = "paid"
        elif bill.amount_paid > 0:
            bill.status = "partially_paid"
        elif bill.due_date < date.today() and bill.status != "cancelled":
            bill.status = "overdue"

        db.commit()
        db.refresh(bill)
        return self._build_bill_response(bill)

    # ==========================================
    # SUPPLIER PAYMENTS (DISBURSEMENTS)
    # ==========================================
    def create_payment(
        self, db: Session, pmt_in: SupplierPaymentCreate
    ) -> SupplierPaymentResponse:
        bill = db.query(SupplierBill).filter(SupplierBill.id == pmt_in.supplier_bill_id).first()
        if not bill:
            raise ValueError(f"Supplier bill #{pmt_in.supplier_bill_id} not found.")

        payment_number = self.get_next_payment_number(db)
        pmt = SupplierPayment(
            payment_number=payment_number,
            supplier_bill_id=bill.id,
            supplier_id=bill.supplier_id,
            payment_date=pmt_in.payment_date or date.today(),
            amount_paid=pmt_in.amount_paid,
            currency=pmt_in.currency,
            exchange_rate_to_usd=pmt_in.exchange_rate_to_usd,
            payment_method=pmt_in.payment_method,
            reference_code=pmt_in.reference_code,
            disbursed_from_account=pmt_in.disbursed_from_account,
            notes=pmt_in.notes,
        )
        db.add(pmt)

        # Update bill paid amount and status
        bill.amount_paid += pmt_in.amount_paid
        bill.balance_payable = max(0.0, bill.amount_billed - bill.amount_paid)

        if bill.balance_payable == 0.0:
            bill.status = "paid"
        else:
            bill.status = "partially_paid"

        db.commit()
        db.refresh(pmt)
        return SupplierPaymentResponse.from_orm(pmt)

    # ==========================================
    # SUPPLIER LEDGER
    # ==========================================
    def get_supplier_ledger(
        self,
        db: Session,
        supplier_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Optional[SupplierLedgerResponse]:
        supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
        if not supplier:
            return None

        sup_resp = self._build_supplier_response(db, supplier)

        bill_query = db.query(SupplierBill).filter(
            SupplierBill.supplier_id == supplier_id,
            SupplierBill.status != "cancelled"
        )
        if start_date:
            bill_query = bill_query.filter(SupplierBill.bill_date >= start_date)
        if end_date:
            bill_query = bill_query.filter(SupplierBill.bill_date <= end_date)
        bills = bill_query.order_by(SupplierBill.bill_date.asc()).all()

        pmt_query = db.query(SupplierPayment).filter(SupplierPayment.supplier_id == supplier_id)
        if start_date:
            pmt_query = pmt_query.filter(SupplierPayment.payment_date >= start_date)
        if end_date:
            pmt_query = pmt_query.filter(SupplierPayment.payment_date <= end_date)
        payments = pmt_query.order_by(SupplierPayment.payment_date.asc()).all()

        events = []
        for b in bills:
            events.append({
                "date": b.bill_date,
                "type": "BILL",
                "reference_number": b.bill_number,
                "supplier_reference": b.supplier_reference,
                "description": b.description or f"Bill for {b.category}",
                "currency": b.currency,
                "bill_amount": b.amount_billed,
                "paid_amount": 0.0,
            })

        for p in payments:
            events.append({
                "date": p.payment_date,
                "type": "PAYMENT",
                "reference_number": p.payment_number,
                "supplier_reference": None,
                "description": f"Payment disbursed via {p.payment_method.replace('_', ' ').title()} (Ref: {p.reference_code})",
                "currency": p.currency,
                "bill_amount": 0.0,
                "paid_amount": p.amount_paid,
            })

        events.sort(key=lambda x: x["date"])

        total_billed = 0.0
        total_paid = 0.0
        running_payable = 0.0
        transactions: List[SupplierLedgerTransaction] = []

        for e in events:
            total_billed += e["bill_amount"]
            total_paid += e["paid_amount"]
            running_payable += (e["bill_amount"] - e["paid_amount"])

            transactions.append(
                SupplierLedgerTransaction(
                    date=e["date"],
                    type=e["type"],
                    reference_number=e["reference_number"],
                    supplier_reference=e["supplier_reference"],
                    description=e["description"],
                    currency=e["currency"],
                    bill_amount=round(e["bill_amount"], 2),
                    paid_amount=round(e["paid_amount"], 2),
                    running_payable=round(running_payable, 2),
                )
            )

        return SupplierLedgerResponse(
            supplier=sup_resp,
            statement_date=date.today(),
            start_date=start_date,
            end_date=end_date,
            total_billed=round(total_billed, 2),
            total_paid=round(total_paid, 2),
            closing_payable=round(running_payable, 2),
            transactions=transactions,
        )

    # ==========================================
    # HELPERS
    # ==========================================
    def _build_supplier_response(self, db: Session, supplier: Supplier) -> SupplierResponse:
        bills = (
            db.query(SupplierBill)
            .filter(SupplierBill.supplier_id == supplier.id, SupplierBill.status != "cancelled")
            .all()
        )

        total_billed_usd = 0.0
        total_paid_usd = 0.0
        balance_payable_usd = 0.0
        pending_count = 0

        for b in bills:
            rate = b.exchange_rate_to_usd if b.exchange_rate_to_usd > 0 else 1.0
            total_billed_usd += (b.amount_billed / rate)
            total_paid_usd += (b.amount_paid / rate)
            balance_payable_usd += (b.balance_payable / rate)
            if b.status in ["pending", "partially_paid", "overdue"]:
                pending_count += 1

        return SupplierResponse(
            id=supplier.id,
            name=supplier.name,
            supplier_code=supplier.supplier_code,
            category=supplier.category,
            contact_person=supplier.contact_person,
            email=supplier.email,
            phone=supplier.phone,
            whatsapp=supplier.whatsapp,
            physical_address=supplier.physical_address,
            country=supplier.country,
            currency=supplier.currency,
            tax_pin_number=supplier.tax_pin_number,
            bank_details=supplier.bank_details or {},
            mobile_money_details=supplier.mobile_money_details or {},
            payment_terms=supplier.payment_terms,
            rating=supplier.rating,
            notes=supplier.notes,
            is_active=supplier.is_active,
            total_billed_usd=round(total_billed_usd, 2),
            total_paid_usd=round(total_paid_usd, 2),
            balance_payable_usd=round(balance_payable_usd, 2),
            pending_bills_count=pending_count,
            created_at=supplier.created_at,
            updated_at=supplier.updated_at,
        )

    def _build_bill_response(self, bill: SupplierBill) -> SupplierBillResponse:
        supplier_name = bill.supplier.name if bill.supplier else "Unknown Supplier"
        payments_resp = [SupplierPaymentResponse.from_orm(p) for p in (bill.payments or [])]

        return SupplierBillResponse(
            id=bill.id,
            bill_number=bill.bill_number,
            supplier_reference=bill.supplier_reference,
            supplier_id=bill.supplier_id,
            booking_id=bill.booking_id,
            invoice_id=bill.invoice_id,
            bill_date=bill.bill_date,
            due_date=bill.due_date,
            service_date=bill.service_date,
            currency=bill.currency,
            exchange_rate_to_usd=bill.exchange_rate_to_usd,
            amount_billed=bill.amount_billed,
            amount_paid=bill.amount_paid,
            balance_payable=bill.balance_payable,
            status=bill.status,
            category=bill.category,
            description=bill.description,
            notes=bill.notes,
            attachment_url=bill.attachment_url,
            supplier_name=supplier_name,
            created_at=bill.created_at,
            updated_at=bill.updated_at,
            payments=payments_resp,
        )


supplier_service = SupplierService()
