from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.blog import Tag
from app.schemas.content_tag import ContentTagCreate, ContentTagUpdate


class ContentTagService:
    def get_tags(self, db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None, include_inactive: bool = False) -> tuple[List[Tag], int]:
        """
        Retrieve all tags with pagination, optionally filtered by category.
        """
        query = db.query(Tag)
        
        if not include_inactive:
            query = query.filter(Tag.is_active == True)
            
        if category:
            query = query.filter(Tag.category == category)
            
        # Count total
        total = query.count()
        
        # Sort by order_index, then created_at
        query = query.order_by(Tag.order_index.asc(), Tag.created_at.desc())
        
        items = query.offset(skip).limit(limit).all()
        return items, total
    
    def get_tag(self, db: Session, tag_id: int) -> Optional[Tag]:
        """
        Retrieve a specific tag by ID.
        """
        return db.query(Tag).filter(Tag.id == tag_id).first()
    
    def get_tag_by_slug(self, db: Session, slug: str) -> Optional[Tag]:
        """
        Retrieve a specific tag by slug.
        """
        return db.query(Tag).filter(Tag.slug == slug).first()
        
    def create_tag(self, db: Session, tag_in: ContentTagCreate) -> Tag:
        """
        Create a new tag.
        """
        db_tag = Tag(
            name=tag_in.name,
            slug=tag_in.slug,
            description=tag_in.description,
            category=tag_in.category,
            icon=tag_in.icon,
            color=tag_in.color,
            order_index=tag_in.order_index,
            is_active=tag_in.is_active,
        )
        db.add(db_tag)
        db.commit()
        db.refresh(db_tag)
        return db_tag
    
    def update_tag(self, db: Session, tag_id: int, tag_in: ContentTagUpdate) -> Optional[Tag]:
        """
        Update an existing tag.
        """
        db_tag = self.get_tag(db, tag_id)
        if not db_tag:
            return None
            
        update_data = tag_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tag, key, value)
            
        db.commit()
        db.refresh(db_tag)
        return db_tag
        
    def delete_tag(self, db: Session, tag_id: int) -> bool:
        """
        Soft delete a tag by setting is_active to False.
        """
        db_tag = self.get_tag(db, tag_id)
        if not db_tag:
            return False
            
        db_tag.is_active = False
        db.commit()
        return True

content_tag_service = ContentTagService()
