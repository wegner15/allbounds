from typing import Optional, List, Dict, Literal
from datetime import date
from pydantic import BaseModel


Granularity = Literal["day", "week", "month", "quarter"]


# ==========================================
# SHARED
# ==========================================

class AmountByLabel(BaseModel):
    label: str
    count: int = 0
    amount_usd: float = 0.0
    percentage: float = 0.0


# ==========================================
# 1. SALES REPORT
# ==========================================

class SalesByPeriodItem(BaseModel):
    period: str          # Sortable key, e.g. "2026-09", "2026-Q3", "2026-W36", "2026-09-14"
    period_label: str    # Human label, e.g. "Sep 2026", "Q3 2026"
    period_start: date
    invoices_count: int
    gross_revenue_usd: float
    discount_usd: float
    net_revenue_usd: float
    collected_usd: float
    outstanding_usd: float


class SalesByDestinationItem(BaseModel):
    destination: str
    bookings_count: int
    total_sales_usd: float
    percentage_of_total: float


class SalesByConsultantItem(BaseModel):
    consultant_name: str
    invoices_count: int
    total_sales_usd: float
    collected_usd: float = 0.0
    outstanding_usd: float = 0.0
    percentage_of_total: float = 0.0


class SalesComparison(BaseModel):
    previous_start_date: date
    previous_end_date: date
    previous_invoiced_usd: float
    previous_collected_usd: float
    previous_invoices_count: int
    invoiced_change_percent: Optional[float] = None
    collected_change_percent: Optional[float] = None
    invoices_count_change_percent: Optional[float] = None


class SalesReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    granularity: Granularity = "month"
    include_drafts: bool = False
    total_gross_usd: float = 0.0
    total_discount_usd: float = 0.0
    total_invoiced_usd: float
    total_collected_usd: float
    total_outstanding_usd: float
    collection_rate_percent: float = 0.0
    invoices_count: int
    average_order_value_usd: float
    comparison: Optional[SalesComparison] = None
    period_breakdown: List[SalesByPeriodItem] = []
    destination_breakdown: List[SalesByDestinationItem] = []
    consultant_breakdown: List[SalesByConsultantItem] = []
    status_breakdown: List[AmountByLabel] = []


# ==========================================
# 2. AGING REPORTS (RECEIVABLES & PAYABLES)
# ==========================================

AGING_BUCKET_KEYS = ["current", "d1_30", "d31_60", "d61_90", "d90_plus"]


class AgingBucketItem(BaseModel):
    key: str = ""        # current | d1_30 | d31_60 | d61_90 | d90_plus
    bucket_label: str
    count: int
    total_amount_usd: float
    percentage: float


class AgingPartyRow(BaseModel):
    """One row of an aged debtors / creditors matrix (per client or supplier)."""
    party_id: Optional[int] = None
    party_name: str
    documents_count: int
    current_usd: float = 0.0
    d1_30_usd: float = 0.0
    d31_60_usd: float = 0.0
    d61_90_usd: float = 0.0
    d90_plus_usd: float = 0.0
    total_usd: float = 0.0
    oldest_days_overdue: int = 0


class AgingInvoiceItem(BaseModel):
    invoice_id: int
    invoice_number: str
    client_id: Optional[int] = None
    client_name: str
    invoice_date: date
    due_date: date
    days_overdue: int
    bucket: str = "current"
    currency: str
    total_amount: float
    amount_paid: float
    balance_due: float
    balance_due_usd: float
    status: str


class ReceivablesAgingResponse(BaseModel):
    as_of_date: date
    total_receivable_usd: float
    total_overdue_usd: float = 0.0
    overdue_percent: float = 0.0
    documents_count: int = 0
    weighted_avg_days_overdue: float = 0.0
    buckets: List[AgingBucketItem] = []
    by_party: List[AgingPartyRow] = []
    overdue_invoices: List[AgingInvoiceItem] = []


