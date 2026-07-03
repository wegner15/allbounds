import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.partner import Partner
from app.models.booking import Booking

def test_partner_code_autogeneration_on_create(client: TestClient, db: Session, superuser_token_headers):
    """Test that a unique partner code is generated if left blank when creating a partner."""
    # Create partner with no code
    partner_data = {
        "name": "Autogen Partner",
        "category": "hotel",
        "website_url": "https://www.autogen.com",
        "discount_percent": 10.0,
        "commission_percent": 5.0,
        "order_index": 1
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/partners/",
        headers=superuser_token_headers,
        json=partner_data,
    )
    assert response.status_code == 200
    created_partner = response.json()
    assert created_partner["name"] == "Autogen Partner"
    assert created_partner["partner_code"] is not None
    assert len(created_partner["partner_code"]) == 6
    assert created_partner["discount_percent"] == 10.0
    assert created_partner["commission_percent"] == 5.0

    # Retrieve from DB to verify it exists
    db_partner = db.query(Partner).filter(Partner.id == created_partner["id"]).first()
    assert db_partner is not None
    assert db_partner.partner_code == created_partner["partner_code"]


def test_validate_partner_code(client: TestClient, db: Session):
    """Test the public validation endpoint for partner codes."""
    # Create a partner with a specific code
    partner = Partner(
        name="Validation Partner",
        category="airline",
        slug="validation-partner",
        partner_code="VALID9",
        discount_percent=15.0,
        commission_percent=8.0,
        is_active=True
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)

    # Test validating valid code
    response = client.get(f"{settings.API_V1_STR}/partners/validate/VALID9")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["partner_id"] == partner.id
    assert data["name"] == "Validation Partner"
    assert data["discount_percent"] == 15.0

    # Test validating code case-insensitively
    response_lower = client.get(f"{settings.API_V1_STR}/partners/validate/valid9")
    assert response_lower.status_code == 200
    assert response_lower.json()["valid"] is True

    # Test validating invalid code
    response_invalid = client.get(f"{settings.API_V1_STR}/partners/validate/INVALID")
    assert response_invalid.status_code == 404
    assert "Invalid or inactive" in response_invalid.json()["detail"]


def test_booking_with_partner_code(client: TestClient, db: Session):
    """Test that a booking created with a partner code associates correctly and stores partner details."""
    # Create a partner
    partner = Partner(
        name="Booking Partner",
        category="affiliation",
        slug="booking-partner",
        partner_code="BOOK12",
        discount_percent=12.5,
        commission_percent=6.0,
        is_active=True
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)

    # Create a booking with the partner code
    booking_data = {
        "booking_type": "package",
        "entity_id": 1,
        "entity_slug": "test-package",
        "contact_name": "John Doe",
        "contact_email": "john.doe@example.com",
        "contact_phone": "+1234567890",
        "country_of_origin": "United States",
        "number_of_adults": 1,
        "number_of_children": 0,
        "source": "referral",
        "partner_code": "BOOK12",
        "travelers": [
            {
                "traveler_type": "adult",
                "full_name": "John Doe"
            }
        ]
    }

    response = client.post(
        f"{settings.API_V1_STR}/bookings/",
        json=booking_data
    )
    assert response.status_code == 200
    created_booking = response.json()
    assert created_booking["partner_code"] == "BOOK12"
    assert created_booking["partner_id"] == partner.id
    assert created_booking["partner"] is not None
    assert created_booking["partner"]["name"] == "Booking Partner"
    assert created_booking["partner"]["discount_percent"] == 12.5

    # Retrieve from DB to verify association is saved in the DB
    db_booking = db.query(Booking).filter(Booking.id == created_booking["id"]).first()
    assert db_booking is not None
    assert db_booking.partner_id == partner.id
    assert db_booking.partner_code == "BOOK12"
