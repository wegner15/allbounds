from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse
from app.schemas.hotel_type import HotelTypeResponse

# Base Hotel Schema
class HotelBase(BaseModel):
    name: str = Field(..., description="Name of the hotel", example="Hilton Hotel")
    summary: Optional[str] = Field(None, description="Brief summary of the hotel")
    description: Optional[str] = Field(None, description="Detailed description of the hotel")
    country_id: int = Field(..., description="ID of the country this hotel belongs to")
    hotel_type_id: Optional[int] = Field(None, description="ID of the hotel type")
    stars: Optional[float] = Field(None, description="Star rating of the hotel (1-5)", ge=0, le=5)
    address: Optional[str] = Field(None, description="Physical address of the hotel")
    city: Optional[str] = Field(None, description="City where the hotel is located")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the hotel")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the hotel")
    price_category: Optional[str] = Field(None, description="Price category (e.g., Budget, Mid-range, Luxury)")
    amenities: Optional[Dict[str, Any]] = Field(None, description="Amenities offered by the hotel")
    check_in_time: Optional[str] = Field(None, description="Standard check-in time")
    check_out_time: Optional[str] = Field(None, description="Standard check-out time")
    image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the hotel's primary image")
    
# Schema for creating a new Hotel
class HotelCreate(HotelBase):
    pass

# Schema for updating a Hotel
class HotelUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the hotel")
    summary: Optional[str] = Field(None, description="Brief summary of the hotel")
    description: Optional[str] = Field(None, description="Detailed description of the hotel")
    country_id: Optional[int] = Field(None, description="ID of the country this hotel belongs to")
    hotel_type_id: Optional[int] = Field(None, description="ID of the hotel type")
    stars: Optional[float] = Field(None, description="Star rating of the hotel (1-5)", ge=0, le=5)
    address: Optional[str] = Field(None, description="Physical address of the hotel")
    city: Optional[str] = Field(None, description="City where the hotel is located")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the hotel")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the hotel")
    price_category: Optional[str] = Field(None, description="Price category (e.g., Budget, Mid-range, Luxury)")
    amenities: Optional[Dict[str, Any]] = Field(None, description="Amenities offered by the hotel")
    check_in_time: Optional[str] = Field(None, description="Standard check-in time")
    check_out_time: Optional[str] = Field(None, description="Standard check-out time")
    image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the hotel's primary image")
    is_active: Optional[bool] = Field(None, description="Whether the hotel is active")

# Schema for Hotel response
class HotelResponse(HotelBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the hotel", example="hilton-hotel")
    is_active: bool = Field(..., description="Whether the hotel is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schema for Hotel with Country details
class HotelWithCountryResponse(HotelResponse):
    country: CountryResponse
    hotel_type: Optional[HotelTypeResponse] = None
    
    class Config:
        from_attributes = True

# Schema for Hotel with package relationships
class HotelWithRelationshipsResponse(HotelWithCountryResponse):
    package_ids: Optional[List[int]] = Field(None, description="IDs of packages associated with this hotel")
    group_trip_ids: Optional[List[int]] = Field(None, description="IDs of group trips associated with this hotel")
    
    class Config:
        from_attributes = True
