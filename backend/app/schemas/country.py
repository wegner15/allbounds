from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.region import RegionResponse
from app.schemas.media import MediaAssetResponse

# Base Country Schema
class CountryBase(BaseModel):
    name: str = Field(..., description="Name of the country", example="Kenya")
    description: Optional[str] = Field(None, description="Description of the country")
    summary: Optional[str] = Field(None, description="Brief summary of the country")
    region_id: int = Field(..., description="ID of the region this country belongs to")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the country image")
    media_asset_ids: Optional[List[int]] = Field(None, description="List of IDs for the country's gallery")
    
# Schema for creating a new Country
class CountryCreate(CountryBase):
    pass

# Schema for updating a Country
class CountryUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the country")
    description: Optional[str] = Field(None, description="Description of the country")
    summary: Optional[str] = Field(None, description="Brief summary of the country")
    region_id: Optional[int] = Field(None, description="ID of the region this country belongs to")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the country image")
    media_asset_ids: Optional[List[int]] = Field(None, description="List of IDs for the country's gallery")
    is_active: Optional[bool] = Field(None, description="Whether the country is active")

# Schema for Country response
class CountryResponse(CountryBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the country", example="kenya")
    is_active: bool = Field(..., description="Whether the country is active")
    created_at: datetime
    updated_at: datetime
    media_assets: List[MediaAssetResponse] = Field(default_factory=list)
    
    class Config:
        from_attributes = True

# Schema for Country with Region details
class CountryWithRegionResponse(CountryResponse):
    region: RegionResponse
    
    class Config:
        from_attributes = True
