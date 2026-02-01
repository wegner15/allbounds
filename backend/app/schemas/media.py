from pydantic import BaseModel, Field, model_validator
from typing import Optional, Dict, Any
from datetime import datetime

# Base Media Asset Schema
class MediaAssetBase(BaseModel):
    filename: str = Field(..., description="Original filename of the media asset")
    file_path: str = Field(..., description="Path in storage")
    storage_key: Optional[str] = Field(None, description="Storage key in R2")
    content_type: Optional[str] = Field(None, description="MIME type of the media asset")
    file_size: Optional[int] = Field(None, description="Size of the media asset in bytes")
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

    @model_validator(mode='after')
    def populate_url(self) -> 'MediaAssetResponse':
        if not self.url:
            from app.core.cloudflare_config import cloudflare_settings
            
            cf_id = self.storage_key
            
            if not cf_id and self.file_path and self.file_path.startswith("cloudflare://"):
                cf_id = self.file_path.split("cloudflare://", 1)[1]
            
            if not cf_id and self.file_path and not self.file_path.startswith("http") and not self.file_path.startswith("/"):
                cf_id = self.file_path
                
            if cf_id:
                self.url = f"{cloudflare_settings.delivery_url}/{cf_id}/public"
            elif self.file_path and self.file_path.startswith("http"):
                self.url = self.file_path
                
        return self
    
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
