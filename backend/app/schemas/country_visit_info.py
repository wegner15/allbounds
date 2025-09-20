from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime

class VisitRating(str, Enum):
    excellent = "excellent"
    good = "good"
    fair = "fair"
    poor = "poor"
    discouraged = "discouraged"

class MonthlyVisitRatingBase(BaseModel):
    month: str = Field(..., description="Month name (e.g., January, February)")
    rating: VisitRating = Field(..., description="Rating for this month")
    notes: Optional[str] = Field(None, description="Optional notes for this month")

class MonthlyVisitRating(MonthlyVisitRatingBase):
    pass

class CountryVisitInfoBase(BaseModel):
    country_id: int = Field(..., description="ID of the country")
    monthly_ratings: List[MonthlyVisitRating] = Field(..., description="Monthly visit ratings")
    general_notes: Optional[str] = Field(None, description="General notes about visiting this country")

class CountryVisitInfoCreate(CountryVisitInfoBase):
    pass

class CountryVisitInfoUpdate(BaseModel):
    monthly_ratings: Optional[List[MonthlyVisitRating]] = Field(None, description="Monthly visit ratings")
    general_notes: Optional[str] = Field(None, description="General notes about visiting this country")

class CountryVisitInfo(CountryVisitInfoBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
