from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.models.group_trip import GroupTrip, GroupTripDeparture
from app.models.media import MediaAsset
from app.models.inclusion_exclusion import Inclusion, Exclusion
from app.schemas.group_trip import GroupTripCreate, GroupTripUpdate, GroupTripDepartureCreate, GroupTripDepartureUpdate
from app.utils.slug import create_slug
from app.core.cloudflare_config import cloudflare_settings

# Helper function to format group trip response
def format_group_trip_response(group_trip: GroupTrip, gallery_images: List[Dict[str, Any]], cover_image: str) -> Dict[str, Any]:
    """
    Format group trip data for API response, including inclusion and exclusion items.
    """
    return {
        "id": group_trip.id,
        "name": group_trip.name,
        "summary": group_trip.summary,
        "description": group_trip.description,
        "slug": group_trip.slug,
        "duration_days": group_trip.duration_days,
        "price": float(group_trip.price) if group_trip.price else None,
        "min_participants": group_trip.min_participants,
        "max_participants": group_trip.max_participants,
        "itinerary": group_trip.itinerary,
        "inclusions": group_trip.inclusions,
        "exclusions": group_trip.exclusions,
        "cover_image": cover_image,
        "gallery_images": gallery_images,
        "country": {
            "id": group_trip.country.id,
            "name": group_trip.country.name,
            "slug": group_trip.country.slug,
        } if group_trip.country else None,
        "holiday_types": [
            {
                "id": ht.id,
                "name": ht.name,
                "slug": ht.slug,
            }
            for ht in group_trip.holiday_types
        ],
        "inclusion_items": [
            {
                "id": inc.id,
                "name": inc.name,
                "description": inc.description,
                "icon": inc.icon,
                "category": inc.category
            }
            for inc in group_trip.inclusion_items
        ],
        "exclusion_items": [
            {
                "id": exc.id,
                "name": exc.name,
                "description": exc.description,
                "icon": exc.icon,
                "category": exc.category
            }
            for exc in group_trip.exclusion_items
        ],
        "departures": [
            {
                "id": dep.id,
                "start_date": dep.start_date.isoformat() if dep.start_date else None,
                "end_date": dep.end_date.isoformat() if dep.end_date else None,
                "available_slots": dep.available_slots,
                "booked_slots": dep.booked_slots,
                "is_active": dep.is_active,
            }
            for dep in group_trip.departures if dep.is_active
        ],
        "is_active": group_trip.is_active,
        "is_featured": group_trip.is_featured,
    }

# Updated methods for GroupTripService class

def get_group_trip_details_by_slug(self, db: Session, slug: str) -> Optional[Dict[str, Any]]:
    """
    Get group trip details with gallery images formatted for frontend.
    """
    group_trip = db.query(GroupTrip).options(
        joinedload(GroupTrip.media_assets),
        joinedload(GroupTrip.country),
        joinedload(GroupTrip.holiday_types),
        joinedload(GroupTrip.departures),
        joinedload(GroupTrip.inclusion_items),
        joinedload(GroupTrip.exclusion_items)
    ).filter(GroupTrip.slug == slug, GroupTrip.is_active == True).first()
    
    if not group_trip:
        return None
        
    # Format gallery images with Cloudflare URLs
    gallery_images = []
    cover_image = None
    
    for media in group_trip.media_assets:
        if media.is_active:
            # Generate Cloudflare image URL properly
            if media.storage_key:
                # Use storage_key (Cloudflare image ID) to construct URL
                image_url = f"{cloudflare_settings.delivery_url}/{media.storage_key}/public"
            elif media.file_path and media.file_path.startswith('http'):
                # Already a full URL
                image_url = media.file_path
            elif media.file_path:
                # Assume it's a Cloudflare image ID
                image_url = f"{cloudflare_settings.delivery_url}/{media.file_path}/public"
            else:
                # Fallback
                image_url = media.file_path or ""
            
            image_data = {
                "id": media.id,
                "filename": media.filename,
                "alt_text": media.alt_text or group_trip.name,
                "title": media.title,
                "caption": media.caption,
                "width": media.width,
                "height": media.height,
                "file_path": image_url,
                "cloudflare_id": media.storage_key or (media.file_path if not media.file_path.startswith('http') else None),
            }
            gallery_images.append(image_data)
    
    # Use image_id as cover image, or first gallery image as fallback
    if group_trip.image_id:
        cover_image = group_trip.image_id
    elif gallery_images:
        cover_image = gallery_images[0]["file_path"]
        
    # Use the helper function to format the response
    return format_group_trip_response(group_trip, gallery_images, cover_image)

def get_group_trip_details_by_id(self, db: Session, group_trip_id: int) -> Optional[Dict[str, Any]]:
    """
    Get group trip details with gallery images formatted for frontend by ID.
    """
    group_trip = db.query(GroupTrip).options(
        joinedload(GroupTrip.media_assets),
        joinedload(GroupTrip.country),
        joinedload(GroupTrip.holiday_types),
        joinedload(GroupTrip.departures),
        joinedload(GroupTrip.inclusion_items),
        joinedload(GroupTrip.exclusion_items)
    ).filter(GroupTrip.id == group_trip_id).first()
    
    if not group_trip:
        return None
        
    # Format gallery images with Cloudflare URLs
    gallery_images = []
    cover_image = None
    
    for media in group_trip.media_assets:
        if media.is_active:
            # Generate Cloudflare image URL properly
            if media.storage_key:
                # Use storage_key (Cloudflare image ID) to construct URL
                image_url = f"{cloudflare_settings.delivery_url}/{media.storage_key}/public"
            elif media.file_path and media.file_path.startswith('http'):
                # Already a full URL
                image_url = media.file_path
            elif media.file_path:
                # Assume it's a Cloudflare image ID
                image_url = f"{cloudflare_settings.delivery_url}/{media.file_path}/public"
            else:
                # Fallback
                image_url = media.file_path or ""
            
            image_data = {
                "id": media.id,
                "filename": media.filename,
                "alt_text": media.alt_text or group_trip.name,
                "title": media.title,
                "caption": media.caption,
                "width": media.width,
                "height": media.height,
                "file_path": image_url,
                "cloudflare_id": media.storage_key or (media.file_path if not media.file_path.startswith('http') else None),
            }
            gallery_images.append(image_data)
    
    # Use image_id as cover image, or first gallery image as fallback
    if group_trip.image_id:
        cover_image = group_trip.image_id
    elif gallery_images:
        cover_image = gallery_images[0]["file_path"]
        
    # Use the helper function to format the response
    return format_group_trip_response(group_trip, gallery_images, cover_image)
