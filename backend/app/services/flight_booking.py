from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.flight_booking import FlightBooking, FlightPassenger
from app.schemas.flight_booking import FlightBookingCreate, FlightBookingUpdate
from app.services.email import email_service

class FlightBookingService:
    def get(self, db: Session, id: int) -> Optional[FlightBooking]:
        return db.query(FlightBooking).filter(FlightBooking.id == id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[FlightBooking]:
        return db.query(FlightBooking).order_by(FlightBooking.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: FlightBookingCreate) -> FlightBooking:
        # 1. Create the main booking record
        db_obj = FlightBooking(
            trip_type=obj_in.trip_type,
            departure_city=obj_in.departure_city,
            destination_city=obj_in.destination_city,
            departure_date=obj_in.departure_date,
            return_date=obj_in.return_date,
            preferred_departure_time=obj_in.preferred_departure_time,
            adults=obj_in.adults,
            children=obj_in.children,
            infants=obj_in.infants,
            purpose=obj_in.purpose,
            contact_name=obj_in.contact_name,
            contact_email=obj_in.contact_email,
            contact_phone=obj_in.contact_phone,
            preferred_contact_method=obj_in.preferred_contact_method,
            travel_budget_range=obj_in.travel_budget_range,
            is_flexible_dates=obj_in.is_flexible_dates,
            add_on_services=obj_in.add_on_services,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)

        # 2. Create nested passengers
        for passenger_in in obj_in.passengers:
            db_passenger = FlightPassenger(
                booking_id=db_obj.id,
                full_name=passenger_in.full_name,
                dob=passenger_in.dob,
                gender=passenger_in.gender,
                nationality=passenger_in.nationality,
                passport_number=passenger_in.passport_number,
                passport_expiry=passenger_in.passport_expiry,
                special_assistance=passenger_in.special_assistance,
                seat_preference=passenger_in.seat_preference,
                meal_preference=passenger_in.meal_preference,
                passenger_type=passenger_in.passenger_type,
            )
            db.add(db_passenger)
        
        db.commit()
        db.refresh(db_obj)

        # 3. Trigger notification emails
        self._send_notifications(db_obj)

        return db_obj

    def update(self, db: Session, *, db_obj: FlightBooking, obj_in: FlightBookingUpdate) -> FlightBooking:
        db_obj.status = obj_in.status
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, *, id: int) -> FlightBooking:
        db_obj = db.query(FlightBooking).filter(FlightBooking.id == id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

    def _send_notifications(self, booking: FlightBooking):
        try:
            # Notify Admins
            admin_subject = f"New Flight Request | {booking.trip_type.name} | {booking.contact_name}"
            admin_content_html = f"""
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee; width: 30%;"><strong>Contact Name:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_name}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_email}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.contact_phone}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Route:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.departure_city} to {booking.destination_city}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Dates:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.departure_date} to {booking.return_date or 'N/A'}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Purpose:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.purpose.value}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Passengers:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.adults} Adults, {booking.children} Ch, {booking.infants} Inf</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Services:</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">{booking.add_on_services}</td></tr>
            </table>
            """
            
            final_admin_html = email_service.generate_html_email(
                title="New Flight Request Received",
                content_html=admin_content_html,
                call_to_action={"url": "https://allboundtravel.com/admin/bookings/flights", "text": "View in Dashboard"}
            )
            email_service.send_email("bookings@allboundvacations.com", admin_subject, final_admin_html)

            # Confirm with Customer
            cust_subject = "Flight Request Received | Allbound Vacations"
            cust_content_html = f"""
            <p style="font-size: 16px;">We have successfully received your flight request for <strong>{booking.destination_city}</strong>.</p>
            <p>Our flight specialists are currently reviewing your details. 
            In the meantime, feel free to contact us via <a href="mailto:bookings@allboundvacations.com" style="color: #008080;">bookings@allboundvacations.com</a> if you have any questions.</p>
            """
            final_cust_html = email_service.generate_html_email(
                title=f"Thank You, {booking.contact_name}!",
                content_html=cust_content_html
            )
            email_service.send_email(booking.contact_email, cust_subject, final_cust_html)
        except Exception as e:
            print(f"Failed to send flight emails: {e}")

flight_booking_service = FlightBookingService()
