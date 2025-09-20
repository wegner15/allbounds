from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.schemas.package import PackageResponse, PackageCreate, PackageUpdate, PackageWithCountryResponse, PackageHolidayTypeCreate
from app.services.package import package_service
from app.auth.dependencies import get_current_user, has_permission

class SetCoverImageRequest(BaseModel):
    image_id: str

router = APIRouter()

@router.get("/", response_model=List[PackageWithCountryResponse])
def get_packages(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all packages.
    """
    packages = package_service.get_packages(db, skip=skip, limit=limit)
    return packages

@router.get("/country/{country_id}", response_model=List[PackageWithCountryResponse])
def get_packages_by_country(
    country_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve packages by country ID.
    """
    packages = package_service.get_packages_by_country(db, country_id=country_id, skip=skip, limit=limit)
    return packages

@router.get("/featured", response_model=List[PackageWithCountryResponse])
def get_featured_packages(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve featured packages.
    """
    packages = package_service.get_featured_packages(db, skip=skip, limit=limit)
    return packages

@router.get("/{package_id}", response_model=PackageWithCountryResponse)
def get_package(
    package_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific package by ID.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return package

@router.get("/slug/{slug}", response_model=PackageWithCountryResponse)
def get_package_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific package by slug.
    """
    package = package_service.get_package_by_slug(db, slug=slug)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return package

@router.get("/details/{slug}")
def get_package_details_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve package details with gallery images by slug.
    """
    package_details = package_service.get_package_details_by_slug(db, slug=slug)
    if package_details is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    return package_details

@router.post("/", response_model=PackageResponse)
def create_package(
    *,
    db: Session = Depends(get_db),
    package_in: PackageCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new package.
    """
    package = package_service.create_package(db, package_in)
    return package

@router.put("/{package_id}", response_model=PackageResponse)
def update_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    package_in: PackageUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update a package.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    package = package_service.update_package(db, package_id=package_id, package_update=package_in)
    return package

@router.delete("/{package_id}", response_model=PackageResponse)
def delete_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete a package.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    package_service.delete_package(db, package_id=package_id)
    return package

@router.post("/{package_id}/publish", response_model=PackageResponse)
def publish_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    current_user: User = Depends(has_permission("content:publish")),
) -> Any:
    """
    Publish a package.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    package = package_service.publish_package(db, package_id=package_id)
    return package

@router.post("/{package_id}/unpublish", response_model=PackageResponse)
def unpublish_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    current_user: User = Depends(has_permission("content:publish")),
) -> Any:
    """
    Unpublish a package.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    package = package_service.unpublish_package(db, package_id=package_id)
    return package

@router.post("/{package_id}/holiday-types/{holiday_type_id}", response_model=PackageResponse)
def add_holiday_type_to_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    holiday_type_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add a holiday type to a package.
    """
    package = package_service.add_holiday_type(
        db, package_id=package_id, holiday_type_id=holiday_type_id
    )
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or holiday type not found")
    return package

@router.delete("/{package_id}/holiday-types/{holiday_type_id}", response_model=PackageResponse)
def remove_holiday_type_from_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    holiday_type_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a holiday type from a package.
    """
    package = package_service.remove_holiday_type(
        db, package_id=package_id, holiday_type_id=holiday_type_id
    )
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or holiday type not found")
    return package

@router.post("/{package_id}/cover-image", response_model=PackageResponse)
def set_package_cover_image(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    request: SetCoverImageRequest,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Set the cover image for a package.
    """
    package = package_service.get_package(db, package_id=package_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package not found")
    
    updated_package = package_service.set_cover_image(db, package_id=package_id, image_id=request.image_id)
    return updated_package

@router.post("/{package_id}/media/{media_id}", response_model=PackageResponse)
def add_media_to_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Add a media asset to a package's gallery.
    """
    package = package_service.add_media_to_package(db, package_id=package_id, media_id=media_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or media not found")
    return package

@router.delete("/{package_id}/media/{media_id}", response_model=PackageResponse)
def remove_media_from_package(
    *,
    db: Session = Depends(get_db),
    package_id: int,
    media_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a media asset from a package's gallery.
    """
    package = package_service.remove_media_from_package(db, package_id=package_id, media_id=media_id)
    if package is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Package or media not found")
    return package
