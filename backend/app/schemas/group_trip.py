from pydantic import BaseModel, Field
from typing import Optional, List, ClassVar, Type, Any
from datetime import datetime, date

# Import at the top level to avoid Pydantic 2.x issues
from app.schemas.country import CountryResponse

# Base Group Trip Schema
class GroupTripBase(BaseModel):
    name: str = Field(..., description="Name of the group trip", example="Kenya Safari Group Tour")
    summary: Optional[str] = Field(None, description="Brief summary of the group trip")
    description: Optional[str] = Field(None, description="Detailed description of the group trip")
    country_id: int = Field(..., description="ID of the country this group trip belongs to")
    duration_days: Optional[int] = Field(None, description="Duration of the group trip in days", ge=1)
    price: Optional[float] = Field(None, description="Base price of the group trip", ge=0)
    itinerary: Optional[str] = Field(None, description="Detailed itinerary of the group trip")
    inclusions: Optional[str] = Field(None, description="What's included in the group trip")
    exclusions: Optional[str] = Field(None, description="What's excluded from the group trip")
    min_participants: Optional[int] = Field(None, description="Minimum number of participants", ge=1)
    max_participants: Optional[int] = Field(None, description="Maximum number of participants", ge=1)
    image_id: Optional[str] = Field(None, description="ID of the Cloudflare image for this group trip")
    start_date: Optional[str] = Field(None, description="Start date of the group trip")
    end_date: Optional[str] = Field(None, description="End date of the group trip")
    
# Schema for creating a new Group Trip
class GroupTripCreate(GroupTripBase):
    pass

# Schema for updating a Group Trip
class GroupTripUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the group trip")
    summary: Optional[str] = Field(None, description="Brief summary of the group trip")
    description: Optional[str] = Field(None, description="Detailed description of the group trip")
    country_id: Optional[int] = Field(None, description="ID of the country this group trip belongs to")
    duration_days: Optional[int] = Field(None, description="Duration of the group trip in days", ge=1)
    price: Optional[float] = Field(None, description="Base price of the group trip", ge=0)
    itinerary: Optional[str] = Field(None, description="Detailed itinerary of the group trip")
    inclusions: Optional[str] = Field(None, description="What's included in the group trip")
    exclusions: Optional[str] = Field(None, description="What's excluded from the group trip")
    min_participants: Optional[int] = Field(None, description="Minimum number of participants", ge=1)
    max_participants: Optional[int] = Field(None, description="Maximum number of participants", ge=1)
    is_active: Optional[bool] = Field(None, description="Whether the group trip is active")
    is_featured: Optional[bool] = Field(None, description="Whether the group trip is featured")
    published_at: Optional[datetime] = Field(None, description="When the group trip was published")
    image_id: Optional[str] = Field(None, description="ID of the Cloudflare image for this group trip")
    start_date: Optional[str] = Field(None, description="Start date of the group trip")
    end_date: Optional[str] = Field(None, description="End date of the group trip")

# Schema for Group Trip response
class GroupTripResponse(GroupTripBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the group trip", example="kenya-safari-group-tour")
    is_active: bool = Field(..., description="Whether the group trip is active")
    is_featured: bool = Field(..., description="Whether the group trip is featured")
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Schema for Group Trip with Country details
class GroupTripWithCountryResponse(GroupTripResponse):
    country: CountryResponse
    
    class Config:
        from_attributes = True

# Base Group Trip Departure Schema
class GroupTripDepartureBase(BaseModel):
    group_trip_id: int = Field(..., description="ID of the group trip this departure belongs to")
    start_date: date = Field(..., description="Start date of the departure")
    end_date: date = Field(..., description="End date of the departure")
    price: Optional[float] = Field(None, description="Price for this specific departure", ge=0)
    available_slots: int = Field(..., description="Number of available slots for this departure", ge=0)
    booked_slots: int = Field(0, description="Number of booked slots for this departure", ge=0)
    
# Schema for creating a new Group Trip Departure
class GroupTripDepartureCreate(GroupTripDepartureBase):
    pass

# Schema for updating a Group Trip Departure
class GroupTripDepartureUpdate(BaseModel):
    start_date: Optional[date] = Field(None, description="Start date of the departure")
    end_date: Optional[date] = Field(None, description="End date of the departure")
    price: Optional[float] = Field(None, description="Price for this specific departure", ge=0)
    available_slots: Optional[int] = Field(None, description="Number of available slots for this departure", ge=0)
    is_active: Optional[bool] = Field(None, description="Whether the departure is active")

# Schema for Group Trip Departure response
class GroupTripDepartureResponse(GroupTripDepartureBase):
    id: int
    is_active: bool = Field(..., description="Whether the departure is active")
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schema for adding a holiday type to a group trip
class GroupTripHolidayTypeCreate(BaseModel):
    holiday_type_id: int = Field(..., description="ID of the holiday type to add to the group trip")
