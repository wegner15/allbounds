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
from app.models.amenity import Amenity
from app.models.hotel import Hotel
from app.models.hotel_type import HotelType
from app.models.activity import Activity
from app.models.package import Package, PackageHolidayType
from app.models.package_price_chart import PackagePriceChart
from app.models.inclusion_exclusion import Inclusion, Exclusion
from app.models.group_trip import GroupTrip, GroupTripDeparture
from app.models.review import Review
from app.models.blog import BlogPost, Tag
from app.models.content import ContentPage
from app.models.media import MediaAsset
from app.models.audit import AuditLog
from app.models.seo import SeoMeta
from app.models.itinerary import ItineraryItem, ItineraryActivity
from app.models.booking import Booking, BookingTraveler
from app.models.inquiry import Inquiry
from app.models.country_visit_info import CountryVisitInfo
from app.models.newsletter import NewsletterSubscription
from app.models.visa_application import VisaApplication
from app.models.flight_booking import FlightBooking, FlightPassenger
from app.models.email_log import EmailLog

# This ensures all models are imported in the correct order
__all__ = [
    'User', 'Role', 'Permission',
    'Region', 'Country', 'HolidayType',
    'Attraction', 'Accommodation', 'Amenity', 'Hotel', 'HotelType', 'Activity',
    'Package', 'PackageHolidayType', 'PackagePriceChart',
    'Inclusion', 'Exclusion',
    'GroupTrip', 'GroupTripDeparture',
    'Review', 'BlogPost', 'Tag', 'ContentPage',
    'MediaAsset', 'AuditLog', 'SeoMeta',
    'ItineraryItem', 'ItineraryActivity',
    'Booking', 'BookingTraveler', 'Inquiry',
    'CountryVisitInfo', 'NewsletterSubscription', 'VisaApplication',
    'FlightBooking', 'FlightPassenger', 'EmailLog',
]
