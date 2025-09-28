from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.booking import Booking, BookingTraveler
from app.schemas.booking import BookingCreate, BookingUpdate, InquiryCreate, InquiryUpdate


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
        return db_booking

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
        return db_inquiry

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