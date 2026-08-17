from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.content_tag import (
    ContentTagCreate,
    ContentTagUpdate,
    ContentTagResponse,
    PaginatedContentTagResponse,
)
from app.services.content_tag import content_tag_service

router = APIRouter()

@router.get("/paginated", response_model=PaginatedContentTagResponse)
def read_paginated_tags(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for tag name, slug or description"),
    category: Optional[str] = Query(None, description="Filter by category"),
    include_inactive: bool = Query(True, description="Include inactive tags"),
    order_by: str = Query("order_index", description="Field to order by"),
    order: str = Query("asc", description="Order direction (asc/desc)"),
) -> Any:
    """
    Retrieve paginated tags for admin list view.
    """
    import math
    items, total = content_tag_service.get_paginated_tags(
        db=db,
        page=page,
        limit=limit,
        search=search,
        category=category,
        include_inactive=include_inactive,
        order_by=order_by,
        order=order,
    )
    pages = math.ceil(total / limit) if limit > 0 else 0

    return {
        "items": items,
        "total": total,
        "page": page,
        "size": limit,
        "pages": pages,
    }

@router.get("/", response_model=List[ContentTagResponse])
def read_tags(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 1000,
    category: Optional[str] = None,
    include_inactive: bool = False
) -> Any:
    """
    Retrieve tags.
    """
    tags, total = content_tag_service.get_tags(
        db, skip=skip, limit=limit, category=category, include_inactive=include_inactive
    )
    return tags

@router.get("/{tag_id}", response_model=ContentTagResponse)
def read_tag(
    *,
    db: Session = Depends(get_db),
    tag_id: int,
) -> Any:
    """
    Get tag by ID.
    """
    tag = content_tag_service.get_tag(db=db, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.post("/", response_model=ContentTagResponse)
def create_tag(
    *,
    db: Session = Depends(get_db),
    tag_in: ContentTagCreate,
    # current_user = Depends(get_current_active_admin)  # Assuming admin only
) -> Any:
    """
    Create new tag.
    """
    # Verify slug uniqueness
    tag = content_tag_service.get_tag_by_slug(db, slug=tag_in.slug)
    if tag:
        raise HTTPException(
            status_code=400,
            detail="The tag with this slug already exists in the system.",
        )
    tag = content_tag_service.create_tag(db=db, tag_in=tag_in)
    return tag

@router.put("/{tag_id}", response_model=ContentTagResponse)
def update_tag(
    *,
    db: Session = Depends(get_db),
    tag_id: int,
    tag_in: ContentTagUpdate,
    # current_user = Depends(get_current_active_admin)
) -> Any:
    """
    Update a tag.
    """
    tag = content_tag_service.get_tag(db=db, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
        
    if tag_in.slug and tag_in.slug != tag.slug:
        existing = content_tag_service.get_tag_by_slug(db, slug=tag_in.slug)
        if existing and existing.id != tag_id:
            raise HTTPException(
                status_code=400,
                detail="The tag with this slug already exists in the system.",
            )
            
    tag = content_tag_service.update_tag(db=db, tag_id=tag_id, tag_in=tag_in)
    return tag

@router.delete("/{tag_id}", response_model=dict)
def delete_tag(
    *,
    db: Session = Depends(get_db),
    tag_id: int,
    # current_user = Depends(get_current_active_admin)
) -> Any:
    """
    Delete a tag.
    """
    tag = content_tag_service.get_tag(db=db, tag_id=tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    success = content_tag_service.delete_tag(db=db, tag_id=tag_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete tag")
        
    return {"status": "success", "message": "Tag successfully deleted"}
