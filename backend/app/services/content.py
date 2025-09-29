from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from app.models.content import ContentPage
from app.schemas.content import ContentPageCreate, ContentPageUpdate
from app.utils.slug import create_slug


class ContentService:
    def get_content_pages(self, db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[ContentPage]:
        query = db.query(ContentPage)
        if active_only:
            query = query.filter(ContentPage.is_active == True)
        return query.offset(skip).limit(limit).all()

    def get_content_page(self, db: Session, page_id: int) -> Optional[ContentPage]:
        return db.query(ContentPage).filter(ContentPage.id == page_id).first()

    def get_content_page_by_slug(self, db: Session, slug: str) -> Optional[ContentPage]:
        return db.query(ContentPage).filter(ContentPage.slug == slug, ContentPage.is_active == True).first()

    def create_content_page(self, db: Session, content_page_in: ContentPageCreate) -> ContentPage:
        # Generate slug if not provided
        slug = content_page_in.slug
        if not slug:
            slug = create_slug(content_page_in.title)

        # Check if slug already exists
        existing_page = self.get_content_page_by_slug(db, slug)
        if existing_page:
            raise ValueError(f"Content page with slug '{slug}' already exists")

        db_content_page = ContentPage(
            title=content_page_in.title,
            slug=slug,
            content=content_page_in.content,
            meta_title=content_page_in.meta_title,
            meta_description=content_page_in.meta_description,
            is_published=content_page_in.is_published,
            is_active=content_page_in.is_active,
        )
        db.add(db_content_page)
        db.commit()
        db.refresh(db_content_page)
        return db_content_page

    def update_content_page(self, db: Session, page_id: int, content_page_in: ContentPageUpdate) -> Optional[ContentPage]:
        content_page = self.get_content_page(db, page_id)
        if not content_page:
            return None

        update_data = content_page_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(content_page, field, value)

        db.commit()
        db.refresh(content_page)
        return content_page

    def delete_content_page(self, db: Session, page_id: int) -> bool:
        content_page = self.get_content_page(db, page_id)
        if not content_page:
            return False

        db.delete(content_page)
        db.commit()
        return True

    def publish_content_page(self, db: Session, page_id: int) -> Optional[ContentPage]:
        content_page = self.get_content_page(db, page_id)
        if not content_page:
            return None

        content_page.is_published = True
        db.commit()
        db.refresh(content_page)
        return content_page

    def unpublish_content_page(self, db: Session, page_id: int) -> Optional[ContentPage]:
        content_page = self.get_content_page(db, page_id)
        if not content_page:
            return None

        content_page.is_published = False
        db.commit()
        db.refresh(content_page)
        return content_page


content_service = ContentService()