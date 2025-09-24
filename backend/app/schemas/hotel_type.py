from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base HotelType Schema
class HotelTypeBase(BaseModel):
    name: str = Field(..., description="Name of the hotel type", example="Resort")
    description: Optional[str] = Field(None, description="Description of the hotel type")

# Schema for creating a new HotelType
class HotelTypeCreate(HotelTypeBase):
    pass

# Schema for updating a HotelType
class HotelTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the hotel type")
    description: Optional[str] = Field(None, description="Description of the hotel type")
    is_active: Optional[bool] = Field(None, description="Whether the hotel type is active")

# Schema for HotelType response
class HotelTypeResponse(HotelTypeBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the hotel type", example="resort")
    is_active: bool = Field(..., description="Whether the hotel type is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
