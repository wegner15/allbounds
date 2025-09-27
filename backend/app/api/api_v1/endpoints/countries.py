from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.country import CountryResponse, CountryCreate, CountryUpdate, CountryWithRegionResponse
from app.schemas.country_visit_info import CountryVisitInfo, CountryVisitInfoCreate, CountryVisitInfoUpdate
from app.services.country import country_service
from app.services.country_visit_info import country_visit_info_service
from app.auth.dependencies import get_current_user, has_permission

router = APIRouter()

@router.get("/", response_model=List[CountryResponse])
@router.get("", response_model=List[CountryResponse])
def get_countries(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    details: bool = Query(False, description="Include detailed related data (packages, group_trips, attractions, etc.)"),
) -> Any:
    """
    Retrieve all countries.
    """
    if details:
        countries = country_service.get_countries_with_details(db, skip=skip, limit=limit)
        return countries
    else:
        countries = country_service.get_countries(db, skip=skip, limit=limit)
        return [CountryResponse.from_orm(country) for country in countries]

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
    return [CountryResponse.from_orm(country) for country in countries]

@router.get("/with-hotels", response_model=List[CountryResponse])
def get_countries_with_hotels(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve countries that have active hotels.
    """
    countries = country_service.get_countries_with_hotels(db, skip=skip, limit=limit)
    return [CountryResponse.from_orm(country) for country in countries]

@router.get("/with-packages", response_model=List[CountryResponse])
def get_countries_with_packages(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve countries that have active packages.
    """
    countries = country_service.get_countries_with_packages(db, skip=skip, limit=limit)
    return [CountryResponse.from_orm(country) for country in countries]

@router.get("/with-activities", response_model=List[CountryResponse])
def get_countries_with_activities(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve countries that have active activities.
    """
    countries = country_service.get_countries_with_activities(db, skip=skip, limit=limit)
    return [CountryResponse.from_orm(country) for country in countries]

@router.get("/with-attractions", response_model=List[CountryResponse])
def get_countries_with_attractions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve countries that have active attractions.
    """
    countries = country_service.get_countries_with_attractions(db, skip=skip, limit=limit)
    return [CountryResponse.from_orm(country) for country in countries]

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
    return CountryWithRegionResponse.from_orm(country)

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
    return CountryWithRegionResponse.from_orm(country)

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
    return CountryResponse.from_orm(country)

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
    return CountryResponse.from_orm(country)

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
    return CountryResponse.from_orm(country)

# Country Visit Info endpoints
@router.get("/{country_id}/visit-info", response_model=CountryVisitInfo)
def get_country_visit_info(
    country_id: int,
    db: Session = Depends(get_db)
) -> Any:
    """
    Get visit information for a specific country
    """
    # Check if country exists
    country = country_service.get_country(db, country_id)
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    
    visit_info = country_visit_info_service.get_country_visit_info(db, country_id)
    if not visit_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit information not found for this country"
        )
    
    return visit_info

@router.post("/{country_id}/visit-info", response_model=CountryVisitInfo)
def create_country_visit_info(
    country_id: int,
    visit_info: CountryVisitInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create visit information for a country (admin only)
    """
    # Check if country exists
    country = country_service.get_country(db, country_id)
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    
    # Check if visit info already exists
    existing_visit_info = country_visit_info_service.get_country_visit_info(db, country_id)
    if existing_visit_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Visit information already exists for this country. Use PUT to update."
        )
    
    # Ensure country_id in path matches the one in the request body
    if visit_info.country_id != country_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country ID in path does not match the one in request body"
        )
    
    return country_visit_info_service.create_country_visit_info(db, visit_info)

@router.put("/{country_id}/visit-info", response_model=CountryVisitInfo)
def update_country_visit_info(
    country_id: int,
    visit_info: CountryVisitInfoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update visit information for a country (admin only)
    """
    # Check if country exists
    country = country_service.get_country(db, country_id)
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    
    return country_visit_info_service.update_country_visit_info(db, country_id, visit_info)

@router.delete("/{country_id}/visit-info", status_code=status.HTTP_204_NO_CONTENT)
def delete_country_visit_info(
    country_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(has_permission("content:delete")),
):
    """
    Delete visit information for a country (admin only)
    """
    # Check if country exists
    country = country_service.get_country(db, country_id)
    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found"
        )
    
    success = country_visit_info_service.delete_country_visit_info(db, country_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit information not found for this country"
        )
    
    return None
