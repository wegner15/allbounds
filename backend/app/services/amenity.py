from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.amenity import Amenity
from app.schemas.amenity import AmenityCreate, AmenityUpdate


class AmenityService:
    def get_amenities(self, db: Session, skip: int = 0, limit: int = 100, include_inactive: bool = False) -> tuple[List[Amenity], int]:
        """
        Retrieve all amenities with pagination, sorted by newest first.
        """
        query = db.query(Amenity)
        if not include_inactive:
            query = query.filter(Amenity.is_active == True)
        
        # Count total
        total = query.count()
        
        # Sort by created_at desc (newest first)
        query = query.order_by(Amenity.created_at.desc())
        
        items = query.offset(skip).limit(limit).all()
        return items, total
    
    def get_amenity(self, db: Session, amenity_id: int) -> Optional[Amenity]:
        """
        Retrieve a specific amenity by ID.
        """
        return db.query(Amenity).filter(Amenity.id == amenity_id).first()
    
    def get_amenity_by_name(self, db: Session, name: str) -> Optional[Amenity]:
        """
        Retrieve a specific amenity by name.
        """
        return db.query(Amenity).filter(Amenity.name == name).first()
    
    def get_amenities_by_category(self, db: Session, category: str) -> List[Amenity]:
        """
        Retrieve amenities by category.
        """
        return db.query(Amenity).filter(Amenity.category == category, Amenity.is_active == True).all()
    
    def create_amenity(self, db: Session, amenity_create: AmenityCreate) -> Amenity:
        """
        Create a new amenity.
        """
        db_amenity = Amenity(
            name=amenity_create.name,
            description=amenity_create.description,
            icon=amenity_create.icon,
            category=amenity_create.category,
            is_popular=amenity_create.is_popular if amenity_create.is_popular is not None else False,
        )
        db.add(db_amenity)
        db.commit()
        db.refresh(db_amenity)
        return db_amenity
    
    def update_amenity(self, db: Session, amenity_id: int, amenity_update: AmenityUpdate) -> Optional[Amenity]:
        """
        Update an existing amenity.
        """
        db_amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
        if not db_amenity:
            return None
        
        update_data = amenity_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_amenity, key, value)
        
        db.commit()
        db.refresh(db_amenity)
        return db_amenity
    
    def delete_amenity(self, db: Session, amenity_id: int) -> bool:
        """
        Soft delete an amenity by setting is_active to False.
        """
        db_amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()
        if not db_amenity:
            return False
        
        db_amenity.is_active = False
        db.commit()
        return True


amenity_service = AmenityService()
