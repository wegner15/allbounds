from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, date


# Hotel Summary for Price Chart Hotel Options
class PriceChartHotelSummaryResponse(BaseModel):
    id: int
    name: str
    slug: str
    stars: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    price_category: Optional[str] = None
    image_url: Optional[str] = None
    cover_image: Optional[str] = None
    image_id: Optional[str] = None
    summary: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


# Price Chart Hotel Option Schemas
class PriceChartHotelOptionBase(BaseModel):
    hotel_id: int = Field(..., description="ID of the hotel")
    price_supplement: float = Field(default=0.0, description="Extra price supplement in USD per person (0.0 for included)")
    room_type: Optional[str] = Field(None, description="Room or accommodation tier name, e.g. Standard, Luxury Tent")
    is_default: bool = Field(default=False, description="Whether this is the default selected option")
    is_active: bool = Field(default=True, description="Whether this option is active")
    order_index: int = Field(default=0, description="Display order index")

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class PriceChartHotelOptionCreate(PriceChartHotelOptionBase):
    price_chart_id: Optional[int] = Field(None, description="ID of the price chart")


class PriceChartHotelOptionUpdate(BaseModel):
    hotel_id: Optional[int] = None
    price_supplement: Optional[float] = None
    room_type: Optional[str] = None
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class PriceChartHotelOptionResponse(PriceChartHotelOptionBase):
    id: int
    price_chart_id: int
    hotel: Optional[PriceChartHotelSummaryResponse] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


# Base Price Chart Schema
class PackagePriceChartBase(BaseModel):
    title: str = Field(..., description="Title of the price chart period", example="Summer 2025")
    start_date: date = Field(..., description="Start date of the price period")
    end_date: date = Field(..., description="End date of the price period")
    price: float = Field(..., description="Price in USD for this period", ge=0)
    booking_price: Optional[float] = Field(None, description="Optional booking/deposit price in USD (defaults to price if blank)", ge=0)
    notes: Optional[str] = Field(None, description="Optional notes relevant to this price period")

    model_config = ConfigDict(from_attributes=True, extra='ignore')

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start_date(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


# Schema for creating a new Price Chart
class PackagePriceChartCreate(PackagePriceChartBase):
    package_id: int = Field(..., description="ID of the package this price chart belongs to")
    is_active: Optional[bool] = Field(True, description="Whether the price chart is active")
    hotel_options: Optional[List[PriceChartHotelOptionBase]] = Field(default_factory=list, description="Hotel options with supplements")


# Schema for updating a Price Chart
class PackagePriceChartUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the price chart period")
    start_date: Optional[date] = Field(None, description="Start date of the price period")
    end_date: Optional[date] = Field(None, description="End date of the price period")
    price: Optional[float] = Field(None, description="Price in USD for this period", ge=0)
    booking_price: Optional[float] = Field(None, description="Optional booking/deposit price in USD", ge=0)
    notes: Optional[str] = Field(None, description="Optional notes relevant to this price period")
    is_active: Optional[bool] = Field(None, description="Whether the price chart is active")
    hotel_options: Optional[List[PriceChartHotelOptionBase]] = Field(None, description="Hotel options with supplements")

    model_config = ConfigDict(from_attributes=True, extra='ignore')

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start_date(cls, v, info):
        if v is not None and 'start_date' in info.data and info.data['start_date'] is not None and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


# Schema for Price Chart response
class PackagePriceChartResponse(PackagePriceChartBase):
    id: int
    package_id: int
    is_active: bool
    hotel_options: List[PriceChartHotelOptionResponse] = Field(default_factory=list, description="Attached hotel options")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra='ignore')


# Schema for bulk create/update of price charts
class PackagePriceChartBulkCreate(BaseModel):
    package_id: int = Field(..., description="ID of the package these price charts belong to")
    price_charts: List[PackagePriceChartBase] = Field(..., description="List of price charts to create")


# Schema for bulk update of price charts
class PackagePriceChartBulkUpdate(BaseModel):
    price_charts: List[PackagePriceChartUpdate] = Field(..., description="List of price charts to update")
