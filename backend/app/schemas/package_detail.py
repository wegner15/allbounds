"""
Comprehensive schema for package detail page with all relationships.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date, time

# Nested schemas for related entities

class CountrySummary(BaseModel):
    id: int
    name: str
    slug: str
    image_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class HolidayTypeSummary(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    
    class Config:
        from_attributes = True


class MediaAssetSummary(BaseModel):
    id: int
    image_id: Optional[str] = None
    storage_key: Optional[str] = None
    file_path: Optional[str] = None
    filename: Optional[str] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    alt_text: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    order_index: Optional[int] = None
    
    class Config:
        from_attributes = True


class AmenitySummary(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        from_attributes = True


class HotelSummary(BaseModel):
    id: int
    name: str
    slug: str
    summary: Optional[str] = None
    city: Optional[str] = None
    stars: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_id: Optional[str] = None
    image_url: Optional[str] = None
    amenities: List[AmenitySummary] = []
    
    class Config:
        from_attributes = True


class AttractionSummary(BaseModel):
    id: int
    name: str
    slug: str
    summary: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_id: Optional[str] = None
    image_url: Optional[str] = None
    
    class Config:
        from_attributes = True


class ItineraryActivityDetail(BaseModel):
    id: int
    time: Optional[time] = None
    activity_title: str
    activity_description: Optional[str] = None
    location: Optional[str] = None
    duration_hours: Optional[float] = None
    is_meal: bool = False
    meal_type: Optional[str] = None
    order_index: int = 0
    
    class Config:
        from_attributes = True


class ActivitySummary(BaseModel):
    id: int
    name: str
    slug: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    
    class Config:
        from_attributes = True


class ItineraryItemDetail(BaseModel):
    id: int
    day_number: int
    date: Optional[date] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accommodation_notes: Optional[str] = None
    hotels: List[HotelSummary] = []
    attractions: List[AttractionSummary] = []
    custom_activities: List[ItineraryActivityDetail] = []
    linked_activities: List[ActivitySummary] = []
    
    class Config:
        from_attributes = True


class InclusionDetail(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        from_attributes = True


class ExclusionDetail(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    
    class Config:
        from_attributes = True


class ReviewDetail(BaseModel):
    id: int
    title: Optional[str] = None
    content: str
    rating: float
    reviewer_name: str
    is_approved: bool
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PriceChartDetail(BaseModel):
    id: int
    title: str
    start_date: datetime
    end_date: datetime
    price: float
    is_active: bool
    
    class Config:
        from_attributes = True


class BlogPostSummary(BaseModel):
    id: int
    title: str
    slug: str
    summary: Optional[str] = None
    cover_image_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    is_published: bool = True
    
    class Config:
        from_attributes = True


# Main comprehensive package detail response
class PackageDetailResponse(BaseModel):
    """
    Comprehensive package detail response with all relationships loaded.
    Designed for the tour page redesign.
    """
    id: int
    name: str
    slug: str
    summary: Optional[str] = None
    description: Optional[str] = None
    duration_days: Optional[int] = None
    price: Optional[float] = None
    image_id: Optional[str] = None
    is_active: bool
    is_featured: bool
    package_type: str = "safari"
    created_at: datetime
    updated_at: datetime
    
    # Relationships
    country: CountrySummary
    holiday_types: List[HolidayTypeSummary] = []
    media_assets: List[MediaAssetSummary] = []
    itinerary_items: List[ItineraryItemDetail] = []
    inclusion_items: List[InclusionDetail] = []
    exclusion_items: List[ExclusionDetail] = []
    hotels: List[HotelSummary] = []
    attractions: List[AttractionSummary] = []
    reviews: List[ReviewDetail] = []
    price_charts: List[PriceChartDetail] = []
    blog_posts: List[BlogPostSummary] = []
    
    class Config:
        from_attributes = True
