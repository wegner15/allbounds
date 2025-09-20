from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.accommodation import Accommodation
from app.schemas.accommodation import AccommodationCreate, AccommodationUpdate
from app.utils.slug import create_slug

class AccommodationService:
    def get_accommodations(self, db: Session, skip: int = 0, limit: int = 100) -> List[Accommodation]:
        """
        Retrieve all accommodations with pagination.
        """
        return db.query(Accommodation).filter(Accommodation.is_active == True).offset(skip).limit(limit).all()
    
    def get_accommodations_by_country(self, db: Session, country_id: int, skip: int = 0, limit: int = 100) -> List[Accommodation]:
        """
        Retrieve all accommodations for a specific country with pagination.
        """
        return db.query(Accommodation).filter(
            Accommodation.country_id == country_id,
            Accommodation.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_accommodation(self, db: Session, accommodation_id: int) -> Optional[Accommodation]:
        """
        Retrieve a specific accommodation by ID.
        """
        return db.query(Accommodation).filter(Accommodation.id == accommodation_id, Accommodation.is_active == True).first()
    
    def get_accommodation_by_slug(self, db: Session, slug: str) -> Optional[Accommodation]:
        """
        Retrieve a specific accommodation by slug.
        """
        return db.query(Accommodation).filter(Accommodation.slug == slug, Accommodation.is_active == True).first()
    
    def create_accommodation(self, db: Session, accommodation_create: AccommodationCreate) -> Accommodation:
        """
        Create a new accommodation.
        """
        slug = create_slug(accommodation_create.name)
        db_accommodation = Accommodation(
            name=accommodation_create.name,
            summary=accommodation_create.summary,
            description=accommodation_create.description,
            country_id=accommodation_create.country_id,
            stars=accommodation_create.stars,
            address=accommodation_create.address,
            latitude=accommodation_create.latitude,
            longitude=accommodation_create.longitude,
            amenities=accommodation_create.amenities,
            slug=slug,
        )
        db.add(db_accommodation)
        db.commit()
        db.refresh(db_accommodation)
        return db_accommodation
    
    def update_accommodation(self, db: Session, accommodation_id: int, accommodation_update: AccommodationUpdate) -> Optional[Accommodation]:
        """
        Update an existing accommodation.
        """
        db_accommodation = db.query(Accommodation).filter(Accommodation.id == accommodation_id).first()
        if not db_accommodation:
            return None
        
        update_data = accommodation_update.model_dump(exclude_unset=True)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_accommodation, key, value)
        
        db.commit()
        db.refresh(db_accommodation)
        return db_accommodation
    
    def delete_accommodation(self, db: Session, accommodation_id: int) -> bool:
        """
        Soft delete an accommodation by setting is_active to False.
        """
        db_accommodation = db.query(Accommodation).filter(Accommodation.id == accommodation_id).first()
        if not db_accommodation:
            return False
        
        db_accommodation.is_active = False
        db.commit()
        return True

accommodation_service = AccommodationService()
