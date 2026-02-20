from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.visa_application import VisaApplication, ApplicationStatus
from app.schemas.visa_application import VisaApplicationCreate, VisaApplicationUpdate
from app.services.email import email_service
from app.core.config import settings

class VisaApplicationService:
    def get_applications(
        self, db: Session, skip: int = 0, limit: int = 100, status: Optional[ApplicationStatus] = None
    ) -> List[VisaApplication]:
        query = db.query(VisaApplication)
        if status:
            query = query.filter(VisaApplication.status == status)
        return query.order_by(VisaApplication.created_at.desc()).offset(skip).limit(limit).all()

    def get_application(self, db: Session, application_id: int) -> Optional[VisaApplication]:
        return db.query(VisaApplication).filter(VisaApplication.id == application_id).first()

    def create_application(self, db: Session, application_in: VisaApplicationCreate) -> VisaApplication:
        # Create VisaApplication instance
        db_application = VisaApplication(**application_in.model_dump())
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        
        # Send email notification to admins
        try:
            self._send_admin_notification(db_application)
            self._send_customer_confirmation(db_application)
        except Exception as e:
            # We don't want to fail the creation if emails fail, just log it
            print(f"Failed to send visa application emails: {e}")
            
        return db_application

    def update_application(
        self, db: Session, application_id: int, application_in: VisaApplicationUpdate
    ) -> Optional[VisaApplication]:
        db_application = self.get_application(db, application_id)
        if not db_application:
            return None

        update_data = application_in.model_dump(exclude_unset=True)
        
        # Check if status is changing to approved/rejected to notify user
        old_status = db_application.status
        
        for field, value in update_data.items():
            setattr(db_application, field, value)

        db.commit()
        db.refresh(db_application)
        
        # Notify user of status change if applicable
        if 'status' in update_data and old_status != db_application.status:
            try:
                self._send_status_update(db_application)
            except Exception as e:
                print(f"Failed to send status update email: {e}")

        return db_application

    def _send_admin_notification(self, application: VisaApplication):
        subject = f"New Visa Application - {application.destination_country} ({application.visa_type.value.capitalize()})"
        content_html = f"""
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Applicant:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.full_name}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Destination:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.destination_country}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Nationality:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.nationality}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Travel Dates:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.travel_from_date} to {application.travel_to_date}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{application.phone}</td></tr>
        </table>
        """
        
        final_html = email_service.generate_html_email(
            title="New Visa Application Received",
            content_html=content_html,
            call_to_action={"url": f"https://allboundtravel.com/admin/bookings/visa-applications", "text": "View in Dashboard"}
        )

        email_service.send_email(
            to_email=settings.ADMIN_EMAIL,
            subject=subject,
            html_content=final_html
        )
        
    def _send_customer_confirmation(self, application: VisaApplication):
        subject = f"Your Visa Application to {application.destination_country} has been received"
        content_html = f"""
        <p style="font-size: 16px;">Dear {application.full_name},</p>
        <p>Thank you for submitting your visa application for <strong>{application.destination_country}</strong> with Allbound Vacations.</p>
        <p>Our visa experts are reviewing your details and will contact you shortly regarding the next steps.</p>
        """
        
        final_html = email_service.generate_html_email(
            title="Visa Application Received",
            content_html=content_html
        )
        
        email_service.send_email(
            to_email=application.email,
            subject=subject,
            html_content=final_html
        )

    def _send_status_update(self, application: VisaApplication):
        subject = f"Update on your Visa Application to {application.destination_country}"
        content_html = f"""
        <p style="font-size: 16px;">Dear {application.full_name},</p>
        <p>The status of your visa application for {application.destination_country} has been updated to: <strong style="color: #008080;">{application.status.value.upper()}</strong></p>
        """
        if application.admin_notes:
            content_html += f"""
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #008080; margin-top: 20px;">
                <h3 style="margin-top: 0;font-size: 14px;color: #4b5563;">Message from our team:</h3>
                <p style="white-space: pre-wrap; margin-bottom: 0;">{application.admin_notes}</p>
            </div>
            """
            
        final_html = email_service.generate_html_email(
            title="Visa Application Status Update",
            content_html=content_html
        )
        
        email_service.send_email(
            to_email=application.email,
            subject=subject,
            html_content=final_html
        )

visa_application_service = VisaApplicationService()
