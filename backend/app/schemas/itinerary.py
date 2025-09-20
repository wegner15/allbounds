from typing import List, Optional
from datetime import date, time
from decimal import Decimal
from pydantic import BaseModel, Field, validator, root_validator

from app.models.itinerary import EntityType, MealType
from .activity import ActivityResponse


# Base schemas for ItineraryActivity
class ItineraryActivityBase(BaseModel):
    time: Optional[time] = None
    activity_title: str = Field(..., min_length=1, max_length=255)
    activity_description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    attraction_id: Optional[int] = None
    duration_hours: Optional[Decimal] = Field(None, ge=0, le=24)
    is_meal: bool = False
    meal_type: Optional[MealType] = None
    order_index: int = 0

    @validator('meal_type')
    def validate_meal_type(cls, v, values):
        if values.get('is_meal') and not v:
            raise ValueError('meal_type is required when is_meal is True')
        if not values.get('is_meal') and v:
            raise ValueError('meal_type should not be set when is_meal is False')
        return v

    @validator('duration_hours')
    def validate_duration(cls, v):
        if v is not None and v <= 0:
            raise ValueError('duration_hours must be greater than 0')
        return v


class ItineraryActivityCreate(ItineraryActivityBase):
    pass


class ItineraryActivityUpdate(BaseModel):
    time: Optional[time] = None
    activity_title: Optional[str] = Field(None, min_length=1, max_length=255)
    activity_description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    attraction_id: Optional[int] = None
    duration_hours: Optional[Decimal] = Field(None, ge=0, le=24)
    is_meal: Optional[bool] = None
    meal_type: Optional[MealType] = None
    order_index: Optional[int] = None


class ItineraryActivityResponse(ItineraryActivityBase):
    id: int
    itinerary_item_id: int
    attraction: Optional[dict] = None  # Will be populated with attraction details

    class Config:
        from_attributes = True


# Base schemas for ItineraryItem
class ItineraryItemBase(BaseModel):
    day_number: int = Field(..., ge=1)
    date: Optional[date] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    hotel_ids: List[int] = []
    attraction_ids: List[int] = []
    linked_activity_ids: List[int] = []
    accommodation_notes: Optional[str] = None

    @validator('day_number')
    def validate_day_number(cls, v):
        if v <= 0:
            raise ValueError('day_number must be greater than 0')
        if v > 365:
            raise ValueError('day_number cannot exceed 365 days')
        return v

    @validator('title')
    def validate_title(cls, v):
        if v and not v.strip():
            raise ValueError('title cannot be empty or whitespace only')
        return v.strip() if v else v


class ItineraryItemCreate(ItineraryItemBase):
    entity_type: EntityType
    entity_id: int
    custom_activities: List[ItineraryActivityCreate] = []


class ItineraryItemUpdate(BaseModel):
    day_number: Optional[int] = Field(None, ge=1)
    date: Optional[date] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    hotel_ids: Optional[List[int]] = None
    attraction_ids: Optional[List[int]] = None
    linked_activity_ids: Optional[List[int]] = None
    accommodation_notes: Optional[str] = None


class ItineraryItemResponse(ItineraryItemBase):
    id: int
    entity_type: EntityType
    entity_id: int
    custom_activities: List[ItineraryActivityResponse] = []
    linked_activities: List[ActivityResponse] = []
    hotels: List[dict] = []  # Will be populated with hotel details
    attractions: List[dict] = []  # Will be populated with attraction details

    class Config:
        from_attributes = True


# Bulk operations schemas
class ItineraryBulkCreate(BaseModel):
    entity_type: EntityType
    entity_id: int
    items: List[ItineraryItemCreate]


class ItineraryBulkUpdate(BaseModel):
    items: List[ItineraryItemUpdate]


# Response schemas for complete itinerary
class ItineraryResponse(BaseModel):
    entity_type: EntityType
    entity_id: int
    total_days: int
    items: List[ItineraryItemResponse]

    class Config:
        from_attributes = True


# Schema for reordering activities
class ActivityReorderRequest(BaseModel):
    activity_ids: List[int] = Field(..., description="List of activity IDs in the desired order")


# Schema for reordering itinerary items
class ItineraryReorderRequest(BaseModel):
    item_ids: List[int] = Field(..., description="List of itinerary item IDs in the desired order")
