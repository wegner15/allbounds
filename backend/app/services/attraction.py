from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.attraction import Attraction
from app.schemas.attraction import AttractionCreate, AttractionUpdate
from app.utils.slug import create_slug

class AttractionService:
    def get_attractions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Attraction]:
        """
        Retrieve all attractions with pagination.
        """
        return db.query(Attraction).filter(Attraction.is_active == True).offset(skip).limit(limit).all()
    
    def get_attractions_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Attraction]:
        """
        Retrieve all attractions for a specific country with pagination.
        """
        return db.query(Attraction).filter(
            Attraction.country_id == country_id,
            Attraction.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_attraction(self, db: Session, attraction_id: int) -> Optional[Attraction]:
        """
        Retrieve a specific attraction by ID.
        """
        return db.query(Attraction).filter(Attraction.id == attraction_id, Attraction.is_active == True).first()
    
    def get_attraction_by_slug(self, db: Session, slug: str) -> Optional[Attraction]:
        """
        Retrieve a specific attraction by slug.
        """
        return db.query(Attraction).filter(Attraction.slug == slug, Attraction.is_active == True).first()
    
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
            slug=slug,
        )
        db.add(db_attraction)
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
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
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
        """
        from app.models.media import MediaAsset

        db_attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
        if not db_attraction:
            return None

        # Fetch the media asset to get the Cloudflare ID (storage_key)
        media_asset = db.query(MediaAsset).filter(MediaAsset.id == int(image_id)).first()
        if not media_asset:
            # If no media asset is found, we can't set the image
            return db_attraction

        # The image_id on the attraction should be the Cloudflare ID
        db_attraction.image_id = media_asset.storage_key
        db.commit()
        db.refresh(db_attraction)
        return db_attraction
        
    def assign_package(self, db: Session, attraction_id: int, package_id: int) -> bool:
        """
        Assign a package to an attraction.
        """
        from app.models.package import Package
        
        attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
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
        
        attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
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
        
        attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
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
        
        attraction = db.query(Attraction).filter(Attraction.id == attraction_id).first()
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        
        if not attraction or not group_trip or group_trip not in attraction.group_trips:
            return False
            
        attraction.group_trips.remove(group_trip)
        db.commit()
        return True

attraction_service = AttractionService()
