from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.group_trip import GroupTrip
from app.models.activity import Activity
from app.models.hotel import Hotel
from app.models.attraction import Attraction
from app.models.country import Country
from app.models.holiday_type import HolidayType
from app.models.package import Package
from app.models.booking import Booking
from app.models.inquiry import Inquiry
from app.models.audit import AuditLog
from app.models.user import User
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class RecentActivityItem(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: int
    user_name: str
    created_at: datetime

class RecentBookingItem(BaseModel):
    id: int
    booking_type: str
    contact_name: str
    contact_email: str
    status: str
    created_at: datetime

class StatsResponse(BaseModel):
    destinations: int  # countries
    holiday_types: int
    packages: int
    group_trips: int
    activities: int
    hotels: int
    attractions: int
    package_bookings: int
    group_trip_bookings: int
    inquiries: int
    recent_activity: List[RecentActivityItem]
    recent_bookings: List[RecentBookingItem]

@router.get("/", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Get basic statistics for the platform.
    """
    destinations_count = db.query(func.count(Country.id)).scalar()
    holiday_types_count = db.query(func.count(HolidayType.id)).scalar()
    packages_count = db.query(func.count(Package.id)).scalar()
    group_trips_count = db.query(func.count(GroupTrip.id)).scalar()
    activities_count = db.query(func.count(Activity.id)).scalar()
    hotels_count = db.query(func.count(Hotel.id)).scalar()
    attractions_count = db.query(func.count(Attraction.id)).scalar()

    # Booking statistics
    package_bookings_count = db.query(func.count(Booking.id)).filter(Booking.booking_type == 'package').scalar()
    group_trip_bookings_count = db.query(func.count(Booking.id)).filter(Booking.booking_type == 'group_trip').scalar()
    inquiries_count = db.query(func.count(Inquiry.id)).scalar()

    # Get recent activity from audit logs
    recent_activity_query = db.query(
        AuditLog.id,
        AuditLog.action,
        AuditLog.entity_type,
        AuditLog.entity_id,
        User.first_name,
        User.last_name,
        AuditLog.created_at
    ).join(User, AuditLog.user_id == User.id)\
     .order_by(AuditLog.created_at.desc())\
     .limit(10)\
     .all()

    recent_activity = [
        RecentActivityItem(
            id=row.id,
            action=row.action,
            entity_type=row.entity_type,
            entity_id=row.entity_id,
            user_name=f"{row.first_name} {row.last_name}",
            created_at=row.created_at
        )
        for row in recent_activity_query
    ]

    # Get recent bookings
    recent_bookings_query = db.query(
        Booking.id,
        Booking.booking_type,
        Booking.contact_name,
        Booking.contact_email,
        Booking.status,
        Booking.created_at
    ).order_by(Booking.created_at.desc())\
     .limit(10)\
     .all()

    recent_bookings = [
        RecentBookingItem(
            id=row.id,
            booking_type=row.booking_type,
            contact_name=row.contact_name,
            contact_email=row.contact_email,
            status=row.status,
            created_at=row.created_at
        )
        for row in recent_bookings_query
    ]

    return StatsResponse(
        destinations=destinations_count,
        holiday_types=holiday_types_count,
        packages=packages_count,
        group_trips=group_trips_count,
        activities=activities_count,
        hotels=hotels_count,
        attractions=attractions_count,
        package_bookings=package_bookings_count,
        group_trip_bookings=group_trip_bookings_count,
        inquiries=inquiries_count,
        recent_activity=recent_activity,
        recent_bookings=recent_bookings
    )