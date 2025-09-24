from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.auth.dependencies import get_current_user, get_current_superuser
from app.services.country_visit_info import country_visit_info_service
from app.services.country import country_service
from app.schemas.country_visit_info import CountryVisitInfo, CountryVisitInfoCreate, CountryVisitInfoUpdate
from app.models.user import User

router = APIRouter()

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
    current_user: User = Depends(get_current_superuser)
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
    current_user: User = Depends(get_current_superuser)
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
    current_user: User = Depends(get_current_superuser)
) -> Any:
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
