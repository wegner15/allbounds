from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# Travel Guide Category Schemas
class TravelGuideCategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    slug: Optional[str] = Field(None, max_length=100)
    icon: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    order_index: int = 0
    is_active: bool = True

class TravelGuideCategoryCreate(TravelGuideCategoryBase):
    pass

class TravelGuideCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class TravelGuideCategory(TravelGuideCategoryBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Travel Guide Item Schemas
class TravelGuideItemBase(BaseModel):
    country_id: int
    category_id: int
    title: str = Field(..., max_length=200)
    content: str
    icon: Optional[str] = Field(None, max_length=50)
    order_index: int = 0
    is_active: bool = True

class TravelGuideItemCreate(TravelGuideItemBase):
    pass

class TravelGuideItemUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    icon: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None

class TravelGuideItem(TravelGuideItemBase):
    id: int
    category: Optional[TravelGuideCategory] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
