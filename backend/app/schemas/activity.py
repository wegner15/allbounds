from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any
from datetime import datetime

from .media import MediaAssetResponse
from .country import CountryResponse, CountryMinResponse
from app.schemas.content_tag import ContentTagResponse

# Base Activity Schema
class ActivityBase(BaseModel):
    name: str = Field(..., description="Name of the activity", example="Safari")
    description: Optional[str] = Field(None, description="Description of the activity")
    summary: Optional[str] = Field(None, description="Brief summary of the activity")

# Schema for creating a new Activity
class ActivityCreate(ActivityBase):
    is_active: Optional[bool] = Field(True, description="Whether the activity is active")
    is_featured: Optional[bool] = Field(False, description="Whether the activity is featured")
    cover_image_id: Optional[int] = Field(None, description="ID of the cover image media asset")
    media_asset_ids: Optional[List[int]] = Field([], description="List of media asset IDs for the gallery")
    country_ids: Optional[List[int]] = Field([], description="List of country IDs associated with the activity")
    tag_ids: Optional[List[int]] = Field([], description="List of tag IDs associated with the activity")

# Schema for updating an Activity
class ActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the activity")
    description: Optional[str] = Field(None, description="Description of the activity")
    summary: Optional[str] = Field(None, description="Brief summary of the activity")
    is_active: Optional[bool] = Field(None, description="Whether the activity is active")
    is_featured: Optional[bool] = Field(None, description="Whether the activity is featured")
    cover_image_id: Optional[int] = Field(None, description="ID of the cover image media asset")
    media_asset_ids: Optional[List[int]] = Field(None, description="List of media asset IDs for the gallery")
    country_ids: Optional[List[int]] = Field(None, description="List of country IDs associated with the activity")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs associated with the activity")

# Schema for Activity response
class ActivityResponse(ActivityBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the activity", example="safari")
    is_active: bool = Field(..., description="Whether the activity is active")
    is_featured: bool = Field(default=False, description="Whether the activity is featured")
    cover_image: Optional[MediaAssetResponse] = Field(None, description="Cover image of the activity")
    media_assets: List[MediaAssetResponse] = Field([], description="Gallery of media assets for the activity")
    countries: List[CountryMinResponse] = Field([], description="Countries associated with the activity")
    tags: List[ContentTagResponse] = Field([], description="Tags associated with the activity")
    created_at: datetime
    updated_at: datetime
    
    @field_validator('is_featured', mode='before')
    @classmethod
    def validate_is_featured(cls, v):
        """Convert None to False for is_featured field"""
        return v if v is not None else False
    
    class Config:
        from_attributes = True

# Schema for Activity with its associated trips (Packages and Group Trips)
class ActivityTripsResponse(BaseModel):
    packages: List[Any] = [] # Use Any to avoid circular imports, or import inside
    group_trips: List[Any] = []
    total_packages: int = 0
    total_group_trips: int = 0
