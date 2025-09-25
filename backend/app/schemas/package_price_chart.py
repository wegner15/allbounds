from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date

# Base Price Chart Schema
class PackagePriceChartBase(BaseModel):
    title: str = Field(..., description="Title of the price chart period", example="Summer 2025")
    start_date: date = Field(..., description="Start date of the price period")
    end_date: date = Field(..., description="End date of the price period")
    price: float = Field(..., description="Price in USD for this period", ge=0)

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

# Schema for creating a new Price Chart
class PackagePriceChartCreate(PackagePriceChartBase):
    package_id: int = Field(..., description="ID of the package this price chart belongs to")
    is_active: Optional[bool] = Field(True, description="Whether the price chart is active")

# Schema for updating a Price Chart
class PackagePriceChartUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the price chart period")
    start_date: Optional[date] = Field(None, description="Start date of the price period")
    end_date: Optional[date] = Field(None, description="End date of the price period")
    price: Optional[float] = Field(None, description="Price in USD for this period", ge=0)
    is_active: Optional[bool] = Field(None, description="Whether the price chart is active")

    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if v is not None and 'start_date' in values and values['start_date'] is not None and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

# Schema for Price Chart response
class PackagePriceChartResponse(PackagePriceChartBase):
    id: int
    package_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Schema for bulk create/update of price charts
class PackagePriceChartBulkCreate(BaseModel):
    package_id: int = Field(..., description="ID of the package these price charts belong to")
    price_charts: List[PackagePriceChartBase] = Field(..., description="List of price charts to create")

# Schema for bulk update of price charts
class PackagePriceChartBulkUpdate(BaseModel):
    price_charts: List[PackagePriceChartUpdate] = Field(..., description="List of price charts to update")
