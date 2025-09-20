import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.package import Package, PackageHolidayType
from app.models.holiday_type import HolidayType
from app.models.country import Country
from app.models.region import Region

def test_create_package(client: TestClient, db: Session, superuser_token_headers):
    """Test create package endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    package_data = {
        "name": "Test Package",
        "summary": "A brief summary",
        "description": "This is a test package",
        "slug": "test-package",
        "country_id": country.id,
        "duration_days": 7,
        "price": 1299.99,
        "itinerary": "Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        "inclusions": "Accommodation, Breakfast, Transfers",
        "exclusions": "Flights, Travel Insurance"
    }
    response = client.post(
        f"{settings.API_V1_STR}/packages/",
        headers=superuser_token_headers,
        json=package_data,
    )
    created_package = response.json()
    assert response.status_code == 200
    assert created_package["name"] == package_data["name"]
    assert created_package["summary"] == package_data["summary"]
    assert created_package["description"] == package_data["description"]
    assert created_package["slug"] == package_data["slug"]
    assert created_package["country_id"] == country.id
    assert created_package["duration_days"] == package_data["duration_days"]
    assert created_package["price"] == package_data["price"]
    assert created_package["itinerary"] == package_data["itinerary"]
    assert created_package["inclusions"] == package_data["inclusions"]
    assert created_package["exclusions"] == package_data["exclusions"]
    assert "id" in created_package

def test_read_packages(client: TestClient, db: Session):
    """Test read packages endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test packages
    package1 = Package(
        name="Package 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="package-1", 
        country_id=country.id,
        duration_days=5,
        price=999.99,
        itinerary="Day 1: Arrival\nDay 2-5: Activities",
        inclusions="Accommodation, Breakfast",
        exclusions="Flights"
    )
    package2 = Package(
        name="Package 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="package-2", 
        country_id=country.id,
        duration_days=10,
        price=1999.99,
        itinerary="Day 1: Arrival\nDay 2-10: Activities",
        inclusions="Accommodation, All Meals",
        exclusions="Flights, Insurance"
    )
    db.add(package1)
    db.add(package2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/packages/")
    packages = response.json()
    assert response.status_code == 200
    assert len(packages) == 2
    assert packages[0]["name"] == "Package 1"
    assert packages[1]["name"] == "Package 2"

def test_read_packages_by_country(client: TestClient, db: Session):
    """Test read packages by country endpoint."""
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
    
    # Create test packages
    package1 = Package(
        name="Package 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="package-1", 
        country_id=country1.id,
        duration_days=5,
        price=999.99,
        itinerary="Day 1: Arrival\nDay 2-5: Activities",
        inclusions="Accommodation, Breakfast",
        exclusions="Flights"
    )
    package2 = Package(
        name="Package 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="package-2", 
        country_id=country1.id,
        duration_days=10,
        price=1999.99,
        itinerary="Day 1: Arrival\nDay 2-10: Activities",
        inclusions="Accommodation, All Meals",
        exclusions="Flights, Insurance"
    )
    package3 = Package(
        name="Package 3", 
        summary="Summary 3", 
        description="Description 3", 
        slug="package-3", 
        country_id=country2.id,
        duration_days=7,
        price=1499.99,
        itinerary="Day 1: Arrival\nDay 2-7: Activities",
        inclusions="Accommodation, Some Meals",
        exclusions="Flights, Insurance"
    )
    db.add(package1)
    db.add(package2)
    db.add(package3)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/packages/country/{country1.id}")
    packages = response.json()
    assert response.status_code == 200
    assert len(packages) == 2
    assert packages[0]["name"] == "Package 1"
    assert packages[1]["name"] == "Package 2"

def test_read_featured_packages(client: TestClient, db: Session):
    """Test read featured packages endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test packages
    package1 = Package(
        name="Package 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="package-1", 
        country_id=country.id,
        duration_days=5,
        price=999.99,
        itinerary="Day 1: Arrival\nDay 2-5: Activities",
        inclusions="Accommodation, Breakfast",
        exclusions="Flights",
        is_featured=True
    )
    package2 = Package(
        name="Package 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="package-2", 
        country_id=country.id,
        duration_days=10,
        price=1999.99,
        itinerary="Day 1: Arrival\nDay 2-10: Activities",
        inclusions="Accommodation, All Meals",
        exclusions="Flights, Insurance",
        is_featured=False
    )
    db.add(package1)
    db.add(package2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/packages/featured")
    packages = response.json()
    assert response.status_code == 200
    assert len(packages) == 1
    assert packages[0]["name"] == "Package 1"
    assert packages[0]["is_featured"] is True

def test_read_package(client: TestClient, db: Session):
    """Test read package endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package
    package = Package(
        name="Test Package", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-package", 
        country_id=country.id,
        duration_days=7,
        price=1299.99,
        itinerary="Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        inclusions="Accommodation, Breakfast, Transfers",
        exclusions="Flights, Travel Insurance"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    response = client.get(f"{settings.API_V1_STR}/packages/{package.id}")
    fetched_package = response.json()
    assert response.status_code == 200
    assert fetched_package["name"] == package.name
    assert fetched_package["summary"] == package.summary
    assert fetched_package["description"] == package.description
    assert fetched_package["slug"] == package.slug
    assert fetched_package["country_id"] == country.id
    assert fetched_package["duration_days"] == package.duration_days
    assert fetched_package["price"] == package.price
    assert fetched_package["itinerary"] == package.itinerary
    assert fetched_package["inclusions"] == package.inclusions
    assert fetched_package["exclusions"] == package.exclusions
    assert fetched_package["id"] == package.id

def test_read_package_by_slug(client: TestClient, db: Session):
    """Test read package by slug endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package
    package = Package(
        name="Test Package", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-package", 
        country_id=country.id,
        duration_days=7,
        price=1299.99,
        itinerary="Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        inclusions="Accommodation, Breakfast, Transfers",
        exclusions="Flights, Travel Insurance"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    response = client.get(f"{settings.API_V1_STR}/packages/slug/{package.slug}")
    fetched_package = response.json()
    assert response.status_code == 200
    assert fetched_package["name"] == package.name
    assert fetched_package["summary"] == package.summary
    assert fetched_package["description"] == package.description
    assert fetched_package["slug"] == package.slug
    assert fetched_package["country_id"] == country.id
    assert fetched_package["id"] == package.id

def test_update_package(client: TestClient, db: Session, superuser_token_headers):
    """Test update package endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package
    package = Package(
        name="Original Name", 
        summary="Original Summary", 
        description="Original Description", 
        slug="original-slug", 
        country_id=country.id,
        duration_days=5,
        price=999.99,
        itinerary="Original Itinerary",
        inclusions="Original Inclusions",
        exclusions="Original Exclusions"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    update_data = {
        "name": "Updated Name",
        "summary": "Updated Summary",
        "description": "Updated Description",
        "duration_days": 8,
        "price": 1499.99,
        "itinerary": "Updated Itinerary",
        "inclusions": "Updated Inclusions",
        "exclusions": "Updated Exclusions"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/packages/{package.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_package = response.json()
    assert response.status_code == 200
    assert updated_package["name"] == update_data["name"]
    assert updated_package["summary"] == update_data["summary"]
    assert updated_package["description"] == update_data["description"]
    assert updated_package["duration_days"] == update_data["duration_days"]
    assert updated_package["price"] == update_data["price"]
    assert updated_package["itinerary"] == update_data["itinerary"]
    assert updated_package["inclusions"] == update_data["inclusions"]
    assert updated_package["exclusions"] == update_data["exclusions"]
    assert updated_package["id"] == package.id
    # Slug should remain unchanged
    assert updated_package["slug"] == package.slug
    # Country should remain unchanged
    assert updated_package["country_id"] == country.id

def test_delete_package(client: TestClient, db: Session, superuser_token_headers):
    """Test delete package endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package
    package = Package(
        name="Test Package", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-package", 
        country_id=country.id,
        duration_days=7,
        price=1299.99,
        itinerary="Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        inclusions="Accommodation, Breakfast, Transfers",
        exclusions="Flights, Travel Insurance"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    response = client.delete(
        f"{settings.API_V1_STR}/packages/{package.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify package is deleted (soft delete)
    db_package = db.query(Package).filter(Package.id == package.id).first()
    assert db_package is not None
    assert db_package.is_active is False

def test_publish_unpublish_package(client: TestClient, db: Session, superuser_token_headers):
    """Test publish and unpublish package endpoints."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package (unpublished by default)
    package = Package(
        name="Test Package", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-package", 
        country_id=country.id,
        duration_days=7,
        price=1299.99,
        itinerary="Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        inclusions="Accommodation, Breakfast, Transfers",
        exclusions="Flights, Travel Insurance",
        is_published=False
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    # Test publish
    response = client.post(
        f"{settings.API_V1_STR}/packages/{package.id}/publish",
        headers=superuser_token_headers,
    )
    published_package = response.json()
    assert response.status_code == 200
    assert published_package["is_published"] is True
    
    # Verify in database
    db_package = db.query(Package).filter(Package.id == package.id).first()
    assert db_package.is_published is True
    
    # Test unpublish
    response = client.post(
        f"{settings.API_V1_STR}/packages/{package.id}/unpublish",
        headers=superuser_token_headers,
    )
    unpublished_package = response.json()
    assert response.status_code == 200
    assert unpublished_package["is_published"] is False
    
    # Verify in database
    db_package = db.query(Package).filter(Package.id == package.id).first()
    assert db_package.is_published is False

def test_add_remove_holiday_type(client: TestClient, db: Session, superuser_token_headers):
    """Test add and remove holiday type endpoints."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test package
    package = Package(
        name="Test Package", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-package", 
        country_id=country.id,
        duration_days=7,
        price=1299.99,
        itinerary="Day 1: Arrival\nDay 2: City Tour\nDay 3-7: Beach",
        inclusions="Accommodation, Breakfast, Transfers",
        exclusions="Flights, Travel Insurance"
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    
    # Create holiday type
    holiday_type = HolidayType(name="Beach Holiday", description="Relaxing beach vacation", slug="beach-holiday")
    db.add(holiday_type)
    db.commit()
    db.refresh(holiday_type)
    
    # Test add holiday type
    response = client.post(
        f"{settings.API_V1_STR}/packages/{package.id}/holiday-types/{holiday_type.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify in database
    db_package_holiday_type = db.query(PackageHolidayType).filter(
        PackageHolidayType.package_id == package.id,
        PackageHolidayType.holiday_type_id == holiday_type.id
    ).first()
    assert db_package_holiday_type is not None
    
    # Test remove holiday type
    response = client.delete(
        f"{settings.API_V1_STR}/packages/{package.id}/holiday-types/{holiday_type.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify in database
    db_package_holiday_type = db.query(PackageHolidayType).filter(
        PackageHolidayType.package_id == package.id,
        PackageHolidayType.holiday_type_id == holiday_type.id
    ).first()
    assert db_package_holiday_type is None
