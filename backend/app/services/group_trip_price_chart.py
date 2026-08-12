from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.group_trip_price_chart import GroupTripPriceChart
from app.schemas.group_trip_price_chart import GroupTripPriceChartCreate, GroupTripPriceChartUpdate

class GroupTripPriceChartService:
    def get_price_charts_by_group_trip(self, db: Session, group_trip_id: int) -> List[GroupTripPriceChart]:
        return db.query(GroupTripPriceChart).filter(
            GroupTripPriceChart.group_trip_id == group_trip_id
        ).order_by(GroupTripPriceChart.start_date).all()

    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[GroupTripPriceChart]:
        return db.query(GroupTripPriceChart).filter(GroupTripPriceChart.id == price_chart_id).first()

    def create_price_chart(self, db: Session, price_chart_data: GroupTripPriceChartCreate) -> GroupTripPriceChart:
        data = price_chart_data.model_dump()
        if data.get("booking_price") is None:
            data["booking_price"] = data.get("price")
        db_chart = GroupTripPriceChart(**data)
        db.add(db_chart)
        db.commit()
        db.refresh(db_chart)
        return db_chart

    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: GroupTripPriceChartUpdate) -> Optional[GroupTripPriceChart]:
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

group_trip_price_chart_service = GroupTripPriceChartService()
