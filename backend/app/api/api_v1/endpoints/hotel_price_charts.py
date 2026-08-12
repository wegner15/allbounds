from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.hotel_price_chart import hotel_price_chart_service
from app.schemas.hotel_price_chart import (
    HotelPriceChartCreate,
    HotelPriceChartUpdate,
    HotelPriceChartResponse
)

router = APIRouter()

@router.get("/hotels/{hotel_id}/price-charts", response_model=List[HotelPriceChartResponse])
def get_hotel_price_charts(hotel_id: int, db: Session = Depends(get_db)):
    return hotel_price_chart_service.get_price_charts_by_hotel(db, hotel_id)

@router.post("/hotels/price-charts", response_model=HotelPriceChartResponse, status_code=status.HTTP_201_CREATED)
def create_hotel_price_chart(price_chart_data: HotelPriceChartCreate, db: Session = Depends(get_db)):
    return hotel_price_chart_service.create_price_chart(db, price_chart_data)

@router.put("/hotels/price-charts/{price_chart_id}", response_model=HotelPriceChartResponse)
def update_hotel_price_chart(price_chart_id: int, price_chart_data: HotelPriceChartUpdate, db: Session = Depends(get_db)):
    updated = hotel_price_chart_service.update_price_chart(db, price_chart_id, price_chart_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Price chart not found")
    return updated

@router.delete("/hotels/price-charts/{price_chart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel_price_chart(price_chart_id: int, db: Session = Depends(get_db)):
    deleted = hotel_price_chart_service.delete_price_chart(db, price_chart_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Price chart not found")
    return None
