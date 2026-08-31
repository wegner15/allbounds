from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from datetime import datetime

from app.models.package_price_chart import PackagePriceChart, PackagePriceChartHotel
from app.models.hotel import Hotel
from app.schemas.package_price_chart import (
    PackagePriceChartCreate,
    PackagePriceChartUpdate,
    PriceChartHotelOptionCreate,
    PriceChartHotelOptionUpdate
)


class PackagePriceChartService:
    def _get_cloudflare_image_url(self, image_id: str, variant: str = "public") -> Optional[str]:
        if not image_id:
            return None
        from app.core.config import settings
        account_hash = getattr(settings, 'CLOUDFLARE_ACCOUNT_HASH', '62bELV54wDYF4c-Pv5uhYg')
        return f"https://imagedelivery.net/{account_hash}/{image_id}/{variant}"

    def _populate_hotel_images(self, price_charts: List[PackagePriceChart]):
        for chart in price_charts:
            if hasattr(chart, 'hotel_options') and chart.hotel_options:
                for opt in chart.hotel_options:
                    if opt.hotel:
                        if opt.hotel.image_id and not getattr(opt.hotel, 'image_url', None):
                            setattr(opt.hotel, 'image_url', self._get_cloudflare_image_url(opt.hotel.image_id))
                        elif not getattr(opt.hotel, 'image_url', None) and opt.hotel.cover_image:
                            setattr(opt.hotel, 'image_url', opt.hotel.cover_image)

    def get_price_charts_by_package(self, db: Session, package_id: int, skip: int = 0, limit: int = 100) -> List[PackagePriceChart]:
        """Get all price charts for a specific package with hotel options."""
        charts = db.query(PackagePriceChart).options(
            joinedload(PackagePriceChart.hotel_options).joinedload(PackagePriceChartHotel.hotel)
        ).filter(
            PackagePriceChart.package_id == package_id
        ).order_by(PackagePriceChart.start_date).offset(skip).limit(limit).all()
        self._populate_hotel_images(charts)
        return charts
    
    def get_active_price_charts_by_package(self, db: Session, package_id: int) -> List[PackagePriceChart]:
        """Get active price charts for a specific package with hotel options."""
        charts = db.query(PackagePriceChart).options(
            joinedload(PackagePriceChart.hotel_options).joinedload(PackagePriceChartHotel.hotel)
        ).filter(
            and_(
                PackagePriceChart.package_id == package_id,
                PackagePriceChart.is_active == True
            )
        ).order_by(PackagePriceChart.start_date).all()
        self._populate_hotel_images(charts)
        return charts
    
    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[PackagePriceChart]:
        """Get a specific price chart by ID with hotel options."""
        chart = db.query(PackagePriceChart).options(
            joinedload(PackagePriceChart.hotel_options).joinedload(PackagePriceChartHotel.hotel)
        ).filter(PackagePriceChart.id == price_chart_id).first()
        if chart:
            self._populate_hotel_images([chart])
        return chart
    
    def get_price_for_date(self, db: Session, package_id: int, date: datetime) -> Optional[float]:
        """Get the price for a specific date."""
        price_chart = db.query(PackagePriceChart).filter(
            and_(
                PackagePriceChart.package_id == package_id,
                PackagePriceChart.start_date <= date,
                PackagePriceChart.end_date >= date,
                PackagePriceChart.is_active == True
            )
        ).first()
        
        if price_chart:
            return price_chart.price
        return None
    
    def create_price_chart(self, db: Session, price_chart_data: PackagePriceChartCreate) -> PackagePriceChart:
        """Create a new price chart with optional hotel options."""
        data = price_chart_data.model_dump(exclude={"hotel_options"})
        if data.get("booking_price") is None:
            data["booking_price"] = data.get("price")
        db_price_chart = PackagePriceChart(**data)
        db.add(db_price_chart)
        db.flush()

        # Handle hotel options if provided
        if price_chart_data.hotel_options:
            for idx, opt in enumerate(price_chart_data.hotel_options):
                hotel_opt = PackagePriceChartHotel(
                    price_chart_id=db_price_chart.id,
                    hotel_id=opt.hotel_id,
                    price_supplement=opt.price_supplement,
                    room_type=opt.room_type,
                    is_default=opt.is_default,
                    is_active=opt.is_active,
                    order_index=opt.order_index if opt.order_index is not None else idx
                )
                db.add(hotel_opt)

        db.commit()
        db.refresh(db_price_chart)
        return self.get_price_chart_by_id(db, db_price_chart.id) or db_price_chart
    
    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: PackagePriceChartUpdate) -> Optional[PackagePriceChart]:
        """Update an existing price chart and optionally replace hotel options."""
        db_price_chart = db.query(PackagePriceChart).filter(PackagePriceChart.id == price_chart_id).first()
        if not db_price_chart:
            return None
        
        update_data = price_chart_data.model_dump(exclude_unset=True, exclude={"hotel_options"})
        for key, value in update_data.items():
            setattr(db_price_chart, key, value)
        
        if db_price_chart.booking_price is None:
            db_price_chart.booking_price = db_price_chart.price

        # Update hotel options if explicitly passed
        if price_chart_data.hotel_options is not None:
            # Remove existing options and replace with new ones
            db.query(PackagePriceChartHotel).filter(PackagePriceChartHotel.price_chart_id == price_chart_id).delete()
            for idx, opt in enumerate(price_chart_data.hotel_options):
                hotel_opt = PackagePriceChartHotel(
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
        return self.get_price_chart_by_id(db, price_chart_id)
    
    def delete_price_chart(self, db: Session, price_chart_id: int) -> bool:
        """Delete a price chart."""
        db_price_chart = db.query(PackagePriceChart).filter(PackagePriceChart.id == price_chart_id).first()
        if not db_price_chart:
            return False
        
        db.delete(db_price_chart)
        db.commit()
        return True


package_price_chart_service = PackagePriceChartService()
