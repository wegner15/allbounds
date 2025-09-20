import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.region import Region

def test_create_region(client: TestClient, db: Session, superuser_token_headers):
    """Test create region endpoint."""
    region_data = {
        "name": "Test Region",
        "description": "This is a test region",
        "slug": "test-region"
    }
    response = client.post(
        f"{settings.API_V1_STR}/regions/",
        headers=superuser_token_headers,
        json=region_data,
    )
    created_region = response.json()
    assert response.status_code == 200
    assert created_region["name"] == region_data["name"]
    assert created_region["description"] == region_data["description"]
    assert created_region["slug"] == region_data["slug"]
    assert "id" in created_region

def test_read_regions(client: TestClient, db: Session):
    """Test read regions endpoint."""
    # Create test regions
    region1 = Region(name="Region 1", description="Description 1", slug="region-1")
    region2 = Region(name="Region 2", description="Description 2", slug="region-2")
    db.add(region1)
    db.add(region2)
    db.commit()
    
    response = client.get(f"{settings.API_V1_STR}/regions/")
    regions = response.json()
    assert response.status_code == 200
    assert len(regions) == 2
    assert regions[0]["name"] == "Region 1"
    assert regions[1]["name"] == "Region 2"

def test_read_region(client: TestClient, db: Session):
    """Test read region endpoint."""
    # Create test region
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    response = client.get(f"{settings.API_V1_STR}/regions/{region.id}")
    fetched_region = response.json()
    assert response.status_code == 200
    assert fetched_region["name"] == region.name
    assert fetched_region["description"] == region.description
    assert fetched_region["slug"] == region.slug
    assert fetched_region["id"] == region.id

def test_read_region_by_slug(client: TestClient, db: Session):
    """Test read region by slug endpoint."""
    # Create test region
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    response = client.get(f"{settings.API_V1_STR}/regions/slug/{region.slug}")
    fetched_region = response.json()
    assert response.status_code == 200
    assert fetched_region["name"] == region.name
    assert fetched_region["description"] == region.description
    assert fetched_region["slug"] == region.slug
    assert fetched_region["id"] == region.id

def test_update_region(client: TestClient, db: Session, superuser_token_headers):
    """Test update region endpoint."""
    # Create test region
    region = Region(name="Original Name", description="Original Description", slug="original-slug")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    update_data = {
        "name": "Updated Name",
        "description": "Updated Description"
    }
    
    response = client.put(
        f"{settings.API_V1_STR}/regions/{region.id}",
        headers=superuser_token_headers,
        json=update_data,
    )
    updated_region = response.json()
    assert response.status_code == 200
    assert updated_region["name"] == update_data["name"]
    assert updated_region["description"] == update_data["description"]
    assert updated_region["id"] == region.id
    # Slug should remain unchanged
    assert updated_region["slug"] == region.slug

def test_delete_region(client: TestClient, db: Session, superuser_token_headers):
    """Test delete region endpoint."""
    # Create test region
    region = Region(name="Test Region", description="Test Description", slug="test-region")
    db.add(region)
    db.commit()
    db.refresh(region)
    
    response = client.delete(
        f"{settings.API_V1_STR}/regions/{region.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    
    # Verify region is deleted (soft delete)
    db_region = db.query(Region).filter(Region.id == region.id).first()
    assert db_region is not None
    assert db_region.is_active is False
