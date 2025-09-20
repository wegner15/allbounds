from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

# Base SEO Meta Schema
class SeoMetaBase(BaseModel):
    entity_type: str = Field(..., description="Type of entity (e.g., 'region', 'country', 'package')")
    entity_id: int = Field(..., description="ID of the entity")
    title: str = Field(..., description="SEO title")
    description: str = Field(..., description="SEO description")
    keywords: Optional[str] = Field(None, description="SEO keywords")
    canonical_url: Optional[str] = Field(None, description="Canonical URL")
    og_title: Optional[str] = Field(None, description="Open Graph title")
    og_description: Optional[str] = Field(None, description="Open Graph description")
    og_image_url: Optional[str] = Field(None, description="Open Graph image URL")
    twitter_card: Optional[str] = Field(None, description="Twitter card type")
    twitter_title: Optional[str] = Field(None, description="Twitter title")
    twitter_description: Optional[str] = Field(None, description="Twitter description")
    twitter_image_url: Optional[str] = Field(None, description="Twitter image URL")
    structured_data: Optional[Dict[str, Any]] = Field(None, description="JSON-LD structured data")

# Schema for creating a new SEO Meta
class SeoMetaCreate(SeoMetaBase):
    pass

# Schema for updating an SEO Meta
class SeoMetaUpdate(BaseModel):
    title: Optional[str] = Field(None, description="SEO title")
    description: Optional[str] = Field(None, description="SEO description")
    keywords: Optional[str] = Field(None, description="SEO keywords")
    canonical_url: Optional[str] = Field(None, description="Canonical URL")
    og_title: Optional[str] = Field(None, description="Open Graph title")
    og_description: Optional[str] = Field(None, description="Open Graph description")
    og_image_url: Optional[str] = Field(None, description="Open Graph image URL")
    twitter_card: Optional[str] = Field(None, description="Twitter card type")
    twitter_title: Optional[str] = Field(None, description="Twitter title")
    twitter_description: Optional[str] = Field(None, description="Twitter description")
    twitter_image_url: Optional[str] = Field(None, description="Twitter image URL")
    structured_data: Optional[Dict[str, Any]] = Field(None, description="JSON-LD structured data")

# Schema for SEO Meta response
class SeoMetaResponse(SeoMetaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
