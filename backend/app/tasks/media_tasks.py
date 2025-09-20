import logging
import aiohttp
import io
import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session

from app.services.media import media_service
from app.media.r2 import r2_client

logger = logging.getLogger(__name__)

async def process_uploaded_media(db: Session, storage_key: str, filename: str, 
                               size_bytes: int, mime_type: str, entity_type: Optional[str] = None, 
                               entity_id: Optional[int] = None, alt_text: Optional[str] = None, 
                               title: Optional[str] = None) -> dict:
    """
    Process an uploaded media file.
    
    Args:
        db: Database session
        storage_key: Storage key of the uploaded file
        filename: Original filename
        size_bytes: Size of the file in bytes
        mime_type: MIME type of the file
        entity_type: Type of entity this media belongs to
        entity_id: ID of the entity this media belongs to
        alt_text: Alternative text for the image
        title: Title for the media asset
        
    Returns:
        Dictionary with media asset information
    """
    logger.info(f"Processing uploaded media: {filename} ({storage_key})")
    
    # Create media asset record in database
    media_asset = media_service.confirm_upload(
        db, storage_key, filename, size_bytes, mime_type, 
        entity_type, entity_id, alt_text, title
    )
    
    # Generate presigned URL for the media asset
    url = media_service.get_presigned_url(db, media_asset.id)
    
    return {
        "id": media_asset.id,
        "filename": media_asset.filename,
        "storage_key": media_asset.storage_key,
        "mime_type": media_asset.mime_type,
        "size_bytes": media_asset.size_bytes,
        "url": url
    }

async def download_and_upload_external_media(db: Session, external_url: str, 
                                          entity_type: Optional[str] = None, 
                                          entity_id: Optional[int] = None, 
                                          alt_text: Optional[str] = None, 
                                          title: Optional[str] = None) -> Optional[dict]:
    """
    Download a media file from an external URL and upload it to R2.
    
    Args:
        db: Database session
        external_url: External URL to download from
        entity_type: Type of entity this media belongs to
        entity_id: ID of the entity this media belongs to
        alt_text: Alternative text for the image
        title: Title for the media asset
        
    Returns:
        Dictionary with media asset information or None if failed
    """
    logger.info(f"Downloading media from external URL: {external_url}")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(external_url) as response:
                if response.status != 200:
                    logger.error(f"Failed to download media from {external_url}: {response.status}")
                    return None
                
                # Get content type and filename
                content_type = response.headers.get("Content-Type", "application/octet-stream")
                content_disposition = response.headers.get("Content-Disposition", "")
                filename = None
                
                # Try to extract filename from Content-Disposition header
                if "filename=" in content_disposition:
                    filename = content_disposition.split("filename=")[1].strip('"')
                
                # If filename not found, extract from URL
                if not filename:
                    filename = external_url.split("/")[-1].split("?")[0]
                
                # If still no filename, use a generic one
                if not filename:
                    filename = f"downloaded_media_{content_type.replace('/', '_')}"
                
                # Read content
                content = await response.read()
                content_io = io.BytesIO(content)
                
                # Upload to R2
                storage_key = f"{uuid.uuid4()}{os.path.splitext(filename)[1]}"
                upload_success = r2_client.upload_file(
                    content_io,
                    storage_key,
                    content_type
                )
                
                if not upload_success:
                    logger.error(f"Failed to upload media to R2: {storage_key}")
                    return None
                
                # Create media asset record in database
                media_asset = media_service.confirm_upload(
                    db, storage_key, filename, len(content), content_type, 
                    entity_type, entity_id, alt_text, title
                )
                
                # Generate presigned URL for the media asset
                url = media_service.get_presigned_url(db, media_asset.id)
                
                return {
                    "id": media_asset.id,
                    "filename": media_asset.filename,
                    "storage_key": media_asset.storage_key,
                    "mime_type": media_asset.mime_type,
                    "size_bytes": media_asset.size_bytes,
                    "url": url
                }
    except Exception as e:
        logger.exception(f"Error downloading and uploading external media: {e}")
        return None
