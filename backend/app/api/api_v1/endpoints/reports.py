from typing import Any, Optional
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user
from app.services.report_service import report_service
from app.schemas.reports import (
    SalesReportResponse,
    ReceivablesAgingResponse,
    PayablesAgingResponse,
    ProfitabilityReportResponse,
    CashFlowReportResponse,
)

router = APIRouter()


@router.get("/sales", response_model=SalesReportResponse)
def get_sales_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate Sales Performance Report with period, destination, and consultant breakdown."""
    return report_service.get_sales_report(db, start_date=start_date, end_date=end_date)


@router.get("/receivables-aging", response_model=ReceivablesAgingResponse)
def get_receivables_aging_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate Accounts Receivable Aging Report (Current, 1-30, 31-60, 61-90, 90+ days)."""
    return report_service.get_receivables_aging(db)


@router.get("/payables-aging", response_model=PayablesAgingResponse)
def get_payables_aging_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate Accounts Payable Aging Report (due dates and supplier liabilities)."""
    return report_service.get_payables_aging(db)


@router.get("/profitability", response_model=ProfitabilityReportResponse)
def get_profitability_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate Booking & Trip Profitability Report (Invoiced Revenue vs. Supplier Costs = Gross Margin)."""
    return report_service.get_profitability_report(db, start_date=start_date, end_date=end_date)


@router.get("/cash-flow", response_model=CashFlowReportResponse)
def get_cash_flow_report(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """Generate Cash-Flow Report (Actual cash receipts in vs. supplier disbursements out)."""
    return report_service.get_cash_flow_report(db, start_date=start_date, end_date=end_date)
