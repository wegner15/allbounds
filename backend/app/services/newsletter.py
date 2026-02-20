from sqlalchemy.orm import Session
from app.models.newsletter import NewsletterSubscription
from typing import List
from app.schemas.newsletter import NewsletterSubscriptionCreate
from app.services.email import email_service
from app.core.config import settings

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

        # Notify admin of new subscription
        try:
            self._send_admin_notification(db_obj)
        except Exception as e:
            print(f"Failed to send newsletter notification email: {e}")

        return db_obj

    def _send_admin_notification(self, subscription: NewsletterSubscription):
        subject = f"New Newsletter Subscription - {subscription.email}"
        content_html = f"""
        <p>A new user has subscribed to the newsletter:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{subscription.email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Source:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{subscription.source or 'Direct'}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{subscription.created_at.strftime('%Y-%m-%d %H:%M:%S')}</td></tr>
        </table>
        """
        
        final_html = email_service.generate_html_email(
            title="New Newsletter Subscriber",
            content_html=content_html
        )
        
        email_service.send_email(
            to_email=settings.ADMIN_EMAIL,
            subject=subject,
            html_content=final_html
        )

newsletter_subscription_service = NewsletterSubscriptionService()
