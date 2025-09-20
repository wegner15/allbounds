"""
This file imports all models in the correct order to avoid circular dependencies.
"""
# Import models in the correct order to avoid circular dependencies

# Import base models first
from app.models.user import User, Role, Permission
from app.models.region import Region
from app.models.country import Country
from app.models.holiday_type import HolidayType

# Import models that depend on base models
from app.models.attraction import Attraction
from app.models.accommodation import Accommodation
from app.models.hotel import Hotel
from app.models.package import Package
from app.models.group_trip import GroupTrip, GroupTripDeparture
from app.models.review import Review
from app.models.blog import BlogPost, Tag
from app.models.media import MediaAsset
from app.models.audit import AuditLog
from app.models.seo import SeoMeta
from app.models.itinerary import ItineraryItem, ItineraryActivity

# This ensures all models are imported in the correct order
__all__ = [
    'User', 'Role', 'Permission',
    'Region', 'Country', 'HolidayType',
    'Attraction', 'Accommodation', 'Hotel', 'Package',
    'GroupTrip', 'GroupTripDeparture',
    'Review', 'BlogPost', 'Tag',
    'MediaAsset', 'AuditLog', 'SeoMeta',
    'ItineraryItem', 'ItineraryActivity',
]
