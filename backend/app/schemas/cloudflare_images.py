"""
Schemas for Cloudflare Images API.
"""
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class DirectUploadRequest(BaseModel):
    """
    Request schema for direct creator upload.
    """
    require_signed_urls: bool = Field(True, description="Whether to require signed URLs for this image")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata to attach to the image")
    expiry_minutes: Optional[int] = Field(None, description="Optional expiry time in minutes for the upload URL (2-360)")


class DirectUploadResponse(BaseModel):
    """
    Response schema for direct creator upload.
    """
    id: str = Field(..., description="Image ID")
    upload_url: str = Field(..., description="One-time upload URL")


class ImageUploadResponse(BaseModel):
    """
    Response schema for image upload.
    """
    id: str = Field(..., description="Image ID")
    filename: str = Field(..., description="Original filename")
    uploaded: datetime = Field(..., description="Upload timestamp")
    require_signed_urls: bool = Field(..., description="Whether signed URLs are required")
    variants: List[str] = Field(..., description="Available image variant URLs")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Image metadata")


class ImageListResponse(BaseModel):
    """
    Response schema for image list.
    """
    images: List[ImageUploadResponse] = Field(..., description="List of images")
    total_count: int = Field(..., description="Total number of images")
    page_count: int = Field(..., description="Number of pages")
    page_size: int = Field(..., description="Number of images per page")
    current_page: int = Field(..., description="Current page number")


class VariantOptions(BaseModel):
    """
    Options for image variant creation.
    """
    width: Optional[int] = Field(None, description="Width of the variant in pixels")
    height: Optional[int] = Field(None, description="Height of the variant in pixels")
    fit: str = Field("scale-down", description="Fit option (scale-down, contain, cover, crop, pad)")
    metadata: str = Field("none", description="Metadata option (none, copyright, keep)")


class VariantRequest(BaseModel):
    """
    Request schema for variant creation.
    """
    id: str = Field(..., description="Variant ID")
    options: VariantOptions = Field(..., description="Variant options")
    never_require_signed_urls: bool = Field(False, description="Whether to always allow public access")


class VariantResponse(BaseModel):
    """
    Response schema for variant.
    """
    id: str = Field(..., description="Variant ID")
    options: VariantOptions = Field(..., description="Variant options")
    never_require_signed_urls: bool = Field(..., description="Whether public access is always allowed")


class SignedUrlRequest(BaseModel):
    """
    Request schema for signed URL generation.
    """
    image_id: str = Field(..., description="Image ID")
    variant_name: str = Field("public", description="Variant name")
    expiry_minutes: Optional[int] = Field(60, description="Expiry time in minutes")


class SignedUrlResponse(BaseModel):
    """
    Response schema for signed URL generation.
    """
    url: str = Field(..., description="Signed URL")
    expires_at: datetime = Field(..., description="Expiry timestamp")
