from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse
from app.schemas.holiday_type import HolidayTypeResponse
from app.schemas.inclusion_exclusion import InclusionResponse, ExclusionResponse

# Base Package Schema
class PackageBase(BaseModel):
    name: str = Field(..., description="Name of the package", example="Kenya Safari Adventure")
    summary: Optional[str] = Field(None, description="Brief summary of the package")
    description: Optional[str] = Field(None, description="Detailed description of the package")
    country_id: int = Field(..., description="ID of the country this package belongs to")
    duration_days: Optional[int] = Field(None, description="Duration of the package in days", ge=1)
    price: Optional[float] = Field(None, description="Base price of the package", ge=0)
    itinerary: Optional[str] = Field(None, description="Detailed itinerary of the package")
    inclusions: Optional[str] = Field(None, description="What's included in the package")
    exclusions: Optional[str] = Field(None, description="What's excluded from the package")
    image_id: Optional[str] = Field(None, description="Cloudflare image ID for the package thumbnail")
    
# Schema for creating a new Package
class PackageCreate(PackageBase):
    holiday_type_ids: Optional[List[int]] = Field(default_factory=list, description="List of holiday type IDs to associate with this package")
    inclusion_ids: Optional[List[int]] = Field(default_factory=list, description="List of inclusion IDs to associate with this package")
    exclusion_ids: Optional[List[int]] = Field(default_factory=list, description="List of exclusion IDs to associate with this package")

# Schema for updating a Package
class PackageUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the package")
    summary: Optional[str] = Field(None, description="Brief summary of the package")
    description: Optional[str] = Field(None, description="Detailed description of the package")
    country_id: Optional[int] = Field(None, description="ID of the country this package belongs to")
    duration_days: Optional[int] = Field(None, description="Duration of the package in days", ge=1)
    price: Optional[float] = Field(None, description="Base price of the package", ge=0)
    itinerary: Optional[str] = Field(None, description="Detailed itinerary of the package")
    inclusions: Optional[str] = Field(None, description="What's included in the package")
    exclusions: Optional[str] = Field(None, description="What's excluded from the package")
    image_id: Optional[str] = Field(None, description="Cloudflare image ID for the package thumbnail")
    is_active: Optional[bool] = Field(None, description="Whether the package is active")
    is_featured: Optional[bool] = Field(None, description="Whether the package is featured")
    published_at: Optional[datetime] = Field(None, description="When the package was published")
    holiday_type_ids: Optional[List[int]] = Field(None, description="List of holiday type IDs to associate with this package")
    inclusion_ids: Optional[List[int]] = Field(None, description="List of inclusion IDs to associate with this package")
    exclusion_ids: Optional[List[int]] = Field(None, description="List of exclusion IDs to associate with this package")

# Schema for Package response
class PackageResponse(PackageBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the package", example="kenya-safari-adventure")
    is_active: bool = Field(..., description="Whether the package is active")
    is_featured: bool = Field(..., description="Whether the package is featured")
    is_published: bool = Field(..., description="Whether the package is published")
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    holiday_types: List[HolidayTypeResponse] = Field(default_factory=list, description="Holiday types associated with this package")
    inclusion_items: List[InclusionResponse] = Field(default_factory=list, description="Inclusions associated with this package")
    exclusion_items: List[ExclusionResponse] = Field(default_factory=list, description="Exclusions associated with this package")
    
    class Config:
        from_attributes = True

# Schema for Package with Country details
class PackageWithCountryResponse(PackageResponse):
    country: CountryResponse
    
    class Config:
        from_attributes = True

# Schema for adding a holiday type to a package
class PackageHolidayTypeCreate(BaseModel):
    holiday_type_id: int = Field(..., description="ID of the holiday type to add to the package")

# Schema for adding an inclusion to a package
class PackageInclusionCreate(BaseModel):
    inclusion_id: int = Field(..., description="ID of the inclusion to add to the package")

# Schema for adding an exclusion to a package
class PackageExclusionCreate(BaseModel):
    exclusion_id: int = Field(..., description="ID of the exclusion to add to the package")
