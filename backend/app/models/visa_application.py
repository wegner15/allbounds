from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.db.database import Base

class VisaType(str, enum.Enum):
    TOURIST = "tourist"
    BUSINESS = "business"
    STUDENT = "student"
    WORK = "work"
    OTHER = "other"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    APPROVED = "approved"
    REJECTED = "rejected"

class VisaApplication(Base):
    __tablename__ = "visa_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Visa Details
    destination_country = Column(String, index=True, nullable=False)
    visa_type = Column(Enum(VisaType), nullable=False)
    nationality = Column(String, nullable=False)
    intended_travel_date = Column(Date, nullable=False)
    
    # Personal Details
    full_name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    passport_number = Column(String, nullable=False)
    passport_expiry = Column(Date, nullable=False)
    marital_status = Column(String, nullable=False) # Single, Married, Divorced, Widowed
    current_residence = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=False)
    
    # Travel Details
    purpose_of_travel = Column(String, nullable=False)
    travel_from_date = Column(Date, nullable=False)
    travel_to_date = Column(Date, nullable=False)
    accommodation_type = Column(String, nullable=False) # Hotel, Host, Family
    
    # Optional Flight Reservation
    flight_reservation_id = Column(Integer, ForeignKey("media_assets.id"), nullable=True)
    
    # Status handling
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    admin_notes = Column(Text, nullable=True)
    
    # Relationships
    flight_reservation = relationship("MediaAsset", foreign_keys=[flight_reservation_id])
