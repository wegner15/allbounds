from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.group_trip import GroupTrip, GroupTripDeparture
from app.models.group_trip_price_chart import GroupTripPriceChart, GroupTripPriceChartHotel
from app.models.media import MediaAsset
from app.models.inclusion_exclusion import Inclusion, Exclusion
from app.models.blog import Tag
from app.schemas.group_trip import GroupTripCreate, GroupTripUpdate, GroupTripDepartureCreate, GroupTripDepartureUpdate
from app.utils.slug import create_slug, ensure_unique_slug, update_slug_if_name_changed
from app.core.cloudflare_config import cloudflare_settings
from app.services.group_trip_helper import format_group_trip_response

class GroupTripService:
    def get_group_trips(self, db: Session, skip: int = 0, limit: int = 100, tag: Optional[str] = None) -> List[GroupTrip]:
        """
        Retrieve all group trips with pagination.
        """
        query = db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(GroupTrip.is_active == True)
        
        if tag:
            query = query.filter(GroupTrip.tags.any(Tag.slug == tag))
            
        return query.offset(skip).limit(limit).all()

    def get_paginated_group_trips(
        self,
        db: Session,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        country_id: Optional[int] = None,
        holiday_type_id: Optional[int] = None,
        tag: Optional[str] = None,
        include_inactive: bool = True,
        order_by: str = "created_at",
        order: str = "desc",
    ):
        """
        Retrieve paginated group trips with search and filtering for admin panel.
        Returns (items, total_count).
        """
        from app.models.country import Country
        from app.models.holiday_type import HolidayType
        query = db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        )

        if not include_inactive:
            query = query.filter(GroupTrip.is_active == True)

        if country_id:
            query = query.filter(
                or_(
                    GroupTrip.country_id == country_id,
                    GroupTrip.countries.any(Country.id == country_id)
                )
            )

        if holiday_type_id:
            query = query.filter(GroupTrip.holiday_types.any(HolidayType.id == holiday_type_id))

        if tag:
            query = query.filter(GroupTrip.tags.any(Tag.slug == tag))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.outerjoin(GroupTrip.country).filter(
                or_(
                    GroupTrip.name.ilike(term),
                    GroupTrip.description.ilike(term),
                    GroupTrip.summary.ilike(term),
                    Country.name.ilike(term)
                )
            )

        total = query.count()

        if order_by == "name":
            query = query.order_by(GroupTrip.name.desc() if order == "desc" else GroupTrip.name.asc())
        elif order_by == "price":
            query = query.order_by(GroupTrip.price.desc() if order == "desc" else GroupTrip.price.asc())
        else:
            query = query.order_by(GroupTrip.created_at.desc() if order == "desc" else GroupTrip.created_at.asc())

        skip = (page - 1) * limit if page > 0 else 0
        items = query.offset(skip).limit(limit).all()

        return items, total
    
    def get_group_trips_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve all group trips for a specific country with pagination.
        Includes trips where the country is either the primary destination
        or one of the additional destinations.
        """
        from app.models.country import Country
        return db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(
            GroupTrip.is_active == True,
            or_(
                GroupTrip.country_id == country_id,
                GroupTrip.countries.any(Country.id == country_id)
            )
        ).offset(skip).limit(limit).all()
    
    def get_featured_group_trips(self, db: Session, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve featured group trips with pagination.
        """
        return db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(
            GroupTrip.is_active == True,
            GroupTrip.is_featured == True
        ).offset(skip).limit(limit).all()

    def get_group_trips_by_holiday_type(self, db: Session, holiday_type_id: int, skip: int = 0, limit: int = 100) -> List[GroupTrip]:
        """
        Retrieve all group trips for a specific holiday type with pagination.
        """
        from app.models.holiday_type import HolidayType
        return db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(
            GroupTrip.holiday_types.any(HolidayType.id == holiday_type_id),
            GroupTrip.is_active == True
        ).offset(skip).limit(limit).all()

    def get_group_trip(self, db: Session, group_trip_id: int, include_inactive: bool = True) -> Optional[GroupTrip]:
        """
        Retrieve a specific group trip by ID.
        By default, include_inactive is True so admin operations work.
        """
        from app.models.group_trip_price_chart import GroupTripPriceChart, GroupTripPriceChartHotel
        query = db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.price_charts).joinedload(GroupTripPriceChart.hotel_options).joinedload(GroupTripPriceChartHotel.hotel),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(GroupTrip.id == group_trip_id)
        if not include_inactive:
            query = query.filter(GroupTrip.is_active == True)
        return query.first()
    
    def get_group_trip_by_slug(self, db: Session, slug: str, include_inactive: bool = False) -> Optional[GroupTrip]:
        """
        Retrieve a specific group trip by slug.
        """
        from app.models.group_trip_price_chart import GroupTripPriceChart, GroupTripPriceChartHotel
        query = db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.price_charts).joinedload(GroupTripPriceChart.hotel_options).joinedload(GroupTripPriceChartHotel.hotel),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(GroupTrip.slug == slug)
        if not include_inactive:
            query = query.filter(GroupTrip.is_active == True)
        return query.first()

    
    def get_similar_group_trips(self, db: Session, group_trip_id: int, limit: int = 4) -> List[GroupTrip]:
        """
        Retrieve similar group trips based on country and holiday types.
        """
        # Get the current group trip
        current_trip = self.get_group_trip(db, group_trip_id)
        if not current_trip:
            return []
        
        # Get trips from the same country with similar holiday types
        from app.models.holiday_type import HolidayType
        
        query = db.query(GroupTrip).options(
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
        ).filter(
            GroupTrip.id != group_trip_id,  # Exclude current trip
            GroupTrip.is_active == True,
            GroupTrip.country_id == current_trip.country_id  # Same country
        )
        
        # If the current trip has holiday types, prioritize trips with matching holiday types
        if current_trip.holiday_types:
            holiday_type_ids = [ht.id for ht in current_trip.holiday_types]
            query = query.filter(
                GroupTrip.holiday_types.any(HolidayType.id.in_(holiday_type_ids))
            )
        
        similar_trips = query.limit(limit).all()
        
        # If we don't have enough similar trips, get more from the same country
        if len(similar_trips) < limit:
            remaining = limit - len(similar_trips)
            additional_trips = db.query(GroupTrip).options(
                joinedload(GroupTrip.departures),
                joinedload(GroupTrip.country),
                joinedload(GroupTrip.countries),
                joinedload(GroupTrip.holiday_types),
                joinedload(GroupTrip.inclusion_items),
                joinedload(GroupTrip.exclusion_items),
                joinedload(GroupTrip.tags)
            ).filter(
                GroupTrip.id != group_trip_id,
                GroupTrip.is_active == True,
                GroupTrip.country_id == current_trip.country_id,
                GroupTrip.id.notin_([t.id for t in similar_trips])
            ).limit(remaining).all()
            
            similar_trips.extend(additional_trips)
        
        return similar_trips
    
    def get_group_trip_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get group trip details with gallery images formatted for frontend.
        """
        group_trip = db.query(GroupTrip).options(
            joinedload(GroupTrip.media_assets),
            joinedload(GroupTrip.country),
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
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
            "countries": [
                {
                    "id": c.id,
                    "name": c.name,
                    "slug": c.slug,
                }
                for c in group_trip.countries
            ],
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
            "tags": [
                {
                    "id": tag.id,
                    "name": tag.name,
                    "slug": getattr(tag, 'slug', ''),
                    "description": getattr(tag, 'description', None),
                    "category": getattr(tag, 'category', None),
                    "color": getattr(tag, 'color', None),
                    "icon": getattr(tag, 'icon', None),
                    "is_active": getattr(tag, 'is_active', True),
                    "created_at": getattr(tag, 'created_at', None),
                    "updated_at": getattr(tag, 'updated_at', None),
                }
                for tag in group_trip.tags
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
            image_id=group_trip_create.image_id,
            is_active=group_trip_create.is_active if group_trip_create.is_active is not None else True,
            is_featured=group_trip_create.is_featured if group_trip_create.is_featured is not None else False,
            slug=slug,
        )
        db.add(db_group_trip)
        db.flush()  # Flush to get the ID
        
        # Handle inclusions
        if hasattr(group_trip_create, 'inclusion_ids') and group_trip_create.inclusion_ids:
            inclusions = db.query(Inclusion).filter(Inclusion.id.in_(group_trip_create.inclusion_ids)).all()
            db_group_trip.inclusion_items.extend(inclusions)
            
        # Handle exclusions
        if hasattr(group_trip_create, 'exclusion_ids') and group_trip_create.exclusion_ids:
            exclusions = db.query(Exclusion).filter(Exclusion.id.in_(group_trip_create.exclusion_ids)).all()
            db_group_trip.exclusion_items.extend(exclusions)
            
        # Handle additional countries (multi-destination)
        if hasattr(group_trip_create, 'country_ids') and group_trip_create.country_ids:
            from app.models.country import Country
            extra_countries = db.query(Country).filter(Country.id.in_(group_trip_create.country_ids)).all()
            db_group_trip.countries.extend(extra_countries)
            
        # Handle tags
        if hasattr(group_trip_create, 'tag_ids') and group_trip_create.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(group_trip_create.tag_ids)).all()
            db_group_trip.tags.extend(tags)
        
        db.commit()
        db.refresh(db_group_trip)
        return db_group_trip
    
    def update_group_trip(self, db: Session, group_trip_id: int, group_trip_update: GroupTripUpdate) -> Optional[GroupTrip]:
        """
        Update an existing group trip.
        """
        db_group_trip = db.query(GroupTrip).options(
            joinedload(GroupTrip.countries)
        ).filter(GroupTrip.id == group_trip_id).first()
        if not db_group_trip:
            return None
        
        update_data = group_trip_update.model_dump(exclude_unset=True)
        
        # Handle inclusions separately
        if 'inclusion_ids' in update_data:
            inclusion_ids = update_data.pop('inclusion_ids')
            if inclusion_ids is not None:
                db_group_trip.inclusion_items.clear()
                if inclusion_ids:
                    inclusions = db.query(Inclusion).filter(Inclusion.id.in_(inclusion_ids)).all()
                    db_group_trip.inclusion_items.extend(inclusions)
                    
        # Handle exclusions separately
        if 'exclusion_ids' in update_data:
            exclusion_ids = update_data.pop('exclusion_ids')
            if exclusion_ids is not None:
                db_group_trip.exclusion_items.clear()
                if exclusion_ids:
                    exclusions = db.query(Exclusion).filter(Exclusion.id.in_(exclusion_ids)).all()
                    db_group_trip.exclusion_items.extend(exclusions)

        # Handle additional countries separately (multi-destination)
        if 'country_ids' in update_data:
            country_ids = update_data.pop('country_ids')
            if country_ids is not None:
                from app.models.country import Country
                current_ids = {c.id for c in db_group_trip.countries}
                new_ids = set(country_ids)

                to_remove = [c for c in db_group_trip.countries if c.id not in new_ids]
                for c in to_remove:
                    db_group_trip.countries.remove(c)

                to_add_ids = new_ids - current_ids
                if to_add_ids:
                    extra_countries = db.query(Country).filter(Country.id.in_(to_add_ids)).all()
                    db_group_trip.countries.extend(extra_countries)
                    
        # Handle tags separately
        if 'tag_ids' in update_data:
            tag_ids = update_data.pop('tag_ids')
            if tag_ids is not None:
                current_ids = {t.id for t in db_group_trip.tags}
                new_ids = set(tag_ids)

                to_remove = [t for t in db_group_trip.tags if t.id not in new_ids]
                for t in to_remove:
                    db_group_trip.tags.remove(t)

                to_add_ids = new_ids - current_ids
                if to_add_ids:
                    tags = db.query(Tag).filter(Tag.id.in_(to_add_ids)).all()
                    db_group_trip.tags.extend(tags)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, GroupTrip, db_group_trip.slug, group_trip_id
        )
        
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
        
        # Set the cover image to the media's storage_key (Cloudflare image ID)
        group_trip.image_id = media.storage_key or media.file_path
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
            joinedload(GroupTrip.countries),
            joinedload(GroupTrip.holiday_types),
            joinedload(GroupTrip.departures),
            joinedload(GroupTrip.inclusion_items),
            joinedload(GroupTrip.exclusion_items),
            joinedload(GroupTrip.tags)
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
            "countries": [
                {
                    "id": c.id,
                    "name": c.name,
                    "slug": c.slug,
                }
                for c in group_trip.countries
            ],
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
            "tags": [
                {
                    "id": tag.id,
                    "name": tag.name,
                    "slug": tag.slug,
                    "category": tag.category,
                    "color": tag.color,
                    "icon": tag.icon
                }
                for tag in group_trip.tags
            ],
            "is_active": group_trip.is_active,
            "is_featured": group_trip.is_featured,
        }

    def add_inclusion(self, db: Session, group_trip_id: int, inclusion_id: int) -> Optional[GroupTrip]:
        """
        Add an inclusion to a group trip.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not db_group_trip or not db_inclusion:
            return None
        
        if db_inclusion not in db_group_trip.inclusion_items:
            db_group_trip.inclusion_items.append(db_inclusion)
            db.commit()
            db.refresh(db_group_trip)
        
        return db_group_trip
    
    def remove_inclusion(self, db: Session, group_trip_id: int, inclusion_id: int) -> Optional[GroupTrip]:
        """
        Remove an inclusion from a group trip.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not db_group_trip or not db_inclusion:
            return None
        
        if db_inclusion in db_group_trip.inclusion_items:
            db_group_trip.inclusion_items.remove(db_inclusion)
            db.commit()
            db.refresh(db_group_trip)
        
        return db_group_trip
    
    def add_exclusion(self, db: Session, group_trip_id: int, exclusion_id: int) -> Optional[GroupTrip]:
        """
        Add an exclusion to a group trip.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not db_group_trip or not db_exclusion:
            return None
        
        if db_exclusion not in db_group_trip.exclusion_items:
            db_group_trip.exclusion_items.append(db_exclusion)
            db.commit()
            db.refresh(db_group_trip)
        
        return db_group_trip
    
    def remove_exclusion(self, db: Session, group_trip_id: int, exclusion_id: int) -> Optional[GroupTrip]:
        """
        Remove an exclusion from a group trip.
        """
        db_group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        db_exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not db_group_trip or not db_exclusion:
            return None
        
        if db_exclusion in db_group_trip.exclusion_items:
            db_group_trip.exclusion_items.remove(db_exclusion)
            db.commit()
            db.refresh(db_group_trip)
        
        return db_group_trip

group_trip_service = GroupTripService()
