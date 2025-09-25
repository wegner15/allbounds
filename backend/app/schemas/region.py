from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Base Region Schema
class RegionBase(BaseModel):
    name: str = Field(..., description="Name of the region", example="Africa")
    description: Optional[str] = Field(None, description="Description of the region")
    summary: Optional[str] = Field(None, description="Brief summary of the region")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the region image")
    
# Schema for creating a new Region
class RegionCreate(RegionBase):
    pass

# Schema for updating a Region
class RegionUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the region")
    description: Optional[str] = Field(None, description="Description of the region")
    summary: Optional[str] = Field(None, description="Brief summary of the region")
    image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the region image")
    is_active: Optional[bool] = Field(None, description="Whether the region is active")

# Schema for Region response
class RegionResponse(RegionBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the region", example="africa")
    is_active: bool = Field(..., description="Whether the region is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Simple country response for embedding in region response
class CountryInRegionResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True

# Schema for Region response with countries
class RegionWithCountriesResponse(RegionResponse):
    countries: List[CountryInRegionResponse] = Field(default_factory=list, description="Countries in this region")
    
    class Config:
        from_attributes = True
