from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse
from app.schemas.activity import ActivityResponse
from app.schemas.content_tag import ContentTagResponse

# Simplified hotel schema for use in attraction responses (avoids circular imports)
class SimplifiedHotelResponse(BaseModel):
    id: int
    name: str
    slug: str
    stars: Optional[float] = None
    city: Optional[str] = None
    price_category: Optional[str] = None
    image_url: Optional[str] = None
    cover_image: Optional[str] = None
    country_id: Optional[int] = None
    image_id: Optional[str] = None  # Added image_id to schema so it can be used for computation

    @field_validator('cover_image', 'image_url', mode='before')
    @classmethod
    def compute_cover_image(cls, v, info):
        """Generate cover_image URL from image_id if available"""
        # Get the model instance from validation context
        if hasattr(info, 'data') and 'image_id' in info.data:
            image_id = info.data.get('image_id')
            if image_id:
                from app.core.cloudflare_config import cloudflare_settings
                return f"{cloudflare_settings.delivery_url}/{image_id}/medium"
        return v

    class Config:
        from_attributes = True

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
    is_featured: Optional[bool] = Field(False, description="Whether the attraction is featured")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs associated with the attraction")

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
    is_featured: Optional[bool] = Field(None, description="Whether the attraction is featured")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs associated with the attraction")

# Schema for Attraction response
class AttractionResponse(AttractionBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the attraction", example="maasai-mara")
    is_active: bool = Field(..., description="Whether the attraction is active")
    is_featured: bool = Field(False, description="Whether the attraction is featured")
    created_at: datetime
    updated_at: datetime
    cover_image: Optional[str] = Field(None, description="Cover image URL")
    country: Optional[CountryResponse] = Field(None, description="Country details for the attraction")
    
    @field_validator('is_active', mode='before')
    @classmethod
    def validate_boolean_fields(cls, v):
        """Convert None to False for boolean fields"""
        return v if v is not None else False
    
    @field_validator('cover_image', mode='before')
    @classmethod
    def compute_cover_image(cls, v, info):
        """Generate cover_image URL from image_id if available"""
        # Get the model instance from validation context
        if hasattr(info, 'data') and 'image_id' in info.data:
            image_id = info.data.get('image_id')
            if image_id:
                from app.core.cloudflare_config import cloudflare_settings
                return f"{cloudflare_settings.delivery_url}/{image_id}/medium"
        return v
    
    gallery_images: Optional[List[GalleryImageResponse]] = Field(None, description="Gallery images")
    activities: List[ActivityResponse] = Field([], description="Activities associated with the attraction")
    hotels: List[SimplifiedHotelResponse] = Field([], description="Hotels associated with the attraction")
    tags: List[ContentTagResponse] = Field([], description="Tags associated with the attraction")
    
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
    activity_ids: Optional[List[int]] = Field(None, description="IDs of activities associated with this attraction")
    hotel_ids: Optional[List[int]] = Field(None, description="IDs of hotels associated with this attraction")
    
    class Config:
        from_attributes = True

# Schema for paginated attraction response (optimized for admin list)
class PaginatedAttractionResponse(BaseModel):
    items: List[AttractionResponse]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        from_attributes = True

