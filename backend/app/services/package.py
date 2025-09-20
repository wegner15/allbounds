from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.models.package import Package
from app.models.media import MediaAsset
from app.models.holiday_type import HolidayType
from app.schemas.package import PackageCreate, PackageUpdate
from app.utils.slug import create_slug
from app.core.cloudflare_config import cloudflare_settings

class PackageService:
    def _get_cloudflare_image_url(self, image_id: str, variant: str = "medium") -> str:
        """
        Generate Cloudflare Images delivery URL.
        """
        if not image_id:
            return None
        return f"{cloudflare_settings.delivery_url}/{image_id}/{variant}"

    def get_packages(self, db: Session, skip: int = 0, limit: int = 100) -> List[Package]:
        """
        Retrieve all packages with pagination.
        """
        return db.query(Package).options(
            joinedload(Package.country),
            joinedload(Package.holiday_types)
        ).filter(Package.is_active == True).offset(skip).limit(limit).all()
    
    def get_packages_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Package]:
        """
        Retrieve all packages for a specific country with pagination.
        """
        return db.query(Package).options(
            joinedload(Package.country),
            joinedload(Package.holiday_types)
        ).filter(
            Package.country_id == country_id,
            Package.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_featured_packages(self, db: Session, skip: int = 0, limit: int = 100) -> List[Package]:
        """
        Retrieve featured packages with pagination.
        """
        return db.query(Package).options(
            joinedload(Package.country),
            joinedload(Package.holiday_types)
        ).filter(
            Package.is_active == True,
            Package.is_featured == True
        ).offset(skip).limit(limit).all()
    
    def get_package(self, db: Session, package_id: int) -> Optional[Package]:
        """
        Retrieve a specific package by ID.
        """
        return db.query(Package).options(
            joinedload(Package.country),
            joinedload(Package.holiday_types)
        ).filter(Package.id == package_id, Package.is_active == True).first()
    
    def get_package_by_slug(self, db: Session, slug: str) -> Optional[Package]:
        """
        Retrieve a specific package by slug.
        """
        return db.query(Package).filter(Package.slug == slug, Package.is_active == True).first()
    
    def get_package_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get package details with gallery images formatted for frontend.
        """
        package = db.query(Package).options(
            joinedload(Package.media_assets),
            joinedload(Package.country),
            joinedload(Package.holiday_types)
        ).filter(Package.slug == slug, Package.is_active == True).first()
        
        if not package:
            return None
            
        # Format gallery images
        gallery_images = []
        cover_image = None
        
        for media in package.media_assets:
            if media.is_active:
                # Generate Cloudflare image URL properly
                if media.storage_key:
                    # Use storage_key (Cloudflare image ID) to construct URL
                    image_url = self._get_cloudflare_image_url(media.storage_key)
                elif media.file_path and media.file_path.startswith('http'):
                    # Already a full URL
                    image_url = media.file_path
                elif media.file_path and not media.file_path.startswith("cloudflare://"):
                    # Assume it's a Cloudflare image ID
                    image_url = self._get_cloudflare_image_url(media.file_path)
                else:
                    # Fallback
                    image_url = media.file_path or ""
                    
                image_data = {
                    "id": media.id,
                    "filename": media.filename,
                    "alt_text": media.alt_text or package.name,
                    "title": media.title,
                    "caption": media.caption,
                    "width": media.width,
                    "height": media.height,
                    "file_path": image_url,
                    "cloudflare_id": media.storage_key or media.file_path if not media.file_path.startswith('http') else None,
                }
                gallery_images.append(image_data)
        
        # Use image_id as cover image, or first gallery image as fallback
        if package.image_id:
            cover_image = self._get_cloudflare_image_url(package.image_id)
        elif gallery_images:
            cover_image = gallery_images[0]["file_path"]
            
        return {
            "id": package.id,
            "name": package.name,
            "summary": package.summary,
            "description": package.description,
            "slug": package.slug,
            "duration_days": package.duration_days,
            "price": float(package.price) if package.price else None,
            "itinerary": package.itinerary,
            "inclusions": package.inclusions,
            "exclusions": package.exclusions,
            "cover_image": cover_image,
            "gallery_images": gallery_images,
            "country": {
                "id": package.country.id,
                "name": package.country.name,
                "slug": package.country.slug,
            } if package.country else None,
            "holiday_types": [
                {
                    "id": ht.id,
                    "name": ht.name,
                    "slug": ht.slug,
                }
                for ht in package.holiday_types
            ],
            "is_active": package.is_active,
            "is_featured": package.is_featured,
        }
    
    def create_package(self, db: Session, package_create: PackageCreate) -> Package:
        """
        Create a new package.
        """
        slug = create_slug(package_create.name)
        db_package = Package(
            name=package_create.name,
            summary=package_create.summary,
            description=package_create.description,
            country_id=package_create.country_id,
            duration_days=package_create.duration_days,
            price=package_create.price,
            itinerary=package_create.itinerary,
            inclusions=package_create.inclusions,
            exclusions=package_create.exclusions,
            slug=slug,
        )
        db.add(db_package)
        db.flush()  # Flush to get the ID
        
        # Handle holiday types
        if package_create.holiday_type_ids:
            holiday_types = db.query(HolidayType).filter(HolidayType.id.in_(package_create.holiday_type_ids)).all()
            db_package.holiday_types.extend(holiday_types)
        
        db.commit()
        db.refresh(db_package)
        return db_package
    
    def update_package(self, db: Session, package_id: int, package_update: PackageUpdate) -> Optional[Package]:
        """
        Update an existing package.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        if not db_package:
            return None
        
        update_data = package_update.model_dump(exclude_unset=True)
        
        # Handle holiday types separately
        if 'holiday_type_ids' in update_data:
            holiday_type_ids = update_data.pop('holiday_type_ids')
            if holiday_type_ids is not None:
                db_package.holiday_types.clear()
                if holiday_type_ids:
                    holiday_types = db.query(HolidayType).filter(HolidayType.id.in_(holiday_type_ids)).all()
                    db_package.holiday_types.extend(holiday_types)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_package, key, value)
        
        db.commit()
        db.refresh(db_package)
        return db_package
    
    def delete_package(self, db: Session, package_id: int) -> bool:
        """
        Soft delete a package by setting is_active to False.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        if not db_package:
            return False
        
        db_package.is_active = False
        db.commit()
        return True
    
    def publish_package(self, db: Session, package_id: int) -> Optional[Package]:
        """
        Publish a package by setting published_at to the current time and is_published to True.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        if not db_package:
            return None
        
        db_package.published_at = datetime.utcnow()
        db_package.is_published = True
        db.commit()
        db.refresh(db_package)
        return db_package
    
    def unpublish_package(self, db: Session, package_id: int) -> Optional[Package]:
        """
        Unpublish a package by setting published_at to None and is_published to False.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        if not db_package:
            return None
        
        db_package.published_at = None
        db_package.is_published = False
        db.commit()
        db.refresh(db_package)
        return db_package
    
    def add_holiday_type(self, db: Session, package_id: int, holiday_type_id: int) -> Optional[Package]:
        """
        Add a holiday type to a package.
        """
        from app.models.holiday_type import HolidayType
        
        db_package = db.query(Package).filter(Package.id == package_id).first()
        db_holiday_type = db.query(HolidayType).filter(HolidayType.id == holiday_type_id).first()
        
        if not db_package or not db_holiday_type:
            return None
        
        db_package.holiday_types.append(db_holiday_type)
        db.commit()
        db.refresh(db_package)
        return db_package
    
    def remove_holiday_type(self, db: Session, package_id: int, holiday_type_id: int) -> Optional[Package]:
        """
        Remove a holiday type from a package.
        """
        from app.models.holiday_type import HolidayType
        
        db_package = db.query(Package).filter(Package.id == package_id).first()
        db_holiday_type = db.query(HolidayType).filter(HolidayType.id == holiday_type_id).first()
        
        if not db_package or not db_holiday_type:
            return None
        
        if db_holiday_type in db_package.holiday_types:
            db_package.holiday_types.remove(db_holiday_type)
            db.commit()
            db.refresh(db_package)
        
        return db_package
    
    def set_cover_image(self, db: Session, package_id: int, image_id: str) -> Optional[Package]:
        """
        Set the cover image for a package.
        """
        import logging
        logger = logging.getLogger(__name__)
        
        logger.info(f"Setting cover image for package {package_id} with image_id {image_id} (type: {type(image_id)})")
        
        db_package = db.query(Package).filter(Package.id == package_id).first()
        if not db_package:
            logger.error(f"Package with ID {package_id} not found")
            return None
        
        # Convert image_id to string if it's not already
        if image_id is not None and not isinstance(image_id, str):
            image_id = str(image_id)
            logger.info(f"Converted image_id to string: {image_id}")
        
        # Update the package's image_id
        db_package.image_id = image_id
        logger.info(f"Updated package {package_id} with image_id {image_id}")
        
        # Commit the changes
        db.commit()
        db.refresh(db_package)
        logger.info(f"Changes committed. Package now has image_id: {db_package.image_id}")
        
        return db_package
    
    def add_media_to_package(self, db: Session, package_id: int, media_id: int) -> Optional[Package]:
        """
        Add a media asset to a package's gallery.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        
        if not db_package or not db_media:
            return None
        
        if db_media not in db_package.media_assets:
            db_package.media_assets.append(db_media)
            db.commit()
            db.refresh(db_package)
        
        return db_package
    
    def remove_media_from_package(self, db: Session, package_id: int, media_id: int) -> Optional[Package]:
        """
        Remove a media asset from a package's gallery.
        """
        db_package = db.query(Package).filter(Package.id == package_id).first()
        db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        
        if not db_package or not db_media:
            return None
        
        if db_media in db_package.media_assets:
            db_package.media_assets.remove(db_media)
            db.commit()
            db.refresh(db_package)
        
        return db_package

package_service = PackageService()
