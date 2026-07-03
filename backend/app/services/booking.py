from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.booking import Booking, BookingTraveler
from app.schemas.booking import BookingCreate, BookingUpdate, InquiryCreate, InquiryUpdate
from app.services.email import email_service
from app.core.config import settings


class BookingService:
    def get_bookings(self, db: Session, skip: int = 0, limit: int = 100) -> List[Booking]:
        """Retrieve all bookings with pagination."""
        return db.query(Booking).offset(skip).limit(limit).all()

    def get_booking(self, db: Session, booking_id: int) -> Optional[Booking]:
        """Retrieve a specific booking by ID."""
        return db.query(Booking).filter(Booking.id == booking_id).first()

    def get_bookings_by_type(self, db: Session, booking_type: str, skip: int = 0, limit: int = 100) -> List[Booking]:
        """Retrieve bookings by type (package or group_trip)."""
        return db.query(Booking).filter(Booking.booking_type == booking_type).offset(skip).limit(limit).all()

    def get_bookings_by_entity(self, db: Session, booking_type: str, entity_id: int) -> List[Booking]:
        """Retrieve bookings for a specific package or group trip."""
        return db.query(Booking).filter(
            and_(Booking.booking_type == booking_type, Booking.entity_id == entity_id)
        ).all()

    def create_booking(self, db: Session, booking: BookingCreate) -> Booking:
        """Create a new booking."""
        # Resolve partner code if provided
        partner_id = None
        partner_code = None
        if booking.partner_code:
            from app.services.partner import partner_service
            partner = partner_service.get_partner_by_code(db, booking.partner_code)
            if partner:
                partner_id = partner.id
                partner_code = partner.partner_code

        # Create the booking
        db_booking = Booking(
            booking_type=booking.booking_type,
            entity_id=booking.entity_id,
            entity_slug=booking.entity_slug,
            contact_name=booking.contact_name,
            contact_email=booking.contact_email,
            contact_phone=booking.contact_phone,
            country_of_origin=booking.country_of_origin,
            number_of_adults=booking.number_of_adults,
            number_of_children=booking.number_of_children,
            special_requests=booking.special_requests,
            source=booking.source,
            partner_id=partner_id,
            partner_code=partner_code,
        )
        db.add(db_booking)
        db.flush()  # Get the booking ID

        # Create travelers
        for traveler in booking.travelers:
            db_traveler = BookingTraveler(
                booking_id=db_booking.id,
                traveler_type=traveler.traveler_type,
                full_name=traveler.full_name,
                age=traveler.age,
            )
            db.add(db_traveler)

        db.commit()
        db.refresh(db_booking)
        
        # Send email notification to admin and confirmation to customer
        try:
            self._send_admin_notification(db_booking)
            self._send_customer_confirmation(db_booking)
        except Exception as e:
            print(f"Failed to send booking notification emails: {e}")
            
        return db_booking

    def _send_admin_notification(self, booking: Booking):
        booking_type_display = booking.booking_type.replace('_', ' ').title()
        subject = f"New {booking_type_display} Request - {booking.contact_name}"
        
        # Check for partner referral info
        partner_info_row = ""
        if booking.partner:
            partner_info_row = f"""
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Referral Partner:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.partner.name} (Code: {booking.partner_code})</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Referral Benefits:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">Discount: {booking.partner.discount_percent}%, Commission: {booking.partner.commission_percent}%</td></tr>
            """

        content_html = f"""
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Type:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking_type_display}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Item:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.entity_slug}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Client Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_name}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_phone}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 10px solid #eee;"><strong>Country:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.country_of_origin}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Passengers:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.number_of_adults} Adults, {booking.number_of_children} Children</td></tr>
            {partner_info_row}
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Special Requests:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.special_requests or 'None'}</td></tr>
        </table>
        """
        
        final_html = email_service.generate_html_email(
            title="New Booking Request",
            content_html=content_html,
            call_to_action={"url": f"https://allboundtravel.com/admin/bookings/{booking.booking_type}s", "text": "View in Dashboard"}
        )
        
        email_service.send_email(
            to_email=settings.ADMIN_EMAIL,
            subject=subject,
            html_content=final_html
        )

    def _send_customer_confirmation(self, booking: Booking):
        booking_type_display = booking.booking_type.replace('_', ' ').title()
        subject = f"Your {booking_type_display} Request - Allbound Vacations"
        
        content_html = f"""
        <p style="font-size: 16px;">Dear {booking.contact_name},</p>
        <p>Thank you for your interest in our <strong>{booking_type_display}</strong>: {booking.entity_slug.replace('-', ' ').title()}.</p>
        <p>We have received your request and our travel experts are reviewing the details. We will contact you shortly to finalize your booking and provide next steps.</p>
        <p>If you have any immediate questions, feel free to reply to this email or call us at {settings.CONTACT_PHONE}.</p>
        """
        
        final_html = email_service.generate_html_email(
            title="Booking Request Received",
            content_html=content_html
        )
        
        email_service.send_email(
            to_email=booking.contact_email,
            subject=subject,
            html_content=final_html
        )

    def update_booking(self, db: Session, booking_id: int, booking_update: BookingUpdate) -> Optional[Booking]:
        """Update a booking."""
        db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not db_booking:
            return None

        update_data = booking_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_booking, field, value)

        db.commit()
        db.refresh(db_booking)
        return db_booking

    def delete_booking(self, db: Session, booking_id: int) -> bool:
        """Delete a booking."""
        db_booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not db_booking:
            return False

        db.delete(db_booking)
        db.commit()
        return True


