from sqlalchemy.orm import Session
from app.models.newsletter import NewsletterSubscription
from typing import List
from app.schemas.newsletter import NewsletterSubscriptionCreate

class NewsletterSubscriptionService:
    def get_all(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[NewsletterSubscription]:
        return db.query(NewsletterSubscription).offset(skip).limit(limit).all()

    def get_by_email(self, db: Session, *, email: str) -> NewsletterSubscription | None:
        return db.query(NewsletterSubscription).filter(NewsletterSubscription.email == email).first()

    def create(self, db: Session, *, obj_in: NewsletterSubscriptionCreate) -> NewsletterSubscription:
        db_obj = self.get_by_email(db, email=obj_in.email)
        if db_obj:
            if not db_obj.is_active:
                db_obj.is_active = True
                db.add(db_obj)
                db.commit()
                db.refresh(db_obj)
            return db_obj

        db_obj = NewsletterSubscription(
            email=obj_in.email,
            source=obj_in.source
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

newsletter_subscription_service = NewsletterSubscriptionService()
