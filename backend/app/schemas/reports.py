from typing import Optional, List, Dict, Any
from datetime import date
from pydantic import BaseModel


# ==========================================
# 1. SALES REPORT
# ==========================================

class SalesByPeriodItem(BaseModel):
    period: str  # e.g. "2026-09", "2026-Q3", "2026"
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


class SalesReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_invoiced_usd: float
    total_collected_usd: float
    total_outstanding_usd: float
    invoices_count: int
    average_order_value_usd: float
    period_breakdown: List[SalesByPeriodItem] = []
    destination_breakdown: List[SalesByDestinationItem] = []
    consultant_breakdown: List[SalesByConsultantItem] = []


# ==========================================
# 2. AGING REPORTS (RECEIVABLES & PAYABLES)
# ==========================================

class AgingBucketItem(BaseModel):
    bucket_label: str  # "Current", "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"
    count: int
    total_amount_usd: float
    percentage: float


class AgingInvoiceItem(BaseModel):
    invoice_id: int
    invoice_number: str
    client_name: str
    invoice_date: date
    due_date: date
    days_overdue: int
    currency: str
    total_amount: float
    amount_paid: float
    balance_due: float
    balance_due_usd: float
    status: str


class ReceivablesAgingResponse(BaseModel):
    as_of_date: date
    total_receivable_usd: float
    buckets: List[AgingBucketItem] = []
    overdue_invoices: List[AgingInvoiceItem] = []


class AgingBillItem(BaseModel):
    bill_id: int
    bill_number: str
    supplier_name: str
    bill_date: date
    due_date: date
    days_overdue: int
    currency: str
    amount_billed: float
    amount_paid: float
    balance_payable: float
    balance_payable_usd: float
    status: str


class PayablesAgingResponse(BaseModel):
    as_of_date: date
    total_payable_usd: float
    buckets: List[AgingBucketItem] = []
    pending_bills: List[AgingBillItem] = []


# ==========================================
# 3. PROFITABILITY REPORT (TRIP & PERIOD)
# ==========================================

class BookingProfitabilityItem(BaseModel):
    booking_id: Optional[int] = None
    invoice_id: int
    invoice_number: str
    client_name: str
    service_description: str
    destination: Optional[str] = None
    revenue_usd: float
    cost_usd: float
    gross_profit_usd: float
    gross_margin_percent: float


class ProfitabilityReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_revenue_usd: float
    total_cost_usd: float
    total_gross_profit_usd: float
    average_margin_percent: float
    items: List[BookingProfitabilityItem] = []


# ==========================================
# 4. CASH-FLOW REPORT
# ==========================================

class CashFlowDailyItem(BaseModel):
    date: date
    inflow_usd: float   # From client receipts
    outflow_usd: float  # From supplier payments
    net_usd: float


class CashFlowReportResponse(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_inflow_usd: float
    total_outflow_usd: float
    net_cash_flow_usd: float
    inflows_by_method: Dict[str, float] = {}
    outflows_by_method: Dict[str, float] = {}
    daily_timeline: List[CashFlowDailyItem] = []
