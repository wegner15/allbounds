"""
Financial reporting service.

All monetary aggregates are normalised to USD using the exchange rate captured on each
document (``exchange_rate_to_usd`` = units of document currency per 1 USD).

Conventions
-----------
* Cancelled documents are always excluded.
* Draft invoices are excluded from revenue unless ``include_drafts`` is requested –
  they have not been issued to the client and are not yet revenue / receivables.
* Aging reports accept an ``as_of`` date. For past dates, balances are reconstructed
  from receipts / supplier payments dated on or before that day.
"""
from collections import defaultdict
from datetime import date, timedelta
from typing import Optional, List, Dict, Tuple, Iterable, Any

from sqlalchemy.orm import Session, selectinload

from app.models.finance import Invoice, PaymentReceipt
from app.models.supplier_bill import SupplierBill
from app.models.supplier_payment import SupplierPayment
from app.schemas.reports import (
    AmountByLabel,
    SalesReportResponse,
    SalesByPeriodItem,
    SalesByDestinationItem,
    SalesByConsultantItem,
    SalesComparison,
    ReceivablesAgingResponse,
    AgingBucketItem,
    AgingPartyRow,
    AgingInvoiceItem,
    PayablesAgingResponse,
    AgingBillItem,
    ProfitabilityReportResponse,
    ProfitabilityGroupItem,
    BookingProfitabilityItem,
    CashFlowReportResponse,
    CashFlowDailyItem,
    ExecutiveSummaryResponse,
)

# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

AGING_BUCKETS: List[Tuple[str, str, str]] = [
    # key, receivables label, payables label
    ("current", "Current", "Not Yet Due"),
    ("d1_30", "1–30 Days", "1–30 Days Overdue"),
    ("d31_60", "31–60 Days", "31–60 Days Overdue"),
    ("d61_90", "61–90 Days", "61–90 Days Overdue"),
    ("d90_plus", "90+ Days", "90+ Days Overdue"),
]

MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _r2(v: float) -> float:
    return round(v or 0.0, 2)


def _rate(value: Optional[float]) -> float:
    return value if value and value > 0 else 1.0


def _pct(part: float, whole: float, digits: int = 1) -> float:
    return round(part / whole * 100, digits) if whole else 0.0


def _change(current: float, previous: float) -> Optional[float]:
    if not previous:
        return None
    return round((current - previous) / abs(previous) * 100, 1)


def _bucket_for(days_overdue: int) -> str:
    if days_overdue <= 0:
        return "current"
    if days_overdue <= 30:
        return "d1_30"
    if days_overdue <= 60:
        return "d31_60"
    if days_overdue <= 90:
        return "d61_90"
    return "d90_plus"


def _auto_granularity(start: date, end: date) -> str:
    span = (end - start).days
    if span <= 45:
        return "day"
    if span <= 140:
        return "week"
    if span <= 800:
        return "month"
    return "quarter"


