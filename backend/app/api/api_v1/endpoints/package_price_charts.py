from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services.package_price_chart import package_price_chart_service
from app.schemas.package_price_chart import (
    PackagePriceChartCreate,
    PackagePriceChartUpdate,
    PackagePriceChartResponse
)
from app.core.redis_cache import cache_endpoint, invalidate_cache_pattern

router = APIRouter()

@router.get("/packages/{package_id}/price-charts", response_model=List[PackagePriceChartResponse])
@cache_endpoint(ttl=300)
def get_package_price_charts(
    package_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """
    Get all price charts for a specific package.
    """
    price_charts = package_price_chart_service.get_price_charts_by_package(db, package_id, skip, limit)
    return price_charts

@router.get("/packages/{package_id}/price-charts/active", response_model=List[PackagePriceChartResponse])
@cache_endpoint(ttl=300)
def get_active_package_price_charts(
    package_id: int,
    db: Session = Depends(get_db)
):
    """
    Get active price charts for a specific package.
    """
    price_charts = package_price_chart_service.get_active_price_charts_by_package(db, package_id)
    return price_charts

@router.get("/price-charts/{price_chart_id}", response_model=PackagePriceChartResponse)
@cache_endpoint(ttl=300)
def get_price_chart(
    price_chart_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific price chart by ID.
    """
    price_chart = package_price_chart_service.get_price_chart_by_id(db, price_chart_id)
    if not price_chart:
        raise HTTPException(status_code=404, detail="Price chart not found")
    return price_chart

@router.post("/price-charts", response_model=PackagePriceChartResponse, status_code=status.HTTP_201_CREATED)
def create_price_chart(
    price_chart_data: PackagePriceChartCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new price chart.
    """
    result = package_price_chart_service.create_price_chart(db, price_chart_data)
    invalidate_cache_pattern(f"*price-charts*")
    return result

@router.put("/price-charts/{price_chart_id}", response_model=PackagePriceChartResponse)
def update_price_chart(
    price_chart_id: int,
    price_chart_data: PackagePriceChartUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing price chart.
    """
    updated_price_chart = package_price_chart_service.update_price_chart(db, price_chart_id, price_chart_data)
    if not updated_price_chart:
        raise HTTPException(status_code=404, detail="Price chart not found")
    invalidate_cache_pattern(f"*price-charts*")
    return updated_price_chart

@router.delete("/price-charts/{price_chart_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_price_chart(
    price_chart_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a price chart.
    """
    deleted = package_price_chart_service.delete_price_chart(db, price_chart_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Price chart not found")
    invalidate_cache_pattern(f"*price-charts*")
    return None
