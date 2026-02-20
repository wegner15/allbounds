from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any
from datetime import date, datetime
from app.models.visa_application import VisaType, ApplicationStatus
from app.schemas.media import MediaAssetResponse

# Base Schema
class VisaApplicationBase(BaseModel):
    # Visa Details
    destination_country: str = Field(..., description="Destination Country")
    visa_type: VisaType = Field(..., description="Type of visa requested")
    nationality: str = Field(..., description="Applicant's nationality")
    intended_travel_date: date = Field(..., description="Intended date of travel")

    # Personal Details
    full_name: str = Field(..., description="Full Name as per Passport")
    dob: date = Field(..., description="Date of Birth")
    passport_number: str = Field(..., description="Passport Number")
    passport_expiry: date = Field(..., description="Passport Expiry Date")
    marital_status: str = Field(..., description="Marital Status")
    current_residence: str = Field(..., description="Current Country of Residence")
    email: EmailStr = Field(..., description="Email Address")
    phone: str = Field(..., description="Telephone Number")

    # Travel Details
    purpose_of_travel: str = Field(..., description="Purpose of Travel")
    travel_from_date: date = Field(..., description="Travel From Date")
    travel_to_date: date = Field(..., description="Travel To Date")
    accommodation_type: str = Field(..., description="Accommodation Type")
    flight_reservation_id: Optional[int] = Field(None, description="Optional MediaAsset ID for flight reservation")

# Schema for creating
class VisaApplicationCreate(VisaApplicationBase):
    pass

# Schema for updating (Admin only)
class VisaApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = Field(None, description="Application Status")
    admin_notes: Optional[str] = Field(None, description="Admin notes")

# Main Response Schema
class VisaApplicationResponse(VisaApplicationBase):
    id: int
    status: ApplicationStatus
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    flight_reservation: Optional[MediaAssetResponse] = None

    class Config:
        from_attributes = True
