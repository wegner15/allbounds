from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.models.attraction import Attraction
from app.models.country import Country
from app.models.blog import Tag
from app.schemas.attraction import AttractionCreate, AttractionUpdate
from app.utils.slug import create_slug, ensure_unique_slug, update_slug_if_name_changed

class AttractionService:
    def get_attractions(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        country: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        featured: Optional[bool] = None,
    ) -> List[Attraction]:
        """
        Retrieve all attractions with pagination ordered by newest first.
        """
        query = (
            db.query(Attraction)
            .options(joinedload(Attraction.country), joinedload(Attraction.activities), joinedload(Attraction.tags))
            .filter(Attraction.is_active == True)
        )

        if featured is not None:
            query = query.filter(Attraction.is_featured == featured)

        if search:
            normalized = f"%{search.strip().lower()}%"
            query = query.filter(
                or_(
                    Attraction.name.ilike(normalized),
                    Attraction.description.ilike(normalized),
                    Attraction.summary.ilike(normalized),
                    Attraction.city.ilike(normalized),
                    Attraction.address.ilike(normalized),
                )
            )

        if country:
            country_obj = (
                db.query(Country)
                .filter(
                    Country.is_active == True,
                    or_(Country.slug == country, Country.name == country),
                )
                .first()
            )
            if country_obj:
                query = query.filter(Attraction.country_id == country_obj.id)
            else:
                # No matching country means no results
                return []

        if category:
            query = query.filter(Attraction.category == category)
            
        if tag:
            query = query.filter(Attraction.tags.any(Tag.slug == tag))

        return (
            query.order_by(Attraction.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_paginated_attractions(
        self,
        db: Session,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        country_id: Optional[int] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        include_inactive: bool = True,
        order_by: str = "created_at",
        order: str = "desc",
    ):
        """
        Retrieve paginated attractions with search and filtering for admin panel.
        Returns (items, total_count).
        """
        query = db.query(Attraction).options(
            joinedload(Attraction.country),
            joinedload(Attraction.activities),
            joinedload(Attraction.tags)
        )

        if not include_inactive:
            query = query.filter(Attraction.is_active == True)

        if country_id:
            query = query.filter(Attraction.country_id == country_id)

        if category:
            query = query.filter(Attraction.category == category)

        if tag:
            query = query.filter(Attraction.tags.any(Tag.slug == tag))

        if search and search.strip():
            normalized = f"%{search.strip().lower()}%"
            query = query.outerjoin(Attraction.country).filter(
                or_(
                    Attraction.name.ilike(normalized),
                    Attraction.description.ilike(normalized),
                    Attraction.summary.ilike(normalized),
                    Attraction.city.ilike(normalized),
                    Attraction.address.ilike(normalized),
                    Country.name.ilike(normalized),
                )
            )

        total = query.count()

        if order_by == "name":
            query = query.order_by(Attraction.name.desc() if order == "desc" else Attraction.name.asc())
        elif order_by == "price":
            query = query.order_by(Attraction.price.desc() if order == "desc" else Attraction.price.asc())
        else:
            query = query.order_by(Attraction.created_at.desc() if order == "desc" else Attraction.created_at.asc())

        skip = (page - 1) * limit if page > 0 else 0
        items = query.offset(skip).limit(limit).all()

        return items, total
    
    def get_attractions_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Attraction]:
        """
        Retrieve all attractions for a specific country with pagination ordered by newest first.
        """
        return (
            db.query(Attraction)
            .options(
                joinedload(Attraction.country),
                joinedload(Attraction.activities),
                joinedload(Attraction.tags)
            )
            .filter(
                Attraction.country_id == country_id,
                Attraction.is_active == True,
            )
            .order_by(Attraction.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_attraction(self, db: Session, attraction_id: int, include_inactive: bool = True) -> Optional[Attraction]:
        """
        Retrieve a specific attraction by ID with details.
        By default, include_inactive is True so admin operations (editing, reactivating) work.
        """
        query = (
            db.query(Attraction)
            .options(
                joinedload(Attraction.country),
                joinedload(Attraction.activities),
                joinedload(Attraction.hotels),  # Explicitly load hotels
                joinedload(Attraction.packages), # Explicitly load packages
                joinedload(Attraction.group_trips), # Explicitly load group trips
                joinedload(Attraction.tags), # Explicitly load tags
            )
            .filter(Attraction.id == attraction_id)
        )
        if not include_inactive:
            query = query.filter(Attraction.is_active == True)
        return query.first()
    
    def get_attraction_by_slug(self, db: Session, slug: str, include_inactive: bool = False) -> Optional[Attraction]:
        """
        Retrieve a specific attraction by slug with details.
        """
        query = (
            db.query(Attraction)
            .options(
                joinedload(Attraction.country),
                joinedload(Attraction.activities),
                joinedload(Attraction.hotels),  # Explicitly load hotels
                joinedload(Attraction.packages), # Explicitly load packages
                joinedload(Attraction.group_trips), # Explicitly load group trips
                joinedload(Attraction.tags), # Explicitly load tags
            )
            .filter(Attraction.slug == slug)
        )
        if not include_inactive:
            query = query.filter(Attraction.is_active == True)
        return query.first()
    
    def create_attraction(self, db: Session, attraction_create: AttractionCreate) -> Attraction:
        """
        Create a new attraction.
        """
        slug = create_slug(attraction_create.name)
        db_attraction = Attraction(
            name=attraction_create.name,
            summary=attraction_create.summary,
            description=attraction_create.description,
            country_id=attraction_create.country_id,
            address=attraction_create.address,
            city=attraction_create.city,
            latitude=attraction_create.latitude,
            longitude=attraction_create.longitude,
            duration_minutes=attraction_create.duration_minutes,
            price=attraction_create.price,
            opening_hours=attraction_create.opening_hours,
            image_id=attraction_create.image_id,
            is_featured=getattr(attraction_create, 'is_featured', False) or False,
            slug=slug,
        )
        db.add(db_attraction)
        db.commit()
        db.refresh(db_attraction)
        
        # Handle tags
        if attraction_create.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(attraction_create.tag_ids)).all()
            db_attraction.tags.extend(tags)
            db.commit()
            db.refresh(db_attraction)
            
        return db_attraction
    
    def update_attraction(self, db: Session, attraction_id: int, attraction_update: AttractionUpdate) -> Optional[Attraction]:
        """
        Update an existing attraction.
        """
        db_attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
        if not db_attraction:
            return None
        
        update_data = attraction_update.model_dump(exclude_unset=True)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, Attraction, db_attraction.slug, attraction_id
        )
        
        # Handle tags separately
        if 'tag_ids' in attraction_update.model_fields_set:
            if attraction_update.tag_ids is not None:
                tags = db.query(Tag).filter(Tag.id.in_(attraction_update.tag_ids)).all()
                db_attraction.tags = tags
            else:
                db_attraction.tags = []
        
        for key, value in update_data.items():
            if key != 'tag_ids':
                setattr(db_attraction, key, value)
        
        db.commit()
        db.refresh(db_attraction)
        return db_attraction
    
    def delete_attraction(self, db: Session, attraction_id: int) -> bool:
        """
        Soft delete an attraction by setting is_active to False.
        """
        db_attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
        if not db_attraction:
            return False
        
        db_attraction.is_active = False
        db.commit()
        return True

    def set_cover_image(self, db: Session, attraction_id: int, image_id: str) -> Optional[Attraction]:
        """
        Set the cover image for an attraction.
        Accepts either a Cloudflare image ID directly or a MediaAsset ID.
        """
        from app.models.media import MediaAsset

        db_attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
        if not db_attraction:
            return None

        # Check if image_id looks like a Cloudflare ID (UUID format with dashes)
        # Example: 7508c42c-720d-423f-2308-1f352c33c900
        if '-' in image_id and len(image_id) > 30:
            # Assume it's a Cloudflare image ID, use it directly
            db_attraction.image_id = image_id
        else:
            # Assume it's a MediaAsset ID, fetch the media asset to get the Cloudflare ID
            try:
                media_asset = db.query(MediaAsset).filter(MediaAsset.id == int(image_id)).first()
                if media_asset and media_asset.storage_key:
                    db_attraction.image_id = media_asset.storage_key
                else:
                    # If no media asset is found or no storage_key, return without updating
                    return db_attraction
            except (ValueError, TypeError):
                # If conversion to int fails, treat as Cloudflare ID
                db_attraction.image_id = image_id

        db.commit()
        db.refresh(db_attraction)
        return db_attraction
        
    def assign_package(self, db: Session, attraction_id: int, package_id: int) -> bool:
        """
        Assign a package to an attraction.
        """
        from app.models.package import Package
        
        attraction = db.query(Attraction).options(joinedload(Attraction.packages)).filter(Attraction.id == attraction_id).first()
        package = db.query(Package).filter(Package.id == package_id).first()
        
        if not attraction or not package:
            return False
            
        attraction.packages.append(package)
        db.commit()
        return True
    
    def remove_package(self, db: Session, attraction_id: int, package_id: int) -> bool:
        """
        Remove a package from an attraction.
        """
        from app.models.package import Package
        
        attraction = db.query(Attraction).options(joinedload(Attraction.packages)).filter(Attraction.id == attraction_id).first()
        package = db.query(Package).filter(Package.id == package_id).first()
        
        if not attraction or not package or package not in attraction.packages:
            return False
            
        attraction.packages.remove(package)
        db.commit()
        return True
    
    def assign_group_trip(self, db: Session, attraction_id: int, group_trip_id: int) -> bool:
        """
        Assign a group trip to an attraction.
        """
        from app.models.group_trip import GroupTrip
        
        attraction = db.query(Attraction).options(joinedload(Attraction.group_trips)).filter(Attraction.id == attraction_id).first()
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        
        if not attraction or not group_trip:
            return False
            
        attraction.group_trips.append(group_trip)
        db.commit()
        return True
    
    def remove_group_trip(self, db: Session, attraction_id: int, group_trip_id: int) -> bool:
        """
        Remove a group trip from an attraction.
        """
        from app.models.group_trip import GroupTrip
        
        attraction = db.query(Attraction).options(joinedload(Attraction.group_trips)).filter(Attraction.id == attraction_id).first()
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        
        if not attraction or not group_trip or group_trip not in attraction.group_trips:
            return False
            
        attraction.group_trips.remove(group_trip)
        db.commit()
        return True

    def assign_activity(self, db: Session, attraction_id: int, activity_id: int) -> bool:
        """
        Assign an activity to an attraction.
        """
        from app.models.activity import Activity
        
        attraction = db.query(Attraction).options(joinedload(Attraction.activities)).filter(Attraction.id == attraction_id).first()
        activity = db.query(Activity).filter(Activity.id == activity_id).first()
        
        if not attraction or not activity:
            return False
            
        attraction.activities.append(activity)
        db.commit()
        return True
    
    def remove_activity(self, db: Session, attraction_id: int, activity_id: int) -> bool:
        """
        Remove an activity from an attraction.
        """
        from app.models.activity import Activity
        
        attraction = db.query(Attraction).options(joinedload(Attraction.activities)).filter(Attraction.id == attraction_id).first()
        activity = db.query(Activity).filter(Activity.id == activity_id).first()
        
        if not attraction or not activity or activity not in attraction.activities:
            return False
            
        attraction.activities.remove(activity)
        db.commit()
        return True

    def assign_hotel(self, db: Session, attraction_id: int, hotel_id: int) -> bool:
        """
        Assign a hotel to an attraction.
        """
        from app.models.hotel import Hotel
        
        attraction = db.query(Attraction).options(joinedload(Attraction.hotels)).filter(Attraction.id == attraction_id).first()
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        
        if not attraction or not hotel:
            return False
        
        if hotel in attraction.hotels:
            return True  # Already linked
            
        attraction.hotels.append(hotel)
        db.commit()
        return True
    
    def remove_hotel(self, db: Session, attraction_id: int, hotel_id: int) -> bool:
        """
        Remove a hotel from an attraction.
        """
        from app.models.hotel import Hotel
        
        attraction = db.query(Attraction).options(joinedload(Attraction.hotels)).filter(Attraction.id == attraction_id).first()
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        
        if not attraction or not hotel or hotel not in attraction.hotels:
            return False
            
        attraction.hotels.remove(hotel)
        db.commit()
        return True

attraction_service = AttractionService()
