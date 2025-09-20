from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

# Base Media Asset Schema
class MediaAssetBase(BaseModel):
    filename: str = Field(..., description="Original filename of the media asset")
    file_path: str = Field(..., description="Path in storage")
    storage_key: str = Field(..., description="Storage key in R2")
    content_type: str = Field(..., description="MIME type of the media asset")
    file_size: int = Field(..., description="Size of the media asset in bytes")
    entity_type: Optional[str] = Field(None, description="Type of entity this media belongs to")
    entity_id: Optional[int] = Field(None, description="ID of the entity this media belongs to")
    alt_text: Optional[str] = Field(None, description="Alternative text for the image")
    title: Optional[str] = Field(None, description="Title for the media asset")

# Schema for updating a Media Asset
class MediaAssetUpdate(BaseModel):
    alt_text: Optional[str] = Field(None, description="Alternative text for the image")
    title: Optional[str] = Field(None, description="Title for the media asset")
    entity_type: Optional[str] = Field(None, description="Type of entity this media belongs to")
    entity_id: Optional[int] = Field(None, description="ID of the entity this media belongs to")
    is_active: Optional[bool] = Field(None, description="Whether the media asset is active")

# Schema for Media Asset response
class MediaAssetResponse(MediaAssetBase):
    id: int
    is_active: bool = Field(..., description="Whether the media asset is active")
    created_by_id: int = Field(..., description="ID of the user who created the media asset")
    created_at: datetime
    updated_at: datetime
    url: Optional[str] = Field(None, description="URL to access the media asset")
    
    class Config:
        from_attributes = True

# Schema for client-side upload confirmation
class MediaAssetConfirm(BaseModel):
    storage_key: str = Field(..., description="Storage key in R2")
    filename: str = Field(..., description="Original filename of the media asset")
    file_size: int = Field(..., description="Size of the media asset in bytes")
    content_type: str = Field(..., description="MIME type of the media asset")
    entity_type: Optional[str] = Field(None, description="Type of entity this media belongs to")
    entity_id: Optional[int] = Field(None, description="ID of the entity this media belongs to")
    alt_text: Optional[str] = Field(None, description="Alternative text for the image")
    title: Optional[str] = Field(None, description="Title for the media asset")

# Schema for presigned upload response
class PresignedUploadResponse(BaseModel):
    url: str = Field(..., description="URL to upload to")
    fields: Dict[str, Any] = Field(..., description="Fields to include in the form")
    storage_key: str = Field(..., description="Storage key in R2")
