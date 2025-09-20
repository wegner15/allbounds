from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from .media import MediaAssetResponse

# Base Activity Schema
class ActivityBase(BaseModel):
    name: str = Field(..., description="Name of the activity", example="Safari")
    description: Optional[str] = Field(None, description="Description of the activity")

# Schema for creating a new Activity
class ActivityCreate(ActivityBase):
    is_active: Optional[bool] = Field(True, description="Whether the activity is active")
    cover_image_id: Optional[int] = Field(None, description="ID of the cover image media asset")
    media_asset_ids: Optional[List[int]] = Field([], description="List of media asset IDs for the gallery")

# Schema for updating an Activity
class ActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the activity")
    description: Optional[str] = Field(None, description="Description of the activity")
    is_active: Optional[bool] = Field(None, description="Whether the activity is active")
    cover_image_id: Optional[int] = Field(None, description="ID of the cover image media asset")
    media_asset_ids: Optional[List[int]] = Field(None, description="List of media asset IDs for the gallery")

# Schema for Activity response
class ActivityResponse(ActivityBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the activity", example="safari")
    is_active: bool = Field(..., description="Whether the activity is active")
    cover_image: Optional[MediaAssetResponse] = Field(None, description="Cover image of the activity")
    media_assets: List[MediaAssetResponse] = Field([], description="Gallery of media assets for the activity")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
