from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ContentPageBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    content: str = Field(..., min_length=1)
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=500)
    is_published: bool = False
    is_active: bool = True


class ContentPageCreate(ContentPageBase):
    pass


class ContentPageUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=100, pattern=r'^[a-z0-9-]+$')
    content: Optional[str] = Field(None, min_length=1)
    meta_title: Optional[str] = Field(None, max_length=200)
    meta_description: Optional[str] = Field(None, max_length=500)
    is_published: Optional[bool] = None
    is_active: Optional[bool] = None


class ContentPageResponse(ContentPageBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True