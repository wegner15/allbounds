from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date

class HotelPriceChartBase(BaseModel):
    title: str = Field(..., description="Title of the price chart period", example="High Season Rate")
    start_date: date = Field(..., description="Start date of the price period")
    end_date: date = Field(..., description="End date of the price period")
    price: float = Field(..., description="Price in USD for this period", ge=0)
    booking_price: Optional[float] = Field(None, description="Optional booking/deposit price in USD", ge=0)
    notes: Optional[str] = Field(None, description="Optional notes relevant to this price period")

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class HotelPriceChartCreate(HotelPriceChartBase):
    hotel_id: int = Field(..., description="ID of the hotel")
    is_active: Optional[bool] = Field(True, description="Whether active")

class HotelPriceChartUpdate(BaseModel):
    title: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    price: Optional[float] = Field(None, ge=0)
    booking_price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class HotelPriceChartResponse(HotelPriceChartBase):
    id: int
    hotel_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
