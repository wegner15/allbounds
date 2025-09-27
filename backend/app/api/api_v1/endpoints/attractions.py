from typing import Any, List
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.attraction import AttractionResponse, AttractionCreate, AttractionUpdate, AttractionWithCountryResponse, AttractionWithRelationshipsResponse
from app.schemas.package import PackageWithCountryResponse
from app.schemas.group_trip import GroupTripWithCountryResponse
from app.services.attraction import attraction_service
from app.auth.dependencies import get_current_user, has_permission

class SetCoverImageRequest(BaseModel):
    image_id: str

router = APIRouter()

@router.get("/", response_model=List[AttractionResponse])
@router.get("", response_model=List[AttractionResponse])  # Explicit route without trailing slash
def get_attractions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    country: str = Query(None, description="Filter attractions by country name"),
) -> Any:
    """
    Retrieve all attractions.
    """
    if country:
        # Find country by name and get attractions for that country
        from app.models.country import Country
        country_obj = db.query(Country).filter(Country.name == country, Country.is_active == True).first()
        if country_obj:
            attractions = attraction_service.get_attractions_by_country(db, country_id=country_obj.id, skip=skip, limit=limit)
        else:
            attractions = []
    else:
        attractions = attraction_service.get_attractions(db, skip=skip, limit=limit)
    return attractions

@router.get("/country/{country_id}", response_model=List[AttractionResponse])
def get_attractions_by_country(
    country_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve attractions by country ID.
    """
    attractions = attraction_service.get_attractions_by_country(db, country_id=country_id, skip=skip, limit=limit)
    return attractions

@router.get("/{attraction_id}", response_model=AttractionWithCountryResponse)
def get_attraction(
    attraction_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific attraction by ID.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    # Add gallery images from media service
    from app.services.media import media_service
    gallery_images = media_service.get_media_assets_by_entity(db, entity_type="attraction", entity_id=attraction.id)
    
    # Create gallery images list
    gallery_images_list = []
    for media_asset in gallery_images:
        # Generate proper image URL
        image_url = media_service.get_presigned_url(db, media_asset.id)
        if not image_url and media_asset.file_path.startswith("cloudflare://"):
            from app.core.cloudflare_config import cloudflare_settings
            image_url = f"{cloudflare_settings.delivery_url}/{media_asset.storage_key}/medium"
        elif not image_url:
            image_url = media_asset.file_path
            
        gallery_images_list.append({
            'id': media_asset.id,
            'file_path': image_url,
            'alt_text': media_asset.alt_text,
            'caption': media_asset.caption
        })
    
    # Add gallery_images to the attraction object
    attraction.gallery_images = gallery_images_list
    
    return attraction

@router.get("/slug/{slug}", response_model=AttractionWithCountryResponse)
def get_attraction_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific attraction by slug.
    """
    attraction = attraction_service.get_attraction_by_slug(db, slug=slug)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    # Add gallery images from media service
    from app.services.media import media_service
    gallery_images = media_service.get_media_assets_by_entity(db, entity_type="attraction", entity_id=attraction.id)
    
    # Create gallery images list
    gallery_images_list = []
    for media_asset in gallery_images:
        # Generate proper image URL
        image_url = media_service.get_presigned_url(db, media_asset.id)
        if not image_url and media_asset.file_path.startswith("cloudflare://"):
            from app.core.cloudflare_config import cloudflare_settings
            image_url = f"{cloudflare_settings.delivery_url}/{media_asset.storage_key}/medium"
        elif not image_url:
            image_url = media_asset.file_path
            
        gallery_images_list.append({
            'id': media_asset.id,
            'file_path': image_url,
            'alt_text': media_asset.alt_text,
            'caption': media_asset.caption
        })
    
    # Add gallery_images to the attraction object
    attraction.gallery_images = gallery_images_list
    
    return attraction

@router.post("/", response_model=AttractionResponse)
def create_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_in: AttractionCreate,
    current_user: User = Depends(has_permission("content:create")),
) -> Any:
    """
    Create new attraction.
    """
    attraction = attraction_service.create_attraction(db, attraction_in)
    return attraction

@router.put("/{attraction_id}", response_model=AttractionResponse)
def update_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    attraction_in: AttractionUpdate,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Update an attraction.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    attraction = attraction_service.update_attraction(db, attraction_id=attraction_id, attraction_update=attraction_in)
    return attraction

