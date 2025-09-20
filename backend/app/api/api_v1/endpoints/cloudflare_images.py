"""
API endpoints for Cloudflare Images integration.
"""
from typing import Any, List, Optional
from datetime import datetime, timedelta
import io

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.dependencies import get_current_user, has_permission
from app.services.cloudflare_images import cloudflare_images_service
from app.schemas.cloudflare_images import (
    DirectUploadRequest, DirectUploadResponse,
    ImageUploadResponse, ImageListResponse,
    VariantRequest, VariantResponse,
    SignedUrlRequest, SignedUrlResponse
)

router = APIRouter()


@router.post("/direct-upload", response_model=DirectUploadResponse)
def create_direct_upload_url(
    request: DirectUploadRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Create a one-time upload URL for direct creator uploads.
    """
    try:
        # Calculate expiry time if provided
        expiry = None
        if request.expiry_minutes:
            expiry = datetime.utcnow() + timedelta(minutes=request.expiry_minutes)
        
        # Get direct upload URL from Cloudflare
        response = cloudflare_images_service.get_direct_upload_url(
            require_signed_urls=request.require_signed_urls,
            metadata=request.metadata,
            expiry=expiry
        )
        
        # Extract relevant information from response
        result = response.get("result", {})
        
        return DirectUploadResponse(
            id=result.get("id"),
            upload_url=result.get("uploadURL")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create direct upload URL: {str(e)}"
        )


@router.post("/upload", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    require_signed_urls: bool = Form(True),
    metadata: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Upload an image to Cloudflare Images.
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Parse metadata if provided
        parsed_metadata = None
        if metadata:
            import json
            try:
                parsed_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid metadata format. Must be valid JSON."
                )
        
        # Upload image to Cloudflare
        response = cloudflare_images_service.upload_image(
            file_data=file_content,
            file_name=file.filename,
            require_signed_urls=require_signed_urls,
            metadata=parsed_metadata
        )
        
        # Extract relevant information from response
        result = response.get("result", {})
        
        return ImageUploadResponse(
            id=result.get("id"),
            filename=result.get("filename"),
            uploaded=result.get("uploaded"),
            require_signed_urls=result.get("requireSignedURLs", False),
            variants=result.get("variants", []),
            metadata=result.get("metadata")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/upload-and-create-media", response_model=dict)
async def upload_image_and_create_media(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    entity_type: str = Form("activity"),
    entity_id: Optional[int] = Form(None),
    alt_text: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    caption: Optional[str] = Form(None),
    require_signed_urls: bool = Form(True),
    metadata: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Upload an image to Cloudflare Images and create a corresponding MediaAsset record.
    """
    try:
        # Read file content
        file_content = await file.read()
        
        # Parse metadata if provided
        parsed_metadata = None
        if metadata:
            import json
            try:
                parsed_metadata = json.loads(metadata)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid metadata format. Must be valid JSON."
                )
        
        # Upload image to Cloudflare
        cf_response = cloudflare_images_service.upload_image(
            file_data=file_content,
            file_name=file.filename,
            require_signed_urls=require_signed_urls,
            metadata=parsed_metadata
        )
        
        # Extract relevant information from response
        cf_result = cf_response.get("result", {})
        cloudflare_id = cf_result.get("id")
        
        if not cloudflare_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to get Cloudflare image ID"
            )
        
        # Create MediaAsset record
        from app.services.media import media_service
        from app.models.media import MediaAsset
        
        # Create a MediaAsset record with Cloudflare image reference
        db_media = MediaAsset(
            filename=file.filename or "unknown",
            original_filename=file.filename,
            file_path=f"cloudflare://{cloudflare_id}",
            storage_key=cloudflare_id,
            file_size=len(file_content),
            content_type=file.content_type or "image/jpeg",
            alt_text=alt_text,
            title=title,
            caption=caption,
            entity_type=entity_type,
            entity_id=entity_id,
            created_by_id=current_user.id
        )
        
        db.add(db_media)
        db.commit()
        db.refresh(db_media)
        
        # Associate with entity if provided
        if entity_type and entity_id:
            media_service.associate_media_with_entity(db, db_media.id, entity_type, entity_id)
        
        # Ensure we're returning valid JSON by using a proper response model
        from fastapi.responses import JSONResponse
        
        # Prepare the response data
        response_data = {
            "cloudflare_image": {
                "id": cf_result.get("id"),
                "filename": cf_result.get("filename"),
                "uploaded": cf_result.get("uploaded"),
                "require_signed_urls": cf_result.get("requireSignedURLs", False),
                "variants": cf_result.get("variants", []),
                "metadata": cf_result.get("metadata")
            },
            "media_asset": {
                "id": db_media.id,
                "filename": db_media.filename,
                "file_path": db_media.file_path,
                "alt_text": db_media.alt_text,
                "title": db_media.title,
                "caption": db_media.caption,
                "cloudflare_id": cloudflare_id
            }
        }
        
        # Return a properly formatted JSON response
        return response_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image and create media asset: {str(e)}"
        )


