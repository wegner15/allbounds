from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.activity import Activity
from app.models.media import MediaAsset
from app.models.blog import Tag
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.utils.slug import create_slug, ensure_unique_slug, update_slug_if_name_changed

class ActivityService:
    def get_activities(self, db: Session, skip: int = 0, limit: int = 100, tag: Optional[str] = None) -> List[Activity]:
        """
        Retrieve all activities with pagination.
        """
        query = db.query(Activity).filter(Activity.is_active == True)
        if tag:
            query = query.filter(Activity.tags.any(Tag.slug == tag))
            
        return query.options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries),
            joinedload(Activity.tags)
        ).offset(skip).limit(limit).all()
    
    def get_activity(self, db: Session, activity_id: int) -> Optional[Activity]:
        """
        Retrieve a specific activity by ID.
        """
        return db.query(Activity).filter(Activity.id == activity_id, Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries),
            joinedload(Activity.tags)
        ).first()
    
    def get_activity_by_slug(self, db: Session, slug: str) -> Optional[Activity]:
        """
        Retrieve a specific activity by slug.
        """
        return db.query(Activity).filter(Activity.slug == slug, Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries),
            joinedload(Activity.tags)
        ).first()
    
    def get_activities_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Activity]:
        """
        Retrieve all activities for a specific country with pagination.
        """
        return db.query(Activity).join(
            Activity.countries
        ).filter(
            Activity.is_active == True,
            Activity.countries.any(id=country_id)
        ).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries),
            joinedload(Activity.tags)
        ).offset(skip).limit(limit).all()
    
    def get_featured_activities(self, db: Session, skip: int = 0, limit: int = 100, country: Optional[str] = None, tag: Optional[str] = None) -> List[Activity]:
        """
        Retrieve featured activities with pagination, optionally filtered by country and tag.
        """
        query = db.query(Activity).filter(
            Activity.is_active == True,
            Activity.is_featured == True
        )

        if country:
            from app.models.country import Country
            query = query.join(Activity.countries).filter(Country.name.ilike(f"%{country}%"))
            
        if tag:
            query = query.filter(Activity.tags.any(Tag.slug == tag))

        return query.options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries)
        ).offset(skip).limit(limit).all()
    
    def get_featured_activities_by_country(self, db: Session, country_name: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        """
        Retrieve featured activities filtered by country name.
        """
        from app.models.country import Country
        
        return db.query(Activity).join(
            Activity.countries
        ).filter(
            Activity.is_active == True,
            Activity.is_featured == True,
            Country.name == country_name
        ).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets),
            joinedload(Activity.countries)
        ).offset(skip).limit(limit).all()
    
    def create_activity(self, db: Session, activity_create: ActivityCreate) -> Activity:
        """
        Create a new activity.
        """
        from app.models.country import Country
        
        slug = create_slug(activity_create.name)
        db_activity = Activity(
            name=activity_create.name,
            description=activity_create.description,
            summary=activity_create.summary,
            slug=slug,
            is_active=activity_create.is_active if activity_create.is_active is not None else True,
            is_featured=activity_create.is_featured if activity_create.is_featured is not None else False,
            cover_image_id=activity_create.cover_image_id
        )
        db.add(db_activity)
        db.commit()
        db.refresh(db_activity)
        
        # Associate media assets if provided
        if activity_create.media_asset_ids:
            for media_id in activity_create.media_asset_ids:
                db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
                if db_media:
                    db_activity.media_assets.append(db_media)
            db.commit()
            db.refresh(db_activity)
        
        # Associate countries if provided
        if activity_create.country_ids:
            for country_id in activity_create.country_ids:
                db_country = db.query(Country).filter(Country.id == country_id).first()
                if db_country:
                    db_activity.countries.append(db_country)
            db.commit()
            db.refresh(db_activity)
            
        # Handle tags
        if activity_create.tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(activity_create.tag_ids)).all()
            db_activity.tags.extend(tags)
            db.commit()
            db.refresh(db_activity)
        
        return db_activity
    
    def update_activity(self, db: Session, activity_id: int, activity_update: ActivityUpdate) -> Optional[Activity]:
        """
        Update an existing activity.
        """
        from app.models.country import Country
        
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not db_activity:
            return None
        
        update_data = activity_update.model_dump(exclude_unset=True)
        
        # Handle media_asset_ids separately
        media_asset_ids = update_data.pop("media_asset_ids", None)
        
        # Handle country_ids separately
        country_ids = update_data.pop("country_ids", None)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, Activity, db_activity.slug, activity_id
        )
        
        for key, value in update_data.items():
            setattr(db_activity, key, value)
        
        # Update media assets if provided
        if media_asset_ids is not None:
            # Get current media IDs
            current_media_ids = {media.id for media in db_activity.media_assets}
            new_media_ids = set(media_asset_ids)
            
            # IDs to remove
            ids_to_remove = current_media_ids - new_media_ids
            if ids_to_remove:
                for media in db_activity.media_assets[:]:
                    if media.id in ids_to_remove:
                        db_activity.media_assets.remove(media)
            
            # IDs to add
            ids_to_add = new_media_ids - current_media_ids
            if ids_to_add:
                for media_id in ids_to_add:
                    db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
                    if db_media:
                        db_activity.media_assets.append(db_media)
        
        # Update countries if provided
        if country_ids is not None:
            # Get current country IDs
            current_country_ids = {country.id for country in db_activity.countries}
            new_country_ids = set(country_ids)
            
            # IDs to remove
            ids_to_remove = current_country_ids - new_country_ids
            if ids_to_remove:
                for country in db_activity.countries[:]:
                    if country.id in ids_to_remove:
                        db_activity.countries.remove(country)
            
            # IDs to add
            ids_to_add = new_country_ids - current_country_ids
            if ids_to_add:
                for country_id in ids_to_add:
                    db_country = db.query(Country).filter(Country.id == country_id).first()
                    if db_country:
                        db_activity.countries.append(db_country)
                        
        # Handle tags separately
        if 'tag_ids' in activity_update.model_fields_set:
            if activity_update.tag_ids is not None:
                tags = db.query(Tag).filter(Tag.id.in_(activity_update.tag_ids)).all()
                db_activity.tags = tags
            else:
                db_activity.tags = []
        
        db.commit()
        db.refresh(db_activity)
        return db_activity

    def add_media_to_activity_gallery(self, db: Session, activity_id: int, media_id: int) -> Optional[Activity]:
        """
        Add a media asset to an activity's gallery.
        """
        db_activity = self.get_activity(db, activity_id)
        if not db_activity:
            return None

        db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if not db_media:
            return None

        db_activity.media_assets.append(db_media)
        db.commit()
        db.refresh(db_activity)
        return db_activity

    def remove_media_from_activity_gallery(self, db: Session, activity_id: int, media_id: int) -> Optional[Activity]:
        """
        Remove a media asset from an activity's gallery.
        """
        db_activity = self.get_activity(db, activity_id)
        if not db_activity:
            return None

        db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if not db_media:
            return None

        if db_media in db_activity.media_assets:
            db_activity.media_assets.remove(db_media)
            db.commit()
            db.refresh(db_activity)

        return db_activity
    
    def delete_activity(self, db: Session, activity_id: int) -> bool:
        """
        Soft delete an activity by setting is_active to False.
        """
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not db_activity:
            return False
        
        db_activity.is_active = False
        db.commit()
        return True
    
    def add_activity_to_country(self, db: Session, activity_id: int, country_id: int) -> Optional[Activity]:
        """
        Add an activity to a country.
        """
        from app.models.country import Country
        
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        db_country = db.query(Country).filter(Country.id == country_id).first()
        
        if not db_activity or not db_country:
            return None
        
        db_activity.countries.append(db_country)
        db.commit()
        db.refresh(db_activity)
        return db_activity
    
    def remove_activity_from_country(self, db: Session, activity_id: int, country_id: int) -> Optional[Activity]:
        """
        Remove an activity from a country.
        """
        from app.models.country import Country
        
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        db_country = db.query(Country).filter(Country.id == country_id).first()
        
        if not db_activity or not db_country:
            return None
        
        if db_country in db_activity.countries:
            db_activity.countries.remove(db_country)
            db.commit()
            db.refresh(db_activity)
        
        return db_activity

    def get_activity_trips(self, db: Session, activity_id: int) -> dict:
        """
        Retrieve all packages and group trips that include this activity in their itinerary.
        """
        from app.models.itinerary import ItineraryItem, EntityType
        from app.models.package import Package
        from app.models.group_trip import GroupTrip

        # Get all itinerary items that link to this activity
        itinerary_items = db.query(ItineraryItem).filter(
            ItineraryItem.linked_activities.any(id=activity_id)
        ).all()

        package_ids = set()
        group_trip_ids = set()

        for item in itinerary_items:
            if item.entity_type == EntityType.PACKAGE:
                package_ids.add(item.entity_id)
            elif item.entity_type == EntityType.GROUP_TRIP:
                group_trip_ids.add(item.entity_id)

        packages = []
        if package_ids:
            packages = db.query(Package).filter(
                Package.id.in_(package_ids),
                Package.is_active == True
            ).options(joinedload(Package.country)).all()

        group_trips = []
        if group_trip_ids:
            group_trips = db.query(GroupTrip).filter(
                GroupTrip.id.in_(group_trip_ids),
                GroupTrip.is_active == True
            ).options(joinedload(GroupTrip.country)).all()

        return {
            "packages": packages,
            "group_trips": group_trips,
            "total_packages": len(packages),
            "total_group_trips": len(group_trips)
        }

activity_service = ActivityService()
