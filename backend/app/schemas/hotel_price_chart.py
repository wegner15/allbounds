from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime, date


# ==========================================
# Hotel Price Chart Night Rates Schemas
# ==========================================

class HotelPriceChartNightRateBase(BaseModel):
    nights: int = Field(..., description="Number of nights for this stay duration", ge=1, example=3)
    price: float = Field(..., description="Total rate in USD for this number of nights", ge=0, example=450.0)
    price_per_night: Optional[float] = Field(None, description="Computed or explicit rate per night", ge=0)
    room_type: Optional[str] = Field(None, description="Room category or suite name", example="Standard Deluxe Room")
    meal_plan: Optional[str] = Field(None, description="Meal plan", example="Bed & Breakfast")
    is_default: bool = Field(default=False, description="Whether this is the default selected duration")
    order_index: int = Field(default=0, description="Display column order index")
    is_active: bool = Field(default=True, description="Whether this night rate option is active")

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class HotelPriceChartNightRateCreate(HotelPriceChartNightRateBase):
    price_chart_id: Optional[int] = Field(None, description="ID of parent price chart")


class HotelPriceChartNightRateUpdate(BaseModel):
    nights: Optional[int] = Field(None, ge=1)
    price: Optional[float] = Field(None, ge=0)
    price_per_night: Optional[float] = Field(None, ge=0)
    room_type: Optional[str] = None
    meal_plan: Optional[str] = None
    is_default: Optional[bool] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class HotelPriceChartNightRateResponse(HotelPriceChartNightRateBase):
    id: int
    price_chart_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


# ==========================================
# Hotel Price Chart Main Schemas
# ==========================================

class HotelPriceChartBase(BaseModel):
    title: str = Field(..., description="Title of the price chart period (e.g. Low Season, High Season, Peak Season)", example="High Season Rate")
    start_date: date = Field(..., description="Start date of the price period")
    end_date: date = Field(..., description="End date of the price period")
    price: float = Field(default=0.0, description="Base/Reference price in USD", ge=0)
    booking_price: Optional[float] = Field(None, description="Optional booking/deposit price in USD", ge=0)
    notes: Optional[str] = Field(None, description="Optional seasonal notes, meal policies or stay terms")
    night_rates: Optional[List[HotelPriceChartNightRateBase]] = Field(default_factory=list, description="List of variable night rates")

    model_config = ConfigDict(from_attributes=True, extra='ignore')

    @field_validator('end_date')
    @classmethod
    def end_date_must_be_after_start_date(cls, v, info):
        if 'start_date' in info.data and v < info.data['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class HotelPriceChartCreate(HotelPriceChartBase):
    hotel_id: int = Field(..., description="ID of the hotel")
    is_active: Optional[bool] = Field(True, description="Whether active")
    night_rates: Optional[List[HotelPriceChartNightRateCreate]] = Field(default_factory=list, description="Night rates to create")


class HotelPriceChartUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    price: Optional[float] = Field(None, ge=0)
    booking_price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    night_rates: Optional[List[HotelPriceChartNightRateCreate]] = None

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class HotelPriceChartResponse(HotelPriceChartBase):
    id: int
    hotel_id: int
    is_active: bool
    night_rates: List[HotelPriceChartNightRateResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, extra='ignore')
