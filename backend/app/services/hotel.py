from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, joinedload

from app.models.hotel import Hotel
from app.models.hotel_price_chart import HotelPriceChart, HotelPriceChartNightRate
from app.models.country import Country
from app.models.amenity import Amenity
from app.models.blog import Tag
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

    def _resolve_cover_image_url(self, db: Session, hotel: Hotel) -> Optional[str]:
        """
        Get cover image url for a hotel, falling back to the first active media asset if image_id is not set.
        """
        if hotel.image_id:
            return self._get_cloudflare_image_url(hotel.image_id)
        
        # Fallback to first active media asset
        from app.models.media import MediaAsset
        from app.models.hotel import hotel_media
        
        first_media = db.query(MediaAsset).join(hotel_media).filter(
            hotel_media.c.hotel_id == hotel.id,
            MediaAsset.is_active == True
        ).order_by(MediaAsset.id.asc()).first()
        
        if not first_media:
            return None
            
        if first_media.file_path.startswith("cloudflare://") and first_media.storage_key:
            return self._get_cloudflare_image_url(first_media.storage_key)
        elif first_media.storage_key:
            return self._get_cloudflare_image_url(first_media.storage_key)
        return first_media.file_path
    
    def get_hotels(self, db: Session, skip: int = 0, limit: int = 100, recommended: Optional[bool] = None, country: Optional[str] = None, tag: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve all hotels with pagination and optional filtering, including cover images.
        Hotels are ordered by creation date (newest first).
        """
        # NOTE: We intentionally do NOT joinedload media_assets here.
        # The list view only needs the primary image_id (already on the hotel row).
        # Loading all gallery media assets for every hotel in a list was very expensive.
        # We DO joinedload amenities to prevent N+1 queries (one query per hotel).
        query = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.amenities),
            joinedload(Hotel.tags)
        ).filter(Hotel.is_active == True)

        if recommended is not None and recommended:
            # For now, recommended means all active hotels (can be enhanced later with a recommended field)
            pass  # No additional filtering needed

        if country:
            # Join with country to filter by country name
            query = query.join(Hotel.country).filter(Country.name.ilike(f"%{country}%"))
            
        if tag:
            query = query.filter(Hotel.tags.any(Tag.slug == tag))

        # Order by created_at descending (newest first)
        query = query.order_by(Hotel.created_at.desc())

        hotels = query.offset(skip).limit(limit).all()

        # Format hotels with cover images
        result = []
        for hotel in hotels:
            cover_image_url = self._resolve_cover_image_url(db, hotel)

            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "country_id": hotel.country_id,
                "hotel_type_id": hotel.hotel_type_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_id": hotel.image_id,
                "image_url": cover_image_url,
                "cover_image": cover_image_url,
                "is_active": hotel.is_active,
                "address": hotel.address,
                "city": hotel.city,
                "stars": hotel.stars,
                "price_category": hotel.price_category,
                "amenity_ids": [amenity.id for amenity in hotel.amenities],
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
                    for tag in hotel.tags
                ] if hotel.tags else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)

        return result

    def get_paginated_hotels(
        self,
        db: Session,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        country_id: Optional[int] = None,
        tag: Optional[str] = None,
        include_inactive: bool = True,
        order_by: str = "created_at",
        order: str = "desc",
    ):
        """
        Retrieve paginated hotels with search and filtering for admin panel.
        Returns (items, total_count).
        """
        from sqlalchemy import or_
        query = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.amenities),
            joinedload(Hotel.tags)
        )

        if not include_inactive:
            query = query.filter(Hotel.is_active == True)

        if country_id:
            query = query.filter(Hotel.country_id == country_id)

        if tag:
            query = query.filter(Hotel.tags.any(Tag.slug == tag))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.outerjoin(Hotel.country).filter(
                or_(
                    Hotel.name.ilike(term),
                    Hotel.city.ilike(term),
                    Hotel.address.ilike(term),
                    Country.name.ilike(term)
                )
            )

        total = query.count()

        if order_by == "name":
            query = query.order_by(Hotel.name.desc() if order == "desc" else Hotel.name.asc())
        elif order_by == "stars":
            query = query.order_by(Hotel.stars.desc() if order == "desc" else Hotel.stars.asc())
        else:
            query = query.order_by(Hotel.created_at.desc() if order == "desc" else Hotel.created_at.asc())

        skip = (page - 1) * limit if page > 0 else 0
        hotels = query.offset(skip).limit(limit).all()

        result = []
        for hotel in hotels:
            cover_image_url = self._resolve_cover_image_url(db, hotel)
            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "country_id": hotel.country_id,
                "hotel_type_id": hotel.hotel_type_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_id": hotel.image_id,
                "image_url": cover_image_url,
                "cover_image": cover_image_url,
                "is_active": hotel.is_active,
                "address": hotel.address,
                "city": hotel.city,
                "stars": hotel.stars,
                "price_category": hotel.price_category,
                "amenity_ids": [amenity.id for amenity in hotel.amenities] if hotel.amenities else [],
                "tags": [
                    {
                        "id": tag_item.id,
                        "name": tag_item.name,
                        "slug": getattr(tag_item, 'slug', ''),
                        "description": getattr(tag_item, 'description', None),
                        "category": getattr(tag_item, 'category', None),
                        "color": getattr(tag_item, 'color', None),
                        "icon": getattr(tag_item, 'icon', None),
                        "is_active": getattr(tag_item, 'is_active', True),
                        "created_at": getattr(tag_item, 'created_at', None),
                        "updated_at": getattr(tag_item, 'updated_at', None),
                    }
                    for tag_item in hotel.tags
                ] if hotel.tags else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)

        return result, total
    
    def get_hotels_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Retrieve all hotels for a specific country with pagination, including cover images.
        Hotels are ordered by creation date (newest first).
        """
        hotels = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.amenities),
            joinedload(Hotel.tags)
        ).filter(
            Hotel.country_id == country_id,
            Hotel.is_active == True
        ).order_by(Hotel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Format hotels — use image_id only, no media_assets loading
        result = []
        for hotel in hotels:
            cover_image_url = self._resolve_cover_image_url(db, hotel)
            
            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "hotel_type_id": hotel.hotel_type_id,
                "stars": hotel.stars,
                "address": hotel.address,
                "city": hotel.city,
                "price_category": hotel.price_category,
                "country_id": hotel.country_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_url": cover_image_url,
                "cover_image": cover_image_url,
                "is_active": hotel.is_active,
                "amenity_ids": [amenity.id for amenity in hotel.amenities],
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
                    for tag in hotel.tags
                ] if hotel.tags else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)
        
        return result
    
    def get_featured_hotels(self, db: Session, skip: int = 0, limit: int = 100, country: Optional[str] = None, tag: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Retrieve featured hotels with cover images, optionally filtered by country and tag.
        Hotels are ordered by creation date (newest first).
        """
        query = db.query(Hotel).options(
            joinedload(Hotel.country),
            joinedload(Hotel.amenities),
            joinedload(Hotel.tags)
        ).filter(
            Hotel.is_active == True,
            Hotel.is_featured == True
        )

        if country:
            query = query.join(Hotel.country).filter(Country.name.ilike(f"%{country}%"))
            
        if tag:
            query = query.filter(Hotel.tags.any(Tag.slug == tag))

        hotels = query.order_by(Hotel.created_at.desc()).offset(skip).limit(limit).all()
        
        # Format hotels — use image_id only, no media_assets loading
        result = []
        for hotel in hotels:
            cover_image_url = self._resolve_cover_image_url(db, hotel)
            
            hotel_data = {
                "id": hotel.id,
                "name": hotel.name,
                "summary": hotel.summary,
                "description": hotel.description,
                "slug": hotel.slug,
                "country_id": hotel.country_id,
                "hotel_type_id": hotel.hotel_type_id,
                "country": {
                    "id": hotel.country.id,
                    "name": hotel.country.name,
                    "slug": hotel.country.slug,
                } if hotel.country else None,
                "image_id": hotel.image_id,
                "image_url": cover_image_url,
                "cover_image": cover_image_url,
                "is_active": hotel.is_active,
                "is_featured": hotel.is_featured,
                "address": hotel.address,
                "city": hotel.city,
                "stars": hotel.stars,
                "price_category": hotel.price_category,
                "amenity_ids": [amenity.id for amenity in hotel.amenities],
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
                    for tag in hotel.tags
                ] if hotel.tags else [],
                "created_at": hotel.created_at,
                "updated_at": hotel.updated_at,
            }
            result.append(hotel_data)
        
        return result
    
    def get_hotel(self, db: Session, hotel_id: int, include_inactive: bool = True) -> Optional[Hotel]:
        """
        Retrieve a specific hotel by ID.
        By default, include_inactive is True so admin operations work.
        """
        query = db.query(Hotel).filter(Hotel.id == hotel_id)
        if not include_inactive:
            query = query.filter(Hotel.is_active == True)
        return query.first()
    
    def get_hotel_by_slug(self, db: Session, slug: str, include_inactive: bool = False) -> Optional[Hotel]:
        """
        Retrieve a specific hotel by slug with media assets.
        """
        query = db.query(Hotel).options(
            joinedload(Hotel.media_assets),
            joinedload(Hotel.price_charts)
        ).filter(Hotel.slug == slug)
        if not include_inactive:
            query = query.filter(Hotel.is_active == True)
        return query.first()
    
    def get_hotel_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
        """
        Get hotel details with gallery images formatted for frontend.
        """
        hotel = db.query(Hotel).options(
            joinedload(Hotel.media_assets),
            joinedload(Hotel.price_charts).joinedload(HotelPriceChart.night_rates),
            joinedload(Hotel.country),
            joinedload(Hotel.hotel_type),
            joinedload(Hotel.amenities),
            joinedload(Hotel.tags)
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
            "latitude": hotel.latitude,
            "longitude": hotel.longitude,
            "price_category": hotel.price_category,
            "country_id": hotel.country_id,
            "amenities": [
                {
                    "id": amenity.id,
                    "name": amenity.name,
                    "icon": amenity.icon,
                    "category": amenity.category,
                    "description": amenity.description,
                    "is_popular": getattr(amenity, 'is_popular', False),
                } for amenity in hotel.amenities if amenity.is_active
            ] if hotel.amenities else [],
            "amenity_ids": [amenity.id for amenity in hotel.amenities] if hotel.amenities else [],
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
                for tag in hotel.tags
            ] if hotel.tags else [],
            "check_in_time": hotel.check_in_time,
            "check_out_time": hotel.check_out_time,
            "cover_image": cover_image,
            "image_url": cover_image,
            "gallery_images": gallery_images,
            "price_charts": [
                {
                    "id": pc.id,
                    "title": pc.title,
                    "start_date": pc.start_date.isoformat() if pc.start_date else None,
                    "end_date": pc.end_date.isoformat() if pc.end_date else None,
                    "price": float(pc.price) if pc.price else 0,
                    "booking_price": float(pc.booking_price) if pc.booking_price is not None else float(pc.price) if pc.price else 0,
                    "notes": pc.notes,
                    "is_active": pc.is_active,
                    "night_rates": [
                        {
                            "id": nr.id,
                            "nights": nr.nights,
                            "price": float(nr.price) if nr.price else 0,
                            "price_per_night": float(nr.price_per_night) if nr.price_per_night is not None else round(float(nr.price)/nr.nights, 2) if nr.price and nr.nights else 0,
                            "room_type": nr.room_type,
                            "meal_plan": nr.meal_plan,
                            "is_default": nr.is_default,
                            "order_index": nr.order_index,
                            "is_active": nr.is_active,
                        } for nr in getattr(pc, 'night_rates', []) if getattr(nr, 'is_active', True)
                    ] if getattr(pc, 'night_rates', None) else [],
                } for pc in hotel.price_charts if pc.is_active
            ] if hotel.price_charts else [],
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
        hotel_type_id = hotel_create.hotel_type_id
        if hotel_type_id in (0, "0"):
            hotel_type_id = None
        
        db_hotel = Hotel(
            name=hotel_create.name,
            summary=hotel_create.summary,
            description=hotel_create.description,
            country_id=hotel_create.country_id,
            hotel_type_id=hotel_type_id,
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
            
        # Add tags if provided
        if hotel_create.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(hotel_create.tag_ids)).all()
            db_hotel.tags = tags
        
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
        hotel_type_id = update_data.get("hotel_type_id")
        if hotel_type_id in (0, "0"):
            update_data["hotel_type_id"] = None
        
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
            
        # Handle tags
        if "tag_ids" in hotel_update.model_fields_set:
            if hotel_update.tag_ids is not None:
                tags = db.query(Tag).filter(Tag.id.in_(hotel_update.tag_ids)).all()
                db_hotel.tags = tags
            else:
                db_hotel.tags = []
        
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