def _period_start(d: date, granularity: str) -> date:
    if granularity == "day":
        return d
    if granularity == "week":
        return d - timedelta(days=d.weekday())
    if granularity == "quarter":
        return date(d.year, 3 * ((d.month - 1) // 3) + 1, 1)
    return d.replace(day=1)


def _period_key_label(start: date, granularity: str) -> Tuple[str, str]:
    if granularity == "day":
        return start.isoformat(), f"{start.day:02d} {MONTH_ABBR[start.month - 1]} {start.year}"
    if granularity == "week":
        iso_year, iso_week, _ = start.isocalendar()
        return f"{iso_year}-W{iso_week:02d}", f"Wk {start.day:02d} {MONTH_ABBR[start.month - 1]} {start.year}"
    if granularity == "quarter":
        q = (start.month - 1) // 3 + 1
        return f"{start.year}-Q{q}", f"Q{q} {start.year}"
    return start.strftime("%Y-%m"), f"{MONTH_ABBR[start.month - 1]} {start.year}"


def _next_period(start: date, granularity: str) -> date:
    if granularity == "day":
        return start + timedelta(days=1)
    if granularity == "week":
        return start + timedelta(days=7)
    months = 3 if granularity == "quarter" else 1
    m = start.month - 1 + months
    return date(start.year + m // 12, m % 12 + 1, 1)


def _iter_periods(start: date, end: date, granularity: str) -> Iterable[date]:
    cur = _period_start(start, granularity)
    guard = 0
    while cur <= end and guard < 2000:
        yield cur
        cur = _next_period(cur, granularity)
        guard += 1


def _resolve_granularity(granularity: Optional[str], start: date, end: date) -> str:
    if granularity in ("day", "week", "month", "quarter"):
        return granularity
    return _auto_granularity(start, end)


def _humanise(value: str) -> str:
    return (value or "other").replace("_", " ").strip().title()


def _invoice_client_name(inv: Invoice) -> str:
    details: Dict[str, Any] = inv.client_details or {}
    if inv.client is not None:
        try:
            name = inv.client.display_name
            if name:
                return name
        except Exception:  # pragma: no cover – defensive, display_name is a property
            pass
    if inv.client_type == "corporate":
        corp = details.get("company_name") or details.get("company")
        if corp:
            return corp
    return (
        details.get("full_name")
        or details.get("name")
        or details.get("company_name")
        or details.get("company")
        or "Unnamed Client"
    )


def _invoice_destination(inv: Invoice) -> str:
    ts: Dict[str, Any] = inv.trip_summary or {}
    raw = ts.get("destinations") or ts.get("destination") or ts.get("country")
    if isinstance(raw, (list, tuple)):
        raw = ", ".join(str(x) for x in raw if x)
    raw = " ".join(str(raw or "").split())
    if not raw:
        return "Unspecified"
    return raw.title() if (raw.islower() or raw.isupper()) else raw


def _invoice_description(inv: Invoice) -> str:
    ts: Dict[str, Any] = inv.trip_summary or {}
    name = ts.get("tour_package_name") or ts.get("package_title")
    if name:
        return str(name)
    items = list(inv.line_items or [])
    if items:
        first = items[0].title or "Travel services"
        return first if len(items) == 1 else f"{first} + {len(items) - 1} more"
    return "Travel services"


def _excluded_invoice_statuses(include_drafts: bool) -> List[str]:
    return ["cancelled"] if include_drafts else ["cancelled", "draft"]


def _receipt_payer(r: PaymentReceipt) -> str:
    if r.client is not None:
        try:
            if r.client.display_name:
                return r.client.display_name
        except Exception:  # pragma: no cover
            pass
    rf: Dict[str, Any] = r.received_from or {}
    name = rf.get("company") or rf.get("company_name") or rf.get("name") or rf.get("full_name")
    if name:
        return name
    if r.invoice is not None:
        return _invoice_client_name(r.invoice)
    return "Unknown Payer"


def _top_labels(source: Dict[str, Dict[str, float]], total: float, limit: int = 10) -> List[AmountByLabel]:
    ordered = sorted(source.items(), key=lambda kv: kv[1]["amount"], reverse=True)
    return [
        AmountByLabel(
            label=k,
            count=int(v["count"]),
            amount_usd=_r2(v["amount"]),
            percentage=_pct(v["amount"], total),
        )
        for k, v in ordered[:limit]
    ]


class ReportService:
    # ==========================================
    # Internal data loaders
    # ==========================================
    def _load_invoices(
        self,
        db: Session,
        start_date: Optional[date],
        end_date: Optional[date],
        include_drafts: bool,
        with_line_items: bool = False,
    ) -> List[Invoice]:
        opts = [selectinload(Invoice.client)]
        if with_line_items:
            opts.append(selectinload(Invoice.line_items))
        query = (
            db.query(Invoice)
            .options(*opts)
            .filter(Invoice.invoice_status.notin_(_excluded_invoice_statuses(include_drafts)))
        )
        if start_date:
            query = query.filter(Invoice.invoice_date >= start_date)
        if end_date:
            query = query.filter(Invoice.invoice_date <= end_date)
        return query.order_by(Invoice.invoice_date.asc(), Invoice.id.asc()).all()

    def _invoice_costs(self, db: Session, invoices: List[Invoice]) -> Dict[int, Tuple[float, str]]:
        """Return {invoice_id: (cost_usd, source)} using a single bills query (no N+1).

        Priority mirrors ``finance_service.get_invoice_profitability``:
        linked supplier bills → line-item supplier expense breakdown → line-item cost price.
        """
        ids = [inv.id for inv in invoices]
        bills_by_invoice: Dict[int, List[SupplierBill]] = defaultdict(list)
        if ids:
            for b in (
                db.query(SupplierBill)
                .filter(SupplierBill.invoice_id.in_(ids), SupplierBill.status != "cancelled")
                .all()
            ):
                bills_by_invoice[b.invoice_id].append(b)

        result: Dict[int, Tuple[float, str]] = {}
        for inv in invoices:
            inv_rate = _rate(inv.exchange_rate_to_usd)
            bills = bills_by_invoice.get(inv.id)
            if bills:
                cost = sum(b.amount_billed / _rate(b.exchange_rate_to_usd) for b in bills)
                result[inv.id] = (cost, "bills")
                continue

            cost = 0.0
            used_expenses = False
            for li in inv.line_items or []:
                expenses = (li.metadata_json or {}).get("supplier_expenses") or []
                if expenses:
                    used_expenses = True
                    for se in expenses:
                        net = se.get("net_price") if se.get("net_price") is not None else (se.get("amount") or 0.0)
                        qty = se.get("quantity") if se.get("quantity") is not None else (se.get("qty") or 1.0)
                        cost += float(net or 0.0) * float(qty or 0.0) / inv_rate
                else:
                    cost += float(li.cost_price or 0.0) * float(li.quantity or 1.0) / inv_rate

            if cost <= 0:
                result[inv.id] = (0.0, "none")
            else:
                result[inv.id] = (cost, "supplier_expenses" if used_expenses else "line_items")
        return result

    # ==========================================
    # 1. SALES REPORT
    # ==========================================
    def get_sales_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        granularity: Optional[str] = None,
        include_drafts: bool = False,
    ) -> SalesReportResponse:
        invoices = self._load_invoices(db, start_date, end_date, include_drafts)

        # Resolve effective range (for gap-filling the trend)
        if invoices:
            range_start = start_date or invoices[0].invoice_date
            range_end = end_date or max(invoices[-1].invoice_date, range_start)
        else:
            range_end = end_date or date.today()
            range_start = start_date or range_end
        gran = _resolve_granularity(granularity, range_start, range_end)

        totals = defaultdict(float)
        periods: Dict[date, Dict[str, float]] = {
            p: defaultdict(float) for p in _iter_periods(range_start, range_end, gran)
        }
        destinations: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        consultants: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        statuses: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))

        for inv in invoices:
            rate = _rate(inv.exchange_rate_to_usd)
            usd_total = inv.total_amount / rate
            usd_gross = inv.subtotal / rate
            usd_discount = ((inv.discount_amount or 0.0) + (inv.promotional_discount or 0.0)) / rate
            usd_paid = inv.amount_paid / rate
            usd_balance = inv.balance_due / rate

            totals["gross"] += usd_gross
            totals["discount"] += usd_discount
            totals["net"] += usd_total
            totals["paid"] += usd_paid
            totals["balance"] += usd_balance

            p = periods.setdefault(_period_start(inv.invoice_date, gran), defaultdict(float))
            p["count"] += 1
            p["gross"] += usd_gross
            p["discount"] += usd_discount
            p["net"] += usd_total
            p["paid"] += usd_paid
            p["balance"] += usd_balance

            d = destinations[_invoice_destination(inv)]
            d["count"] += 1
            d["total"] += usd_total

            c = consultants[(inv.consultant_name or "").strip() or "Unassigned / Website"]
            c["count"] += 1
            c["total"] += usd_total
            c["paid"] += usd_paid
            c["balance"] += usd_balance

            s = statuses[_humanise(inv.invoice_status)]
            s["count"] += 1
            s["amount"] += usd_total

        net_total = totals["net"]
        period_items = []
        for start, v in sorted(periods.items()):
            key, label = _period_key_label(start, gran)
            period_items.append(
                SalesByPeriodItem(
                    period=key,
                    period_label=label,
                    period_start=start,
                    invoices_count=int(v["count"]),
                    gross_revenue_usd=_r2(v["gross"]),
                    discount_usd=_r2(v["discount"]),
                    net_revenue_usd=_r2(v["net"]),
                    collected_usd=_r2(v["paid"]),
                    outstanding_usd=_r2(v["balance"]),
                )
            )

        dest_items = [
            SalesByDestinationItem(
                destination=k,
                bookings_count=int(v["count"]),
                total_sales_usd=_r2(v["total"]),
                percentage_of_total=_pct(v["total"], net_total),
            )
            for k, v in sorted(destinations.items(), key=lambda x: x[1]["total"], reverse=True)
        ]

        consultant_items = [
            SalesByConsultantItem(
                consultant_name=k,
                invoices_count=int(v["count"]),
                total_sales_usd=_r2(v["total"]),
                collected_usd=_r2(v["paid"]),
                outstanding_usd=_r2(v["balance"]),
                percentage_of_total=_pct(v["total"], net_total),
            )
            for k, v in sorted(consultants.items(), key=lambda x: x[1]["total"], reverse=True)
        ]

        comparison = None
        if start_date and end_date and end_date >= start_date:
            span = (end_date - start_date).days + 1
            prev_end = start_date - timedelta(days=1)
            prev_start = prev_end - timedelta(days=span - 1)
            prev = self._load_invoices(db, prev_start, prev_end, include_drafts)
            prev_net = sum(i.total_amount / _rate(i.exchange_rate_to_usd) for i in prev)
            prev_paid = sum(i.amount_paid / _rate(i.exchange_rate_to_usd) for i in prev)
            comparison = SalesComparison(
                previous_start_date=prev_start,
                previous_end_date=prev_end,
                previous_invoiced_usd=_r2(prev_net),
                previous_collected_usd=_r2(prev_paid),
                previous_invoices_count=len(prev),
                invoiced_change_percent=_change(net_total, prev_net),
                collected_change_percent=_change(totals["paid"], prev_paid),
                invoices_count_change_percent=_change(len(invoices), len(prev)),
            )

        count = len(invoices)
        return SalesReportResponse(
            start_date=start_date,
            end_date=end_date,
            granularity=gran,
            include_drafts=include_drafts,
            total_gross_usd=_r2(totals["gross"]),
            total_discount_usd=_r2(totals["discount"]),
            total_invoiced_usd=_r2(net_total),
            total_collected_usd=_r2(totals["paid"]),
            total_outstanding_usd=_r2(totals["balance"]),
            collection_rate_percent=_pct(totals["paid"], net_total),
            invoices_count=count,
            average_order_value_usd=_r2(net_total / count) if count else 0.0,
            comparison=comparison,
            period_breakdown=period_items,
            destination_breakdown=dest_items,
            consultant_breakdown=consultant_items,
            status_breakdown=_top_labels(statuses, net_total, limit=20),
        )

    # ==========================================
    # 2. AGING (shared machinery)
    # ==========================================
    @staticmethod
    def _build_aging(
        rows: List[Dict[str, Any]], labels_index: int
    ) -> Tuple[List[AgingBucketItem], List[AgingPartyRow], float, float, float]:
        """rows: dicts with party_id, party_name, days_overdue, balance_usd."""
        total = sum(r["balance_usd"] for r in rows)
        bucket_totals = {k: {"count": 0, "amount": 0.0} for k, *_ in AGING_BUCKETS}
        parties: Dict[Any, Dict[str, Any]] = {}

        overdue_total = 0.0
        weighted_days = 0.0
        for r in rows:
            key = _bucket_for(r["days_overdue"])
            bucket_totals[key]["count"] += 1
            bucket_totals[key]["amount"] += r["balance_usd"]
            if r["days_overdue"] > 0:
                overdue_total += r["balance_usd"]
                weighted_days += r["balance_usd"] * r["days_overdue"]

            pkey = r["party_id"] if r["party_id"] is not None else f"name:{r['party_name'].lower()}"
            p = parties.setdefault(
                pkey,
                {"party_id": r["party_id"], "party_name": r["party_name"], "count": 0, "oldest": 0,
                 **{k: 0.0 for k, *_ in AGING_BUCKETS}},
            )
            p["count"] += 1
            p[key] += r["balance_usd"]
            p["oldest"] = max(p["oldest"], max(0, r["days_overdue"]))

        buckets = [
            AgingBucketItem(
                key=k,
                bucket_label=labels[labels_index - 1],
                count=bucket_totals[k]["count"],
                total_amount_usd=_r2(bucket_totals[k]["amount"]),
                percentage=_pct(bucket_totals[k]["amount"], total),
            )
            for k, *labels in AGING_BUCKETS
        ]

        party_rows = []
        for p in parties.values():
            row_total = sum(p[k] for k, *_ in AGING_BUCKETS)
            party_rows.append(
                AgingPartyRow(
                    party_id=p["party_id"],
                    party_name=p["party_name"],
                    documents_count=p["count"],
                    current_usd=_r2(p["current"]),
                    d1_30_usd=_r2(p["d1_30"]),
                    d31_60_usd=_r2(p["d31_60"]),
                    d61_90_usd=_r2(p["d61_90"]),
                    d90_plus_usd=_r2(p["d90_plus"]),
                    total_usd=_r2(row_total),
                    oldest_days_overdue=p["oldest"],
                )
            )
        party_rows.sort(key=lambda x: x.total_usd, reverse=True)
        avg_days = round(weighted_days / overdue_total, 1) if overdue_total else 0.0
        return buckets, party_rows, total, overdue_total, avg_days

    # ==========================================
    # 2a. RECEIVABLES AGING REPORT
    # ==========================================
    def get_receivables_aging(self, db: Session, as_of: Optional[date] = None) -> ReceivablesAgingResponse:
        today = date.today()
        as_of = min(as_of or today, today)
        historical = as_of < today

        query = (
            db.query(Invoice)
            .options(selectinload(Invoice.client))
            .filter(
                Invoice.invoice_status.notin_(["cancelled", "draft"]),
                Invoice.invoice_date <= as_of,
            )
        )
        if historical:
            query = query.options(selectinload(Invoice.receipts))
        else:
            query = query.filter(Invoice.invoice_status != "paid", Invoice.balance_due > 0.005)
        invoices = query.order_by(Invoice.due_date.asc()).all()

        rows: List[Dict[str, Any]] = []
        items: List[AgingInvoiceItem] = []
        for inv in invoices:
            rate = _rate(inv.exchange_rate_to_usd)
            if historical:
                paid = 0.0
                for r in inv.receipts or []:
                    if r.payment_status == "reversed" or r.receipt_date > as_of:
                        continue
                    if (r.currency or inv.currency) == inv.currency:
                        paid += r.amount_received
                    else:
                        paid += r.amount_received / _rate(r.exchange_rate_to_usd) * rate
                balance = max(0.0, inv.total_amount - (inv.credit_applied or 0.0) - paid)
            else:
                paid = inv.amount_paid
                balance = inv.balance_due
            if balance <= 0.005:
                continue

            balance_usd = balance / rate
            days = (as_of - inv.due_date).days
            name = _invoice_client_name(inv)
            rows.append({"party_id": inv.client_id, "party_name": name, "days_overdue": days, "balance_usd": balance_usd})
            items.append(
                AgingInvoiceItem(
                    invoice_id=inv.id,
                    invoice_number=inv.invoice_number,
                    client_id=inv.client_id,
                    client_name=name,
                    invoice_date=inv.invoice_date,
                    due_date=inv.due_date,
                    days_overdue=max(0, days),
                    bucket=_bucket_for(days),
                    currency=inv.currency,
                    total_amount=_r2(inv.total_amount),
                    amount_paid=_r2(paid),
                    balance_due=_r2(balance),
                    balance_due_usd=_r2(balance_usd),
                    status=inv.invoice_status,
                )
            )

        buckets, parties, total, overdue, avg_days = self._build_aging(rows, labels_index=1)
        items.sort(key=lambda x: (-x.days_overdue, -x.balance_due_usd))
        return ReceivablesAgingResponse(
            as_of_date=as_of,
            total_receivable_usd=_r2(total),
            total_overdue_usd=_r2(overdue),
            overdue_percent=_pct(overdue, total),
            documents_count=len(items),
            weighted_avg_days_overdue=avg_days,
            buckets=buckets,
            by_party=parties,
            overdue_invoices=items,
        )

    # ==========================================
    # 2b. PAYABLES AGING REPORT
    # ==========================================
    def get_payables_aging(self, db: Session, as_of: Optional[date] = None) -> PayablesAgingResponse:
        today = date.today()
        as_of = min(as_of or today, today)
        historical = as_of < today

        query = (
            db.query(SupplierBill)
            .options(selectinload(SupplierBill.supplier))
            .filter(SupplierBill.status != "cancelled", SupplierBill.bill_date <= as_of)
        )
        if historical:
            query = query.options(selectinload(SupplierBill.payments))
        else:
            query = query.filter(SupplierBill.status != "paid", SupplierBill.balance_payable > 0.005)
        bills = query.order_by(SupplierBill.due_date.asc()).all()

        rows: List[Dict[str, Any]] = []
        items: List[AgingBillItem] = []
        due_7 = 0.0
        due_30 = 0.0
        for b in bills:
            rate = _rate(b.exchange_rate_to_usd)
            if historical:
                paid = 0.0
                for p in b.payments or []:
                    if p.payment_date > as_of:
                        continue
                    if (p.currency or b.currency) == b.currency:
                        paid += p.amount_paid
                    else:
                        paid += p.amount_paid / _rate(p.exchange_rate_to_usd) * rate
                balance = max(0.0, b.amount_billed - paid)
            else:
                paid = b.amount_paid
                balance = b.balance_payable
            if balance <= 0.005:
                continue

            balance_usd = balance / rate
            days = (as_of - b.due_date).days
            if -7 <= days <= 0:
                due_7 += balance_usd
            if -30 <= days <= 0:
                due_30 += balance_usd

            name = b.supplier.name if b.supplier else "Unknown Supplier"
            rows.append({"party_id": b.supplier_id, "party_name": name, "days_overdue": days, "balance_usd": balance_usd})
            items.append(
                AgingBillItem(
                    bill_id=b.id,
                    bill_number=b.bill_number,
                    supplier_id=b.supplier_id,
                    supplier_name=name,
                    bill_date=b.bill_date,
                    due_date=b.due_date,
                    days_overdue=max(0, days),
                    bucket=_bucket_for(days),
                    currency=b.currency,
                    amount_billed=_r2(b.amount_billed),
                    amount_paid=_r2(paid),
                    balance_payable=_r2(balance),
                    balance_payable_usd=_r2(balance_usd),
                    status=b.status,
                )
            )

        buckets, parties, total, overdue, avg_days = self._build_aging(rows, labels_index=2)
        items.sort(key=lambda x: (-x.days_overdue, x.due_date))
        return PayablesAgingResponse(
            as_of_date=as_of,
            total_payable_usd=_r2(total),
            total_overdue_usd=_r2(overdue),
            overdue_percent=_pct(overdue, total),
            documents_count=len(items),
            weighted_avg_days_overdue=avg_days,
            due_next_7_days_usd=_r2(due_7),
            due_next_30_days_usd=_r2(due_30),
            buckets=buckets,
            by_party=parties,
            pending_bills=items,
        )

    # ==========================================
    # 3. PROFITABILITY REPORT (TRIP & PERIOD)
    # ==========================================
    def get_profitability_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        include_drafts: bool = False,
    ) -> ProfitabilityReportResponse:
        invoices = self._load_invoices(db, start_date, end_date, include_drafts, with_line_items=True)
        costs = self._invoice_costs(db, invoices)

        total_rev = 0.0
        total_cost = 0.0
        loss_count = 0
        missing_cost = 0
        items: List[BookingProfitabilityItem] = []
        by_dest: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        by_cons: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))

        for inv in invoices:
            rev = inv.total_amount / _rate(inv.exchange_rate_to_usd)
            cost, source = costs.get(inv.id, (0.0, "none"))
            profit = rev - cost
            total_rev += rev
            total_cost += cost
            if profit < 0:
                loss_count += 1
            if source == "none":
                missing_cost += 1

            dest = _invoice_destination(inv)
            consultant = (inv.consultant_name or "").strip() or "Unassigned / Website"
            for bucket, key in ((by_dest, dest), (by_cons, consultant)):
                bucket[key]["count"] += 1
                bucket[key]["rev"] += rev
                bucket[key]["cost"] += cost

            items.append(
                BookingProfitabilityItem(
                    booking_id=inv.booking_id,
                    invoice_id=inv.id,
                    invoice_number=inv.invoice_number,
                    invoice_date=inv.invoice_date,
                    client_name=_invoice_client_name(inv),
                    consultant_name=consultant,
                    service_description=_invoice_description(inv),
                    destination=dest,
                    cost_source=source,
                    revenue_usd=_r2(rev),
                    cost_usd=_r2(cost),
                    gross_profit_usd=_r2(profit),
                    gross_margin_percent=_pct(profit, rev),
                )
            )

        def _groups(src: Dict[str, Dict[str, float]]) -> List[ProfitabilityGroupItem]:
            out = [
                ProfitabilityGroupItem(
                    label=k,
                    invoices_count=int(v["count"]),
                    revenue_usd=_r2(v["rev"]),
                    cost_usd=_r2(v["cost"]),
                    gross_profit_usd=_r2(v["rev"] - v["cost"]),
                    gross_margin_percent=_pct(v["rev"] - v["cost"], v["rev"]),
                )
                for k, v in src.items()
            ]
            return sorted(out, key=lambda g: g.gross_profit_usd, reverse=True)

        items.sort(key=lambda x: (x.invoice_date or date.min, x.invoice_id), reverse=True)
        gross = total_rev - total_cost
        return ProfitabilityReportResponse(
            start_date=start_date,
            end_date=end_date,
            include_drafts=include_drafts,
            total_revenue_usd=_r2(total_rev),
            total_cost_usd=_r2(total_cost),
            total_gross_profit_usd=_r2(gross),
            average_margin_percent=_pct(gross, total_rev),
            invoices_count=len(items),
            loss_making_count=loss_count,
            missing_cost_count=missing_cost,
            by_destination=_groups(by_dest),
            by_consultant=_groups(by_cons),
            items=items,
        )

    # ==========================================
    # 4. CASH-FLOW REPORT
    # ==========================================
    def get_cash_flow_report(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        granularity: Optional[str] = None,
    ) -> CashFlowReportResponse:
        end_date = end_date or date.today()
        start_date = start_date or (end_date - timedelta(days=29))
        if start_date > end_date:
            start_date, end_date = end_date, start_date
        gran = _resolve_granularity(granularity, start_date, end_date)

        receipts = (
            db.query(PaymentReceipt)
            .options(selectinload(PaymentReceipt.client), selectinload(PaymentReceipt.invoice).selectinload(Invoice.client))
            .filter(
                PaymentReceipt.receipt_date >= start_date,
                PaymentReceipt.receipt_date <= end_date,
                PaymentReceipt.payment_status != "reversed",
            )
            .all()
        )
        payments = (
            db.query(SupplierPayment)
            .options(selectinload(SupplierPayment.supplier))
            .filter(SupplierPayment.payment_date >= start_date, SupplierPayment.payment_date <= end_date)
            .all()
        )

        periods: Dict[date, Dict[str, float]] = {p: defaultdict(float) for p in _iter_periods(start_date, end_date, gran)}
        in_method: Dict[str, float] = defaultdict(float)
        out_method: Dict[str, float] = defaultdict(float)
        by_client: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        by_supplier: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        total_in = 0.0
        total_out = 0.0

        for r in receipts:
            usd = r.amount_received / _rate(r.exchange_rate_to_usd)
            total_in += usd
            in_method[_humanise(r.payment_method)] += usd
            payer = by_client[_receipt_payer(r)]
            payer["count"] += 1
            payer["amount"] += usd
            p = periods.setdefault(_period_start(r.receipt_date, gran), defaultdict(float))
            p["in"] += usd
            p["in_count"] += 1

        for pay in payments:
            usd = pay.amount_paid / _rate(pay.exchange_rate_to_usd)
            total_out += usd
            out_method[_humanise(pay.payment_method)] += usd
            sup = by_supplier[pay.supplier.name if pay.supplier else "Unknown Supplier"]
            sup["count"] += 1
            sup["amount"] += usd
            p = periods.setdefault(_period_start(pay.payment_date, gran), defaultdict(float))
            p["out"] += usd
            p["out_count"] += 1

        timeline: List[CashFlowDailyItem] = []
        running = 0.0
        for start, v in sorted(periods.items()):
            net = v["in"] - v["out"]
            running += net
            key, label = _period_key_label(start, gran)
            timeline.append(
                CashFlowDailyItem(
                    date=start,
                    period=key,
                    period_label=label,
                    inflow_usd=_r2(v["in"]),
                    outflow_usd=_r2(v["out"]),
                    net_usd=_r2(net),
                    cumulative_net_usd=_r2(running),
                    receipts_count=int(v["in_count"]),
                    payments_count=int(v["out_count"]),
                )
            )

        def _sorted_dict(d: Dict[str, float]) -> Dict[str, float]:
            return {k: _r2(v) for k, v in sorted(d.items(), key=lambda kv: kv[1], reverse=True)}

        return CashFlowReportResponse(
            start_date=start_date,
            end_date=end_date,
            granularity=gran,
            total_inflow_usd=_r2(total_in),
            total_outflow_usd=_r2(total_out),
            net_cash_flow_usd=_r2(total_in - total_out),
            receipts_count=len(receipts),
            payments_count=len(payments),
            inflows_by_method=_sorted_dict(in_method),
            outflows_by_method=_sorted_dict(out_method),
            inflows_by_client=_top_labels(by_client, total_in),
            outflows_by_supplier=_top_labels(by_supplier, total_out),
            daily_timeline=timeline,
        )

    # ==========================================
    # 5. EXECUTIVE SUMMARY
    # ==========================================
    def get_executive_summary(
        self,
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        granularity: Optional[str] = None,
        include_drafts: bool = False,
    ) -> ExecutiveSummaryResponse:
        today = date.today()
        end_date = end_date or today
        start_date = start_date or date(end_date.year, 1, 1)
        if start_date > end_date:
            start_date, end_date = end_date, start_date
        gran = _resolve_granularity(granularity, start_date, end_date)
        if gran == "day" and (end_date - start_date).days > 31:
            gran = "week"

        sales = self.get_sales_report(db, start_date, end_date, gran, include_drafts)
        profit = self.get_profitability_report(db, start_date, end_date, include_drafts)
        cash = self.get_cash_flow_report(db, start_date, end_date, gran)
        as_of = min(end_date, today)
        ar = self.get_receivables_aging(db, as_of)
        ap = self.get_payables_aging(db, as_of)

        return ExecutiveSummaryResponse(
            start_date=start_date,
            end_date=end_date,
            as_of_date=as_of,
            granularity=gran,
            invoiced_usd=sales.total_invoiced_usd,
            invoices_count=sales.invoices_count,
            average_order_value_usd=sales.average_order_value_usd,
            invoiced_change_percent=sales.comparison.invoiced_change_percent if sales.comparison else None,
            gross_profit_usd=profit.total_gross_profit_usd,
            gross_margin_percent=profit.average_margin_percent,
            cash_in_usd=cash.total_inflow_usd,
            cash_out_usd=cash.total_outflow_usd,
            net_cash_usd=cash.net_cash_flow_usd,
            receivables_usd=ar.total_receivable_usd,
            receivables_overdue_usd=ar.total_overdue_usd,
            payables_usd=ap.total_payable_usd,
            payables_overdue_usd=ap.total_overdue_usd,
            net_working_position_usd=_r2(ar.total_receivable_usd - ap.total_payable_usd),
            trend=sales.period_breakdown,
            cash_trend=cash.daily_timeline,
            top_destinations=sales.destination_breakdown[:6],
            top_consultants=sales.consultant_breakdown[:6],
            top_debtors=ar.by_party[:6],
            receivable_buckets=ar.buckets,
            payable_buckets=ap.buckets,
        )


report_service = ReportService()
