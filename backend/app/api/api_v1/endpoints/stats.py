from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.group_trip import GroupTrip
from app.models.activity import Activity
from app.models.hotel import Hotel
from app.models.attraction import Attraction
from pydantic import BaseModel

router = APIRouter()

class StatsResponse(BaseModel):
    group_trips: int
    activities: int
    hotels: int
    attractions: int

@router.get("/", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """
    Get basic statistics for the platform.
    """
    group_trips_count = db.query(func.count(GroupTrip.id)).scalar()
    activities_count = db.query(func.count(Activity.id)).scalar()
    hotels_count = db.query(func.count(Hotel.id)).scalar()
    attractions_count = db.query(func.count(Attraction.id)).scalar()

    return StatsResponse(
        group_trips=group_trips_count,
        activities=activities_count,
        hotels=hotels_count,
        attractions=attractions_count
    )