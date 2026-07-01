from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.partner import Partner
from app.schemas.partner import PartnerCreate, PartnerUpdate
from app.utils.slug import create_slug, update_slug_if_name_changed

class PartnerService:
    def get_partners(self, db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None) -> List[Partner]:
        """
        Retrieve all partners with pagination. Optional filtering by category.
        """
        query = db.query(Partner).filter(Partner.is_active == True)
        if category:
            query = query.filter(Partner.category == category)
        return query.order_by(Partner.order_index.asc(), Partner.name.asc()).offset(skip).limit(limit).all()
    
    def get_partner(self, db: Session, partner_id: int) -> Optional[Partner]:
        """
        Retrieve a specific partner by ID.
        """
        return db.query(Partner).filter(Partner.id == partner_id, Partner.is_active == True).first()
        
    def get_partner_by_slug(self, db: Session, slug: str) -> Optional[Partner]:
        """
        Retrieve a specific partner by slug.
        """
        return db.query(Partner).filter(Partner.slug == slug, Partner.is_active == True).first()

    def create_partner(self, db: Session, partner_create: PartnerCreate) -> Partner:
        """
        Create a new partner.
        """
        slug = create_slug(partner_create.name)
        db_partner = Partner(
            name=partner_create.name,
            slug=slug,
            category=partner_create.category,
            logo_image_id=partner_create.logo_image_id,
            website_url=partner_create.website_url,
            order_index=partner_create.order_index or 0,
        )
        db.add(db_partner)
        db.commit()
        db.refresh(db_partner)
        return db_partner

    def update_partner(self, db: Session, partner_id: int, partner_update: PartnerUpdate) -> Optional[Partner]:
        """
        Update an existing partner.
        """
        db_partner = db.query(Partner).filter(Partner.id == partner_id).first()
        if not db_partner:
            return None
        
        update_data = partner_update.model_dump(exclude_unset=True)
        
        # Safely update slug if name changed
        update_data = update_slug_if_name_changed(
            update_data, db, Partner, db_partner.slug, partner_id
        )
        
        for key, value in update_data.items():
            setattr(db_partner, key, value)
        
        db.commit()
        db.refresh(db_partner)
        return db_partner

    def delete_partner(self, db: Session, partner_id: int) -> bool:
        """
        Soft delete a partner by setting is_active to False.
        """
        db_partner = db.query(Partner).filter(Partner.id == partner_id).first()
        if not db_partner:
            return False
        
        db_partner.is_active = False
        db.commit()
        return True

partner_service = PartnerService()
