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
            admin_content = f"""
            <h2>New Flight Request Received</h2>
            <p><strong>Contact:</strong> {booking.contact_name} ({booking.contact_email} / {booking.contact_phone})</p>
            <p><strong>Route:</strong> {booking.departure_city} to {booking.destination_city}</p>
            <p><strong>Dates:</strong> {booking.departure_date} to {booking.return_date or 'N/A'}</p>
            <p><strong>Purpose:</strong> {booking.purpose.value}</p>
            <p><strong>Passengers:</strong> {booking.adults} Adults, {booking.children} Ch, {booking.infants} Inf</p>
            <p><strong>Services:</strong> {booking.add_on_services}</p>
            """
            email_service.send_email("info@allboundtravel.com", admin_subject, admin_content)

            # Confirm with Customer
            cust_subject = "Flight Request Received | Allbound Vacations"
            cust_content = f"""
            <h2>Thank You, {booking.contact_name}!</h2>
            <p>We have successfully received your flight request for {booking.destination_city}.</p>
            <p>Our flight specialists are currently reviewing your details. 
            In the meantime, feel free to contact us via info@allboundtravel.com if you have any questions.</p>
            """
            email_service.send_email(booking.contact_email, cust_subject, cust_content)
        except Exception as e:
            print(f"Failed to send flight emails: {e}")

flight_booking_service = FlightBookingService()
