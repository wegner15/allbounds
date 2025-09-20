from typing import Any, List, Dict

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.media import MediaAssetResponse, MediaAssetUpdate, MediaAssetConfirm, PresignedUploadResponse
from app.services.media import media_service
from app.auth.dependencies import get_current_user, has_permission
from app.api.api_v1.endpoints.media_response import MediaAssetResponseWrapper

router = APIRouter()

@router.get("/", response_model=List[Dict[str, Any]])
def get_media_assets(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    entity_type: str = Query(None, description="Filter media assets by entity type"),
    entity_id: int = Query(None, description="Filter media assets by entity ID"),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve all media assets.
    """
    media_assets = media_service.get_media_assets_by_entity(
        db, entity_type=entity_type, entity_id=entity_id, skip=skip, limit=limit
    )
    
    # Convert media assets to response format for gallery
    result = []
    for asset in media_assets:
        # Generate proper image URL
        image_url = media_service.get_presigned_url(db, asset.id)
        if not image_url and asset.file_path.startswith("cloudflare://"):
            # Fallback to direct Cloudflare URL construction
            from app.core.cloudflare_config import cloudflare_settings
            image_url = f"{cloudflare_settings.delivery_url}/{asset.storage_key}/medium"
        elif not image_url:
            image_url = asset.file_path
            
        result.append({
            "id": asset.id,
            "filename": asset.filename,
            "file_path": image_url,
            "alt_text": asset.alt_text,
            "title": asset.title,
            "caption": asset.caption,
            "width": asset.width,
            "height": asset.height,
        })
    
    return result

@router.get("/{media_id}", response_model=Dict[str, Any])
def get_media_asset(
    media_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve a specific media asset by ID.
    """
    media_asset = media_service.get_media_asset(db, media_id=media_id)
    if media_asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    
    # Add presigned URL to the media asset
    url = media_service.get_presigned_url(db, media_asset.id)
    
    return MediaAssetResponseWrapper.convert(media_asset, url)

@router.post("/upload", response_model=Dict[str, Any])
def upload_media_asset(
    db: Session = Depends(get_db),
    file: UploadFile = File(...),
    entity_type: str = Form(...),
    entity_id: int = Form(...),
    alt_text: str = Form(None),
    title: str = Form(None),
    caption: str = Form(None),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Upload a new media asset for gallery.
    """
    media_asset = media_service.create_media_asset(
        db, file, entity_type, entity_id, alt_text, title, caption, current_user.id
    )
    
    if media_asset is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media asset"
        )
    
    # Associate with entity if provided
    if entity_type and entity_id:
        media_service.associate_media_with_entity(db, media_asset.id, entity_type, entity_id)
    
    # Generate proper image URL for response
    image_url = media_service.get_presigned_url(db, media_asset.id)
    if not image_url and media_asset.file_path.startswith("cloudflare://"):
        # Fallback to direct Cloudflare URL construction
        from app.core.cloudflare_config import cloudflare_settings
        image_url = f"{cloudflare_settings.delivery_url}/{media_asset.storage_key}/medium"
    elif not image_url:
        image_url = media_asset.file_path
    
    # Return the media asset with file_path for frontend
    return {
        "id": media_asset.id,
        "filename": media_asset.filename,
        "file_path": image_url,
        "alt_text": media_asset.alt_text,
        "title": media_asset.title,
        "caption": media_asset.caption,
        "width": media_asset.width,
        "height": media_asset.height,
    }

@router.post("/presigned-url", response_model=PresignedUploadResponse)
def get_presigned_upload_url(
    *,
    db: Session = Depends(get_db),
    request: dict,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get a presigned URL for client-side uploads.
    """
    filename = request.get("filename")
    content_type = request.get("content_type")
    presigned_data = media_service.get_upload_presigned_post(filename, content_type)
    
    if presigned_data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate presigned upload URL"
        )
    
    return {
        "url": presigned_data["url"],
        "fields": presigned_data["fields"],
        "storage_key": presigned_data["storage_key"]
    }

@router.post("/confirm-upload", response_model=Dict[str, Any])
def confirm_upload(
    *,
    db: Session = Depends(get_db),
    confirm_data: MediaAssetConfirm,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Confirm a client-side upload by creating a database record.
    """
    media_asset = media_service.confirm_upload(
        db,
        confirm_data.storage_key,
        confirm_data.filename,
        confirm_data.file_size,
        confirm_data.content_type,
        confirm_data.entity_type,
        confirm_data.entity_id,
        confirm_data.alt_text,
        confirm_data.title
    )
    
    # Add presigned URL to the media asset
    url = media_service.get_presigned_url(db, media_asset.id)
    
    return MediaAssetResponseWrapper.convert(media_asset, url)

@router.put("/{media_id}", response_model=Dict[str, Any])
def update_media_asset(
    *,
    db: Session = Depends(get_db),
    media_id: int,
    media_in: MediaAssetUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a media asset.
    """
    media_asset = media_service.get_media_asset(db, media_id=media_id)
    if media_asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    
    media_asset = media_service.update_media_asset(
        db,
        media_id,
        media_in.alt_text,
        media_in.title,
        media_in.entity_type,
        media_in.entity_id
    )
    
    # Add presigned URL to the media asset
    url = media_service.get_presigned_url(db, media_asset.id)
    
    return MediaAssetResponseWrapper.convert(media_asset, url)

@router.delete("/{media_id}", response_model=Dict[str, Any])
def delete_media_asset(
    *,
    db: Session = Depends(get_db),
    media_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a media asset.
    """
    media_asset = media_service.get_media_asset(db, media_id=media_id)
    if media_asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    
    success = media_service.delete_media_asset(db, media_id=media_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete media asset"
        )
    
    # Return the media asset before deletion
    url = media_service.get_presigned_url(db, media_asset.id)
    
    return MediaAssetResponseWrapper.convert(media_asset, url)
