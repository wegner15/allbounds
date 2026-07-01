import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.partner import Partner

def test_create_partner(client: TestClient, db: Session, superuser_token_headers):
    """Test create partner endpoint."""
    partner_data = {
        "name": "Test Airline",
        "category": "airline",
        "logo_image_id": "test-image-id",
        "website_url": "https://www.test-airline.com",
        "order_index": 5
    }
    response = client.post(
        f"{settings.API_V1_STR}/partners/",
        headers=superuser_token_headers,
        json=partner_data,
    )
    created_partner = response.json()
    assert response.status_code == 200
    assert created_partner["name"] == partner_data["name"]
    assert created_partner["category"] == partner_data["category"]
    assert created_partner["logo_image_id"] == partner_data["logo_image_id"]
    assert created_partner["website_url"] == partner_data["website_url"]
    assert created_partner["order_index"] == partner_data["order_index"]
    assert "id" in created_partner
    assert created_partner["slug"] == "test-airline"

def test_read_partners(client: TestClient, db: Session):
    """Test read partners endpoint and filtering by category."""
    # Create test partners
    partner1 = Partner(name="Hotel 1", category="hotel", slug="hotel-1", order_index=1, is_active=True)
    partner2 = Partner(name="Airline 1", category="airline", slug="airline-1", order_index=2, is_active=True)
    db.add(partner1)
    db.add(partner2)
    db.commit()
    
    # Test read all
    response = client.get(f"{settings.API_V1_STR}/partners/")
    partners = response.json()
    assert response.status_code == 200
    assert len(partners) >= 2  # Might have seeds
    
    # Test filtering by category
    response_filter = client.get(f"{settings.API_V1_STR}/partners/?category=hotel")
    filtered_partners = response_filter.json()
    assert response_filter.status_code == 200
    # Should only return hotel partners
    for p in filtered_partners:
        assert p["category"] == "hotel"

def test_read_partner(client: TestClient, db: Session):
    """Test read partner endpoint by ID."""
    partner = Partner(name="Test Partner", category="affiliation", slug="test-partner", is_active=True)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    response = client.get(f"{settings.API_V1_STR}/partners/{partner.id}")
    fetched_partner = response.json()
    assert response.status_code == 200
    assert fetched_partner["name"] == partner.name
    assert fetched_partner["category"] == partner.category
    assert fetched_partner["slug"] == partner.slug
    assert fetched_partner["id"] == partner.id

def test_read_partner_by_slug(client: TestClient, db: Session):
    """Test read partner by slug endpoint."""
    partner = Partner(name="Test Partner", category="affiliation", slug="test-partner-slug", is_active=True)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    response = client.get(f"{settings.API_V1_STR}/partners/slug/{partner.slug}")
    fetched_partner = response.json()
    assert response.status_code == 200
    assert fetched_partner["name"] == partner.name
    assert fetched_partner["category"] == partner.category
    assert fetched_partner["slug"] == partner.slug
    assert fetched_partner["id"] == partner.id

def test_update_partner(client: TestClient, db: Session, superuser_token_headers):
    """Test update partner endpoint."""
    partner = Partner(name="Original Name", category="hotel", slug="original-name", is_active=True)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    update_data = {
        "name": "Updated Name",
        "category": "airline",
        "website_url": "https://www.updated.com"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/partners/{partner.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_partner = response.json()
    assert response.status_code == 200
    assert updated_partner["name"] == update_data["name"]
    assert updated_partner["category"] == update_data["category"]
    assert updated_partner["website_url"] == update_data["website_url"]
    assert updated_partner["id"] == partner.id
    # Slug should update to match new name
    assert updated_partner["slug"] == "updated-name"

def test_delete_partner(client: TestClient, db: Session, superuser_token_headers):
    """Test delete partner endpoint (soft delete)."""
    partner = Partner(name="To Delete", category="affiliation", slug="to-delete", is_active=True)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    
    response = client.delete(
        f"{settings.API_V1_STR}/partners/{partner.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify partner is disabled (soft delete)
    db_partner = db.query(Partner).filter(Partner.id == partner.id).first()
    assert db_partner is not None
    assert db_partner.is_active is False
