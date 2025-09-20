from typing import Dict, Any, Optional
from fastapi import Response
from pydantic import BaseModel

from app.models.media import MediaAsset

class MediaAssetResponseWrapper:
    """
    A wrapper class to convert MediaAsset model instances to a format that matches
    the expected response schema in tests.
    """
    
    @staticmethod
    def convert(media_asset: MediaAsset, url: Optional[str] = None) -> Dict[str, Any]:
        """
        Convert a MediaAsset model instance to a dictionary that matches the expected response schema.
        """
        return {
            "id": media_asset.id,
            "filename": media_asset.filename,
            "file_path": media_asset.file_path,
            "storage_key": media_asset.storage_key,
            "content_type": media_asset.content_type,
            "file_size": media_asset.file_size,
            "entity_type": media_asset.entity_type,
            "entity_id": media_asset.entity_id,
            "alt_text": media_asset.alt_text,
            "title": media_asset.title,
            "is_active": media_asset.is_active,
            "created_by_id": media_asset.created_by_id,
            "created_at": media_asset.created_at,
            "updated_at": media_asset.updated_at,
            "url": url
        }
