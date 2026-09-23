from datetime import date, datetime
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from app.models.client import Client
from app.models.finance import Invoice, PaymentReceipt
from app.models.booking import Booking
from app.schemas.client import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientStatementResponse,
    StatementTransaction,
)


class ClientService:
    def get_clients(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 50,
        search: Optional[str] = None,
        client_type: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> Tuple[List[ClientResponse], int]:
        query = db.query(Client)

        if is_active is not None:
            query = query.filter(Client.is_active == is_active)

        if client_type:
            query = query.filter(Client.client_type == client_type)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Client.first_name.ilike(s),
                    Client.last_name.ilike(s),
                    Client.company_name.ilike(s),
                    Client.email.ilike(s),
                    Client.phone.ilike(s),
                    Client.country_of_origin.ilike(s),
                )
            )

        total = query.count()
        clients = query.order_by(Client.created_at.desc()).offset(skip).limit(limit).all()

        results: List[ClientResponse] = []
        for client in clients:
            resp = self._build_client_response(db, client)
            results.append(resp)

        return results, total

    def get_client(self, db: Session, client_id: int) -> Optional[ClientResponse]:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            return None
        return self._build_client_response(db, client)

    def create_client(self, db: Session, client_in: ClientCreate) -> ClientResponse:
        existing = db.query(Client).filter(Client.email == client_in.email).first()
        if existing:
            raise ValueError(f"A client with email '{client_in.email}' already exists.")

        client = Client(**client_in.dict())
        db.add(client)
        db.commit()
        db.refresh(client)
        return self._build_client_response(db, client)

    def update_client(
        self, db: Session, client_id: int, client_update: ClientUpdate
    ) -> Optional[ClientResponse]:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            return None

        update_data = client_update.dict(exclude_unset=True)
        if "email" in update_data and update_data["email"] != client.email:
            existing = db.query(Client).filter(Client.email == update_data["email"]).first()
            if existing:
                raise ValueError(f"A client with email '{update_data['email']}' already exists.")

        for key, value in update_data.items():
            setattr(client, key, value)

        db.commit()
        db.refresh(client)
        return self._build_client_response(db, client)

    def delete_client(self, db: Session, client_id: int) -> bool:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            return False

        # If has invoices, soft-delete
        has_invoices = db.query(Invoice).filter(Invoice.client_id == client_id).count() > 0
        if has_invoices:
            client.is_active = False
            db.commit()
        else:
            db.delete(client)
            db.commit()
        return True

    def get_client_statement(
        self,
        db: Session,
        client_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> Optional[ClientStatementResponse]:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            return None

        client_resp = self._build_client_response(db, client)

        # Collect Invoices
        inv_query = db.query(Invoice).filter(
            Invoice.client_id == client_id,
            Invoice.invoice_status != "cancelled"
        )
        if start_date:
            inv_query = inv_query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            inv_query = inv_query.filter(Invoice.invoice_date <= end_date)
        invoices = inv_query.order_by(Invoice.invoice_date.asc()).all()

        # Collect Receipts
        rec_query = db.query(PaymentReceipt).filter(
            PaymentReceipt.client_id == client_id,
            PaymentReceipt.payment_status != "reversed"
        )
        if start_date:
            rec_query = rec_query.filter(PaymentReceipt.receipt_date >= start_date)
        if end_date:
            rec_query = rec_query.filter(PaymentReceipt.receipt_date <= end_date)
        receipts = rec_query.order_by(PaymentReceipt.receipt_date.asc()).all()

        # Merge chronologically
        events = []
        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            events.append({
                "date": inv.invoice_date,
                "type": "INVOICE",
                "reference_number": inv.invoice_number,
                "description": f"Invoice for booking {inv.booking_id or 'Custom Safari'}",
                "currency": inv.currency,
                "debit": inv.total_amount,
                "credit": 0.0,
                "debit_usd": inv.total_amount / rate,
                "credit_usd": 0.0,
            })

        for rec in receipts:
            rate = rec.exchange_rate_to_usd if rec.exchange_rate_to_usd > 0 else 1.0
            events.append({
                "date": rec.receipt_date,
                "type": "PAYMENT",
                "reference_number": rec.receipt_number,
                "description": f"Payment received via {rec.payment_method.replace('_', ' ').title()} (Ref: {rec.payment_reference})",
                "currency": rec.currency,
                "debit": 0.0,
                "credit": rec.amount_received,
                "debit_usd": 0.0,
                "credit_usd": rec.amount_received / rate,
            })

        # Sort by date
        events.sort(key=lambda x: x["date"])

        total_billed = 0.0
        total_paid = 0.0
        running_bal = 0.0
        transactions: List[StatementTransaction] = []

        for e in events:
            total_billed += e["debit_usd"]
            total_paid += e["credit_usd"]
            running_bal += (e["debit_usd"] - e["credit_usd"])

            transactions.append(
                StatementTransaction(
                    date=e["date"],
                    type=e["type"],
                    reference_number=e["reference_number"],
                    description=e["description"],
                    currency=e["currency"],
                    debit=round(e["debit"], 2),
                    credit=round(e["credit"], 2),
                    running_balance=round(running_bal, 2),
                )
            )

        return ClientStatementResponse(
            client=client_resp,
            statement_date=date.today(),
            start_date=start_date,
            end_date=end_date,
            opening_balance=0.0,
            total_billed=round(total_billed, 2),
            total_paid=round(total_paid, 2),
            closing_balance=round(running_bal, 2),
            transactions=transactions,
        )

    def _build_client_response(self, db: Session, client: Client) -> ClientResponse:
        invoices = (
            db.query(Invoice)
            .filter(Invoice.client_id == client.id, Invoice.invoice_status != "cancelled")
            .all()
        )

        total_invoiced_usd = 0.0
        total_paid_usd = 0.0
        total_balance_usd = 0.0

        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            total_invoiced_usd += (inv.total_amount / rate)
            total_paid_usd += (inv.amount_paid / rate)
            total_balance_usd += (inv.balance_due / rate)

        bookings_count = db.query(Booking).filter(Booking.client_id == client.id).count()

        return ClientResponse(
            id=client.id,
            client_type=client.client_type,
            first_name=client.first_name,
            last_name=client.last_name,
            company_name=client.company_name,
            contact_person=client.contact_person,
            email=client.email,
            phone=client.phone,
            alt_phone=client.alt_phone,
            country_of_origin=client.country_of_origin,
            address=client.address,
            city=client.city,
            postal_code=client.postal_code,
            tin_number=client.tin_number,
            vat_number=client.vat_number,
            passport_number=client.passport_number,
            nationality=client.nationality,
            dietary_requirements=client.dietary_requirements,
            special_notes=client.special_notes,
            is_active=client.is_active,
            display_name=client.display_name,
            total_invoiced_usd=round(total_invoiced_usd, 2),
            total_paid_usd=round(total_paid_usd, 2),
            outstanding_balance_usd=round(total_balance_usd, 2),
            invoices_count=len(invoices),
            bookings_count=bookings_count,
            created_at=client.created_at,
            updated_at=client.updated_at,
        )


client_service = ClientService()
