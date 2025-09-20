from typing import List, Optional, Dict, Any, BinaryIO
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import os
from fastapi import UploadFile

from app.models.media import MediaAsset
from app.services.cloudflare_images import cloudflare_images_service

class MediaService:
    def get_media_assets(self, db: Session, skip: int = 0, limit: int = 100) -> List[MediaAsset]:
        """
        Retrieve all media assets with pagination.
        """
        return db.query(MediaAsset).filter(MediaAsset.is_active == True).offset(skip).limit(limit).all()
    
    def get_media_assets_by_entity(self, db: Session, entity_type: Optional[str] = None, 
                                  entity_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[MediaAsset]:
        """
        Retrieve media assets filtered by entity type and ID.
        """
        if entity_type and entity_id:
            from app.models.hotel import hotel_media
            from app.models.media import package_media, group_trip_media, attraction_media
            from app.models.hotel import Hotel
            from app.models.package import Package
            from app.models.group_trip import GroupTrip
            from app.models.attraction import Attraction
            
            if entity_type == 'hotel':
                return db.query(MediaAsset).join(
                    hotel_media, MediaAsset.id == hotel_media.c.media_asset_id
                ).filter(
                    hotel_media.c.hotel_id == entity_id,
                    MediaAsset.is_active == True
                ).offset(skip).limit(limit).all()
                
            elif entity_type == 'package':
                return db.query(MediaAsset).join(
                    package_media, MediaAsset.id == package_media.c.media_asset_id
                ).filter(
                    package_media.c.package_id == entity_id,
                    MediaAsset.is_active == True
                ).offset(skip).limit(limit).all()
                
            elif entity_type == 'group_trip':
                return db.query(MediaAsset).join(
                    group_trip_media, MediaAsset.id == group_trip_media.c.media_asset_id
                ).filter(
                    group_trip_media.c.group_trip_id == entity_id,
                    MediaAsset.is_active == True
                ).offset(skip).limit(limit).all()
                
            elif entity_type == 'attraction':
                return db.query(MediaAsset).join(
                    attraction_media, MediaAsset.id == attraction_media.c.media_asset_id
                ).filter(
                    attraction_media.c.attraction_id == entity_id,
                    MediaAsset.is_active == True
                ).offset(skip).limit(limit).all()
        
        # Fallback to all media assets if no entity filter
        return self.get_media_assets(db, skip, limit)
    
    def get_media_asset(self, db: Session, media_id: int) -> Optional[MediaAsset]:
        """
        Retrieve a specific media asset by ID.
        """
        return db.query(MediaAsset).filter(MediaAsset.id == media_id, MediaAsset.is_active == True).first()
    
    def get_media_asset_by_key(self, db: Session, key: str) -> Optional[MediaAsset]:
        """
        Retrieve a specific media asset by storage key.
        """
        return db.query(MediaAsset).filter(MediaAsset.storage_key == key, MediaAsset.is_active == True).first()
    
    def create_media_asset(self, db: Session, file: UploadFile, entity_type: Optional[str] = None, 
                          entity_id: Optional[int] = None, alt_text: Optional[str] = None,
                          title: Optional[str] = None, caption: Optional[str] = None, 
                          user_id: Optional[int] = None) -> Optional[MediaAsset]:
        """
        Create a new media asset by uploading a file to Cloudflare Images and storing metadata in the database.
        
        Args:
            db: Database session
            file: Uploaded file
            entity_type: Type of entity this media belongs to (e.g., "attraction", "package")
            entity_id: ID of the entity this media belongs to
            alt_text: Alternative text for the image
            title: Title for the media asset
            caption: Caption for the media asset
            user_id: ID of the user creating the media asset
            
        Returns:
            The created media asset or None if upload failed
        """
        # Generate a unique storage key
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        storage_key = f"{uuid.uuid4()}{file_extension}"
        
        # Upload file to Cloudflare Images
        file.file.seek(0)  # Ensure we're at the start of the file
        file_data = file.file.read()
        
        try:
            # Upload to Cloudflare Images
            upload_response = cloudflare_images_service.upload_image(
                file_data=file_data,
                file_name=file.filename or storage_key,
                metadata={
                    "entity_type": entity_type,
                    "entity_id": str(entity_id) if entity_id else None,
                    "alt_text": alt_text,
                    "caption": caption
                }
            )
            
            if not upload_response.get("success"):
                return None
                
            cloudflare_id = upload_response["result"]["id"]
            
        except Exception as e:
            print(f"Error uploading to Cloudflare Images: {e}")
            return None
        
        # Create database record
        db_media = MediaAsset(
            filename=file.filename,
            file_path=f"cloudflare://{cloudflare_id}",
            storage_key=cloudflare_id,
            content_type=file.content_type,
            file_size=file.size,
            entity_type=entity_type,
            entity_id=entity_id,
            alt_text=alt_text,
            caption=caption,
            title=title,
            created_by_id=user_id
        )
        db.add(db_media)
        db.commit()
        db.refresh(db_media)
        return db_media
    
    def update_media_asset(self, db: Session, media_id: int, alt_text: Optional[str] = None,
                          title: Optional[str] = None, entity_type: Optional[str] = None,
                          entity_id: Optional[int] = None, caption: Optional[str] = None) -> Optional[MediaAsset]:
        """
        Update metadata for an existing media asset.
        
        Args:
            db: Database session
            media_id: ID of the media asset to update
            alt_text: New alternative text
            title: New title
            entity_type: New entity type
            entity_id: New entity ID
            
        Returns:
            The updated media asset or None if not found
        """
        db_media = self.get_media_asset(db, media_id)
        if not db_media:
            return None
        
        if alt_text is not None:
            db_media.alt_text = alt_text
        
        if title is not None:
            db_media.title = title
        
        if entity_type is not None:
            db_media.entity_type = entity_type
        
        if entity_id is not None:
            db_media.entity_id = entity_id
        
        if caption is not None:
            db_media.caption = caption
        
        db.commit()
        db.refresh(db_media)
        return db_media
    
    def delete_media_asset(self, db: Session, media_id: int) -> bool:
        """
        Delete a media asset by setting is_active to False and optionally removing from Cloudflare Images.
        
        Args:
            db: Database session
            media_id: ID of the media asset to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if not db_media:
            return False
        
        # Soft delete in database
        db_media.is_active = False
        db.commit()
        
        # Delete from Cloudflare Images (optional, can be kept for recovery)
        # try:
        #     cloudflare_images_service.delete_image(db_media.storage_key)
        # except Exception as e:
        #     print(f"Error deleting from Cloudflare Images: {e}")
        
        return True
    
    def get_presigned_url(self, db: Session, media_id: int, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for accessing a media asset.
        
        Args:
            db: Database session
            media_id: ID of the media asset
            expiration: Time in seconds for the URL to remain valid
            
        Returns:
            Presigned URL or None if not found or error
        """
        db_media = self.get_media_asset(db, media_id)
        if not db_media:
            return None
        
        # For Cloudflare Images, generate the delivery URL
        # If signed URLs are required, generate signed URL, otherwise use public URL
        try:
            from app.core.cloudflare_config import cloudflare_settings
            if cloudflare_settings.require_signed_urls:
                from datetime import datetime, timedelta
                expiry = datetime.utcnow() + timedelta(seconds=expiration)
                return cloudflare_images_service.generate_signed_url(
                    db_media.storage_key, 
                    "medium",  # default variant
                    expiry
                )
            else:
                # Public URL format: https://imagedelivery.net/{account_hash}/{image_id}/{variant_name}
                return f"{cloudflare_settings.delivery_url}/{db_media.storage_key}/medium"
        except Exception as e:
            print(f"Error generating Cloudflare Images URL: {e}")
            return None
    
    def get_upload_presigned_post(self, filename: str, content_type: str, 
                                 expiration: int = 3600) -> Optional[Dict[str, Any]]:
        """
        Generate a direct upload URL for client-side uploads to Cloudflare Images.
        
        Args:
            filename: Original filename
            content_type: MIME type of the file
            expiration: Time in seconds for the URL to remain valid
            
        Returns:
            Direct upload data or None if error
        """
        try:
            from datetime import datetime, timedelta
            expiry = datetime.utcnow() + timedelta(seconds=expiration)
            
            # Get direct upload URL from Cloudflare Images
            response = cloudflare_images_service.get_direct_upload_url(
                metadata={
                    "original_filename": filename,
                    "content_type": content_type
                },
                expiry=expiry
            )
            
            if response.get("success"):
                return {
                    "url": response["result"]["uploadURL"],
                    "id": response["result"]["id"]
                }
            return None
        except Exception as e:
            print(f"Error generating Cloudflare Images direct upload URL: {e}")
            return None
    
    def confirm_upload(self, db: Session, storage_key: str, filename: str, file_size: int,
                      content_type: str, entity_type: Optional[str] = None, entity_id: Optional[int] = None,
                      alt_text: Optional[str] = None, title: Optional[str] = None) -> MediaAsset:
        """
        Confirm a client-side upload by creating a database record.
        
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
            The created media asset
        """
        db_media = MediaAsset(
            filename=filename,
            file_path=f"/uploads/{storage_key}",
            storage_key=storage_key,
            content_type=content_type,
            file_size=file_size,
            entity_type=entity_type,
            entity_id=entity_id,
            alt_text=alt_text,
            title=title or filename,
            created_by_id=1  # Default to admin user for now
        )
        db.add(db_media)
        db.commit()
        db.refresh(db_media)
        return db_media
    
    def associate_media_with_entity(self, db: Session, media_id: int, entity_type: str, entity_id: int) -> bool:
        """
        Associate a media asset with an entity by adding it to the appropriate junction table.
        
        Args:
            db: Database session
            media_id: ID of the media asset
            entity_type: Type of entity ('hotel', 'package', 'group_trip', 'attraction')
            entity_id: ID of the entity
            
        Returns:
            True if association was successful, False otherwise
        """
        from app.models.hotel import hotel_media
        from app.models.media import package_media, group_trip_media, attraction_media
        
        try:
            if entity_type == 'hotel':
                # Check if association already exists
                existing = db.execute(
                    hotel_media.select().where(
                        hotel_media.c.hotel_id == entity_id,
                        hotel_media.c.media_asset_id == media_id
                    )
                ).first()
                
                if not existing:
                    db.execute(
                        hotel_media.insert().values(
                            hotel_id=entity_id,
                            media_asset_id=media_id
                        )
                    )
                    
            elif entity_type == 'package':
                existing = db.execute(
                    package_media.select().where(
                        package_media.c.package_id == entity_id,
                        package_media.c.media_asset_id == media_id
                    )
                ).first()
                
                if not existing:
                    db.execute(
                        package_media.insert().values(
                            package_id=entity_id,
                            media_asset_id=media_id
                        )
                    )
                    
            elif entity_type == 'group_trip':
                existing = db.execute(
                    group_trip_media.select().where(
                        group_trip_media.c.group_trip_id == entity_id,
                        group_trip_media.c.media_asset_id == media_id
                    )
                ).first()
                
                if not existing:
                    db.execute(
                        group_trip_media.insert().values(
                            group_trip_id=entity_id,
                            media_asset_id=media_id
                        )
                    )
                    
            elif entity_type == 'attraction':
                existing = db.execute(
                    attraction_media.select().where(
                        attraction_media.c.attraction_id == entity_id,
                        attraction_media.c.media_asset_id == media_id
                    )
                ).first()
                
                if not existing:
                    db.execute(
                        attraction_media.insert().values(
                            attraction_id=entity_id,
                            media_asset_id=media_id
                        )
                    )
            else:
                return False
                
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            print(f"Error associating media with entity: {e}")
            return False

media_service = MediaService()
