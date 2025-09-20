from typing import List, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.region import Region
from app.schemas.region import RegionCreate, RegionUpdate
from app.utils.slug import create_slug

class RegionService:
    def get_regions(self, db: Session, skip: int = 0, limit: int = 100) -> List[Region]:
        """
        Retrieve all regions with pagination.
        """
        return db.query(Region).filter(Region.is_active == True).offset(skip).limit(limit).all()
    
    def get_regions_with_countries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Region]:
        """
        Retrieve all regions with their associated countries.
        """
        return db.query(Region)\
            .options(joinedload(Region.countries))\
            .filter(Region.is_active == True)\
            .offset(skip).limit(limit).all()
    
    def get_region(self, db: Session, region_id: int) -> Optional[Region]:
        """
        Retrieve a specific region by ID.
        """
        return db.query(Region).filter(Region.id == region_id, Region.is_active == True).first()
    
    def get_region_with_countries(self, db: Session, region_id: int) -> Optional[Region]:
        """
        Retrieve a specific region by ID with its associated countries.
        """
        return db.query(Region)\
            .options(joinedload(Region.countries))\
            .filter(Region.id == region_id, Region.is_active == True)\
            .first()
    
    def get_region_by_slug(self, db: Session, slug: str) -> Optional[Region]:
        """
        Retrieve a specific region by slug.
        """
        return db.query(Region).filter(Region.slug == slug, Region.is_active == True).first()
    
    def get_region_by_slug_with_countries(self, db: Session, slug: str) -> Optional[Region]:
        """
        Retrieve a specific region by slug with its associated countries.
        """
        return db.query(Region)\
            .options(joinedload(Region.countries))\
            .filter(Region.slug == slug, Region.is_active == True)\
            .first()
    
    def create_region(self, db: Session, region_create: RegionCreate) -> Region:
        """
        Create a new region.
        """
        slug = create_slug(region_create.name)
        db_region = Region(
            name=region_create.name,
            description=region_create.description,
            slug=slug,
        )
        db.add(db_region)
        db.commit()
        db.refresh(db_region)
        return db_region
    
    def update_region(self, db: Session, region_id: int, region_update: RegionUpdate) -> Optional[Region]:
        """
        Update an existing region.
        """
        db_region = db.query(Region).filter(Region.id == region_id).first()
        if not db_region:
            return None
        
        update_data = region_update.model_dump(exclude_unset=True)
        
        # If name is being updated, update the slug as well
        if "name" in update_data:
            update_data["slug"] = create_slug(update_data["name"])
        
        for key, value in update_data.items():
            setattr(db_region, key, value)
        
        db.commit()
        db.refresh(db_region)
        return db_region
    
    def delete_region(self, db: Session, region_id: int) -> bool:
        """
        Soft delete a region by setting is_active to False.
        """
        db_region = db.query(Region).filter(Region.id == region_id).first()
        if not db_region:
            return False
        
        db_region.is_active = False
        db.commit()
        return True

region_service = RegionService()
