from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.activity import Activity
from app.models.media import MediaAsset
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.utils.slug import create_slug

class ActivityService:
    def get_activities(self, db: Session, skip: int = 0, limit: int = 100) -> List[Activity]:
        """
        Retrieve all activities with pagination.
        """
        return db.query(Activity).filter(Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets)
        ).offset(skip).limit(limit).all()
    
    def get_activity(self, db: Session, activity_id: int) -> Optional[Activity]:
        """
        Retrieve a specific activity by ID.
        """
        return db.query(Activity).filter(Activity.id == activity_id, Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets)
        ).first()
    
    def get_activity_by_slug(self, db: Session, slug: str) -> Optional[Activity]:
        """
        Retrieve a specific activity by slug.
        """
        return db.query(Activity).filter(Activity.slug == slug, Activity.is_active == True).options(
            joinedload(Activity.cover_image),
            joinedload(Activity.media_assets)
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
            joinedload(Activity.media_assets)
        ).offset(skip).limit(limit).all()
    
    def create_activity(self, db: Session, activity_create: ActivityCreate) -> Activity:
        """
        Create a new activity.
        """
        slug = create_slug(activity_create.name)
        db_activity = Activity(
            name=activity_create.name,
            description=activity_create.description,
            summary=activity_create.summary,
            slug=slug,
            is_active=activity_create.is_active if activity_create.is_active is not None else True,
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
        
        return db_activity
    
    def update_activity(self, db: Session, activity_id: int, activity_update: ActivityUpdate) -> Optional[Activity]:
        """
        Update an existing activity.
        """
        db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
        if not db_activity:
            return None
        
        update_data = activity_update.model_dump(exclude_unset=True)
        
        # Handle media_asset_ids separately
        media_asset_ids = update_data.pop("media_asset_ids", None)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_activity, key, value)
        
        # Update media assets if provided
        if media_asset_ids is not None:
            # Clear existing media assets
            db_activity.media_assets.clear()
            
            # Add new media assets
            for media_id in media_asset_ids:
                db_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
                if db_media:
                    db_activity.media_assets.append(db_media)
        
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

activity_service = ActivityService()
