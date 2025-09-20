from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db

router = APIRouter()

@router.get("/", response_model=List)
def get_reviews(db: Session = Depends(get_db)):
    """
    Retrieve all reviews.
    """
    return []
