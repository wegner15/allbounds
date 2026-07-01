from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base Partner Schema
class PartnerBase(BaseModel):
    name: str = Field(..., description="Name of the partner", example="Qatar Airways")
    category: str = Field(..., description="Category of the partner (hotel, airline, affiliation)", example="airline")
    logo_image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the partner logo")
    website_url: Optional[str] = Field(None, description="External website URL for the partner")
    order_index: Optional[int] = Field(0, description="Sorting index for display order")

# Schema for creating a new Partner
class PartnerCreate(PartnerBase):
    pass

# Schema for updating a Partner
class PartnerUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the partner")
    category: Optional[str] = Field(None, description="Category of the partner")
    logo_image_id: Optional[str] = Field(None, description="Cloudflare Image ID for the partner logo")
    website_url: Optional[str] = Field(None, description="External website URL for the partner")
    order_index: Optional[int] = Field(None, description="Sorting index for display order")
    is_active: Optional[bool] = Field(None, description="Whether the partner is active")

# Schema for Partner response
class PartnerResponse(PartnerBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the partner", example="qatar-airways")
    is_active: bool = Field(..., description="Whether the partner is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
