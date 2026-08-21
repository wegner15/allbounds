from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.travel_guide import (
    TravelGuideCategory,
    TravelGuideCategoryCreate,
    TravelGuideCategoryUpdate,
    TravelGuideItem,
    TravelGuideItemCreate,
    TravelGuideItemUpdate
)
from app.services.travel_guide import travel_guide_service

router = APIRouter()

# --- Travel Guide Categories ---

@router.get("/categories", response_model=List[TravelGuideCategory])
def read_categories(
    db: Session = Depends(get_db),
    include_inactive: bool = Query(False, description="Include inactive categories")
) -> Any:
    """
    Retrieve travel guide categories.
    """
    return travel_guide_service.get_categories(db, include_inactive=include_inactive)


@router.post("/categories", response_model=TravelGuideCategory)
def create_category(
    *,
    db: Session = Depends(get_db),
    category_in: TravelGuideCategoryCreate
) -> Any:
    """
    Create a new travel guide category.
    """
    if category_in.slug:
        existing = travel_guide_service.get_category_by_slug(db, slug=category_in.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Category with this slug already exists.")
            
    return travel_guide_service.create_category(db, category_in=category_in)


@router.put("/categories/{category_id}", response_model=TravelGuideCategory)
def update_category(
    *,
    db: Session = Depends(get_db),
    category_id: int,
    category_in: TravelGuideCategoryUpdate
) -> Any:
    """
    Update a travel guide category.
    """
    category = travel_guide_service.get_category_by_id(db, category_id=category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    if category_in.slug and category_in.slug != category.slug:
        existing = travel_guide_service.get_category_by_slug(db, slug=category_in.slug)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=400, detail="Category with this slug already exists.")
            
    updated = travel_guide_service.update_category(db, category_id=category_id, category_in=category_in)
    return updated


@router.delete("/categories/{category_id}", response_model=dict)
def delete_category(
    *,
    db: Session = Depends(get_db),
    category_id: int
) -> Any:
    """
    Delete a travel guide category.
    """
    success = travel_guide_service.delete_category(db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found or could not be deleted.")
    return {"status": "success", "message": "Category successfully deleted"}


# --- Travel Guide Items ---

@router.get("/items", response_model=List[TravelGuideItem])
def read_items(
    db: Session = Depends(get_db),
    country_id: Optional[int] = Query(None, description="Filter by country ID"),
    country_slug: Optional[str] = Query(None, description="Filter by country slug"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    include_inactive: bool = Query(False, description="Include inactive items")
) -> Any:
    """
    Retrieve travel guide items filtered by country and/or category.
    """
    return travel_guide_service.get_items(
        db,
        country_id=country_id,
        country_slug=country_slug,
        category_id=category_id,
        include_inactive=include_inactive
    )


@router.post("/items", response_model=TravelGuideItem)
def create_item(
    *,
    db: Session = Depends(get_db),
    item_in: TravelGuideItemCreate
) -> Any:
    """
    Create a new travel guide item for a destination.
    """
    return travel_guide_service.create_item(db, item_in=item_in)


@router.put("/items/{item_id}", response_model=TravelGuideItem)
def update_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    item_in: TravelGuideItemUpdate
) -> Any:
    """
    Update a travel guide item.
    """
    item = travel_guide_service.get_item_by_id(db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found.")
        
    return travel_guide_service.update_item(db, item_id=item_id, item_in=item_in)


@router.delete("/items/{item_id}", response_model=dict)
def delete_item(
    *,
    db: Session = Depends(get_db),
    item_id: int
) -> Any:
    """
    Delete a travel guide item.
    """
    success = travel_guide_service.delete_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found or could not be deleted.")
    return {"status": "success", "message": "Item successfully deleted"}
