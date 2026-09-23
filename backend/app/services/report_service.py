from datetime import date, datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_

from app.models.finance import Invoice, InvoiceLineItem, PaymentReceipt
from app.models.supplier_bill import SupplierBill
from app.models.supplier_payment import SupplierPayment
from app.models.client import Client
from app.models.supplier import Supplier
from app.models.booking import Booking
from app.schemas.reports import (
    SalesReportResponse,
    SalesByPeriodItem,
    SalesByDestinationItem,
    SalesByConsultantItem,
    ReceivablesAgingResponse,
    AgingBucketItem,
    AgingInvoiceItem,
    PayablesAgingResponse,
    AgingBillItem,
    ProfitabilityReportResponse,
    BookingProfitabilityItem,
    CashFlowReportResponse,
    CashFlowDailyItem,
)


class ReportService:
    # ==========================================
    # 1. SALES REPORT
    # ==========================================
    def get_sales_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> SalesReportResponse:
        query = db.query(Invoice).filter(Invoice.invoice_status != "cancelled")
        if start_date:
            query = query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            query = query.filter(Invoice.invoice_date <= end_date)

        invoices = query.order_by(Invoice.invoice_date.asc()).all()

        total_invoiced_usd = 0.0
        total_collected_usd = 0.0
        total_outstanding_usd = 0.0

        periods_map: Dict[str, Dict[str, float]] = {}
        destinations_map: Dict[str, Dict[str, float]] = {}
        consultants_map: Dict[str, Dict[str, float]] = {}

        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            usd_total = inv.total_amount / rate
            usd_subtotal = inv.subtotal / rate
            usd_discount = inv.discount_amount / rate
            usd_paid = inv.amount_paid / rate
            usd_balance = inv.balance_due / rate

            total_invoiced_usd += usd_total
            total_collected_usd += usd_paid
            total_outstanding_usd += usd_balance

            # Group by Month: YYYY-MM
            period_key = inv.invoice_date.strftime("%Y-%m")
            if period_key not in periods_map:
                periods_map[period_key] = {
                    "count": 0, "gross": 0.0, "discount": 0.0, "net": 0.0, "paid": 0.0, "balance": 0.0
                }
            periods_map[period_key]["count"] += 1
            periods_map[period_key]["gross"] += usd_subtotal
            periods_map[period_key]["discount"] += usd_discount
            periods_map[period_key]["net"] += usd_total
            periods_map[period_key]["paid"] += usd_paid
            periods_map[period_key]["balance"] += usd_balance

            # Group by Destination
            dest = (inv.trip_summary.get("destination") or inv.trip_summary.get("country") or "Other Safaris").title()
            if dest not in destinations_map:
                destinations_map[dest] = {"count": 0, "total": 0.0}
            destinations_map[dest]["count"] += 1
            destinations_map[dest]["total"] += usd_total

            # Group by Consultant
            consultant = inv.consultant_name or "Direct Website"
            if consultant not in consultants_map:
                consultants_map[consultant] = {"count": 0, "total": 0.0}
            consultants_map[consultant]["count"] += 1
            consultants_map[consultant]["total"] += usd_total

        # Format period list
        period_items = [
            SalesByPeriodItem(
                period=k,
                invoices_count=v["count"],
                gross_revenue_usd=round(v["gross"], 2),
                discount_usd=round(v["discount"], 2),
                net_revenue_usd=round(v["net"], 2),
                collected_usd=round(v["paid"], 2),
                outstanding_usd=round(v["balance"], 2),
            )
            for k, v in sorted(periods_map.items())
        ]

        # Format destination list
        dest_items = [
            SalesByDestinationItem(
                destination=k,
                bookings_count=v["count"],
                total_sales_usd=round(v["total"], 2),
                percentage_of_total=round((v["total"] / total_invoiced_usd * 100), 1) if total_invoiced_usd > 0 else 0.0,
            )
            for k, v in sorted(destinations_map.items(), key=lambda x: x[1]["total"], reverse=True)
        ]

        # Format consultant list
        consultant_items = [
            SalesByConsultantItem(
                consultant_name=k,
                invoices_count=v["count"],
                total_sales_usd=round(v["total"], 2),
            )
            for k, v in sorted(consultants_map.items(), key=lambda x: x[1]["total"], reverse=True)
        ]

        count = len(invoices)
        aov = (total_invoiced_usd / count) if count > 0 else 0.0

        return SalesReportResponse(
            start_date=start_date,
            end_date=end_date,
            total_invoiced_usd=round(total_invoiced_usd, 2),
            total_collected_usd=round(total_collected_usd, 2),
            total_outstanding_usd=round(total_outstanding_usd, 2),
            invoices_count=count,
            average_order_value_usd=round(aov, 2),
            period_breakdown=period_items,
            destination_breakdown=dest_items,
            consultant_breakdown=consultant_items,
        )

    # ==========================================
    # 2. RECEIVABLES AGING REPORT
    # ==========================================
    def get_receivables_aging(self, db: Session) -> ReceivablesAgingResponse:
        today = date.today()
        invoices = (
            db.query(Invoice)
            .filter(
                Invoice.invoice_status.notin_(["paid", "cancelled"]),
                Invoice.balance_due > 0
            )
            .order_by(Invoice.due_date.asc())
            .all()
        )

        bucket_totals = {
            "Current": {"count": 0, "amount": 0.0},
            "1-30 Days": {"count": 0, "amount": 0.0},
            "31-60 Days": {"count": 0, "amount": 0.0},
            "61-90 Days": {"count": 0, "amount": 0.0},
            "90+ Days": {"count": 0, "amount": 0.0},
        }

        total_receivable_usd = 0.0
        overdue_items: List[AgingInvoiceItem] = []

        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            balance_usd = inv.balance_due / rate
            total_receivable_usd += balance_usd

            days_overdue = (today - inv.due_date).days

            if days_overdue <= 0:
                bucket_key = "Current"
            elif 1 <= days_overdue <= 30:
                bucket_key = "1-30 Days"
            elif 31 <= days_overdue <= 60:
                bucket_key = "31-60 Days"
            elif 61 <= days_overdue <= 90:
                bucket_key = "61-90 Days"
            else:
                bucket_key = "90+ Days"

            bucket_totals[bucket_key]["count"] += 1
            bucket_totals[bucket_key]["amount"] += balance_usd

            client_name = (
                (inv.client.display_name if inv.client else None)
                or inv.client_details.get("name")
                or inv.client_details.get("company")
                or "Client"
            )

            overdue_items.append(
                AgingInvoiceItem(
                    invoice_id=inv.id,
                    invoice_number=inv.invoice_number,
                    client_name=client_name,
                    invoice_date=inv.invoice_date,
                    due_date=inv.due_date,
                    days_overdue=max(0, days_overdue),
                    currency=inv.currency,
                    total_amount=inv.total_amount,
                    amount_paid=inv.amount_paid,
                    balance_due=inv.balance_due,
                    balance_due_usd=round(balance_usd, 2),
                    status=inv.invoice_status,
                )
            )

        buckets = [
            AgingBucketItem(
                bucket_label=k,
                count=v["count"],
                total_amount_usd=round(v["amount"], 2),
                percentage=round((v["amount"] / total_receivable_usd * 100), 1) if total_receivable_usd > 0 else 0.0,
            )
            for k, v in bucket_totals.items()
        ]

        return ReceivablesAgingResponse(
            as_of_date=today,
            total_receivable_usd=round(total_receivable_usd, 2),
            buckets=buckets,
            overdue_invoices=overdue_items,
        )

    # ==========================================
    # 3. PAYABLES AGING REPORT
    # ==========================================
    def get_payables_aging(self, db: Session) -> PayablesAgingResponse:
        today = date.today()
        bills = (
            db.query(SupplierBill)
            .filter(
                SupplierBill.status.notin_(["paid", "cancelled"]),
                SupplierBill.balance_payable > 0
            )
            .order_by(SupplierBill.due_date.asc())
            .all()
        )

        bucket_totals = {
            "Due Later": {"count": 0, "amount": 0.0},
            "1-30 Days Overdue": {"count": 0, "amount": 0.0},
            "31-60 Days Overdue": {"count": 0, "amount": 0.0},
            "61-90 Days Overdue": {"count": 0, "amount": 0.0},
            "90+ Days Overdue": {"count": 0, "amount": 0.0},
        }

        total_payable_usd = 0.0
        pending_items: List[AgingBillItem] = []

        for b in bills:
            rate = b.exchange_rate_to_usd if b.exchange_rate_to_usd > 0 else 1.0
            balance_usd = b.balance_payable / rate
            total_payable_usd += balance_usd

            days_overdue = (today - b.due_date).days

            if days_overdue <= 0:
                bucket_key = "Due Later"
            elif 1 <= days_overdue <= 30:
                bucket_key = "1-30 Days Overdue"
            elif 31 <= days_overdue <= 60:
                bucket_key = "31-60 Days Overdue"
            elif 61 <= days_overdue <= 90:
                bucket_key = "61-90 Days Overdue"
            else:
                bucket_key = "90+ Days Overdue"

            bucket_totals[bucket_key]["count"] += 1
            bucket_totals[bucket_key]["amount"] += balance_usd

            pending_items.append(
                AgingBillItem(
                    bill_id=b.id,
                    bill_number=b.bill_number,
                    supplier_name=b.supplier.name if b.supplier else "Supplier",
                    bill_date=b.bill_date,
                    due_date=b.due_date,
                    days_overdue=max(0, days_overdue),
                    currency=b.currency,
                    amount_billed=b.amount_billed,
                    amount_paid=b.amount_paid,
                    balance_payable=b.balance_payable,
                    balance_payable_usd=round(balance_usd, 2),
                    status=b.status,
                )
            )

        buckets = [
            AgingBucketItem(
                bucket_label=k,
                count=v["count"],
                total_amount_usd=round(v["amount"], 2),
                percentage=round((v["amount"] / total_payable_usd * 100), 1) if total_payable_usd > 0 else 0.0,
            )
            for k, v in bucket_totals.items()
        ]

        return PayablesAgingResponse(
            as_of_date=today,
            total_payable_usd=round(total_payable_usd, 2),
            buckets=buckets,
            pending_bills=pending_items,
        )

    # ==========================================
    # 4. PROFITABILITY REPORT (TRIP & PERIOD)
    # ==========================================
    def get_profitability_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> ProfitabilityReportResponse:
        inv_query = db.query(Invoice).filter(Invoice.invoice_status != "cancelled")
        if start_date:
            inv_query = inv_query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            inv_query = inv_query.filter(Invoice.invoice_date <= end_date)

        invoices = inv_query.order_by(Invoice.invoice_date.desc()).all()

        total_revenue_usd = 0.0
        total_cost_usd = 0.0
        items: List[BookingProfitabilityItem] = []

        for inv in invoices:
            rate = inv.exchange_rate_to_usd if inv.exchange_rate_to_usd > 0 else 1.0
            rev_usd = inv.total_amount / rate

            # Calculate cost from linked SupplierBills OR line item cost prices
            bills = db.query(SupplierBill).filter(
                SupplierBill.invoice_id == inv.id,
                SupplierBill.status != "cancelled"
            ).all()

            cost_usd = 0.0
            if bills:
                for b in bills:
                    b_rate = b.exchange_rate_to_usd if b.exchange_rate_to_usd > 0 else 1.0
                    cost_usd += (b.amount_billed / b_rate)
            else:
                # Fallback to line item cost prices
                for li in inv.line_items:
                    cost_usd += (li.cost_price * li.quantity) / rate

            gross_profit = rev_usd - cost_usd
            margin_percent = (gross_profit / rev_usd * 100) if rev_usd > 0 else 0.0

            total_revenue_usd += rev_usd
            total_cost_usd += cost_usd

            client_name = (
                (inv.client.display_name if inv.client else None)
                or inv.client_details.get("name")
                or inv.client_details.get("company")
                or "Client"
            )

            dest = inv.trip_summary.get("destination") or inv.trip_summary.get("country")
            desc = inv.trip_summary.get("package_title") or f"{len(inv.line_items)} travel services"

            items.append(
                BookingProfitabilityItem(
                    booking_id=inv.booking_id,
                    invoice_id=inv.id,
                    invoice_number=inv.invoice_number,
                    client_name=client_name,
                    service_description=desc,
                    destination=dest,
                    revenue_usd=round(rev_usd, 2),
                    cost_usd=round(cost_usd, 2),
                    gross_profit_usd=round(gross_profit, 2),
                    gross_margin_percent=round(margin_percent, 1),
                )
            )

        total_gross_profit = total_revenue_usd - total_cost_usd
        avg_margin = (total_gross_profit / total_revenue_usd * 100) if total_revenue_usd > 0 else 0.0

        return ProfitabilityReportResponse(
            start_date=start_date,
            end_date=end_date,
            total_revenue_usd=round(total_revenue_usd, 2),
            total_cost_usd=round(total_cost_usd, 2),
            total_gross_profit_usd=round(total_gross_profit, 2),
            average_margin_percent=round(avg_margin, 1),
            items=items,
        )

    # ==========================================
    # 5. CASH-FLOW REPORT
    # ==========================================
    def get_cash_flow_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> CashFlowReportResponse:
        # Default to last 30 days if no date given
        if not end_date:
            end_date = date.today()
        if not start_date:
            start_date = end_date - timedelta(days=30)

        # 1. Receipts (Inflow)
        receipts = (
            db.query(PaymentReceipt)
            .filter(
                PaymentReceipt.receipt_date >= start_date,
                PaymentReceipt.receipt_date <= end_date,
                PaymentReceipt.payment_status != "reversed"
            )
            .all()
        )

        # 2. Supplier Payments (Outflow)
        payments = (
            db.query(SupplierPayment)
            .filter(
                SupplierPayment.payment_date >= start_date,
                SupplierPayment.payment_date <= end_date
            )
            .all()
        )

        total_inflow = 0.0
        total_outflow = 0.0
        inflows_by_method: Dict[str, float] = {}
        outflows_by_method: Dict[str, float] = {}
        daily_map: Dict[date, Dict[str, float]] = {}

        # Populate date range in daily map
        curr = start_date
        while curr <= end_date:
            daily_map[curr] = {"inflow": 0.0, "outflow": 0.0}
            curr += timedelta(days=1)

        for r in receipts:
            rate = r.exchange_rate_to_usd if r.exchange_rate_to_usd > 0 else 1.0
            usd_amt = r.amount_received / rate
            total_inflow += usd_amt

            method = r.payment_method.replace("_", " ").title()
            inflows_by_method[method] = inflows_by_method.get(method, 0.0) + usd_amt

            if r.receipt_date in daily_map:
                daily_map[r.receipt_date]["inflow"] += usd_amt

        for p in payments:
            rate = p.exchange_rate_to_usd if p.exchange_rate_to_usd > 0 else 1.0
            usd_amt = p.amount_paid / rate
            total_outflow += usd_amt

            method = p.payment_method.replace("_", " ").title()
            outflows_by_method[method] = outflows_by_method.get(method, 0.0) + usd_amt

            if p.payment_date in daily_map:
                daily_map[p.payment_date]["outflow"] += usd_amt

        daily_timeline = [
            CashFlowDailyItem(
                date=k,
                inflow_usd=round(v["inflow"], 2),
                outflow_usd=round(v["outflow"], 2),
                net_usd=round(v["inflow"] - v["outflow"], 2),
            )
            for k, v in sorted(daily_map.items())
        ]

        return CashFlowReportResponse(
            start_date=start_date,
            end_date=end_date,
            total_inflow_usd=round(total_inflow, 2),
            total_outflow_usd=round(total_outflow, 2),
            net_cash_flow_usd=round(total_inflow - total_outflow, 2),
            inflows_by_method={k: round(v, 2) for k, v in inflows_by_method.items()},
            outflows_by_method={k: round(v, 2) for k, v in outflows_by_method.items()},
            daily_timeline=daily_timeline,
        )


report_service = ReportService()
