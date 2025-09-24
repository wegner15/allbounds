from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from app.models.package_price_chart import PackagePriceChart
from app.schemas.package_price_chart import PackagePriceChartCreate, PackagePriceChartUpdate, PackagePriceChartBulkCreate

class PackagePriceChartService:
    def get_price_charts_by_package(self, db: Session, package_id: int, skip: int = 0, limit: int = 100) -> List[PackagePriceChart]:
        """Get all price charts for a specific package."""
        return db.query(PackagePriceChart).filter(
            PackagePriceChart.package_id == package_id
        ).order_by(PackagePriceChart.start_date).offset(skip).limit(limit).all()
    
    def get_active_price_charts_by_package(self, db: Session, package_id: int) -> List[PackagePriceChart]:
        """Get active price charts for a specific package."""
        return db.query(PackagePriceChart).filter(
            and_(
                PackagePriceChart.package_id == package_id,
                PackagePriceChart.is_active == True
            )
        ).order_by(PackagePriceChart.start_date).all()
    
    def get_price_chart_by_id(self, db: Session, price_chart_id: int) -> Optional[PackagePriceChart]:
        """Get a specific price chart by ID."""
        return db.query(PackagePriceChart).filter(PackagePriceChart.id == price_chart_id).first()
    
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
        """Create a new price chart."""
        db_price_chart = PackagePriceChart(**price_chart_data.model_dump())
        db.add(db_price_chart)
        db.commit()
        db.refresh(db_price_chart)
        return db_price_chart
    
    def update_price_chart(self, db: Session, price_chart_id: int, price_chart_data: PackagePriceChartUpdate) -> Optional[PackagePriceChart]:
        """Update an existing price chart."""
        db_price_chart = self.get_price_chart_by_id(db, price_chart_id)
        if not db_price_chart:
            return None
        
        update_data = price_chart_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_price_chart, key, value)
        
        db.commit()
        db.refresh(db_price_chart)
        return db_price_chart
    
    def delete_price_chart(self, db: Session, price_chart_id: int) -> bool:
        """Delete a price chart."""
        db_price_chart = self.get_price_chart_by_id(db, price_chart_id)
        if not db_price_chart:
            return False
        
        db.delete(db_price_chart)
        db.commit()
        return True

# Create an instance of the service
package_price_chart_service = PackagePriceChartService()
