from pydantic import BaseModel, Field
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
    summary: Optional[str] = Field(None, description="Summary of the blog post")
    tags: Optional[List[str]] = Field(None, description="Tags for the blog post")
    
# Schema for creating a new Blog Post
class BlogPostCreate(BlogPostBase):
    slug: Optional[str] = Field(None, description="URL-friendly slug for the blog post")

# Schema for updating a Blog Post
class BlogPostUpdate(BaseModel):
    title: Optional[str] = Field(None, description="Title of the blog post")
    content: Optional[str] = Field(None, description="Content of the blog post")
    summary: Optional[str] = Field(None, description="Summary of the blog post")
    featured_image: Optional[str] = Field(None, description="Featured image URL for the blog post")
    tags: Optional[List[str]] = Field(None, description="Tags for the blog post")
    is_published: Optional[bool] = Field(None, description="Whether the blog post is published")
    is_active: Optional[bool] = Field(None, description="Whether the blog post is active")

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
    tags: List[TagResponse] = []
    
    class Config:
        from_attributes = True
