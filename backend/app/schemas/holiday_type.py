from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base Holiday Type Schema
class HolidayTypeBase(BaseModel):
    name: str = Field(..., description="Name of the holiday type", example="Beach Holiday")
    description: Optional[str] = Field(None, description="Description of the holiday type")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the holiday type image")
    
# Schema for creating a new Holiday Type
class HolidayTypeCreate(HolidayTypeBase):
    slug: Optional[str] = Field(None, description="URL-friendly slug for the holiday type")

# Schema for updating a Holiday Type
class HolidayTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the holiday type")
    description: Optional[str] = Field(None, description="Description of the holiday type")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the holiday type image")
    is_active: Optional[bool] = Field(None, description="Whether the holiday type is active")

# Schema for Holiday Type response
class HolidayTypeResponse(HolidayTypeBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the holiday type", example="beach-holiday")
    is_active: bool = Field(..., description="Whether the holiday type is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
