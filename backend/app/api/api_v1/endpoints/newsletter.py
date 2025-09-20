from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.newsletter import NewsletterSubscription, NewsletterSubscriptionCreate
from app.services.newsletter import newsletter_subscription_service
from app.db.database import get_db
from app.auth.dependencies import get_current_active_superuser
from app import models

router = APIRouter()

@router.post("/subscribe", response_model=NewsletterSubscription)
def subscribe_to_newsletter(
    *, 
    db: Session = Depends(get_db),
    subscription_in: NewsletterSubscriptionCreate
):
    """
    Create a new newsletter subscription.
    """
    subscription = newsletter_subscription_service.get_by_email(db, email=subscription_in.email)
    if subscription and subscription.is_active:
        raise HTTPException(
            status_code=400,
            detail="This email is already subscribed to our newsletter.",
        )
    
    new_subscription = newsletter_subscription_service.create(db, obj_in=subscription_in)
    return new_subscription


@router.get("/", response_model=List[NewsletterSubscription])
def get_all_subscriptions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(get_current_active_superuser),
):
    """
    Retrieve all newsletter subscriptions (admin only).
    """
    subscriptions = newsletter_subscription_service.get_all(db, skip=skip, limit=limit)
    return subscriptions
