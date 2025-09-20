from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.holiday_type import HolidayType
from app.utils.slug import create_slug

class HolidayTypeService:
    def get_holiday_types(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        active_only: bool = True
    ) -> List[HolidayType]:
        """
        Get all holiday types.
        """
        query = db.query(HolidayType)
        if active_only:
            query = query.filter(HolidayType.is_active == True)
        return query.offset(skip).limit(limit).all()

    def get_holiday_type(
        self, 
        db: Session, 
        holiday_type_id: int
    ) -> Optional[HolidayType]:
        """
        Get a holiday type by ID.
        """
        return db.query(HolidayType).filter(HolidayType.id == holiday_type_id).first()

    def get_holiday_type_by_slug(
        self, 
        db: Session, 
        slug: str
    ) -> Optional[HolidayType]:
        """
        Get a holiday type by slug.
        """
        return db.query(HolidayType).filter(HolidayType.slug == slug).first()

    def create_holiday_type(
        self, 
        db: Session, 
        name: str,
        description: Optional[str] = None,
        slug: Optional[str] = None,
        image_id: Optional[str] = None
    ) -> HolidayType:
        """
        Create a new holiday type.
        """
        if not slug:
            slug = create_slug(name)
            
        db_holiday_type = HolidayType(
            name=name,
            description=description,
            slug=slug,
            image_id=image_id
        )
        db.add(db_holiday_type)
        db.commit()
        db.refresh(db_holiday_type)
        return db_holiday_type

    def update_holiday_type(
        self, 
        db: Session, 
        holiday_type_id: int,
        name: Optional[str] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
        image_id: Optional[str] = None
    ) -> Optional[HolidayType]:
        """
        Update a holiday type.
        """
        db_holiday_type = self.get_holiday_type(db, holiday_type_id)
        if db_holiday_type is None:
            return None
            
        if name is not None:
            db_holiday_type.name = name
        if description is not None:
            db_holiday_type.description = description
        if is_active is not None:
            db_holiday_type.is_active = is_active
        if image_id is not None:
            db_holiday_type.image_id = image_id
            
        db.commit()
        db.refresh(db_holiday_type)
        return db_holiday_type

    def delete_holiday_type(
        self, 
        db: Session, 
        holiday_type_id: int
    ) -> Optional[HolidayType]:
        """
        Soft delete a holiday type.
        """
        db_holiday_type = self.get_holiday_type(db, holiday_type_id)
        if db_holiday_type is None:
            return None
            
        db_holiday_type.is_active = False
        db.commit()
        db.refresh(db_holiday_type)
        return db_holiday_type

holiday_type_service = HolidayTypeService()
