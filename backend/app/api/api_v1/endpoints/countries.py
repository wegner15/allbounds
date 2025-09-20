from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.country import CountryResponse, CountryCreate, CountryUpdate, CountryWithRegionResponse
from app.services.country import country_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[CountryResponse])
@router.get("", response_model=List[CountryResponse])
def get_countries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all countries.
    """
    countries = country_service.get_countries(db, skip=skip, limit=limit)
    return countries

@router.get("/region/{region_id}", response_model=List[CountryResponse])
def get_countries_by_region(
    region_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve countries by region ID.
    """
    countries = country_service.get_countries_by_region(db, region_id=region_id, skip=skip, limit=limit)
    return countries

@router.get("/{country_id}", response_model=CountryWithRegionResponse)
def get_country(
    country_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific country by ID.
    """
    country = country_service.get_country_for_admin(db, country_id=country_id)
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    return country

@router.get("/slug/{slug}", response_model=CountryWithRegionResponse)
def get_country_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific country by slug.
    """
    country = country_service.get_country_by_slug(db, slug=slug)
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    return country

@router.get("/slug/{slug}/details", response_model=Any)
def get_country_details_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific country by slug with all related destinations data.
    """
    country_details = country_service.get_country_details_by_slug(db, slug=slug)
    if country_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    return country_details

@router.post("/", response_model=CountryResponse)
def create_country(
    *,
    db: Session = Depends(get_db),
    country_in: CountryCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new country.
    """
    country = country_service.create_country(db, country_in)
    return country

@router.put("/{country_id}", response_model=CountryResponse)
def update_country(
    *,
    db: Session = Depends(get_db),
    country_id: int,
    country_in: CountryUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a country.
    """
    country = country_service.get_country(db, country_id=country_id)
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    country = country_service.update_country(db, country_id=country_id, country_update=country_in)
    return country

@router.delete("/{country_id}", response_model=CountryResponse)
def delete_country(
    *,
    db: Session = Depends(get_db),
    country_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a country.
    """
    country = country_service.get_country(db, country_id=country_id)
    if country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    country_service.delete_country(db, country_id=country_id)
    return country
