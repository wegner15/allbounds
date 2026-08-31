from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime


class AmenityBase(BaseModel):
    name: str = Field(..., description="Name of the amenity", example="Swimming Pool")
    description: Optional[str] = Field(None, description="Description of the amenity")
    icon: Optional[str] = Field(None, description="Icon class or identifier for the amenity", example="wifi")
    category: Optional[str] = Field(None, description="Category of the amenity", example="General")
    is_popular: Optional[bool] = Field(default=False, description="Whether this is a popular facility featured at the top")

    @field_validator('is_popular', mode='before')
    @classmethod
    def validate_is_popular(cls, v):
        """Convert None to False for is_popular"""
        return bool(v) if v is not None else False


class AmenityCreate(AmenityBase):
    pass


class AmenityUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the amenity")
    description: Optional[str] = Field(None, description="Description of the amenity")
    icon: Optional[str] = Field(None, description="Icon class or identifier for the amenity")
    category: Optional[str] = Field(None, description="Category of the amenity")
    is_popular: Optional[bool] = Field(None, description="Whether this is a popular facility featured at the top")
    is_active: Optional[bool] = Field(None, description="Whether the amenity is active")


class AmenityResponse(AmenityBase):
    id: int
    is_popular: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    @field_validator('is_popular', 'is_active', mode='before')
    @classmethod
    def validate_boolean_fields(cls, v):
        """Convert None to False for boolean fields"""
        return bool(v) if v is not None else False

    model_config = ConfigDict(from_attributes=True, extra='ignore')


class PaginatedAmenityResponse(BaseModel):
    items: list[AmenityResponse]
    total: int
    page: int
    size: int
    pages: int
