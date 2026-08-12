from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.group_trip_price_chart import group_trip_price_chart_service
from app.schemas.group_trip_price_chart import (
    GroupTripPriceChartCreate,
    GroupTripPriceChartUpdate,
    GroupTripPriceChartResponse
)

router = APIRouter()

@router.get("/group-trips/{group_trip_id}/price-charts", response_model=List[GroupTripPriceChartResponse])
def get_group_trip_price_charts(group_trip_id: int, db: Session = Depends(get_db)):
    return group_trip_price_chart_service.get_price_charts_by_group_trip(db, group_trip_id)

@router.post("/group-trips/price-charts", response_model=GroupTripPriceChartResponse, status_code=status.HTTP_201_CREATED)
def create_group_trip_price_chart(price_chart_data: GroupTripPriceChartCreate, db: Session = Depends(get_db)):
    return group_trip_price_chart_service.create_price_chart(db, price_chart_data)

@router.put("/group-trips/price-charts/{price_chart_id}", response_model=GroupTripPriceChartResponse)
def update_group_trip_price_chart(price_chart_id: int, price_chart_data: GroupTripPriceChartUpdate, db: Session = Depends(get_db)):
    updated = group_trip_price_chart_service.update_price_chart(db, price_chart_id, price_chart_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Price chart not found")
    return updated

@router.delete("/group-trips/price-charts/{price_chart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group_trip_price_chart(price_chart_id: int, db: Session = Depends(get_db)):
    deleted = group_trip_price_chart_service.delete_price_chart(db, price_chart_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Price chart not found")
    return None
