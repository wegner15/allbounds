from typing import Optional, List
from sqlalchemy.orm import Session
from app.utils.slug import create_slug

from app.models.travel_guide import TravelGuideCategory, TravelGuideItem
from app.models.country import Country
from app.schemas.travel_guide import (
    TravelGuideCategoryCreate,
    TravelGuideCategoryUpdate,
    TravelGuideItemCreate,
    TravelGuideItemUpdate
)

class TravelGuideService:
    # Categories
    def get_categories(self, db: Session, include_inactive: bool = False) -> List[TravelGuideCategory]:
        query = db.query(TravelGuideCategory)
        if not include_inactive:
            query = query.filter(TravelGuideCategory.is_active == True)
        return query.order_by(TravelGuideCategory.order_index.asc(), TravelGuideCategory.id.asc()).all()

    def get_category_by_id(self, db: Session, category_id: int) -> Optional[TravelGuideCategory]:
        return db.query(TravelGuideCategory).filter(TravelGuideCategory.id == category_id).first()

    def get_category_by_slug(self, db: Session, slug: str) -> Optional[TravelGuideCategory]:
        return db.query(TravelGuideCategory).filter(TravelGuideCategory.slug == slug).first()

    def create_category(self, db: Session, category_in: TravelGuideCategoryCreate) -> TravelGuideCategory:
        slug = category_in.slug or create_slug(category_in.name)
        db_category = TravelGuideCategory(
            name=category_in.name,
            slug=slug,
            icon=category_in.icon,
            description=category_in.description,
            order_index=category_in.order_index,
            is_active=category_in.is_active
        )
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category

    def update_category(self, db: Session, category_id: int, category_in: TravelGuideCategoryUpdate) -> Optional[TravelGuideCategory]:
        db_category = self.get_category_by_id(db, category_id)
        if not db_category:
            return None
        
        update_data = category_in.model_dump(exclude_unset=True)
        if "name" in update_data and "slug" not in update_data:
            update_data["slug"] = create_slug(update_data["name"])
            
        for key, value in update_data.items():
            setattr(db_category, key, value)
            
        db.commit()
        db.refresh(db_category)
        return db_category

    def delete_category(self, db: Session, category_id: int) -> bool:
        db_category = self.get_category_by_id(db, category_id)
        if not db_category:
            return False
        db.delete(db_category)
        db.commit()
        return True

    # Guide Items
    def get_items(
        self,
        db: Session,
        country_id: Optional[int] = None,
        country_slug: Optional[str] = None,
        category_id: Optional[int] = None,
        include_inactive: bool = False
    ) -> List[TravelGuideItem]:
        query = db.query(TravelGuideItem)
        
        if country_id:
            query = query.filter(TravelGuideItem.country_id == country_id)
        elif country_slug:
            country = db.query(Country).filter(Country.slug == country_slug).first()
            if country:
                query = query.filter(TravelGuideItem.country_id == country.id)
            else:
                return []
                
        if category_id:
            query = query.filter(TravelGuideItem.category_id == category_id)
            
        if not include_inactive:
            query = query.filter(TravelGuideItem.is_active == True)
            
        return query.order_by(TravelGuideItem.order_index.asc(), TravelGuideItem.id.asc()).all()

    def get_item_by_id(self, db: Session, item_id: int) -> Optional[TravelGuideItem]:
        return db.query(TravelGuideItem).filter(TravelGuideItem.id == item_id).first()

    def create_item(self, db: Session, item_in: TravelGuideItemCreate) -> TravelGuideItem:
        db_item = TravelGuideItem(
            country_id=item_in.country_id,
            category_id=item_in.category_id,
            title=item_in.title,
            content=item_in.content,
            icon=item_in.icon,
            order_index=item_in.order_index,
            is_active=item_in.is_active
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    def update_item(self, db: Session, item_id: int, item_in: TravelGuideItemUpdate) -> Optional[TravelGuideItem]:
        db_item = self.get_item_by_id(db, item_id)
        if not db_item:
            return None
            
        update_data = item_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value)
            
        db.commit()
        db.refresh(db_item)
        return db_item

    def delete_item(self, db: Session, item_id: int) -> bool:
        db_item = self.get_item_by_id(db, item_id)
        if not db_item:
            return False
        db.delete(db_item)
        db.commit()
        return True

travel_guide_service = TravelGuideService()