# Import inquiry model here to avoid circular imports
from app.models.inquiry import Inquiry


class InquiryService:
    def get_inquiries(self, db: Session, skip: int = 0, limit: int = 100) -> List[Inquiry]:
        """Retrieve all inquiries with pagination."""
        return db.query(Inquiry).offset(skip).limit(limit).all()

    def get_inquiry(self, db: Session, inquiry_id: int) -> Optional[Inquiry]:
        """Retrieve a specific inquiry by ID."""
        return db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()

    def get_unread_inquiries(self, db: Session) -> List[Inquiry]:
        """Retrieve all unread inquiries."""
        return db.query(Inquiry).filter(Inquiry.is_read == False).all()

    def create_inquiry(self, db: Session, inquiry: InquiryCreate) -> Inquiry:
        """Create a new inquiry."""
        db_inquiry = Inquiry(
            name=inquiry.name,
            email=inquiry.email,
            phone=inquiry.phone,
            country_of_origin=inquiry.country_of_origin,
            subject=inquiry.subject,
            message=inquiry.message,
            source=inquiry.source,
        )
        db.add(db_inquiry)
        db.commit()
        db.refresh(db_inquiry)
        
        # Send email notification to admin and confirmation to customer
        try:
            self._send_admin_notification(db_inquiry)
            self._send_customer_confirmation(db_inquiry)
        except Exception as e:
            print(f"Failed to send inquiry notification emails: {e}")
            
        return db_inquiry

    def _send_admin_notification(self, inquiry: Inquiry):
        subject = f"New General Inquiry - {inquiry.subject}"
        content_html = f"""
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{inquiry.name}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{inquiry.email}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{inquiry.phone or 'Not provided'}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Country:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{inquiry.country_of_origin or 'Not provided'}</td></tr>
            <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{inquiry.subject}</td></tr>
        </table>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #008080; margin-top: 20px;">
            <h3 style="margin-top: 0;font-size: 14px;color: #4b5563;">Message:</h3>
            <p style="white-space: pre-wrap; margin-bottom: 0;">{inquiry.message}</p>
        </div>
        """
        
        final_html = email_service.generate_html_email(
            title="New Website Inquiry",
            content_html=content_html,
            call_to_action={"url": "https://allboundtravel.com/admin/bookings/inquiries", "text": "View Inquiry"}
        )
        
        email_service.send_email(
            to_email=settings.ADMIN_EMAIL,
            subject=subject,
            html_content=final_html
        )

    def _send_customer_confirmation(self, inquiry: Inquiry):
        subject = f"We have received your inquiry: {inquiry.subject}"
        
        content_html = f"""
        <p style="font-size: 16px;">Dear {inquiry.name},</p>
        <p>Thank you for contacting Allbound Vacations. We have received your inquiry regarding <strong>"{inquiry.subject}"</strong>.</p>
        <p>One of our travel consultants will review your message and get back to you as soon as possible (usually within 24 hours).</p>
        <p>In the meantime, feel free to explore our <a href="https://allboundvacations.com/safaris" style="color: #008080;">latest safari packages</a>.</p>
        """
        
        final_html = email_service.generate_html_email(
            title="Thank You for Contacting Us",
            content_html=content_html
        )
        
        email_service.send_email(
            to_email=inquiry.email,
            subject=subject,
            html_content=final_html
        )

    def update_inquiry(self, db: Session, inquiry_id: int, inquiry_update: InquiryUpdate) -> Optional[Inquiry]:
        """Update an inquiry."""
        db_inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
        if not db_inquiry:
            return None

        update_data = inquiry_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_inquiry, field, value)

        db.commit()
        db.refresh(db_inquiry)
        return db_inquiry

    def mark_as_read(self, db: Session, inquiry_id: int) -> Optional[Inquiry]:
        """Mark an inquiry as read."""
        return self.update_inquiry(db, inquiry_id, InquiryUpdate(is_read=True))

    def delete_inquiry(self, db: Session, inquiry_id: int) -> bool:
        """Delete an inquiry."""
        db_inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
        if not db_inquiry:
            return False

        db.delete(db_inquiry)
        db.commit()
        return True


# Create service instances
booking_service = BookingService()
inquiry_service = InquiryService()