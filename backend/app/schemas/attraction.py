from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse

# Gallery image schema for attractions
class GalleryImageResponse(BaseModel):
    id: int
    file_path: str
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    
    class Config:
        from_attributes = True

# Base Attraction Schema
class AttractionBase(BaseModel):
    name: str = Field(..., description="Name of the attraction", example="Maasai Mara")
    summary: Optional[str] = Field(None, description="Brief summary of the attraction")
    description: Optional[str] = Field(None, description="Detailed description of the attraction")
    country_id: int = Field(..., description="ID of the country this attraction belongs to")
    address: Optional[str] = Field(None, description="Physical address of the attraction")
    city: Optional[str] = Field(None, description="City where the attraction is located")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the attraction")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the attraction")
    duration_minutes: Optional[int] = Field(None, description="Typical visit duration in minutes")
    price: Optional[float] = Field(None, description="Standard admission price")
    opening_hours: Optional[str] = Field(None, description="Operating hours")
    image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the attraction's primary image")
    
# Schema for creating a new Attraction
class AttractionCreate(AttractionBase):
    cover_image: Optional[str] = Field(None, description="Cover image file path")

# Schema for updating an Attraction
class AttractionUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the attraction")
    summary: Optional[str] = Field(None, description="Brief summary of the attraction")
    description: Optional[str] = Field(None, description="Detailed description of the attraction")
    country_id: Optional[int] = Field(None, description="ID of the country this attraction belongs to")
    address: Optional[str] = Field(None, description="Physical address of the attraction")
    city: Optional[str] = Field(None, description="City where the attraction is located")
    latitude: Optional[float] = Field(None, description="Latitude coordinate of the attraction")
    longitude: Optional[float] = Field(None, description="Longitude coordinate of the attraction")
    duration_minutes: Optional[int] = Field(None, description="Typical visit duration in minutes")
    price: Optional[float] = Field(None, description="Standard admission price")
    opening_hours: Optional[str] = Field(None, description="Operating hours")
    image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the attraction's primary image")
    cover_image: Optional[str] = Field(None, description="Cover image file path")
    is_active: Optional[bool] = Field(None, description="Whether the attraction is active")

# Schema for Attraction response
class AttractionResponse(AttractionBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the attraction", example="maasai-mara")
    is_active: bool = Field(..., description="Whether the attraction is active")
    created_at: datetime
    updated_at: datetime
    cover_image: Optional[str] = Field(None, description="Cover image file path")
    gallery_images: Optional[List[GalleryImageResponse]] = Field(None, description="Gallery images")
    
    class Config:
        from_attributes = True

# Schema for Attraction with Country details
class AttractionWithCountryResponse(AttractionResponse):
    country: CountryResponse
    
    class Config:
        from_attributes = True

# Schema for Attraction with package and group trip relationships
class AttractionWithRelationshipsResponse(AttractionWithCountryResponse):
    package_ids: Optional[List[int]] = Field(None, description="IDs of packages associated with this attraction")
    group_trip_ids: Optional[List[int]] = Field(None, description="IDs of group trips associated with this attraction")
    
    class Config:
        from_attributes = True
