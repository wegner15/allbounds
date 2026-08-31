from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.hotel_price_chart import HotelPriceChart, HotelPriceChartNightRate
from app.schemas.hotel_price_chart import HotelPriceChartCreate, HotelPriceChartUpdate


class HotelPriceChartService:
    def get_price_charts_by_hotel(self, db: Session, hotel_id: int) -> List[HotelPriceChart]:
        """Get all price charts for a hotel including variable night duration rates."""
        return db.query(HotelPriceChart).options(
            joinedload(HotelPriceChart.night_rates)
        ).filter(
            HotelPriceChart.hotel_id == hotel_id
        ).order_by(HotelPriceChart.start_date).all()

    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[HotelPriceChart]:
        """Get specific hotel price chart by ID with night duration rates."""
        return db.query(HotelPriceChart).options(
            joinedload(HotelPriceChart.night_rates)
        ).filter(HotelPriceChart.id == price_chart_id).first()

    def create_price_chart(self, db: Session, price_chart_data: HotelPriceChartCreate) -> HotelPriceChart:
        """Create seasonal price chart with night duration rate tiers."""
        data = price_chart_data.model_dump(exclude={"night_rates"})
        if data.get("booking_price") is None:
            data["booking_price"] = data.get("price")
        
        db_chart = HotelPriceChart(**data)
        db.add(db_chart)
        db.flush()

        if price_chart_data.night_rates:
            for idx, rate in enumerate(price_chart_data.night_rates):
                rate_dict = rate.model_dump(exclude_unset=True)
                if rate_dict.get("price_per_night") is None and rate_dict.get("price") and rate_dict.get("nights"):
                    rate_dict["price_per_night"] = round(rate_dict["price"] / rate_dict["nights"], 2)
                night_rate = HotelPriceChartNightRate(
                    price_chart_id=db_chart.id,
                    order_index=rate_dict.get("order_index", idx),
                    **rate_dict
                )
                db.add(night_rate)

        db.commit()
        db.expire_all()
        return self.get_price_chart_by_id(db, db_chart.id) or db_chart

    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: HotelPriceChartUpdate) -> Optional[HotelPriceChart]:
        """Update seasonal price chart and replace night rates if provided."""
        db_chart = db.query(HotelPriceChart).filter(HotelPriceChart.id == price_chart_id).first()
        if not db_chart:
            return None

        update_data = price_chart_data.model_dump(exclude_unset=True, exclude={"night_rates"})
        for k, v in update_data.items():
            setattr(db_chart, k, v)
        
        if db_chart.booking_price is None:
            db_chart.booking_price = db_chart.price

        if price_chart_data.night_rates is not None:
            db.query(HotelPriceChartNightRate).filter(
                HotelPriceChartNightRate.price_chart_id == price_chart_id
            ).delete(synchronize_session=False)

            for idx, rate in enumerate(price_chart_data.night_rates):
                rate_dict = rate.model_dump(exclude_unset=True)
                if rate_dict.get("price_per_night") is None and rate_dict.get("price") and rate_dict.get("nights"):
                    rate_dict["price_per_night"] = round(rate_dict["price"] / rate_dict["nights"], 2)
                night_rate = HotelPriceChartNightRate(
                    price_chart_id=price_chart_id,
                    order_index=rate_dict.get("order_index", idx),
                    **rate_dict
                )
                db.add(night_rate)

        db.commit()
        db.expire_all()
        return self.get_price_chart_by_id(db, price_chart_id)

    def delete_price_chart(self, db: Session, price_chart_id: int) -> bool:
        """Delete hotel price chart."""
        db_chart = self.get_price_chart_by_id(db, price_chart_id)
        if not db_chart:
            return False
        db.delete(db_chart)
        db.commit()
        return True


hotel_price_chart_service = HotelPriceChartService()
