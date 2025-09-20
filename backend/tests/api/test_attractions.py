import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.attraction import Attraction
from app.models.country import Country
from app.models.region import Region

def test_create_attraction(client: TestClient, db: Session, superuser_token_headers):
    """Test create attraction endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    attraction_data = {
        "name": "Test Attraction",
        "summary": "A brief summary",
        "description": "This is a test attraction",
        "slug": "test-attraction",
        "country_id": country.id,
        "address": "123 Test Street",
        "latitude": 12.345,
        "longitude": 67.890
    }
    response = client.post(
        f"{settings.API_V1_STR}/attractions/",
        headers=superuser_token_headers,
        json=attraction_data,
    )
    created_attraction = response.json()
    assert response.status_code == 200
    assert created_attraction["name"] == attraction_data["name"]
    assert created_attraction["summary"] == attraction_data["summary"]
    assert created_attraction["description"] == attraction_data["description"]
    assert created_attraction["slug"] == attraction_data["slug"]
    assert created_attraction["country_id"] == country.id
    assert created_attraction["address"] == attraction_data["address"]
    assert created_attraction["latitude"] == attraction_data["latitude"]
    assert created_attraction["longitude"] == attraction_data["longitude"]
    assert "id" in created_attraction

def test_read_attractions(client: TestClient, db: Session):
    """Test read attractions endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test attractions
    attraction1 = Attraction(
        name="Attraction 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="attraction-1", 
        country_id=country.id,
        address="Address 1",
        latitude=10.0,
        longitude=20.0
    )
    attraction2 = Attraction(
        name="Attraction 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="attraction-2", 
        country_id=country.id,
        address="Address 2",
        latitude=30.0,
        longitude=40.0
    )
    db.add(attraction1)
    db.add(attraction2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/attractions/")
    attractions = response.json()
    assert response.status_code == 200
    assert len(attractions) == 2
    assert attractions[0]["name"] == "Attraction 1"
    assert attractions[1]["name"] == "Attraction 2"

def test_read_attractions_by_country(client: TestClient, db: Session):
    """Test read attractions by country endpoint."""
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
    
    # Create test attractions
    attraction1 = Attraction(
        name="Attraction 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="attraction-1", 
        country_id=country1.id,
        address="Address 1",
        latitude=10.0,
        longitude=20.0
    )
    attraction2 = Attraction(
        name="Attraction 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="attraction-2", 
        country_id=country1.id,
        address="Address 2",
        latitude=30.0,
        longitude=40.0
    )
    attraction3 = Attraction(
        name="Attraction 3", 
        summary="Summary 3", 
        description="Description 3", 
        slug="attraction-3", 
        country_id=country2.id,
        address="Address 3",
        latitude=50.0,
        longitude=60.0
    )
    db.add(attraction1)
    db.add(attraction2)
    db.add(attraction3)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/attractions/country/{country1.id}")
    attractions = response.json()
    assert response.status_code == 200
    assert len(attractions) == 2
    assert attractions[0]["name"] == "Attraction 1"
    assert attractions[1]["name"] == "Attraction 2"

def test_read_attraction(client: TestClient, db: Session):
    """Test read attraction endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test attraction
    attraction = Attraction(
        name="Test Attraction", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-attraction", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890
    )
    db.add(attraction)
    db.commit()
    db.refresh(attraction)
    
    response = client.get(f"{settings.API_V1_STR}/attractions/{attraction.id}")
    fetched_attraction = response.json()
    assert response.status_code == 200
    assert fetched_attraction["name"] == attraction.name
    assert fetched_attraction["summary"] == attraction.summary
    assert fetched_attraction["description"] == attraction.description
    assert fetched_attraction["slug"] == attraction.slug
    assert fetched_attraction["country_id"] == country.id
    assert fetched_attraction["address"] == attraction.address
    assert fetched_attraction["latitude"] == attraction.latitude
    assert fetched_attraction["longitude"] == attraction.longitude
    assert fetched_attraction["id"] == attraction.id

def test_read_attraction_by_slug(client: TestClient, db: Session):
    """Test read attraction by slug endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test attraction
    attraction = Attraction(
        name="Test Attraction", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-attraction", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890
    )
    db.add(attraction)
    db.commit()
    db.refresh(attraction)
    
    response = client.get(f"{settings.API_V1_STR}/attractions/slug/{attraction.slug}")
    fetched_attraction = response.json()
    assert response.status_code == 200
    assert fetched_attraction["name"] == attraction.name
    assert fetched_attraction["summary"] == attraction.summary
    assert fetched_attraction["description"] == attraction.description
    assert fetched_attraction["slug"] == attraction.slug
    assert fetched_attraction["country_id"] == country.id
    assert fetched_attraction["id"] == attraction.id

def test_update_attraction(client: TestClient, db: Session, superuser_token_headers):
    """Test update attraction endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test attraction
    attraction = Attraction(
        name="Original Name", 
        summary="Original Summary", 
        description="Original Description", 
        slug="original-slug", 
        country_id=country.id,
        address="Original Address",
        latitude=10.0,
        longitude=20.0
    )
    db.add(attraction)
    db.commit()
    db.refresh(attraction)
    
    update_data = {
        "name": "Updated Name",
        "summary": "Updated Summary",
        "description": "Updated Description",
        "address": "Updated Address",
        "latitude": 30.0,
        "longitude": 40.0
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/attractions/{attraction.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_attraction = response.json()
    assert response.status_code == 200
    assert updated_attraction["name"] == update_data["name"]
    assert updated_attraction["summary"] == update_data["summary"]
    assert updated_attraction["description"] == update_data["description"]
    assert updated_attraction["address"] == update_data["address"]
    assert updated_attraction["latitude"] == update_data["latitude"]
    assert updated_attraction["longitude"] == update_data["longitude"]
    assert updated_attraction["id"] == attraction.id
    # Slug should remain unchanged
    assert updated_attraction["slug"] == attraction.slug
    # Country should remain unchanged
    assert updated_attraction["country_id"] == country.id

def test_delete_attraction(client: TestClient, db: Session, superuser_token_headers):
    """Test delete attraction endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test attraction
    attraction = Attraction(
        name="Test Attraction", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-attraction", 
        country_id=country.id,
        address="Test Address",
        latitude=12.345,
        longitude=67.890
    )
    db.add(attraction)
    db.commit()
    db.refresh(attraction)
    
    response = client.delete(
        f"{settings.API_V1_STR}/attractions/{attraction.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify attraction is deleted (soft delete)
    db_attraction = db.query(Attraction).filter(Attraction.id == attraction.id).first()
    assert db_attraction is not None
    assert db_attraction.is_active is False
