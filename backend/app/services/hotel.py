from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload

from app.models.hotel import Hotel
from app.models.country import Country
from app.models.amenity import Amenity
from app.schemas.hotel import HotelCreate, HotelUpdate
from app.utils.slug import create_slug, ensure_unique_slug, update_slug_if_name_changed
from app.core.cloudflare_config import cloudflare_settings

class HotelService:
    def _get_cloudflare_image_url(self, image_id: str, variant: str = "medium") -> Optional[str]:
        """
        Generate Cloudflare Images delivery URL.
        """
        if not image_id:
            return None
        return f"{cloudflare_settings.delivery_url}/{image_id}/{variant}"
    
    def get_hotels(self, db: Session, skip: int = 0, limit: int = 100, recommended: Optional[bool] = None, country: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve all hotels with pagination and optional filtering, including cover images.
        Hotels are ordered by creation date (newest first).
        """
        query = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.media_assets)
        ).filter(Hotel.is_active == True)

        if recommended is not None and recommended:
            # For now, recommended means all active hotels (can be enhanced later with a recommended field)
            pass  # No additional filtering needed

        if country:
            # Join with country to filter by country name
            query = query.join(Hotel.country).filter(Country.name.ilike(f"%{country}%"))

        # Order by created_at descending (newest first)
        query = query.order_by(Hotel.created_at.desc())

        hotels = query.offset(skip).limit(limit).all()

        # Format hotels with cover images
        result = []
        for hotel in hotels:
            # Get cover image
            cover_image_url = None
            if hotel.image_id:
                cover_image_url = self._get_cloudflare_image_url(hotel.image_id)
            else:
                # Fallback to first gallery image
                for media in hotel.media_assets:
                    if media.is_active:
                        if media.file_path.startswith("cloudflare://") and media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break
                        elif media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break

            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "country_id": hotel.country_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_id": hotel.image_id,
                "image_url": cover_image_url,  # Add this for backward compatibility
                "is_active": hotel.is_active,
                "address": hotel.address,
                "city": hotel.city,
                "stars": hotel.stars,
                "price_category": hotel.price_category,
                "amenity_ids": [amenity.id for amenity in hotel.amenities] if hotel.amenities else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)

        return result
    
    def get_hotels_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve all hotels for a specific country with pagination, including cover images.
        Hotels are ordered by creation date (newest first).
        """
        hotels = db.query(Hotel).options(
            joinedload(Hotel.media_assets)
        ).filter(
            Hotel.country_id == country_id,
            Hotel.is_active == True
        ).order_by(Hotel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Format hotels with cover images
        result = []
        for hotel in hotels:
            # Get cover image
            cover_image_url = None
            if hotel.image_id:
                cover_image_url = self._get_cloudflare_image_url(hotel.image_id)
            else:
                # Fallback to first gallery image
                for media in hotel.media_assets:
                    if media.is_active:
                        if media.file_path.startswith("cloudflare://") and media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break
                        elif media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break
            
            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "stars": hotel.stars,
                "address": hotel.address,
                "city": hotel.city,
                "price_category": hotel.price_category,
                "cover_image": cover_image_url,
                "is_active": hotel.is_active,
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)
        
        return result
    
    def get_featured_hotels(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve featured hotels with cover images.
        Hotels are ordered by creation date (newest first).
        """
        hotels = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.media_assets)
        ).filter(
            Hotel.is_active == True,
            Hotel.is_featured == True
        ).order_by(Hotel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Format hotels with cover images
        result = []
        for hotel in hotels:
            # Get cover image
            cover_image_url = None
            if hotel.image_id:
                cover_image_url = self._get_cloudflare_image_url(hotel.image_id)
            else:
                # Fallback to first gallery image
                for media in hotel.media_assets:
                    if media.is_active:
                        if media.file_path.startswith("cloudflare://") and media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break
                        elif media.storage_key:
                            cover_image_url = self._get_cloudflare_image_url(media.storage_key)
                            break
            
            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "country_id": hotel.country_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_id": hotel.image_id,
                "image_url": cover_image_url,
                "is_active": hotel.is_active,
                "is_featured": hotel.is_featured,
                "address": hotel.address,
                "city": hotel.city,
                "stars": hotel.stars,
                "price_category": hotel.price_category,
                "amenity_ids": [amenity.id for amenity in hotel.amenities] if hotel.amenities else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)
        
        return result
    
    def get_hotel(self, db: Session, hotel_id: int) -> Optional[Hotel]:
        """
        Retrieve a specific hotel by ID.
        """
        return db.query(Hotel).filter(Hotel.id == hotel_id, Hotel.is_active == True).first()
    
    def get_hotel_by_slug(self, db: Session, slug: str) -> Optional[Hotel]:
        """
        Retrieve a specific hotel by slug with media assets.
        """
        return db.query(Hotel).options(
            joinedload(Hotel.media_assets)
        ).filter(Hotel.slug == slug, Hotel.is_active == True).first()
    
    def get_hotel_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get hotel details with gallery images formatted for frontend.
        """
        hotel = db.query(Hotel).options(
            joinedload(Hotel.media_assets),
            joinedload(Hotel.country),
            joinedload(Hotel.hotel_type)
        ).filter(Hotel.slug == slug, Hotel.is_active == True).first()
        
        if not hotel:
            return None
            
        # Format gallery images
        gallery_images = []
        cover_image = None
        
        for media in hotel.media_assets:
            if media.is_active:
                # Generate proper Cloudflare Images URL
                image_url = None
                if media.file_path.startswith("cloudflare://") and media.storage_key:
                    image_url = self._get_cloudflare_image_url(media.storage_key)
                elif media.storage_key:
                    # Fallback: assume storage_key is Cloudflare Image ID
                    image_url = self._get_cloudflare_image_url(media.storage_key)
                else:
                    image_url = media.file_path
                
                image_data = {
                    "id": media.id,
                    "filename": media.filename,
                    "alt_text": media.alt_text or hotel.name,
                    "title": media.title,
                    "caption": media.caption,
                    "width": media.width,
                    "height": media.height,
                    "file_path": image_url,
                }
                gallery_images.append(image_data)
        
        # Use image_id as cover image, or first gallery image as fallback
        if hotel.image_id:
            cover_image = self._get_cloudflare_image_url(hotel.image_id)
        elif gallery_images:
            cover_image = gallery_images[0]["file_path"]
            
        return {
            "id": hotel.id,
            "name": hotel.name,
            "summary": hotel.summary,
            "description": hotel.description,
            "slug": hotel.slug,
            "stars": hotel.stars,
            "address": hotel.address,
            "city": hotel.city,
            "price_category": hotel.price_category,
            "amenity_ids": [amenity.id for amenity in hotel.amenities] if hotel.amenities else [],
            "check_in_time": hotel.check_in_time,
            "check_out_time": hotel.check_out_time,
            "cover_image": cover_image,
            "gallery_images": gallery_images,
            "country": {
                "id": hotel.country.id,
                "name": hotel.country.name,
                "slug": hotel.country.slug,
            } if hotel.country else None,
            "hotel_type": {
                "id": hotel.hotel_type.id,
                "name": hotel.hotel_type.name,
                "slug": hotel.hotel_type.slug,
            } if hotel.hotel_type else None,
            "is_active": hotel.is_active,
        }
    
    def create_hotel(self, db: Session, hotel_create: HotelCreate) -> Hotel:
        """
        Create a new hotel.
        """
        slug = create_slug(hotel_create.name)
        
        # Extract amenity_ids before creating hotel
        amenity_ids = hotel_create.amenity_ids or []
        
        db_hotel = Hotel(
            name=hotel_create.name,
            summary=hotel_create.summary,
            description=hotel_create.description,
            country_id=hotel_create.country_id,
            hotel_type_id=hotel_create.hotel_type_id,
            stars=hotel_create.stars,
            address=hotel_create.address,
            city=hotel_create.city,
            latitude=hotel_create.latitude,
            longitude=hotel_create.longitude,
            price_category=hotel_create.price_category,
            amenities_json=None,  # Will be populated from amenity_ids relationship
            check_in_time=hotel_create.check_in_time,
            check_out_time=hotel_create.check_out_time,
            image_id=hotel_create.image_id,
            slug=slug,
        )
        db.add(db_hotel)
        db.flush()  # Flush to get the hotel ID
        
        # Add amenities if provided
        if amenity_ids:
            amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
            db_hotel.amenities = amenities
        
        db.commit()
        db.refresh(db_hotel)
        
        # Expunge amenities relationship to prevent serialization issues
        db.expire(db_hotel, ['amenities'])
        
        return db_hotel
    
    def update_hotel(self, db: Session, hotel_id: int, hotel_update: HotelUpdate) -> Optional[Hotel]:
        """
        Update an existing hotel.
        """
        db_hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not db_hotel:
            return None
        
        update_data = hotel_update.model_dump(exclude_unset=True)
        
        # Handle amenity_ids separately
        amenity_ids = update_data.pop("amenity_ids", None)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, Hotel, db_hotel.slug, hotel_id
        )
        
        for key, value in update_data.items():
            setattr(db_hotel, key, value)
        
        # Update amenities if provided
        if amenity_ids is not None:
            amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
            db_hotel.amenities = amenities
        
        db.commit()
        db.refresh(db_hotel)
        
        # Expunge amenities relationship to prevent serialization issues
        db.expire(db_hotel, ['amenities'])
        
        return db_hotel
    
    def delete_hotel(self, db: Session, hotel_id: int) -> bool:
        """
        Soft delete a hotel by setting is_active to False.
        """
        db_hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not db_hotel:
            return False
        
        db_hotel.is_active = False
        db.commit()
        return True
    
    def assign_package(self, db: Session, hotel_id: int, package_id: int) -> bool:
        """
        Assign a package to a hotel.
        """
        from app.models.package import Package
        
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        package = db.query(Package).filter(Package.id == package_id).first()
        
        if not hotel or not package:
            return False
            
        hotel.packages.append(package)
        db.commit()
        return True
    
    def remove_package(self, db: Session, hotel_id: int, package_id: int) -> bool:
        """
        Remove a package from a hotel.
        """
        from app.models.package import Package
        
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        package = db.query(Package).filter(Package.id == package_id).first()
        
        if not hotel or not package or package not in hotel.packages:
            return False
            
        hotel.packages.remove(package)
        db.commit()
        return True
    
    def assign_group_trip(self, db: Session, hotel_id: int, group_trip_id: int) -> bool:
        """
        Assign a group trip to a hotel.
        """
        from app.models.group_trip import GroupTrip
        
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        
        if not hotel or not group_trip:
            return False
            
        hotel.group_trips.append(group_trip)
        db.commit()
        return True
    
    def remove_group_trip(self, db: Session, hotel_id: int, group_trip_id: int) -> bool:
        """
        Remove a group trip from a hotel.
        """
        from app.models.group_trip import GroupTrip
        
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        
        if not hotel or not group_trip or group_trip not in hotel.group_trips:
            return False
            
        hotel.group_trips.remove(group_trip)
        db.commit()
        return True
    
    def set_cover_image(self, db: Session, hotel_id: int, image_id: str) -> bool:
        """
        Set the cover image for a hotel using Cloudflare Image ID.
        """
        from app.models.media import MediaAsset

        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            return False

        # Check if image_id is a number (internal media ID) or a Cloudflare key
        final_image_id = image_id
        if image_id and image_id.isdigit():
            # It's an internal media ID, look up the storage_key
            media_asset = db.query(MediaAsset).filter(MediaAsset.id == int(image_id)).first()
            if media_asset and media_asset.storage_key:
                final_image_id = media_asset.storage_key

        hotel.image_id = final_image_id
        db.commit()
        return True
    
    def add_amenities(self, db: Session, hotel_id: int, amenity_ids: List[int]) -> Optional[Hotel]:
        """
        Add amenities to a hotel.
        """
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            return None
        
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        
        # Add only new amenities (avoid duplicates)
        existing_ids = {a.id for a in hotel.amenities}
        new_amenities = [a for a in amenities if a.id not in existing_ids]
        hotel.amenities.extend(new_amenities)
        
        db.commit()
        db.refresh(hotel)
        return hotel
    
    def remove_amenities(self, db: Session, hotel_id: int, amenity_ids: List[int]) -> Optional[Hotel]:
        """
        Remove amenities from a hotel.
        """
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            return None
        
        # Remove specified amenities
        hotel.amenities = [a for a in hotel.amenities if a.id not in amenity_ids]
        
        db.commit()
        db.refresh(hotel)
        return hotel
    
    def set_amenities(self, db: Session, hotel_id: int, amenity_ids: List[int]) -> Optional[Hotel]:
        """
        Replace all amenities for a hotel.
        """
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            return None
        
        amenities = db.query(Amenity).filter(Amenity.id.in_(amenity_ids)).all()
        hotel.amenities = amenities
        
        db.commit()
        db.refresh(hotel)
        return hotel

hotel_service = HotelService()
