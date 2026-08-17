from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse
from app.schemas.holiday_type import HolidayTypeResponse
from app.schemas.inclusion_exclusion import InclusionResponse, ExclusionResponse
from app.schemas.content_tag import ContentTagResponse
from app.schemas.package_price_chart import PackagePriceChartResponse


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
    is_deal: Optional[bool] = Field(False, description="Whether the package is marked as a special deal")
    package_type: Optional[str] = Field("safari", description="Package type: 'safari' or 'holiday'")
    faqs: Optional[List[dict]] = Field(None, description="List of FAQs ({question: str, answer: str})")
    conversion_triggers: Optional[List[str]] = Field(None, description="List of conversion triggers for the package")
    
# Schema for creating a new Package
class PackageCreate(PackageBase):
    is_active: Optional[bool] = Field(True, description="Whether the package is active")
    is_featured: Optional[bool] = Field(False, description="Whether the package is featured")
    holiday_type_ids: Optional[List[int]] = Field(default_factory=list, description="List of holiday type IDs to associate with this package")
    inclusion_ids: Optional[List[int]] = Field(default_factory=list, description="List of inclusion IDs to associate with this package")
    exclusion_ids: Optional[List[int]] = Field(default_factory=list, description="List of exclusion IDs to associate with this package")
    blog_post_ids: Optional[List[int]] = Field(default_factory=list, description="List of blog post IDs to associate with this package")
    country_ids: Optional[List[int]] = Field(default_factory=list, description="List of additional country IDs (multiple destinations)")
    tag_ids: Optional[List[int]] = Field(default_factory=list, description="List of tag IDs to associate with this package")

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
    is_deal: Optional[bool] = Field(None, description="Whether the package is a special deal")
    package_type: Optional[str] = Field(None, description="Package type: 'safari' or 'holiday'")
    published_at: Optional[datetime] = Field(None, description="When the package was published")
    holiday_type_ids: Optional[List[int]] = Field(None, description="List of holiday type IDs to associate with this package")
    inclusion_ids: Optional[List[int]] = Field(None, description="List of inclusion IDs to associate with this package")
    exclusion_ids: Optional[List[int]] = Field(None, description="List of exclusion IDs to associate with this package")
    blog_post_ids: Optional[List[int]] = Field(None, description="List of blog post IDs to associate with this package")
    faqs: Optional[List[dict]] = Field(None, description="List of FAQs")
    conversion_triggers: Optional[List[str]] = Field(None, description="List of conversion triggers")
    country_ids: Optional[List[int]] = Field(None, description="List of additional country IDs (multiple destinations)")
    tag_ids: Optional[List[int]] = Field(None, description="List of tag IDs to associate with this package")

# Schema for Package response
class PackageResponse(PackageBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the package", example="kenya-safari-adventure")
    is_active: bool = Field(..., description="Whether the package is active")
    is_featured: bool = Field(..., description="Whether the package is featured")
    is_deal: Optional[bool] = Field(False, description="Whether the package is a special deal")
    package_type: str = Field("safari", description="Package type: 'safari' or 'holiday'")
    is_published: bool = Field(..., description="Whether the package is published")
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    holiday_types: List[HolidayTypeResponse] = []
    inclusion_items: List[InclusionResponse] = []
    exclusion_items: List[ExclusionResponse] = []
    countries: List[CountryResponse] = []
    tags: List[ContentTagResponse] = []
    price_charts: List[PackagePriceChartResponse] = []

    # REMOVED: holiday_types, inclusion_items, exclusion_items to prevent circular loading
    # These cause exponential memory growth due to bidirectional relationships
    # Use dedicated endpoints to fetch these if needed
    
    @field_validator('is_active', 'is_featured', 'is_deal', 'is_published', mode='before')
    @classmethod
    def validate_boolean_fields(cls, v):
        """Convert None to False for boolean fields"""
        return v if v is not None else False
    
    class Config:
        from_attributes = True

# Schema for Package with Country details
class PackageWithCountryResponse(PackageResponse):
    country: CountryResponse
    
    class Config:
        from_attributes = True

# Lightweight schema for list endpoints (prevents OOM by not loading all relationships)
class PackageListResponse(BaseModel):
    id: int
    name: str
    summary: Optional[str] = None
    country_id: int
    duration_days: Optional[int] = None
    price: Optional[float] = None
    image_id: Optional[str] = None
    slug: str
    is_active: bool
    is_featured: bool
    is_deal: bool
    package_type: str = "safari"
    created_at: datetime
    country: CountryResponse  # Only load country, not all relationships
    countries: List[CountryResponse] = []  # Additional destinations
    tags: List[ContentTagResponse] = []  # Tags for filtering
    
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
