from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.hotel_price_chart import HotelPriceChart
from app.schemas.hotel_price_chart import HotelPriceChartCreate, HotelPriceChartUpdate

class HotelPriceChartService:
    def get_price_charts_by_hotel(self, db: Session, hotel_id: int) -> List[HotelPriceChart]:
        return db.query(HotelPriceChart).filter(
            HotelPriceChart.hotel_id == hotel_id
        ).order_by(HotelPriceChart.start_date).all()

    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[HotelPriceChart]:
        return db.query(HotelPriceChart).filter(HotelPriceChart.id == price_chart_id).first()

    def create_price_chart(self, db: Session, price_chart_data: HotelPriceChartCreate) -> HotelPriceChart:
        data = price_chart_data.model_dump()
        if data.get("booking_price") is None:
            data["booking_price"] = data.get("price")
        db_chart = HotelPriceChart(**data)
        db.add(db_chart)
        db.commit()
        db.refresh(db_chart)
        return db_chart

    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: HotelPriceChartUpdate) -> Optional[HotelPriceChart]:
        db_chart = self.get_price_chart_by_id(db, price_chart_id)
        if not db_chart:
            return None
        update_data = price_chart_data.model_dump(exclude_unset=True)
        for k, v in update_data.items():
            setattr(db_chart, k, v)
        if db_chart.booking_price is None:
            db_chart.booking_price = db_chart.price
        db.commit()
        db.refresh(db_chart)
        return db_chart

    def delete_price_chart(self, db: Session, price_chart_id: int) -> bool:
        db_chart = self.get_price_chart_by_id(db, price_chart_id)
        if not db_chart:
            return False
        db.delete(db_chart)
        db.commit()
        return True

hotel_price_chart_service = HotelPriceChartService()
