from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.inclusion_exclusion import Inclusion, Exclusion
from app.schemas.inclusion_exclusion import InclusionCreate, InclusionUpdate, ExclusionCreate, ExclusionUpdate

class InclusionService:
    def get_inclusions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Inclusion]:
        """
        Retrieve all inclusions with pagination.
        """
        return db.query(Inclusion).filter(Inclusion.is_active == True).offset(skip).limit(limit).all()
    
    def get_inclusion(self, db: Session, inclusion_id: int) -> Optional[Inclusion]:
        """
        Retrieve a specific inclusion by ID.
        """
        return db.query(Inclusion).filter(Inclusion.id == inclusion_id, Inclusion.is_active == True).first()
    
    def get_inclusions_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Inclusion]:
        """
        Retrieve inclusions by category with pagination.
        """
        return db.query(Inclusion).filter(
            Inclusion.category == category,
            Inclusion.is_active == True
        ).offset(skip).limit(limit).all()
    
    def create_inclusion(self, db: Session, inclusion_create: InclusionCreate) -> Inclusion:
        """
        Create a new inclusion.
        """
        db_inclusion = Inclusion(
            name=inclusion_create.name,
            description=inclusion_create.description,
            icon=inclusion_create.icon,
            category=inclusion_create.category
        )
        db.add(db_inclusion)
        db.commit()
        db.refresh(db_inclusion)
        return db_inclusion
    
    def update_inclusion(self, db: Session, inclusion_id: int, inclusion_update: InclusionUpdate) -> Optional[Inclusion]:
        """
        Update an existing inclusion.
        """
        db_inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        if not db_inclusion:
            return None
        
        update_data = inclusion_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_inclusion, key, value)
        
        db.commit()
        db.refresh(db_inclusion)
        return db_inclusion
    
    def delete_inclusion(self, db: Session, inclusion_id: int) -> bool:
        """
        Soft delete an inclusion by setting is_active to False.
        """
        db_inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        if not db_inclusion:
            return False
        
        db_inclusion.is_active = False
        db.commit()
        return True
    
    def assign_inclusion_to_package(self, db: Session, package_id: int, inclusion_id: int) -> bool:
        """
        Assign an inclusion to a package.
        """
        from app.models.package import Package
        
        package = db.query(Package).filter(Package.id == package_id).first()
        inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not package or not inclusion:
            return False
        
        package.inclusion_items.append(inclusion)
        db.commit()
        return True
    
    def remove_inclusion_from_package(self, db: Session, package_id: int, inclusion_id: int) -> bool:
        """
        Remove an inclusion from a package.
        """
        from app.models.package import Package
        
        package = db.query(Package).filter(Package.id == package_id).first()
        inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not package or not inclusion or inclusion not in package.inclusion_items:
            return False
        
        package.inclusion_items.remove(inclusion)
        db.commit()
        return True
    
    def assign_inclusion_to_group_trip(self, db: Session, group_trip_id: int, inclusion_id: int) -> bool:
        """
        Assign an inclusion to a group trip.
        """
        from app.models.group_trip import GroupTrip
        
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not group_trip or not inclusion:
            return False
        
        group_trip.inclusion_items.append(inclusion)
        db.commit()
        return True
    
    def remove_inclusion_from_group_trip(self, db: Session, group_trip_id: int, inclusion_id: int) -> bool:
        """
        Remove an inclusion from a group trip.
        """
        from app.models.group_trip import GroupTrip
        
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        inclusion = db.query(Inclusion).filter(Inclusion.id == inclusion_id).first()
        
        if not group_trip or not inclusion or inclusion not in group_trip.inclusion_items:
            return False
        
        group_trip.inclusion_items.remove(inclusion)
        db.commit()
        return True

class ExclusionService:
    def get_exclusions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Exclusion]:
        """
        Retrieve all exclusions with pagination.
        """
        return db.query(Exclusion).filter(Exclusion.is_active == True).offset(skip).limit(limit).all()
    
    def get_exclusion(self, db: Session, exclusion_id: int) -> Optional[Exclusion]:
        """
        Retrieve a specific exclusion by ID.
        """
        return db.query(Exclusion).filter(Exclusion.id == exclusion_id, Exclusion.is_active == True).first()
    
    def get_exclusions_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Exclusion]:
        """
        Retrieve exclusions by category with pagination.
        """
        return db.query(Exclusion).filter(
            Exclusion.category == category,
            Exclusion.is_active == True
        ).offset(skip).limit(limit).all()
    
    def create_exclusion(self, db: Session, exclusion_create: ExclusionCreate) -> Exclusion:
        """
        Create a new exclusion.
        """
        db_exclusion = Exclusion(
            name=exclusion_create.name,
            description=exclusion_create.description,
            icon=exclusion_create.icon,
            category=exclusion_create.category
        )
        db.add(db_exclusion)
        db.commit()
        db.refresh(db_exclusion)
        return db_exclusion
    
    def update_exclusion(self, db: Session, exclusion_id: int, exclusion_update: ExclusionUpdate) -> Optional[Exclusion]:
        """
        Update an existing exclusion.
        """
        db_exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        if not db_exclusion:
            return None
        
        update_data = exclusion_update.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_exclusion, key, value)
        
        db.commit()
        db.refresh(db_exclusion)
        return db_exclusion
    
    def delete_exclusion(self, db: Session, exclusion_id: int) -> bool:
        """
        Soft delete an exclusion by setting is_active to False.
        """
        db_exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        if not db_exclusion:
            return False
        
        db_exclusion.is_active = False
        db.commit()
        return True
    
    def assign_exclusion_to_package(self, db: Session, package_id: int, exclusion_id: int) -> bool:
        """
        Assign an exclusion to a package.
        """
        from app.models.package import Package
        
        package = db.query(Package).filter(Package.id == package_id).first()
        exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not package or not exclusion:
            return False
        
        package.exclusion_items.append(exclusion)
        db.commit()
        return True
    
    def remove_exclusion_from_package(self, db: Session, package_id: int, exclusion_id: int) -> bool:
        """
        Remove an exclusion from a package.
        """
        from app.models.package import Package
        
        package = db.query(Package).filter(Package.id == package_id).first()
        exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not package or not exclusion or exclusion not in package.exclusion_items:
            return False
        
        package.exclusion_items.remove(exclusion)
        db.commit()
        return True
    
    def assign_exclusion_to_group_trip(self, db: Session, group_trip_id: int, exclusion_id: int) -> bool:
        """
        Assign an exclusion to a group trip.
        """
        from app.models.group_trip import GroupTrip
        
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not group_trip or not exclusion:
            return False
        
        group_trip.exclusion_items.append(exclusion)
        db.commit()
        return True
    
    def remove_exclusion_from_group_trip(self, db: Session, group_trip_id: int, exclusion_id: int) -> bool:
        """
        Remove an exclusion from a group trip.
        """
        from app.models.group_trip import GroupTrip
        
        group_trip = db.query(GroupTrip).filter(GroupTrip.id == group_trip_id).first()
        exclusion = db.query(Exclusion).filter(Exclusion.id == exclusion_id).first()
        
        if not group_trip or not exclusion or exclusion not in group_trip.exclusion_items:
            return False
        
        group_trip.exclusion_items.remove(exclusion)
        db.commit()
        return True

inclusion_service = InclusionService()
exclusion_service = ExclusionService()
