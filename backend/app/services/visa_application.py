from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.visa_application import VisaApplication, ApplicationStatus
from app.schemas.visa_application import VisaApplicationCreate, VisaApplicationUpdate
from app.services.email import email_service

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
        html_content = f"""
        <h2>New Visa Application Received</h2>
        <p><strong>Applicant:</strong> {application.full_name}</p>
        <p><strong>Destination:</strong> {application.destination_country}</p>
        <p><strong>Nationality:</strong> {application.nationality}</p>
        <p><strong>Travel Dates:</strong> {application.travel_from_date} to {application.travel_to_date}</p>
        <p><strong>Email:</strong> {application.email}</p>
        <p><strong>Phone:</strong> {application.phone}</p>
        <p><a href="https://admin.allboundtravel.com/visas/{application.id}">View Full Application in Admin Panel</a></p>
        """
        # Sending to the default info email (update as needed)
        email_service.send_email(
            to_email="info@allboundtravel.com",
            subject=subject,
            html_content=html_content
        )
        
    def _send_customer_confirmation(self, application: VisaApplication):
        subject = f"Your Visa Application to {application.destination_country} has been received"
        html_content = f"""
        <h2>Visa Application Received</h2>
        <p>Dear {application.full_name},</p>
        <p>Thank you for submitting your visa application for {application.destination_country} with Allbound Vacations.</p>
        <p>Our visa experts are reviewing your details and will contact you shortly regarding the next steps.</p>
        <br>
        <p>Best regards,<br>The Allbound Vacations Team</p>
        """
        email_service.send_email(
            to_email=application.email,
            subject=subject,
            html_content=html_content
        )

    def _send_status_update(self, application: VisaApplication):
        subject = f"Update on your Visa Application to {application.destination_country}"
        html_content = f"""
        <h2>Visa Application Status Update</h2>
        <p>Dear {application.full_name},</p>
        <p>The status of your visa application for {application.destination_country} has been updated to: <strong>{application.status.value.upper()}</strong></p>
        """
        if application.admin_notes:
            html_content += f"<p><strong>Message from our team:</strong> {application.admin_notes}</p>"
            
        html_content += "<br><p>Best regards,<br>The Allbound Vacations Team</p>"
        
        email_service.send_email(
            to_email=application.email,
            subject=subject,
            html_content=html_content
        )

visa_application_service = VisaApplicationService()
