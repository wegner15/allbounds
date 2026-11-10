from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.utils.text import strip_html

STATUSES = {"draft", "submitted", "approved", "rejected", "converted"}


class ScenarioIn(BaseModel):
    id: Optional[int] = None
    label: Optional[str] = None
    pax: int = Field(2, ge=1)
    foc_count: int = Field(0, ge=0)
    rooms: int = Field(1, ge=0)

    @field_validator("pax", mode="before")
    @classmethod
    def coerce_pax(cls, v):
        return 2 if v is None else v

    @field_validator("foc_count", mode="before")
    @classmethod
    def coerce_foc(cls, v):
        return 0 if v is None else v

    @field_validator("rooms", mode="before")
    @classmethod
    def coerce_rooms(cls, v):
        return 1 if v is None else v


class DayIn(BaseModel):
    day_number: int = Field(ge=1)
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = Field(default_factory=list)

    @field_validator("title", "description", mode="before")
    @classmethod
    def clean_day_text(cls, v):
        return strip_html(v)

    @field_validator("images", mode="before")
    @classmethod
    def coerce_images(cls, v):
        if v is None:
            return []
        if isinstance(v, list):
            return v
        return [v] if v else []


class ItemIn(BaseModel):
    day_number: Optional[int] = None
    component_type: str = "other"
    description: str
    cost_basis: str = "per_person"
    unit_cost: float = Field(0.0, ge=0)
    tax_amount: float = Field(0.0, ge=0)
    qty: float = Field(1.0, ge=0)
    capacity: Optional[int] = Field(None, ge=1)
    image_url: Optional[str] = None
    supplier_id: Optional[int] = None
    rate_card_item_id: Optional[int] = None
    is_optional: bool = False
    sort_order: int = 0

    @field_validator("description", mode="before")
    @classmethod
    def clean_item_description(cls, v):
        cleaned = strip_html(v)
        return cleaned if cleaned is not None else (v or "")

    @field_validator("unit_cost", "tax_amount", mode="before")
    @classmethod
    def coerce_float(cls, v):
        return 0.0 if v is None else v

    @field_validator("qty", mode="before")
    @classmethod
    def coerce_qty(cls, v):
        return 1.0 if v is None else v

    @field_validator("is_optional", mode="before")
    @classmethod
    def coerce_bool(cls, v):
        return False if v is None else v

    @field_validator("sort_order", mode="before")
    @classmethod
    def coerce_sort(cls, v):
        return 0 if v is None else v


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


class CatalogueItemResponse(BaseModel):
    entity_type: str  # 'hotel', 'attraction', 'activity'
    entity_id: int
    name: str
    summary: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    country_name: Optional[str] = None
    image_url: Optional[str] = None
    suggested_component_type: str = "other"
    suggested_cost_basis: str = "per_person"
    default_price: Optional[float] = 0.0
    stars: Optional[float] = None
    price_category: Optional[str] = None

    @field_validator("name", "summary", "description", mode="before")
    @classmethod
    def clean_catalogue_text(cls, v):
        return strip_html(v)
