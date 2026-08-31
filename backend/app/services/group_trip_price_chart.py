from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.group_trip_price_chart import GroupTripPriceChart, GroupTripPriceChartHotel
from app.models.hotel import Hotel
from app.schemas.group_trip_price_chart import (
    GroupTripPriceChartCreate,
    GroupTripPriceChartUpdate,
    PriceChartHotelOptionCreate,
    PriceChartHotelOptionUpdate
)


class GroupTripPriceChartService:
    def _get_cloudflare_image_url(self, image_id: str, variant: str = "public") -> Optional[str]:
        if not image_id:
            return None
        from app.core.config import settings
        account_hash = getattr(settings, 'CLOUDFLARE_ACCOUNT_HASH', '62bELV54wDYF4c-Pv5uhYg')
        return f"https://imagedelivery.net/{account_hash}/{image_id}/{variant}"

    def _populate_hotel_images(self, price_charts: List[GroupTripPriceChart]):
        for chart in price_charts:
            if hasattr(chart, 'hotel_options') and chart.hotel_options:
                for opt in chart.hotel_options:
                    if opt.hotel:
                        image_id = getattr(opt.hotel, 'image_id', None)
                        cover_image = getattr(opt.hotel, 'cover_image', None)
                        if image_id and not getattr(opt.hotel, 'image_url', None):
                            setattr(opt.hotel, 'image_url', self._get_cloudflare_image_url(image_id))
                        elif cover_image and not getattr(opt.hotel, 'image_url', None):
                            setattr(opt.hotel, 'image_url', cover_image)

    def get_price_charts_by_group_trip(self, db: Session, group_trip_id: int) -> List[GroupTripPriceChart]:
        charts = db.query(GroupTripPriceChart).options(
            joinedload(GroupTripPriceChart.hotel_options).joinedload(GroupTripPriceChartHotel.hotel)
        ).filter(
            GroupTripPriceChart.group_trip_id == group_trip_id
        ).order_by(GroupTripPriceChart.start_date).all()
        self._populate_hotel_images(charts)
        return charts

    def get_active_price_charts_by_group_trip(self, db: Session, group_trip_id: int) -> List[GroupTripPriceChart]:
        charts = db.query(GroupTripPriceChart).options(
            joinedload(GroupTripPriceChart.hotel_options).joinedload(GroupTripPriceChartHotel.hotel)
        ).filter(
            and_(
                GroupTripPriceChart.group_trip_id == group_trip_id,
                GroupTripPriceChart.is_active == True
            )
        ).order_by(GroupTripPriceChart.start_date).all()
        self._populate_hotel_images(charts)
        return charts

    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[GroupTripPriceChart]:
        chart = db.query(GroupTripPriceChart).options(
            joinedload(GroupTripPriceChart.hotel_options).joinedload(GroupTripPriceChartHotel.hotel)
        ).filter(GroupTripPriceChart.id == price_chart_id).first()
        if chart:
            self._populate_hotel_images([chart])
        return chart

    def create_price_chart(self, db: Session, price_chart_data: GroupTripPriceChartCreate) -> GroupTripPriceChart:
        data = price_chart_data.model_dump(exclude={"hotel_options"})
        if data.get("booking_price") is None:
            data["booking_price"] = data.get("price")
        db_chart = GroupTripPriceChart(**data)
        db.add(db_chart)
        db.flush()

        if price_chart_data.hotel_options:
            for idx, opt in enumerate(price_chart_data.hotel_options):
                hotel_opt = GroupTripPriceChartHotel(
                    price_chart_id=db_chart.id,
                    hotel_id=opt.hotel_id,
                    price_supplement=opt.price_supplement,
                    room_type=opt.room_type,
                    is_default=opt.is_default,
                    is_active=opt.is_active,
                    order_index=opt.order_index if opt.order_index is not None else idx
                )
                db.add(hotel_opt)

        db.commit()
        db.expire_all()
        return self.get_price_chart_by_id(db, db_chart.id) or db_chart

    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: GroupTripPriceChartUpdate) -> Optional[GroupTripPriceChart]:
        db_chart = db.query(GroupTripPriceChart).filter(GroupTripPriceChart.id == price_chart_id).first()
        if not db_chart:
            return None
        
        update_data = price_chart_data.model_dump(exclude_unset=True, exclude={"hotel_options"})
        for k, v in update_data.items():
            setattr(db_chart, k, v)
        
        if db_chart.booking_price is None:
            db_chart.booking_price = db_chart.price

        if price_chart_data.hotel_options is not None:
            db.query(GroupTripPriceChartHotel).filter(GroupTripPriceChartHotel.price_chart_id == price_chart_id).delete(synchronize_session=False)
            for idx, opt in enumerate(price_chart_data.hotel_options):
                hotel_opt = GroupTripPriceChartHotel(
                    price_chart_id=price_chart_id,
                    hotel_id=opt.hotel_id,
                    price_supplement=opt.price_supplement,
                    room_type=opt.room_type,
                    is_default=opt.is_default,
                    is_active=opt.is_active,
                    order_index=opt.order_index if opt.order_index is not None else idx
                )
                db.add(hotel_opt)

        db.commit()
        db.expire_all()
        return self.get_price_chart_by_id(db, price_chart_id)

    def delete_price_chart(self, db: Session, price_chart_id: int) -> bool:
        db_chart = db.query(GroupTripPriceChart).filter(GroupTripPriceChart.id == price_chart_id).first()
        if not db_chart:
            return False
        db.delete(db_chart)
        db.commit()
        return True


group_trip_price_chart_service = GroupTripPriceChartService()
