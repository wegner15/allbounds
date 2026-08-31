from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class AmenityBase(BaseModel):
    name: str = Field(..., description="Name of the amenity", example="Swimming Pool")
    description: Optional[str] = Field(None, description="Description of the amenity")
    icon: Optional[str] = Field(None, description="Icon class or identifier for the amenity", example="wifi")
    category: Optional[str] = Field(None, description="Category of the amenity", example="General")
    is_popular: Optional[bool] = Field(False, description="Whether this is a popular facility featured at the top")


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
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedAmenityResponse(BaseModel):
    items: list[AmenityResponse]
    total: int
    page: int
    size: int
    pages: int
