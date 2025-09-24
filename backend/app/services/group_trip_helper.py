from typing import Dict, Any, List
from app.models.group_trip import GroupTrip

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