@router.post("/{attraction_id}/cover-image", response_model=AttractionResponse)
def set_attraction_cover_image(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    request: SetCoverImageRequest,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Set the cover image for an attraction.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    updated_attraction = attraction_service.set_cover_image(db, attraction_id=attraction_id, image_id=request.image_id)
    return updated_attraction

@router.delete("/{attraction_id}", response_model=AttractionResponse)
def delete_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    current_user: User = Depends(has_permission("content:delete")),
) -> Any:
    """
    Delete an attraction.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    attraction_service.delete_attraction(db, attraction_id=attraction_id)
    return attraction

@router.get("/{attraction_id}/relationships", response_model=AttractionWithRelationshipsResponse)
def get_attraction_with_relationships(
    attraction_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Retrieve a specific attraction with its package and group trip relationships.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    # Convert relationships to IDs for the response
    response = AttractionWithRelationshipsResponse.from_orm(attraction)
    response.package_ids = [package.id for package in attraction.packages]
    response.group_trip_ids = [group_trip.id for group_trip in attraction.group_trips]
    
    return response

@router.post("/{attraction_id}/packages/{package_id}", response_model=dict)
def assign_package_to_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    package_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign a package to an attraction.
    """
    success = attraction_service.assign_package(db, attraction_id=attraction_id, package_id=package_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction or package not found")
    return {"status": "success", "message": f"Package {package_id} assigned to attraction {attraction_id}"}

@router.delete("/{attraction_id}/packages/{package_id}", response_model=dict)
def remove_package_from_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    package_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a package from an attraction.
    """
    success = attraction_service.remove_package(db, attraction_id=attraction_id, package_id=package_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction, package, or relationship not found")
    return {"status": "success", "message": f"Package {package_id} removed from attraction {attraction_id}"}

@router.post("/{attraction_id}/group-trips/{group_trip_id}", response_model=dict)
def assign_group_trip_to_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Assign a group trip to an attraction.
    """
    success = attraction_service.assign_group_trip(db, attraction_id=attraction_id, group_trip_id=group_trip_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction or group trip not found")
    return {"status": "success", "message": f"Group trip {group_trip_id} assigned to attraction {attraction_id}"}

@router.delete("/{attraction_id}/group-trips/{group_trip_id}", response_model=dict)
def remove_group_trip_from_attraction(
    *,
    db: Session = Depends(get_db),
    attraction_id: int,
    group_trip_id: int,
    current_user: User = Depends(has_permission("content:update")),
) -> Any:
    """
    Remove a group trip from an attraction.
    """
    success = attraction_service.remove_group_trip(db, attraction_id=attraction_id, group_trip_id=group_trip_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction, group trip, or relationship not found")
    return {"status": "success", "message": f"Group trip {group_trip_id} removed from attraction {attraction_id}"}

@router.get("/{attraction_id}/trips", response_model=dict)
def get_trips_by_attraction(
    attraction_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all packages and group trips that include this attraction.
    """
    attraction = attraction_service.get_attraction(db, attraction_id=attraction_id)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    # Add gallery images from media service
    from app.services.media import media_service
    gallery_images = media_service.get_media_assets_by_entity(db, entity_type="attraction", entity_id=attraction.id)
    
    # Create gallery images list
    gallery_images_list = []
    for media_asset in gallery_images:
        # Generate proper image URL
        image_url = media_service.get_presigned_url(db, media_asset.id)
        if not image_url and media_asset.file_path.startswith("cloudflare://"):
            from app.core.cloudflare_config import cloudflare_settings
            image_url = f"{cloudflare_settings.delivery_url}/{media_asset.storage_key}/medium"
        elif not image_url:
            image_url = media_asset.file_path
            
        gallery_images_list.append({
            'id': media_asset.id,
            'file_path': image_url,
            'alt_text': media_asset.alt_text,
            'caption': media_asset.caption
        })
    
    # Add gallery_images to the attraction object
    attraction.gallery_images = gallery_images_list
    
    # Get packages that include this attraction
    packages = [PackageWithCountryResponse.from_orm(package) for package in attraction.packages[skip:skip+limit]]
    
    # Get group trips that include this attraction  
    group_trips = [GroupTripWithCountryResponse.from_orm(group_trip) for group_trip in attraction.group_trips[skip:skip+limit]]
    
    return {
        "attraction": AttractionWithCountryResponse.from_orm(attraction),
        "packages": packages,
        "group_trips": group_trips,
        "total_packages": len(attraction.packages),
        "total_group_trips": len(attraction.group_trips)
    }

@router.get("/slug/{slug}/trips", response_model=dict)
def get_trips_by_attraction_slug(
    slug: str,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Get all packages and group trips that include this attraction by slug.
    """
    attraction = attraction_service.get_attraction_by_slug(db, slug=slug)
    if attraction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attraction not found")
    
    # Add gallery images from media service
    from app.services.media import media_service
    gallery_images = media_service.get_media_assets_by_entity(db, entity_type="attraction", entity_id=attraction.id)
    
    # Create gallery images list
    gallery_images_list = []
    for media_asset in gallery_images:
        # Generate proper image URL
        image_url = media_service.get_presigned_url(db, media_asset.id)
        if not image_url and media_asset.file_path.startswith("cloudflare://"):
            from app.core.cloudflare_config import cloudflare_settings
            image_url = f"{cloudflare_settings.delivery_url}/{media_asset.storage_key}/medium"
        elif not image_url:
            image_url = media_asset.file_path
            
        gallery_images_list.append({
            'id': media_asset.id,
            'file_path': image_url,
            'alt_text': media_asset.alt_text,
            'caption': media_asset.caption
        })
    
    # Add gallery_images to the attraction object
    attraction.gallery_images = gallery_images_list
    
    # Get packages that include this attraction
    packages = [PackageWithCountryResponse.from_orm(package) for package in attraction.packages[skip:skip+limit]]
    
    # Get group trips that include this attraction  
    group_trips = [GroupTripWithCountryResponse.from_orm(group_trip) for group_trip in attraction.group_trips[skip:skip+limit]]
    
    return {
        "attraction": AttractionWithCountryResponse.from_orm(attraction),
        "packages": packages,
        "group_trips": group_trips,
        "total_packages": len(attraction.packages),
        "total_group_trips": len(attraction.group_trips)
    }
