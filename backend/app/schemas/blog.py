from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime

# Tag Schema
class TagBase(BaseModel):
    name: str = Field(..., description="Name of the tag", example="Safari")

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the tag", example="safari")
    
    class Config:
        from_attributes = True

# Base Blog Post Schema
class BlogPostBase(BaseModel):
    title: str = Field(..., description="Title of the blog post", example="Top 10 Safari Destinations")
    content: str = Field(..., description="Content of the blog post")
    summary: Optional[str] = Field(None, description="Summary of the blog post", max_length=1000)
    cover_image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the cover image")
    tags: Optional[List[str]] = Field(None, description="Tags for the blog post")

# Schema for creating a new Blog Post
class BlogPostCreate(BlogPostBase):
    slug: Optional[str] = Field(None, description="URL-friendly slug for the blog post")
    package_ids: Optional[List[int]] = Field(default_factory=list, description="IDs of packages to link to this blog post")

# Schema for updating a Blog Post
class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the blog post")
    content: Optional[str] = Field(None, description="Content of the blog post")
    summary: Optional[str] = Field(None, description="Summary of the blog post", max_length=1000)
    cover_image_id: Optional[str] = Field(None, description="Cloudflare Images ID for the cover image")
    tags: Optional[List[str]] = Field(None, description="Tags for the blog post")
    is_published: Optional[bool] = Field(None, description="Whether the blog post is published")
    is_active: Optional[bool] = Field(None, description="Whether the blog post is active")
    package_ids: Optional[List[int]] = Field(None, description="IDs of packages to link to this blog post")

# Schema for Blog Post response
class BlogPostResponse(BlogPostBase):
    id: int
    slug: str = Field(..., description="URL-friendly slug for the blog post", example="top-10-safari-destinations")
    author_id: int = Field(..., description="ID of the user who created the blog post")
    is_published: bool = Field(..., description="Whether the blog post is published")
    is_active: bool = Field(..., description="Whether the blog post is active")
    is_featured: bool = Field(..., description="Whether the blog post is featured")
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    cover_image_url: Optional[str] = Field(None, description="Generated cover image URL")
    tags: List[TagResponse] = []
    # Use any to avoid circular imports, but in practice it will be PackageListResponse or similar
    packages: List[Any] = []
    
    @field_validator('is_published', 'is_active', 'is_featured', mode='before')
    @classmethod
    def validate_boolean_fields(cls, v):
        """Convert None to False for boolean fields"""
        return v if v is not None else False
    
    @field_validator('cover_image_url', mode='before')
    @classmethod
    def compute_cover_image_url(cls, v, info):
        """Generate cover_image_url from cover_image_id if available"""
        if hasattr(info, 'data') and 'cover_image_id' in info.data:
            cover_image_id = info.data.get('cover_image_id')
            if cover_image_id:
                from app.core.cloudflare_config import cloudflare_settings
                return f"{cloudflare_settings.delivery_url}/{cover_image_id}/medium"
        return v
    
    class Config:
        from_attributes = True
