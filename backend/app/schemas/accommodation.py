from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse

# Base Accommodation Schema
class AccommodationBase(BaseModel):
    name: str = Field(..., description="Name of the accommodation", example="Serena Hotel")
    summary: Optional[str] = Field(None, description="Brief summary of the accommodation")
    description: Optional[str] = Field(None, description="Detailed description of the accommodation")
    country_id: int = Field(..., description="ID of the country this accommodation belongs to")
    stars: Optional[float] = Field(None, description="Star rating of the accommodation (1-5)", ge=0, le=5)
    address: Optional[str] = Field(None, description="Physical address of the accommodation")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the accommodation")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the accommodation")
    amenities: Optional[List[str]] = Field(None, description="List of amenities offered by the accommodation")
    
# Schema for creating a new Accommodation
class AccommodationCreate(AccommodationBase):
    pass

# Schema for updating an Accommodation
class AccommodationUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the accommodation")
    summary: Optional[str] = Field(None, description="Brief summary of the accommodation")
    description: Optional[str] = Field(None, description="Detailed description of the accommodation")
    country_id: Optional[int] = Field(None, description="ID of the country this accommodation belongs to")
    stars: Optional[float] = Field(None, description="Star rating of the accommodation (1-5)", ge=0, le=5)
    address: Optional[str] = Field(None, description="Physical address of the accommodation")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the accommodation")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the accommodation")
    amenities: Optional[List[str]] = Field(None, description="List of amenities offered by the accommodation")
    is_active: Optional[bool] = Field(None, description="Whether the accommodation is active")

# Schema for Accommodation response
class AccommodationResponse(AccommodationBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the accommodation", example="serena-hotel")
    is_active: bool = Field(..., description="Whether the accommodation is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schema for Accommodation with Country details
class AccommodationWithCountryResponse(AccommodationResponse):
    country: CountryResponse
    
    class Config:
        from_attributes = True
