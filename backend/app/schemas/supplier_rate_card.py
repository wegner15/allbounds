from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field

COST_BASES = {"per_person", "per_group", "per_room", "per_vehicle", "per_booking"}


class RateCardItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    cost_basis: str = "per_person"
    unit: Optional[str] = None
    rate: float = Field(0.0, ge=0)
    tax_amount: float = Field(0.0, ge=0)
    room_occupancy: Optional[str] = None
    meal_plan: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    min_pax: Optional[int] = Field(None, ge=1)
    max_pax: Optional[int] = Field(None, ge=1)
    sort_order: int = 0
    is_active: bool = True


class RateCardItemCreate(RateCardItemBase):
    pass


class RateCardItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost_basis: Optional[str] = None
    unit: Optional[str] = None
    rate: Optional[float] = Field(None, ge=0)
    tax_amount: Optional[float] = Field(None, ge=0)
    room_occupancy: Optional[str] = None
    meal_plan: Optional[str] = None
    capacity: Optional[int] = None
    min_pax: Optional[int] = None
    max_pax: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class RateCardItemResponse(RateCardItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rate_card_id: int


class RateCardBase(BaseModel):
    supplier_id: int
    name: str
    quote_reference: Optional[str] = None
    service_type: str = "accommodation"
    destination: Optional[str] = None
    currency: str = "USD"
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool = True


class RateCardCreate(RateCardBase):
    items: List[RateCardItemCreate] = []


class RateCardUpdate(BaseModel):
    name: Optional[str] = None
    quote_reference: Optional[str] = None
    service_type: Optional[str] = None
    destination: Optional[str] = None
    currency: Optional[str] = None
    valid_from: Optional[date] = None
    valid_to: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class RateCardResponse(RateCardBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    supplier_name: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[RateCardItemResponse] = []