class AgingBillItem(BaseModel):
    bill_id: int
    bill_number: str
    supplier_id: Optional[int] = None
    supplier_name: str
    bill_date: date
    due_date: date
    days_overdue: int
    bucket: str = "current"
    currency: str
    amount_billed: float
    amount_paid: float
    balance_payable: float
    balance_payable_usd: float
    status: str


class PayablesAgingResponse(BaseModel):
    as_of_date: date
    total_payable_usd: float
    total_overdue_usd: float = 0.0
    overdue_percent: float = 0.0
    documents_count: int = 0
    weighted_avg_days_overdue: float = 0.0
    due_next_7_days_usd: float = 0.0
    due_next_30_days_usd: float = 0.0
    buckets: List[AgingBucketItem] = []
    by_party: List[AgingPartyRow] = []
    pending_bills: List[AgingBillItem] = []


# ==========================================
# 3. PROFITABILITY REPORT (TRIP & PERIOD)
# ==========================================

class BookingProfitabilityItem(BaseModel):
    booking_id: Optional[int] = None
    invoice_id: int
    invoice_number: str
    invoice_date: Optional[date] = None
    client_name: str
    consultant_name: Optional[str] = None
    service_description: str
    destination: Optional[str] = None
    cost_source: str = "line_items"   # bills | supplier_expenses | line_items | none
    revenue_usd: float
    cost_usd: float
    gross_profit_usd: float
    gross_margin_percent: float


class ProfitabilityGroupItem(BaseModel):
    label: str
    invoices_count: int
    revenue_usd: float
    cost_usd: float
    gross_profit_usd: float
    gross_margin_percent: float


class ProfitabilityReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    include_drafts: bool = False
    total_revenue_usd: float
    total_cost_usd: float
    total_gross_profit_usd: float
    average_margin_percent: float
    invoices_count: int = 0
    loss_making_count: int = 0
    missing_cost_count: int = 0
    by_destination: List[ProfitabilityGroupItem] = []
    by_consultant: List[ProfitabilityGroupItem] = []
    items: List[BookingProfitabilityItem] = []


# ==========================================
# 4. CASH-FLOW REPORT
# ==========================================

class CashFlowDailyItem(BaseModel):
    """Kept for backward compatibility – one row per period (not necessarily a day)."""
    date: date
    period: str = ""
    period_label: str = ""
    inflow_usd: float
    outflow_usd: float
    net_usd: float
    cumulative_net_usd: float = 0.0
    receipts_count: int = 0
    payments_count: int = 0


class CashFlowReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    granularity: Granularity = "day"
    total_inflow_usd: float
    total_outflow_usd: float
    net_cash_flow_usd: float
    receipts_count: int = 0
    payments_count: int = 0
    inflows_by_method: Dict[str, float] = {}
    outflows_by_method: Dict[str, float] = {}
    outflows_by_supplier: List[AmountByLabel] = []
    inflows_by_client: List[AmountByLabel] = []
    daily_timeline: List[CashFlowDailyItem] = []


# ==========================================
# 5. EXECUTIVE SUMMARY
# ==========================================

class ExecutiveSummaryResponse(BaseModel):
    start_date: date
    end_date: date
    as_of_date: date
    granularity: Granularity
    # Sales
    invoiced_usd: float
    invoices_count: int
    average_order_value_usd: float
    invoiced_change_percent: Optional[float] = None
    # Profitability
    gross_profit_usd: float
    gross_margin_percent: float
    # Cash
    cash_in_usd: float
    cash_out_usd: float
    net_cash_usd: float
    # Position (as of today)
    receivables_usd: float
    receivables_overdue_usd: float
    payables_usd: float
    payables_overdue_usd: float
    net_working_position_usd: float
    # Breakdowns
    trend: List[SalesByPeriodItem] = []
    cash_trend: List[CashFlowDailyItem] = []
    top_destinations: List[SalesByDestinationItem] = []
    top_consultants: List[SalesByConsultantItem] = []
    top_debtors: List[AgingPartyRow] = []
    receivable_buckets: List[AgingBucketItem] = []
    payable_buckets: List[AgingBucketItem] = []
