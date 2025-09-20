import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.accommodation import Accommodation
from app.models.country import Country
from app.models.region import Region

def test_create_accommodation(client: TestClient, db: Session, superuser_token_headers):
    """Test create accommodation endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    accommodation_data = {
        "name": "Test Accommodation",
        "summary": "A brief summary",
        "description": "This is a test accommodation",
        "slug": "test-accommodation",
        "country_id": country.id,
        "address": "123 Test Street",
        "latitude": 12.345,
        "longitude": 67.890,
        "stars": 4,
        "amenities": ["WiFi", "Pool", "Restaurant"]
    }
    response = client.post(
        f"{settings.API_V1_STR}/accommodations/",
        headers=superuser_token_headers,
        json=accommodation_data,
    )
    created_accommodation = response.json()
    assert response.status_code == 200
    assert created_accommodation["name"] == accommodation_data["name"]
    assert created_accommodation["summary"] == accommodation_data["summary"]
    assert created_accommodation["description"] == accommodation_data["description"]
    assert created_accommodation["slug"] == accommodation_data["slug"]
    assert created_accommodation["country_id"] == country.id
    assert created_accommodation["address"] == accommodation_data["address"]
    assert created_accommodation["latitude"] == accommodation_data["latitude"]
    assert created_accommodation["longitude"] == accommodation_data["longitude"]
    assert created_accommodation["stars"] == accommodation_data["stars"]
    assert created_accommodation["amenities"] == accommodation_data["amenities"]
    assert "id" in created_accommodation

def test_read_accommodations(client: TestClient, db: Session):
    """Test read accommodations endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test accommodations
    accommodation1 = Accommodation(
        name="Accommodation 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="accommodation-1", 
        country_id=country.id,
        address="Address 1",
        latitude=10.0,
        longitude=20.0,
        stars=3,
        amenities=["WiFi", "Breakfast"]
    )
    accommodation2 = Accommodation(
        name="Accommodation 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="accommodation-2", 
        country_id=country.id,
        address="Address 2",
        latitude=30.0,
        longitude=40.0,
        stars=5,
        amenities=["Pool", "Spa", "Restaurant"]
    )
    db.add(accommodation1)
    db.add(accommodation2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/accommodations/")
    accommodations = response.json()
    assert response.status_code == 200
    assert len(accommodations) == 2
    assert accommodations[0]["name"] == "Accommodation 1"
    assert accommodations[1]["name"] == "Accommodation 2"

def test_read_accommodations_by_country(client: TestClient, db: Session):
    """Test read accommodations by country endpoint."""
    # Create a region and countries first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country1 = Country(name="Country 1", description="Description 1", slug="country-1", region_id=region.id)
    country2 = Country(name="Country 2", description="Description 2", slug="country-2", region_id=region.id)
    db.add(country1)
    db.add(country2)
    db.commit()
    db.refresh(country1)
    db.refresh(country2)
    
    # Create test accommodations
    accommodation1 = Accommodation(
        name="Accommodation 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="accommodation-1", 
        country_id=country1.id,
        address="Address 1",
        latitude=10.0,
        longitude=20.0,
        stars=3,
        amenities=["WiFi", "Breakfast"]
    )
    accommodation2 = Accommodation(
        name="Accommodation 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="accommodation-2", 
        country_id=country1.id,
        address="Address 2",
        latitude=30.0,
        longitude=40.0,
        stars=5,
        amenities=["Pool", "Spa", "Restaurant"]
    )
    accommodation3 = Accommodation(
        name="Accommodation 3", 
        summary="Summary 3", 
        description="Description 3", 
        slug="accommodation-3", 
        country_id=country2.id,
        address="Address 3",
        latitude=50.0,
        longitude=60.0,
        stars=4,
        amenities=["WiFi", "Gym"]
    )
    db.add(accommodation1)
    db.add(accommodation2)
    db.add(accommodation3)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/accommodations/country/{country1.id}")
    accommodations = response.json()
    assert response.status_code == 200
    assert len(accommodations) == 2
    assert accommodations[0]["name"] == "Accommodation 1"
    assert accommodations[1]["name"] == "Accommodation 2"

def test_read_accommodation(client: TestClient, db: Session):
    """Test read accommodation endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test accommodation
    accommodation = Accommodation(
        name="Test Accommodation", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-accommodation", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890,
        stars=4,
        amenities=["WiFi", "Pool", "Restaurant"]
    )
    db.add(accommodation)
    db.commit()
    db.refresh(accommodation)
    
    response = client.get(f"{settings.API_V1_STR}/accommodations/{accommodation.id}")
    fetched_accommodation = response.json()
    assert response.status_code == 200
    assert fetched_accommodation["name"] == accommodation.name
    assert fetched_accommodation["summary"] == accommodation.summary
    assert fetched_accommodation["description"] == accommodation.description
    assert fetched_accommodation["slug"] == accommodation.slug
    assert fetched_accommodation["country_id"] == country.id
    assert fetched_accommodation["address"] == accommodation.address
    assert fetched_accommodation["latitude"] == accommodation.latitude
    assert fetched_accommodation["longitude"] == accommodation.longitude
    assert fetched_accommodation["stars"] == accommodation.stars
    assert fetched_accommodation["amenities"] == accommodation.amenities
    assert fetched_accommodation["id"] == accommodation.id

def test_read_accommodation_by_slug(client: TestClient, db: Session):
    """Test read accommodation by slug endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test accommodation
    accommodation = Accommodation(
        name="Test Accommodation", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-accommodation", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890,
        stars=4,
        amenities=["WiFi", "Pool", "Restaurant"]
    )
    db.add(accommodation)
    db.commit()
    db.refresh(accommodation)
    
    response = client.get(f"{settings.API_V1_STR}/accommodations/slug/{accommodation.slug}")
    fetched_accommodation = response.json()
    assert response.status_code == 200
    assert fetched_accommodation["name"] == accommodation.name
    assert fetched_accommodation["summary"] == accommodation.summary
    assert fetched_accommodation["description"] == accommodation.description
    assert fetched_accommodation["slug"] == accommodation.slug
    assert fetched_accommodation["country_id"] == country.id
    assert fetched_accommodation["id"] == accommodation.id

def test_update_accommodation(client: TestClient, db: Session, superuser_token_headers):
    """Test update accommodation endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test accommodation
    accommodation = Accommodation(
        name="Original Name", 
        summary="Original Summary", 
        description="Original Description", 
        slug="original-slug", 
        country_id=country.id,
        address="Original Address",
        latitude=10.0,
        longitude=20.0,
        stars=3,
        amenities=["WiFi", "Breakfast"]
    )
    db.add(accommodation)
    db.commit()
    db.refresh(accommodation)
    
    update_data = {
        "name": "Updated Name",
        "summary": "Updated Summary",
        "description": "Updated Description",
        "address": "Updated Address",
        "latitude": 30.0,
        "longitude": 40.0,
        "stars": 5,
        "amenities": ["WiFi", "Pool", "Spa", "Restaurant"]
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/accommodations/{accommodation.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_accommodation = response.json()
    assert response.status_code == 200
    assert updated_accommodation["name"] == update_data["name"]
    assert updated_accommodation["summary"] == update_data["summary"]
    assert updated_accommodation["description"] == update_data["description"]
    assert updated_accommodation["address"] == update_data["address"]
    assert updated_accommodation["latitude"] == update_data["latitude"]
    assert updated_accommodation["longitude"] == update_data["longitude"]
    assert updated_accommodation["stars"] == update_data["stars"]
    assert updated_accommodation["amenities"] == update_data["amenities"]
    assert updated_accommodation["id"] == accommodation.id
    # Slug should remain unchanged
    assert updated_accommodation["slug"] == accommodation.slug
    # Country should remain unchanged
    assert updated_accommodation["country_id"] == country.id

def test_delete_accommodation(client: TestClient, db: Session, superuser_token_headers):
    """Test delete accommodation endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test accommodation
    accommodation = Accommodation(
        name="Test Accommodation", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-accommodation", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890,
        stars=4,
        amenities=["WiFi", "Pool", "Restaurant"]
    )
    db.add(accommodation)
    db.commit()
    db.refresh(accommodation)
    
    response = client.delete(
        f"{settings.API_V1_STR}/accommodations/{accommodation.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify accommodation is deleted (soft delete)
    db_accommodation = db.query(Accommodation).filter(Accommodation.id == accommodation.id).first()
    assert db_accommodation is not None
    assert db_accommodation.is_active is False
