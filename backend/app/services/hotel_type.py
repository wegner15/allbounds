from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.hotel_type import HotelType
from app.schemas.hotel_type import HotelTypeCreate, HotelTypeUpdate
from app.utils.slug import create_slug

class HotelTypeService:
    def get_hotel_types(self, db: Session, skip: int = 0, limit: int = 100) -> List[HotelType]:
        """
        Retrieve all hotel types with pagination.
        """
        return db.query(HotelType).filter(HotelType.is_active == True).offset(skip).limit(limit).all()
    
    def get_hotel_type(self, db: Session, hotel_type_id: int) -> Optional[HotelType]:
        """
        Retrieve a specific hotel type by ID.
        """
        return db.query(HotelType).filter(HotelType.id == hotel_type_id, HotelType.is_active == True).first()
    
    def get_hotel_type_by_slug(self, db: Session, slug: str) -> Optional[HotelType]:
        """
        Retrieve a specific hotel type by slug.
        """
        return db.query(HotelType).filter(HotelType.slug == slug, HotelType.is_active == True).first()
    
    def create_hotel_type(self, db: Session, hotel_type_create: HotelTypeCreate) -> HotelType:
        """
        Create a new hotel type.
        """
        slug = create_slug(hotel_type_create.name)
        db_hotel_type = HotelType(
            name=hotel_type_create.name,
            description=hotel_type_create.description,
            slug=slug,
        )
        db.add(db_hotel_type)
        db.commit()
        db.refresh(db_hotel_type)
        return db_hotel_type
    
    def update_hotel_type(self, db: Session, hotel_type_id: int, hotel_type_update: HotelTypeUpdate) -> Optional[HotelType]:
        """
        Update an existing hotel type.
        """
        db_hotel_type = db.query(HotelType).filter(HotelType.id == hotel_type_id).first()
        if not db_hotel_type:
            return None
        
        update_data = hotel_type_update.model_dump(exclude_unset=True)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_hotel_type, key, value)
        
        db.commit()
        db.refresh(db_hotel_type)
        return db_hotel_type
    
    def delete_hotel_type(self, db: Session, hotel_type_id: int) -> bool:
        """
        Soft delete a hotel type by setting is_active to False.
        """
        db_hotel_type = db.query(HotelType).filter(HotelType.id == hotel_type_id).first()
        if not db_hotel_type:
            return False
        
        db_hotel_type.is_active = False
        db.commit()
        return True

hotel_type_service = HotelTypeService()