@router.get("/{image_id}", response_model=ImageUploadResponse)
def get_image(
    image_id: str,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get details of a specific image.
    """
    try:
        # Get image details from Cloudflare
        response = cloudflare_images_service.get_image(image_id)
        
        # Extract relevant information from response
        result = response.get("result", {})
        
        return ImageUploadResponse(
            id=result.get("id"),
            filename=result.get("filename", "unknown"),
            uploaded=result.get("uploaded"),
            require_signed_urls=result.get("requireSignedURLs", False),
            variants=result.get("variants", []),
            metadata=result.get("metadata")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get image: {str(e)}"
        )


@router.get("/", response_model=ImageListResponse)
def list_images(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List images in the Cloudflare Images account.
    """
    try:
        # List images from Cloudflare
        response = cloudflare_images_service.list_images(page=page, per_page=per_page)
        
        # Extract relevant information from response
        result = response.get("result", {})
        result_info = response.get("result_info", {})
        
        # Convert image data to response schema
        images = []
        for image_data in result:
            images.append(ImageUploadResponse(
                id=image_data.get("id"),
                filename=image_data.get("filename", "unknown"),
                uploaded=image_data.get("uploaded"),
                require_signed_urls=image_data.get("requireSignedURLs", False),
                variants=image_data.get("variants", []),
                metadata=image_data.get("metadata")
            ))
        
        return ImageListResponse(
            images=images,
            total_count=result_info.get("total_count", 0),
            page_count=result_info.get("total_pages", 0),
            page_size=result_info.get("per_page", per_page),
            current_page=result_info.get("page", page)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list images: {str(e)}"
        )


@router.delete("/{image_id}")
def delete_image(
    image_id: str,
    current_user: User = Depends(has_permission("media:delete"))
) -> Any:
    """
    Delete an image from Cloudflare Images.
    """
    try:
        # Delete image from Cloudflare
        response = cloudflare_images_service.delete_image(image_id)
        
        # Check if deletion was successful
        if not response.get("success", False):
            errors = response.get("errors", [])
            error_message = errors[0].get("message", "Unknown error") if errors else "Unknown error"
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete image: {error_message}"
            )
        
        return {"message": "Image deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete image: {str(e)}"
        )


@router.post("/create-default-variants")
def create_default_variants(
    current_user: User = Depends(has_permission("media:manage"))
) -> Any:
    """
    Create default image variants in Cloudflare Images.
    """
    variants = [
        {
            "id": "thumbnail",
            "options": {
                "width": 200,
                "height": 200,
                "fit": "cover",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "medium",
            "options": {
                "width": 800,
                "height": 600,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "large",
            "options": {
                "width": 1200,
                "height": 900,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        }
    ]
    
    results = []
    errors = []
    
    for variant in variants:
        try:
            response = cloudflare_images_service.create_variant(
                variant_id=variant["id"],
                options=variant["options"],
                never_require_signed_urls=variant["never_require_signed_urls"]
            )
            
            if response.get("success"):
                result = response.get("result", {})
                results.append({
                    "id": result.get("id"),
                    "options": result.get("options", {}),
                    "never_require_signed_urls": result.get("neverRequireSignedURLs", False)
                })
            else:
                errors_list = response.get("errors", [])
                if errors_list and errors_list[0].get("code") == 10007:  # Variant already exists
                    # Add to results anyway since it exists
                    results.append({
                        "id": variant["id"],
                        "options": variant["options"],
                        "never_require_signed_urls": variant["never_require_signed_urls"]
                    })
                else:
                    error_msg = f"Failed to create variant {variant['id']}: {errors_list}"
                    errors.append(error_msg)
        except Exception as e:
            errors.append(f"Error creating variant {variant['id']}: {str(e)}")
    
    if errors and not results:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Failed to create any variants", "errors": errors}
        )
    
    return {"created": results, "errors": errors}


@router.post("/variants", response_model=VariantResponse)
def create_variant(
    variant: VariantRequest,
    current_user: User = Depends(has_permission("media:manage"))
) -> Any:
    """
    Create a new image variant.
    """
    try:
        # Create variant in Cloudflare
        response = cloudflare_images_service.create_variant(
            variant_id=variant.id,
            options=variant.options.dict(),
            never_require_signed_urls=variant.never_require_signed_urls
        )
        
        # Extract relevant information from response
        result = response.get("result", {})
        
        return VariantResponse(
            id=result.get("id"),
            options=VariantOptions(**result.get("options", {})),
            never_require_signed_urls=result.get("neverRequireSignedURLs", False)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create variant: {str(e)}"
        )


@router.get("/variants", response_model=List[VariantResponse])
def list_variants(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    List all image variants.
    """
    try:
        # List variants from Cloudflare
        response = cloudflare_images_service.list_variants()
        
        # Extract relevant information from response
        result = response.get("result", [])
        
        # Convert variant data to response schema
        variants = []
        for variant_data in result:
            variants.append(VariantResponse(
                id=variant_data.get("id"),
                options=VariantOptions(**variant_data.get("options", {})),
                never_require_signed_urls=variant_data.get("neverRequireSignedURLs", False)
            ))
        
        return variants
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list variants: {str(e)}"
        )


@router.delete("/variants/{variant_id}")
def delete_variant(
    variant_id: str,
    current_user: User = Depends(has_permission("media:manage"))
) -> Any:
    """
    Delete an image variant.
    """
    try:
        # Delete variant from Cloudflare
        response = cloudflare_images_service.delete_variant(variant_id)
        
        # Check if deletion was successful
        if not response.get("success", False):
            errors = response.get("errors", [])
            error_message = errors[0].get("message", "Unknown error") if errors else "Unknown error"
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete variant: {error_message}"
            )
        
        return {"message": "Variant deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete variant: {str(e)}"
        )


@router.post("/signed-url", response_model=SignedUrlResponse)
def generate_signed_url(
    request: SignedUrlRequest,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Generate a signed URL for a private image.
    """
    try:
        # Calculate expiry time
        expiry = datetime.utcnow() + timedelta(minutes=request.expiry_minutes)
        
        # Generate signed URL
        signed_url = cloudflare_images_service.generate_signed_url(
            image_id=request.image_id,
            variant_name=request.variant_name,
            expiry=expiry
        )
        
        return SignedUrlResponse(
            url=signed_url,
            expires_at=expiry
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate signed URL: {str(e)}"
        )
