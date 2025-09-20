import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.country import Country
from app.models.region import Region

def test_create_country(client: TestClient, db: Session, superuser_token_headers):
    """Test create country endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country_data = {
        "name": "Test Country",
        "description": "This is a test country",
        "slug": "test-country",
        "region_id": region.id
    }
    response = client.post(
        f"{settings.API_V1_STR}/countries/",
        headers=superuser_token_headers,
        json=country_data,
    )
    created_country = response.json()
    assert response.status_code == 200
    assert created_country["name"] == country_data["name"]
    assert created_country["description"] == country_data["description"]
    assert created_country["slug"] == country_data["slug"]
    assert created_country["region_id"] == region.id
    assert "id" in created_country

def test_read_countries(client: TestClient, db: Session):
    """Test read countries endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    # Create test countries
    country1 = Country(name="Country 1", description="Description 1", slug="country-1", region_id=region.id)
    country2 = Country(name="Country 2", description="Description 2", slug="country-2", region_id=region.id)
    db.add(country1)
    db.add(country2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/countries/")
    countries = response.json()
    assert response.status_code == 200
    assert len(countries) == 2
    assert countries[0]["name"] == "Country 1"
    assert countries[1]["name"] == "Country 2"

def test_read_countries_by_region(client: TestClient, db: Session):
    """Test read countries by region endpoint."""
    # Create regions
    region1 = Region(name="Region 1", description="Description 1", slug="region-1")
    region2 = Region(name="Region 2", description="Description 2", slug="region-2")
    db.add(region1)
    db.add(region2)
    db.commit()
    db.refresh(region1)
    db.refresh(region2)
    
    # Create test countries
    country1 = Country(name="Country 1", description="Description 1", slug="country-1", region_id=region1.id)
    country2 = Country(name="Country 2", description="Description 2", slug="country-2", region_id=region1.id)
    country3 = Country(name="Country 3", description="Description 3", slug="country-3", region_id=region2.id)
    db.add(country1)
    db.add(country2)
    db.add(country3)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/countries/region/{region1.id}")
    countries = response.json()
    assert response.status_code == 200
    assert len(countries) == 2
    assert countries[0]["name"] == "Country 1"
    assert countries[1]["name"] == "Country 2"

def test_read_country(client: TestClient, db: Session):
    """Test read country endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    # Create test country
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    response = client.get(f"{settings.API_V1_STR}/countries/{country.id}")
    fetched_country = response.json()
    assert response.status_code == 200
    assert fetched_country["name"] == country.name
    assert fetched_country["description"] == country.description
    assert fetched_country["slug"] == country.slug
    assert fetched_country["region_id"] == region.id
    assert fetched_country["id"] == country.id

def test_read_country_by_slug(client: TestClient, db: Session):
    """Test read country by slug endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    # Create test country
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    response = client.get(f"{settings.API_V1_STR}/countries/slug/{country.slug}")
    fetched_country = response.json()
    assert response.status_code == 200
    assert fetched_country["name"] == country.name
    assert fetched_country["description"] == country.description
    assert fetched_country["slug"] == country.slug
    assert fetched_country["region_id"] == region.id
    assert fetched_country["id"] == country.id

def test_update_country(client: TestClient, db: Session, superuser_token_headers):
    """Test update country endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    # Create test country
    country = Country(name="Original Name", description="Original Description", slug="original-slug", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    update_data = {
        "name": "Updated Name",
        "description": "Updated Description"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/countries/{country.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_country = response.json()
    assert response.status_code == 200
    assert updated_country["name"] == update_data["name"]
    assert updated_country["description"] == update_data["description"]
    assert updated_country["id"] == country.id
    # Slug should remain unchanged
    assert updated_country["slug"] == country.slug
    # Region should remain unchanged
    assert updated_country["region_id"] == region.id

def test_delete_country(client: TestClient, db: Session, superuser_token_headers):
    """Test delete country endpoint."""
    # Create a region first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    # Create test country
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    response = client.delete(
        f"{settings.API_V1_STR}/countries/{country.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify country is deleted (soft delete)
    db_country = db.query(Country).filter(Country.id == country.id).first()
    assert db_country is not None
    assert db_country.is_active is False
