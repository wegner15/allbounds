from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ContentTagBase(BaseModel):
    name: str = Field(..., description="Display name of the tag", example="Family Friendly")
    slug: str = Field(..., description="URL-safe slug", example="family-friendly")
    description: Optional[str] = Field(None, description="Optional description of what this tag means")
    category: Optional[str] = Field(
        None,
        description="Grouping category for the tag. e.g. 'audience', 'pace', 'environment', 'budget'",
        example="audience",
    )
    icon: Optional[str] = Field(None, description="Emoji or icon identifier", example="👨‍👩‍👧")
    color: Optional[str] = Field(None, description="Hex color code for frontend chip", example="#4CAF50")
    order_index: Optional[int] = Field(0, description="Display order (lower = earlier)")


class ContentTagCreate(ContentTagBase):
    is_active: Optional[bool] = Field(True, description="Whether the tag is active")


class ContentTagUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Display name of the tag")
    slug: Optional[str] = Field(None, description="URL-safe slug")
    description: Optional[str] = Field(None, description="Optional description")
    category: Optional[str] = Field(None, description="Grouping category")
    icon: Optional[str] = Field(None, description="Emoji or icon identifier")
    color: Optional[str] = Field(None, description="Hex color code for frontend chip")
    order_index: Optional[int] = Field(None, description="Display order")
    is_active: Optional[bool] = Field(None, description="Whether the tag is active")


class ContentTagResponse(ContentTagBase):
    id: int
    is_active: Optional[bool] = Field(True, description="Whether the tag is active")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Update timestamp")

    model_config = ConfigDict(from_attributes=True)


class PaginatedContentTagResponse(BaseModel):
    items: List[ContentTagResponse]
    total: int
    page: int
    size: int
    pages: int
