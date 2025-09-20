import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import date

from app.core.config import settings
from app.models.group_trip import GroupTrip, GroupTripDeparture, group_trip_holiday_types
from app.models.holiday_type import HolidayType
from app.models.country import Country
from app.models.region import Region

def test_create_group_trip(client: TestClient, db: Session, superuser_token_headers):
    """Test create group trip endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    group_trip_data = {
        "name": "Test Group Trip",
        "summary": "A brief summary",
        "description": "This is a test group trip",
        "slug": "test-group-trip",
        "country_id": country.id,
        "duration_days": 10,
        "price": 2499.99,
        "itinerary": "Day 1: Arrival\nDay 2-9: Activities\nDay 10: Departure",
        "inclusions": "Accommodation, All Meals, Guide",
        "exclusions": "Flights, Travel Insurance"
    }
    response = client.post(
        f"{settings.API_V1_STR}/group-trips/",
        headers=superuser_token_headers,
        json=group_trip_data,
    )
    created_trip = response.json()
    assert response.status_code == 200
    assert created_trip["name"] == group_trip_data["name"]
    assert created_trip["summary"] == group_trip_data["summary"]
    assert created_trip["description"] == group_trip_data["description"]
    assert created_trip["slug"] == group_trip_data["slug"]
    assert created_trip["country_id"] == country.id
    assert created_trip["duration_days"] == group_trip_data["duration_days"]
    assert created_trip["price"] == group_trip_data["price"]
    assert "id" in created_trip

def test_read_group_trips(client: TestClient, db: Session):
    """Test read group trips endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test group trips
    trip1 = GroupTrip(
        name="Group Trip 1", 
        summary="Summary 1", 
        description="Description 1", 
        slug="group-trip-1", 
        country_id=country.id,
        duration_days=7,
        price=1499.99,
        itinerary="Day 1: Arrival\nDay 2-7: Activities",
        inclusions="Accommodation, Breakfast",
        exclusions="Flights"
    )
    trip2 = GroupTrip(
        name="Group Trip 2", 
        summary="Summary 2", 
        description="Description 2", 
        slug="group-trip-2", 
        country_id=country.id,
        duration_days=14,
        price=2999.99,
        itinerary="Day 1: Arrival\nDay 2-14: Activities",
        inclusions="Accommodation, All Meals",
        exclusions="Flights, Insurance"
    )
    db.add(trip1)
    db.add(trip2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/group-trips/")
    trips = response.json()
    assert response.status_code == 200
    assert len(trips) == 2
    assert trips[0]["name"] == "Group Trip 1"
    assert trips[1]["name"] == "Group Trip 2"

def test_read_group_trip(client: TestClient, db: Session):
    """Test read group trip endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test group trip
    trip = GroupTrip(
        name="Test Group Trip", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-group-trip", 
        country_id=country.id,
        duration_days=10,
        price=2499.99,
        itinerary="Day 1: Arrival\nDay 2-9: Activities\nDay 10: Departure",
        inclusions="Accommodation, All Meals, Guide",
        exclusions="Flights, Travel Insurance"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    response = client.get(f"{settings.API_V1_STR}/group-trips/{trip.id}")
    fetched_trip = response.json()
    assert response.status_code == 200
    assert fetched_trip["name"] == trip.name
    assert fetched_trip["summary"] == trip.summary
    assert fetched_trip["description"] == trip.description
    assert fetched_trip["slug"] == trip.slug
    assert fetched_trip["country_id"] == country.id
    assert fetched_trip["id"] == trip.id

def test_update_group_trip(client: TestClient, db: Session, superuser_token_headers):
    """Test update group trip endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test group trip
    trip = GroupTrip(
        name="Original Name", 
        summary="Original Summary", 
        description="Original Description", 
        slug="original-slug", 
        country_id=country.id,
        duration_days=7,
        price=1499.99,
        itinerary="Original Itinerary",
        inclusions="Original Inclusions",
        exclusions="Original Exclusions"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    update_data = {
        "name": "Updated Name",
        "summary": "Updated Summary",
        "description": "Updated Description",
        "duration_days": 12,
        "price": 2999.99,
        "itinerary": "Updated Itinerary",
        "inclusions": "Updated Inclusions",
        "exclusions": "Updated Exclusions"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/group-trips/{trip.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_trip = response.json()
    assert response.status_code == 200
    assert updated_trip["name"] == update_data["name"]
    assert updated_trip["summary"] == update_data["summary"]
    assert updated_trip["description"] == update_data["description"]
    assert updated_trip["duration_days"] == update_data["duration_days"]
    assert updated_trip["price"] == update_data["price"]
    assert updated_trip["itinerary"] == update_data["itinerary"]
    assert updated_trip["inclusions"] == update_data["inclusions"]
    assert updated_trip["exclusions"] == update_data["exclusions"]
    assert updated_trip["id"] == trip.id
    # Slug should remain unchanged
    assert updated_trip["slug"] == trip.slug
    # Country should remain unchanged
    assert updated_trip["country_id"] == country.id

def test_delete_group_trip(client: TestClient, db: Session, superuser_token_headers):
    """Test delete group trip endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test group trip
    trip = GroupTrip(
        name="Test Group Trip", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-group-trip", 
        country_id=country.id,
        duration_days=10,
        price=2499.99,
        itinerary="Day 1: Arrival\nDay 2-9: Activities\nDay 10: Departure",
        inclusions="Accommodation, All Meals, Guide",
        exclusions="Flights, Travel Insurance"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    response = client.delete(
        f"{settings.API_V1_STR}/group-trips/{trip.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify group trip is deleted (soft delete)
    db_trip = db.query(GroupTrip).filter(GroupTrip.id == trip.id).first()
    assert db_trip is not None
    assert db_trip.is_active is False

def test_create_departure(client: TestClient, db: Session, superuser_token_headers):
    """Test create departure endpoint."""
    # Create a region and country first
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    country = Country(name="Test Country", description="Test Description", slug="test-country", region_id=region.id)
    db.add(country)
    db.commit()
    db.refresh(country)
    
    # Create test group trip
    trip = GroupTrip(
        name="Test Group Trip", 
        summary="Test Summary", 
        description="Test Description", 
        slug="test-group-trip", 
        country_id=country.id,
        duration_days=10,
        price=2499.99,
        itinerary="Day 1: Arrival\nDay 2-9: Activities\nDay 10: Departure",
        inclusions="Accommodation, All Meals, Guide",
        exclusions="Flights, Travel Insurance"
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    
    departure_data = {
        "start_date": "2025-06-15",
        "end_date": "2025-06-25",
        "price": 2599.99,
        "available_slots": 20,
        "booked_slots": 0
    }
    
    response = client.post(
        f"{settings.API_V1_STR}/group-trips/{trip.id}/departures",
        headers=superuser_token_headers,
        json=departure_data,
    )
    created_departure = response.json()
    assert response.status_code == 200
    assert created_departure["start_date"] == departure_data["start_date"]
    assert created_departure["end_date"] == departure_data["end_date"]
    assert created_departure["price"] == departure_data["price"]
    assert created_departure["available_slots"] == departure_data["available_slots"]
    assert created_departure["booked_slots"] == departure_data["booked_slots"]
    assert created_departure["group_trip_id"] == trip.id
    assert "id" in created_departure
