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

class StatsResponse(BaseModel):
    destinations: int  # countries
    holiday_types: int
    packages: int
    group_trips: int
    activities: int
    hotels: int
    attractions: int
    recent_activity: List[RecentActivityItem]

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

    return StatsResponse(
        destinations=destinations_count,
        holiday_types=holiday_types_count,
        packages=packages_count,
        group_trips=group_trips_count,
        activities=activities_count,
        hotels=hotels_count,
        attractions=attractions_count,
        recent_activity=recent_activity
    )