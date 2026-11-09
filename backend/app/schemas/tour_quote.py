from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field

STATUSES = {"draft", "submitted", "approved", "rejected", "converted"}


class ScenarioIn(BaseModel):
    id: Optional[int] = None
    label: Optional[str] = None
    pax: int = Field(2, ge=1)
    foc_count: int = Field(0, ge=0)
    rooms: int = Field(1, ge=0)


class DayIn(BaseModel):
    day_number: int = Field(ge=1)
    title: Optional[str] = None
    description: Optional[str] = None


class ItemIn(BaseModel):
    day_number: Optional[int] = None
    component_type: str = "other"
    description: str
    cost_basis: str = "per_person"
    unit_cost: float = Field(0.0, ge=0)
    tax_amount: float = Field(0.0, ge=0)
    qty: float = Field(1.0, ge=0)
    capacity: Optional[int] = Field(None, ge=1)
    supplier_id: Optional[int] = None
    rate_card_item_id: Optional[int] = None
    is_optional: bool = False
    sort_order: int = 0


class DiscountIn(BaseModel):
    label: str
    mode: str = "percent"  # percent | amount
    value: float = Field(0.0, ge=0)
    scope: str = "total"  # total | per_person


class QuoteBase(BaseModel):
    name: str
    destination: Optional[str] = None
    category: Optional[str] = None
    client_id: Optional[int] = None
    client_name: Optional[str] = None
    lead_reference: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    currency: str = "USD"
    pricing_method: str = "markup"
    pricing_value: float = Field(20.0, ge=0)
    contingency_percent: float = Field(0.0, ge=0)
    tax_enabled: bool = False
    tax_name: Optional[str] = "VAT"
    tax_rate: float = Field(0.0, ge=0)
    tax_inclusive: bool = False
    notes: Optional[str] = None


class QuoteWrite(QuoteBase):
    scenarios: List[ScenarioIn] = []
    days: List[DayIn] = []
    items: List[ItemIn] = []
    discounts: List[DiscountIn] = []


class ScenarioOut(ScenarioIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DayOut(DayIn):
    model_config = ConfigDict(from_attributes=True)


class ItemOut(ItemIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class DiscountOut(DiscountIn):
    model_config = ConfigDict(from_attributes=True)


class QuoteOut(QuoteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    quote_number: str
    status: str
    prepared_by: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    invoice_id: Optional[int] = None
    converted_scenario_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    scenarios: List[ScenarioOut] = []
    days: List[DayOut] = []
    items: List[ItemOut] = []
    discounts: List[DiscountOut] = []
    results: List[Dict[str, Any]] = []


class QuoteListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    quote_number: str
    name: str
    destination: Optional[str] = None
    client_name: Optional[str] = None
    start_date: Optional[date] = None
    currency: str
    status: str
    invoice_id: Optional[int] = None
    created_at: Optional[datetime] = None
    scenario_summaries: List[Dict[str, Any]] = []


class ConvertRequest(BaseModel):
    scenario_id: int
    due_date: Optional[date] = None
    payment_terms: Optional[str] = None
