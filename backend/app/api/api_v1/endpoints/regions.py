from typing import Any, List, Dict

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.region import RegionResponse, RegionCreate, RegionUpdate
from app.schemas.country import CountryResponse
from app.services.region import region_service
from app.services.country import country_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[RegionResponse])
def get_regions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all regions.
    """
    regions = region_service.get_regions(db, skip=skip, limit=limit)
    return regions

@router.get("/with-countries", response_model=List[Dict])
def get_regions_with_countries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve all regions with their associated countries.
    """
    regions = region_service.get_regions(db, skip=skip, limit=limit)
    result = []
    
    for region in regions:
        region_dict = {
            "id": region.id,
            "name": region.name,
            "slug": region.slug,
            "description": region.description,
            "is_active": region.is_active,
            "created_at": region.created_at,
            "updated_at": region.updated_at,
            "countries": []
        }
        
        # Get countries for this region
        countries = country_service.get_countries_by_region(db, region_id=region.id)
        for country in countries:
            country_dict = {
                "id": country.id,
                "name": country.name,
                "slug": country.slug,
                "description": country.description,
                "is_active": country.is_active
            }
            region_dict["countries"].append(country_dict)
            
        result.append(region_dict)
        
    return result

@router.get("/{region_id}", response_model=RegionResponse)
def get_region(
    region_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve a specific region by ID.
    """
    region = region_service.get_region(db, region_id=region_id)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    return region

@router.get("/{region_id}/with-countries", response_model=Dict)
def get_region_with_countries(
    region_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve a specific region by ID with its associated countries.
    """
    region = region_service.get_region(db, region_id=region_id)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    
    region_dict = {
        "id": region.id,
        "name": region.name,
        "slug": region.slug,
        "description": region.description,
        "is_active": region.is_active,
        "created_at": region.created_at,
        "updated_at": region.updated_at,
        "countries": []
    }
    
    # Get countries for this region
    countries = country_service.get_countries_by_region(db, region_id=region.id)
    for country in countries:
        country_dict = {
            "id": country.id,
            "name": country.name,
            "slug": country.slug,
            "description": country.description,
            "is_active": country.is_active
        }
        region_dict["countries"].append(country_dict)
    
    return region_dict

@router.get("/slug/{slug}", response_model=RegionResponse)
def get_region_by_slug(
    slug: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve a specific region by slug.
    """
    region = region_service.get_region_by_slug(db, slug=slug)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    return region

@router.get("/slug/{slug}/with-countries", response_model=Dict)
def get_region_by_slug_with_countries(
    slug: str,
    db: Session = Depends(get_db)
) -> Any:
    """
    Retrieve a specific region by slug with its associated countries.
    """
    region = region_service.get_region_by_slug(db, slug=slug)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    
    region_dict = {
        "id": region.id,
        "name": region.name,
        "slug": region.slug,
        "description": region.description,
        "is_active": region.is_active,
        "created_at": region.created_at,
        "updated_at": region.updated_at,
        "countries": []
    }
    
    # Get countries for this region
    countries = country_service.get_countries_by_region(db, region_id=region.id)
    for country in countries:
        country_dict = {
            "id": country.id,
            "name": country.name,
            "slug": country.slug,
            "description": country.description,
            "is_active": country.is_active
        }
        region_dict["countries"].append(country_dict)
    
    return region_dict

@router.post("/", response_model=RegionResponse)
def create_region(
    *,
    db: Session = Depends(get_db),
    region_in: RegionCreate,
    current_user: User = Depends(has_permission("content:create"))
) -> Any:
    """
    Create new region.
    """
    region = region_service.create_region(db, region_in)
    return region

@router.put("/{region_id}", response_model=RegionResponse)
def update_region(
    *,
    db: Session = Depends(get_db),
    region_id: int,
    region_in: RegionUpdate,
    current_user: User = Depends(has_permission("content:update"))
) -> Any:
    """
    Update a region.
    """
    region = region_service.get_region(db, region_id=region_id)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    region = region_service.update_region(db, region_id=region_id, region_update=region_in)
    return region

@router.delete("/{region_id}", response_model=RegionResponse)
def delete_region(
    *,
    db: Session = Depends(get_db),
    region_id: int,
    current_user: User = Depends(has_permission("content:delete"))
) -> Any:
    """
    Delete a region.
    """
    region = region_service.get_region(db, region_id=region_id)
    if region is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Region not found")
    region_service.delete_region(db, region_id=region_id)
    return region
