from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.content import ContentPage
from app.schemas.content import ContentPageResponse, ContentPageCreate, ContentPageUpdate
from app.services.content import content_service
from app.auth.dependencies import get_current_active_superuser

router = APIRouter()


@router.get("/", response_model=List[ContentPageResponse])
def read_content_pages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Retrieve all content pages (admin only).
    """
    content_pages = content_service.get_content_pages(db, skip=skip, limit=limit, active_only=False)
    return content_pages


@router.get("/published", response_model=List[ContentPageResponse])
def read_published_content_pages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all published content pages (public access).
    """
    content_pages = content_service.get_content_pages(db, skip=skip, limit=limit, active_only=True)
    # Filter for published pages only
    return [page for page in content_pages if page.is_published]


@router.get("/{page_id}", response_model=ContentPageResponse)
def read_content_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Get a specific content page by ID (admin only).
    """
    content_page = content_service.get_content_page(db, page_id=page_id)
    if content_page is None:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page


@router.get("/slug/{slug}", response_model=ContentPageResponse)
def read_content_page_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific content page by slug (public access for published pages).
    """
    content_page = content_service.get_content_page_by_slug(db, slug=slug)
    if content_page is None or not content_page.is_published:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page


@router.post("/", response_model=ContentPageResponse)
def create_content_page(
    content_page_in: ContentPageCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Create a new content page.
    """
    try:
        content_page = content_service.create_content_page(db=db, content_page_in=content_page_in)
        return content_page
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{page_id}", response_model=ContentPageResponse)
def update_content_page(
    page_id: int,
    content_page_in: ContentPageUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Update a content page.
    """
    content_page = content_service.update_content_page(db=db, page_id=page_id, content_page_in=content_page_in)
    if content_page is None:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page


@router.delete("/{page_id}", response_model=ContentPageResponse)
def delete_content_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Delete a content page.
    """
    content_page = content_service.get_content_page(db, page_id=page_id)
    if content_page is None:
        raise HTTPException(status_code=404, detail="Content page not found")

    success = content_service.delete_content_page(db, page_id=page_id)
    if not success:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page


@router.post("/{page_id}/publish", response_model=ContentPageResponse)
def publish_content_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Publish a content page.
    """
    content_page = content_service.publish_content_page(db, page_id=page_id)
    if content_page is None:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page


@router.post("/{page_id}/unpublish", response_model=ContentPageResponse)
def unpublish_content_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_superuser)
):
    """
    Unpublish a content page.
    """
    content_page = content_service.unpublish_content_page(db, page_id=page_id)
    if content_page is None:
        raise HTTPException(status_code=404, detail="Content page not found")
    return content_page