from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# Traveler schema
class BookingTravelerBase(BaseModel):
    traveler_type: str = Field(..., description="Type of traveler: 'adult' or 'child'")
    full_name: str = Field(..., description="Full name of the traveler")
    age: Optional[int] = Field(None, description="Age of the traveler (required for children)")


class BookingTravelerCreate(BookingTravelerBase):
    pass


class BookingTravelerResponse(BookingTravelerBase):
    id: int
    booking_id: int

    class Config:
        from_attributes = True


# Booking schemas
class BookingBase(BaseModel):
    booking_type: str = Field(..., description="Type of booking: 'package' or 'group_trip'")
    entity_id: int = Field(..., description="ID of the package or group trip")
    entity_slug: str = Field(..., description="Slug of the package or group trip")

    # Contact Information
    contact_name: str = Field(..., description="Full name of the contact person")
    contact_email: EmailStr = Field(..., description="Email address")
    contact_phone: str = Field(..., description="Phone number")
    country_of_origin: str = Field(..., description="Country of origin")

    # Travelers
    number_of_adults: int = Field(default=1, ge=1, description="Number of adult travelers")
    number_of_children: int = Field(default=0, ge=0, description="Number of children")

    # Additional Details
    special_requests: Optional[str] = Field(None, description="Any special requests or notes")
    source: str = Field(..., description="How they found us (website, social, referral, etc.)")


class BookingCreate(BookingBase):
    travelers: List[BookingTravelerCreate] = Field(default_factory=list, description="List of travelers")


class BookingUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Booking status")
    special_requests: Optional[str] = Field(None, description="Update special requests")


class BookingResponse(BookingBase):
    id: int
    status: str
    travelers: List[BookingTravelerResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Inquiry schemas
class InquiryBase(BaseModel):
    name: str = Field(..., description="Full name")
    email: EmailStr = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    country_of_origin: Optional[str] = Field(None, description="Country of origin")

    subject: str = Field(..., description="Inquiry subject")
    message: str = Field(..., description="Inquiry message")

    source: str = Field(..., description="How they found us")


class InquiryCreate(InquiryBase):
    pass


class InquiryUpdate(BaseModel):
    status: Optional[str] = Field(None, description="Inquiry status")
    is_read: Optional[bool] = Field(None, description="Whether the inquiry has been read")


class InquiryResponse(InquiryBase):
    id: int
    status: str
    is_read: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True