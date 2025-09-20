from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.models.group_trip import GroupTrip, GroupTripDeparture
from app.models.media import MediaAsset
from app.schemas.group_trip import GroupTripCreate, GroupTripUpdate, GroupTripDepartureCreate, GroupTripDepartureUpdate
from app.utils.slug import create_slug
from app.core.cloudflare_config import cloudflare_settings

class GroupTripService:
    def get_group_trips(self, db: Session, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve all group trips with pagination.
        """
        return db.query(GroupTrip).filter(GroupTrip.is_active == True).offset(skip).limit(limit).all()
    
    def get_group_trips_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve all group trips for a specific country with pagination.
        """
        return db.query(GroupTrip).filter(
            GroupTrip.country_id == country_id,
            GroupTrip.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_featured_group_trips(self, db: Session, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve featured group trips with pagination.
        """
        return db.query(GroupTrip).filter(
            GroupTrip.is_active == True,
            GroupTrip.is_featured == True
        ).offset(skip).limit(limit).all()
    
    def get_group_trip(self, db: Session, group_trip_id: int) -> Optional[GroupTrip]:
        """
        Retrieve a specific group trip by ID.
        """
        return db.query(GroupTrip).filter(GroupTrip.id == group_trip_id, GroupTrip.is_active == True).first()
    
    def get_group_trip_by_slug(self, db: Session, slug: str) -> Optional[GroupTrip]:
        """
        Retrieve a specific group trip by slug.
        """
        return db.query(GroupTrip).filter(GroupTrip.slug == slug, GroupTrip.is_active == True).first()
    
    def get_group_trip_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get group trip details with gallery images formatted for frontend.
        """
        group_trip = db.query(GroupTrip).options(
            joinedload(GroupTrip.media_assets),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.departures)
        ).filter(GroupTrip.slug == slug, GroupTrip.is_active == True).first()
        
        if not group_trip:
            return None
            
        # Format gallery images with Cloudflare URLs
        gallery_images = []
        cover_image = None
        
        for media in group_trip.media_assets:
            if media.is_active:
                # Generate Cloudflare image URL properly
                if media.storage_key:
                    # Use storage_key (Cloudflare image ID) to construct URL
                    image_url = f"{cloudflare_settings.delivery_url}/{media.storage_key}/public"
                elif media.file_path and media.file_path.startswith('http'):
                    # Already a full URL
                    image_url = media.file_path
                elif media.file_path:
                    # Assume it's a Cloudflare image ID
                    image_url = f"{cloudflare_settings.delivery_url}/{media.file_path}/public"
                else:
                    # Fallback
                    image_url = media.file_path or ""
                
                image_data = {
                    "id": media.id,
                    "filename": media.filename,
                    "alt_text": media.alt_text or group_trip.name,
                    "title": media.title,
                    "caption": media.caption,
                    "width": media.width,
                    "height": media.height,
                    "file_path": image_url,
                    "cloudflare_id": media.storage_key or (media.file_path if not media.file_path.startswith('http') else None),
                }
                gallery_images.append(image_data)
        
        # Use image_id as cover image, or first gallery image as fallback
        if group_trip.image_id:
            cover_image = group_trip.image_id
        elif gallery_images:
            cover_image = gallery_images[0]["file_path"]
            
        return {
            "id": group_trip.id,
            "name": group_trip.name,
            "summary": group_trip.summary,
            "description": group_trip.description,
            "slug": group_trip.slug,
            "duration_days": group_trip.duration_days,
            "price": float(group_trip.price) if group_trip.price else None,
            "min_participants": group_trip.min_participants,
            "max_participants": group_trip.max_participants,
            "itinerary": group_trip.itinerary,
            "inclusions": group_trip.inclusions,
            "exclusions": group_trip.exclusions,
            "cover_image": cover_image,
            "gallery_images": gallery_images,
            "country": {
                "id": group_trip.country.id,
                "name": group_trip.country.name,
                "slug": group_trip.country.slug,
            } if group_trip.country else None,
            "holiday_types": [
                {
                    "id": ht.id,
                    "name": ht.name,
                    "slug": ht.slug,
                }
                for ht in group_trip.holiday_types
            ],
            "departures": [
                {
                    "id": dep.id,
                    "start_date": dep.start_date.isoformat() if dep.start_date else None,
                    "end_date": dep.end_date.isoformat() if dep.end_date else None,
                    "available_slots": dep.available_slots,
                    "booked_slots": dep.booked_slots,
                    "is_active": dep.is_active,
                }
                for dep in group_trip.departures if dep.is_active
            ],
            "is_active": group_trip.is_active,
            "is_featured": group_trip.is_featured,
        }
    
    def create_group_trip(self, db: Session, group_trip_create: GroupTripCreate) -> GroupTrip:
        """
        Create a new group trip.
        """
        slug = create_slug(group_trip_create.name)
        db_group_trip = GroupTrip(
            name=group_trip_create.name,
            summary=group_trip_create.summary,
            description=group_trip_create.description,
            country_id=group_trip_create.country_id,
            duration_days=group_trip_create.duration_days,
            price=group_trip_create.price,
            itinerary=group_trip_create.itinerary,
            inclusions=group_trip_create.inclusions,
            exclusions=group_trip_create.exclusions,
            min_participants=group_trip_create.min_participants,
            max_participants=group_trip_create.max_participants,
            slug=slug,
        )
        db.add(db_group_trip)
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def update_group_trip(self, db: Session, group_trip_id: int, group_trip_update: GroupTripUpdate) -> Optional[GroupTrip]:
        """
        Update an existing group trip.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        if not db_group_trip:
            return None
        
        update_data = group_trip_update.model_dump(exclude_unset=True)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_group_trip, key, value)
        
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def delete_group_trip(self, db: Session, group_trip_id: int) -> bool:
        """
        Soft delete a group trip by setting is_active to False.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        if not db_group_trip:
            return False
        
        db_group_trip.is_active = False
        db.commit()
        return True
    
    def publish_group_trip(self, db: Session, group_trip_id: int) -> Optional[GroupTrip]:
        """
        Publish a group trip by setting published_at to the current time.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        if not db_group_trip:
            return None
        
        db_group_trip.published_at = datetime.utcnow()
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def unpublish_group_trip(self, db: Session, group_trip_id: int) -> Optional[GroupTrip]:
        """
        Unpublish a group trip by setting published_at to None.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        if not db_group_trip:
            return None
        
        db_group_trip.published_at = None
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def add_holiday_type(self, db: Session, group_trip_id: int, holiday_type_id: int) -> Optional[GroupTrip]:
        """
        Add a holiday type to a group trip.
        """
        from app.models.holiday_type import HolidayType
        
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_holiday_type = db.query(HolidayType).filter(HolidayType.id == holiday_type_id).first()
        
        if not db_group_trip or not db_holiday_type:
            return None
        
        db_group_trip.holiday_types.append(db_holiday_type)
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def remove_holiday_type(self, db: Session, group_trip_id: int, holiday_type_id: int) -> Optional[GroupTrip]:
        """
        Remove a holiday type from a group trip.
        """
        from app.models.holiday_type import HolidayType
        
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_holiday_type = db.query(HolidayType).filter(HolidayType.id == holiday_type_id).first()
        
        if not db_group_trip or not db_holiday_type:
            return None
        
        if db_holiday_type in db_group_trip.holiday_types:
            db_group_trip.holiday_types.remove(db_holiday_type)
            db.commit()
            db.refresh(db_group_trip)
        
        return db_group_trip
    
    # Group Trip Departure methods
    def get_departures(self, db: Session, group_trip_id: int, skip: int = 0, limit: int = 100) -> List[GroupTripDeparture]:
        """
        Retrieve all departures for a specific group trip with pagination.
        """
        return db.query(GroupTripDeparture).filter(
            GroupTripDeparture.group_trip_id == group_trip_id,
            GroupTripDeparture.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_departure(self, db: Session, departure_id: int) -> Optional[GroupTripDeparture]:
        """
        Retrieve a specific departure by ID.
        """
        return db.query(GroupTripDeparture).filter(
            GroupTripDeparture.id == departure_id,
            GroupTripDeparture.is_active == True
        ).first()
    
    def create_departure(self, db: Session, departure_create: GroupTripDepartureCreate) -> GroupTripDeparture:
        """
        Create a new departure for a group trip.
        """
        db_departure = GroupTripDeparture(
            group_trip_id=departure_create.group_trip_id,
            start_date=departure_create.start_date,
            end_date=departure_create.end_date,
            price=departure_create.price,
            available_slots=departure_create.available_slots,
        )
        db.add(db_departure)
        db.commit()
        db.refresh(db_departure)
        return db_departure
    
    def update_departure(self, db: Session, departure_id: int, departure_update: GroupTripDepartureUpdate) -> Optional[GroupTripDeparture]:
        """
        Update an existing departure.
        """
        db_departure = db.query(GroupTripDeparture).filter(GroupTripDeparture.id == departure_id).first()
        if not db_departure:
            return None
        
        update_data = departure_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_departure, key, value)
        
        db.commit()
        db.refresh(db_departure)
        return db_departure
    
    def delete_departure(self, db: Session, departure_id: int) -> bool:
        """
        Soft delete a departure by setting is_active to False.
        """
        db_departure = db.query(GroupTripDeparture).filter(GroupTripDeparture.id == departure_id).first()
        if not db_departure:
            return False
        
        db_departure.is_active = False
        db.commit()
        return True
    
    # Gallery management methods
    def set_cover_image(self, db: Session, group_trip_id: int, media_id: int) -> Optional[GroupTrip]:
        """
        Set a media asset as the cover image for a group trip.
        """
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        media = db.query(MediaAsset).filter(
            MediaAsset.id == media_id,
            MediaAsset.entity_type == "group_trip",
            MediaAsset.entity_id == group_trip_id,
            MediaAsset.is_active == True
        ).first()
        
        if not group_trip or not media:
            return None
        
        # Set the cover image to the media's file_path (Cloudflare image ID)
        group_trip.image_id = media.file_path
        db.commit()
        db.refresh(group_trip)
        return group_trip
    
    def add_media(self, db: Session, group_trip_id: int, media_id: int) -> Optional[MediaAsset]:
        """
        Associate a media asset with a group trip.
        """
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        
        if not group_trip or not media:
            return None
        
        # Update media to be associated with this group trip
        media.entity_type = "group_trip"
        media.entity_id = group_trip_id
        media.is_active = True
        
        db.commit()
        db.refresh(media)
        return media
    
    def remove_media(self, db: Session, group_trip_id: int, media_id: int) -> bool:
        """
        Remove a media asset from a group trip.
        """
        media = db.query(MediaAsset).filter(
            MediaAsset.id == media_id,
            MediaAsset.entity_type == "group_trip",
            MediaAsset.entity_id == group_trip_id
        ).first()
        
        if not media:
            return False
        
        # Soft delete the media
        media.is_active = False
        db.commit()
        return True
    
    def get_group_trip_details_by_id(self, db: Session, group_trip_id: int) -> Optional[Dict[str, Any]]:
        """
        Get group trip details with gallery images formatted for frontend by ID.
        """
        group_trip = db.query(GroupTrip).options(
            joinedload(GroupTrip.media_assets),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.departures)
        ).filter(GroupTrip.id == group_trip_id).first()
        
        if not group_trip:
            return None
            
        # Format gallery images with Cloudflare URLs
        gallery_images = []
        cover_image = None
        
        for media in group_trip.media_assets:
            if media.is_active:
                # Generate Cloudflare image URL properly
                if media.storage_key:
                    # Use storage_key (Cloudflare image ID) to construct URL
                    image_url = f"{cloudflare_settings.delivery_url}/{media.storage_key}/public"
                elif media.file_path and media.file_path.startswith('http'):
                    # Already a full URL
                    image_url = media.file_path
                elif media.file_path:
                    # Assume it's a Cloudflare image ID
                    image_url = f"{cloudflare_settings.delivery_url}/{media.file_path}/public"
                else:
                    # Fallback
                    image_url = media.file_path or ""
                
                image_data = {
                    "id": media.id,
                    "filename": media.filename,
                    "alt_text": media.alt_text or group_trip.name,
                    "title": media.title,
                    "caption": media.caption,
                    "width": media.width,
                    "height": media.height,
                    "file_path": image_url,
                    "cloudflare_id": media.storage_key or (media.file_path if not media.file_path.startswith('http') else None),
                }
                gallery_images.append(image_data)
        
        # Use image_id as cover image, or first gallery image as fallback
        if group_trip.image_id:
            cover_image = group_trip.image_id
        elif gallery_images:
            cover_image = gallery_images[0]["file_path"]
            
        return {
            "id": group_trip.id,
            "name": group_trip.name,
            "summary": group_trip.summary,
            "description": group_trip.description,
            "slug": group_trip.slug,
            "duration_days": group_trip.duration_days,
            "price": float(group_trip.price) if group_trip.price else None,
            "min_participants": group_trip.min_participants,
            "max_participants": group_trip.max_participants,
            "itinerary": group_trip.itinerary,
            "inclusions": group_trip.inclusions,
            "exclusions": group_trip.exclusions,
            "cover_image": cover_image,
            "gallery_images": gallery_images,
            "country": {
                "id": group_trip.country.id,
                "name": group_trip.country.name,
                "slug": group_trip.country.slug,
            } if group_trip.country else None,
            "holiday_types": [
                {
                    "id": ht.id,
                    "name": ht.name,
                    "slug": ht.slug,
                }
                for ht in group_trip.holiday_types
            ],
            "departures": [
                {
                    "id": dep.id,
                    "start_date": dep.start_date.isoformat() if dep.start_date else None,
                    "end_date": dep.end_date.isoformat() if dep.end_date else None,
                    "available_slots": dep.available_slots,
                    "booked_slots": dep.booked_slots,
                    "is_active": dep.is_active,
                }
                for dep in group_trip.departures if dep.is_active
            ],
            "is_active": group_trip.is_active,
            "is_featured": group_trip.is_featured,
        }

group_trip_service = GroupTripService()
