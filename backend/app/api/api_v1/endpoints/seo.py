from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.seo import SeoMeta
from app.schemas.seo import SeoMetaResponse, SeoMetaCreate, SeoMetaUpdate
from app.utils.seo import seo_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/{entity_type}/{entity_id}", response_model=SeoMetaResponse)
def get_seo_meta(
    entity_type: str,
    entity_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve SEO metadata for an entity.
    """
    seo_meta = seo_service.get_seo_meta(db, entity_type, entity_id)
    if seo_meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO metadata not found")
    return seo_meta

@router.post("/", response_model=SeoMetaResponse)
def create_seo_meta(
    *,
    db: Session = Depends(get_db),
    seo_meta_in: SeoMetaCreate,
    current_user: User = Depends(has_permission("seo:create")),
) -> Any:
    """
    Create new SEO metadata.
    """
    seo_meta = seo_service.create_seo_meta(
        db,
        seo_meta_in.entity_type,
        seo_meta_in.entity_id,
        seo_meta_in.title,
        seo_meta_in.description,
        seo_meta_in.keywords,
        seo_meta_in.canonical_url,
        seo_meta_in.og_title,
        seo_meta_in.og_description,
        seo_meta_in.og_image_url,
        seo_meta_in.twitter_card,
        seo_meta_in.twitter_title,
        seo_meta_in.twitter_description,
        seo_meta_in.twitter_image_url,
        seo_meta_in.structured_data
    )
    return seo_meta

@router.put("/{seo_id}", response_model=SeoMetaResponse)
def update_seo_meta(
    *,
    db: Session = Depends(get_db),
    seo_id: int,
    seo_meta_in: SeoMetaUpdate,
    current_user: User = Depends(has_permission("seo:update")),
) -> Any:
    """
    Update SEO metadata.
    """
    seo_meta = seo_service.update_seo_meta(
        db,
        seo_id,
        seo_meta_in.title,
        seo_meta_in.description,
        seo_meta_in.keywords,
        seo_meta_in.canonical_url,
        seo_meta_in.og_title,
        seo_meta_in.og_description,
        seo_meta_in.og_image_url,
        seo_meta_in.twitter_card,
        seo_meta_in.twitter_title,
        seo_meta_in.twitter_description,
        seo_meta_in.twitter_image_url,
        seo_meta_in.structured_data
    )
    
    if seo_meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO metadata not found")
    
    return seo_meta

@router.delete("/{seo_id}", response_model=SeoMetaResponse)
def delete_seo_meta(
    *,
    db: Session = Depends(get_db),
    seo_id: int,
    current_user: User = Depends(has_permission("seo:delete")),
) -> Any:
    """
    Delete SEO metadata.
    """
    # Get SEO metadata before deletion
    seo_meta = db.query(SeoMeta).filter(SeoMeta.id == seo_id).first()
    if seo_meta is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="SEO metadata not found")
    
    success = seo_service.delete_seo_meta(db, seo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete SEO metadata"
        )
    
    return seo_meta
