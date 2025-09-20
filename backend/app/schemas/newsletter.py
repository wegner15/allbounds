from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Base schema for newsletter subscription
class NewsletterSubscriptionBase(BaseModel):
    email: EmailStr
    source: Optional[str] = None

# Schema for creating a new subscription
class NewsletterSubscriptionCreate(NewsletterSubscriptionBase):
    pass

# Schema for reading a subscription (e.g., when returning from API)
class NewsletterSubscription(NewsletterSubscriptionBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
