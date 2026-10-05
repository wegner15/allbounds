from typing import Any, Optional, Literal
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_finance_or_admin
from app.services.report_service import report_service
from app.schemas.reports import (
    SalesReportResponse,
    ReceivablesAgingResponse,
    PayablesAgingResponse,
    ProfitabilityReportResponse,
    CashFlowReportResponse,
    ExecutiveSummaryResponse,
)

router = APIRouter()

GranularityParam = Optional[Literal["day", "week", "month", "quarter"]]


@router.get("/executive-summary", response_model=ExecutiveSummaryResponse)
def get_executive_summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    granularity: GranularityParam = Query(None, description="Trend bucket size. Auto-selected from the range if omitted."),
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """One-page management summary: sales, margin, cash, receivables & payables position. Defaults to year-to-date."""
    return report_service.get_executive_summary(
        db, start_date=start_date, end_date=end_date, granularity=granularity, include_drafts=include_drafts
    )


@router.get("/sales", response_model=SalesReportResponse)
def get_sales_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    granularity: GranularityParam = Query(None, description="Period bucket size. Auto-selected from the range if omitted."),
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Sales performance with period, destination, consultant and status breakdown plus prior-period comparison."""
    return report_service.get_sales_report(
        db, start_date=start_date, end_date=end_date, granularity=granularity, include_drafts=include_drafts
    )


@router.get("/receivables-aging", response_model=ReceivablesAgingResponse)
def get_receivables_aging_report(
    as_of: Optional[date] = Query(None, description="Aging reference date (defaults to today)."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Aged debtors: buckets, per-client matrix and invoice detail (Current, 1-30, 31-60, 61-90, 90+ days)."""
    return report_service.get_receivables_aging(db, as_of=as_of)


@router.get("/payables-aging", response_model=PayablesAgingResponse)
def get_payables_aging_report(
    as_of: Optional[date] = Query(None, description="Aging reference date (defaults to today)."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Aged creditors: buckets, per-supplier matrix, upcoming due amounts and bill detail."""
    return report_service.get_payables_aging(db, as_of=as_of)


@router.get("/profitability", response_model=ProfitabilityReportResponse)
def get_profitability_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    include_drafts: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Trip profitability (revenue vs. supplier cost) per invoice, destination and consultant."""
    return report_service.get_profitability_report(
        db, start_date=start_date, end_date=end_date, include_drafts=include_drafts
    )


@router.get("/cash-flow", response_model=CashFlowReportResponse)
def get_cash_flow_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    granularity: GranularityParam = Query(None, description="Period bucket size. Auto-selected from the range if omitted."),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_finance_or_admin),
) -> Any:
    """Cash-flow statement: client receipts in vs. supplier disbursements out, with running balance."""
    return report_service.get_cash_flow_report(
        db, start_date=start_date, end_date=end_date, granularity=granularity
    )
