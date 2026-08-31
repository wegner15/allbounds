from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from app.schemas.package_price_chart import (
    PriceChartHotelOptionBase,
    PriceChartHotelOptionCreate,
    PriceChartHotelOptionUpdate,
    PriceChartHotelOptionResponse,
    PriceChartHotelSummaryResponse
)


class GroupTripPriceChartBase(BaseModel):
    title: str = Field(..., description="Title of the price chart period", example="Peak Season 2026")
    start_date: date = Field(..., description="Start date of the price period")
    end_date: date = Field(..., description="End date of the price period")
    price: float = Field(..., description="Price in USD for this period", ge=0)
    booking_price: Optional[float] = Field(None, description="Optional booking/deposit price in USD", ge=0)
    notes: Optional[str] = Field(None, description="Optional notes relevant to this price period")

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start_date(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class GroupTripPriceChartCreate(GroupTripPriceChartBase):
    group_trip_id: int = Field(..., description="ID of the group trip")
    is_active: Optional[bool] = Field(True, description="Whether active")
    hotel_options: Optional[List[PriceChartHotelOptionBase]] = Field(default_factory=list, description="Hotel options with supplements")


class GroupTripPriceChartUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    price: Optional[float] = Field(None, ge=0)
    booking_price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    hotel_options: Optional[List[PriceChartHotelOptionBase]] = Field(None, description="Hotel options with supplements")

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start_date(cls, v, info):
        if v is not None and 'start_date' in info.data and info.data['start_date'] is not None and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class GroupTripPriceChartResponse(GroupTripPriceChartBase):
    id: int
    group_trip_id: int
    is_active: bool
    hotel_options: List[PriceChartHotelOptionResponse] = Field(default_factory=list, description="Attached hotel options")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra='ignore')
