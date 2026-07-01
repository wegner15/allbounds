from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.partner import PartnerResponse, PartnerCreate, PartnerUpdate
from app.services.partner import partner_service
from app.auth.dependencies import has_permission

router = APIRouter()

@router.get("/", response_model=List[PartnerResponse])
@router.get("", response_model=List[PartnerResponse])
def get_partners(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
) -> Any:
    """
    Retrieve all active partners, optionally filtered by category.
    """
    partners = partner_service.get_partners(db, skip=skip, limit=limit, category=category)
    return partners

@router.get("/{partner_id}", response_model=PartnerResponse)
def get_partner(
    partner_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific partner by ID.
    """
    partner = partner_service.get_partner(db, partner_id=partner_id)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return partner

@router.get("/slug/{slug}", response_model=PartnerResponse)
def get_partner_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific partner by slug.
    """
    partner = partner_service.get_partner_by_slug(db, slug=slug)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return partner

@router.post("/", response_model=PartnerResponse)
def create_partner(
    *,
    db: Session = Depends(get_db),
    partner_in: PartnerCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create a new partner (Admin only).
    """
    partner = partner_service.create_partner(db, partner_in)
    return partner

@router.put("/{partner_id}", response_model=PartnerResponse)
def update_partner(
    *,
    db: Session = Depends(get_db),
    partner_id: int,
    partner_in: PartnerUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an existing partner (Admin only).
    """
    partner = partner_service.get_partner(db, partner_id=partner_id)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    updated_partner = partner_service.update_partner(db, partner_id=partner_id, partner_update=partner_in)
    return updated_partner

@router.delete("/{partner_id}", response_model=PartnerResponse)
def delete_partner(
    *,
    db: Session = Depends(get_db),
    partner_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Soft-delete a partner (Admin only).
    """
    partner = partner_service.get_partner(db, partner_id=partner_id)
    if partner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    partner_service.delete_partner(db, partner_id=partner_id)
    return partner
