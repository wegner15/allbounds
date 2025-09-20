import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.search.meilisearch import meilisearch_client
from app.services.search import search_service

def test_search_endpoint(client: TestClient, db: Session):
    """Test search endpoint."""
    # Mock the search service to return test results
    with patch('app.services.search.search_service.search') as mock_search:
        # Set up mock return value
        mock_search.return_value = {
            "regions": {
                "hits": [
                    {"id": 1, "name": "Europe", "description": "European continent"}
                ],
                "processing_time_ms": 5,
                "query": "europe",
                "limit": 20,
                "offset": 0,
                "estimated_total_hits": 1
            },
            "countries": {
                "hits": [
                    {"id": 1, "name": "France", "description": "Country in Europe", "region_id": 1}
                ],
                "processing_time_ms": 3,
                "query": "europe",
                "limit": 20,
                "offset": 0,
                "estimated_total_hits": 1
            }
        }
        
        # Make request to search endpoint
        response = client.post(
            f"{settings.API_V1_STR}/search/",
            json={"query": "europe"}
        )
        
        # Verify response
        assert response.status_code == 200
        results = response.json()
        assert "results" in results
        assert "regions" in results["results"]
        assert "countries" in results["results"]
        assert len(results["results"]["regions"]["hits"]) == 1
        assert len(results["results"]["countries"]["hits"]) == 1
        assert results["results"]["regions"]["hits"][0]["name"] == "Europe"
        assert results["results"]["countries"]["hits"][0]["name"] == "France"
        
        # Verify search service was called with correct parameters
        mock_search.assert_called_once_with("europe", None, 20, 0, None, None)

def test_search_with_index(client: TestClient, db: Session):
    """Test search endpoint with specific index."""
    # Mock the search service to return test results
    with patch('app.services.search.search_service.search') as mock_search:
        # Set up mock return value
        mock_search.return_value = {
            "hits": [
                {"id": 1, "name": "France", "description": "Country in Europe", "region_id": 1}
            ],
            "processing_time_ms": 3,
            "query": "france",
            "limit": 20,
            "offset": 0,
            "estimated_total_hits": 1
        }
        
        # Make request to search endpoint
        response = client.post(
            f"{settings.API_V1_STR}/search/",
            json={"query": "france", "index": "countries"}
        )
        
        # Verify response
        assert response.status_code == 200
        results = response.json()
        assert "results" in results
        assert "countries" in results["results"]
        assert len(results["results"]["countries"]["hits"]) == 1
        assert results["results"]["countries"]["hits"][0]["name"] == "France"
        
        # Verify search service was called with correct parameters
        mock_search.assert_called_once_with("france", "countries", 20, 0, None, None)

def test_search_with_filters(client: TestClient, db: Session):
    """Test search endpoint with filters."""
    # Mock the search service to return test results
    with patch('app.services.search.search_service.search') as mock_search:
        # Set up mock return value
        mock_search.return_value = {
            "hits": [
                {"id": 1, "name": "Beach Resort", "stars": 5, "country_id": 1}
            ],
            "processing_time_ms": 4,
            "query": "resort",
            "limit": 10,
            "offset": 0,
            "estimated_total_hits": 1
        }
        
        # Make request to search endpoint
        response = client.post(
            f"{settings.API_V1_STR}/search/",
            json={
                "query": "resort", 
                "index": "accommodations", 
                "limit": 10,
                "filter": "stars = 5"
            }
        )
        
        # Verify response
        assert response.status_code == 200
        results = response.json()
        assert "results" in results
        assert "accommodations" in results["results"]
        assert len(results["results"]["accommodations"]["hits"]) == 1
        assert results["results"]["accommodations"]["hits"][0]["name"] == "Beach Resort"
        assert results["results"]["accommodations"]["hits"][0]["stars"] == 5
        
        # Verify search service was called with correct parameters
        mock_search.assert_called_once_with("resort", "accommodations", 10, 0, "stars = 5", None)

@pytest.mark.admin
def test_initialize_indexes(client: TestClient, db: Session, superuser_token_headers):
    """Test initialize indexes endpoint."""
    # Mock the search service to return success
    with patch('app.services.search.search_service.initialize_indexes') as mock_initialize:
        # Set up mock return value
        mock_initialize.return_value = True
        
        # Make request to initialize indexes endpoint
        response = client.post(
            f"{settings.API_V1_STR}/search/initialize",
            headers=superuser_token_headers
        )
        
        # Verify response
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["message"] == "All search indexes initialized successfully"
        
        # Verify initialize_indexes was called
        mock_initialize.assert_called_once()

@pytest.mark.admin
def test_index_all(client: TestClient, db: Session, superuser_token_headers):
    """Test index all endpoint."""
    # Mock the search service to return success
    with patch('app.services.search.search_service.index_all') as mock_index_all:
        # Set up mock return value
        mock_index_all.return_value = {
            "regions": True,
            "countries": True,
            "attractions": True,
            "accommodations": True,
            "packages": True,
            "group_trips": True
        }
        
        # Make request to index all endpoint
        response = client.post(
            f"{settings.API_V1_STR}/search/index-all",
            headers=superuser_token_headers
        )
        
        # Verify response
        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert result["message"] == "Indexing started in the background"

def test_health_check(client: TestClient):
    """Test health check endpoint."""
    # Mock the meilisearch client to return healthy status
    with patch('app.search.meilisearch.meilisearch_client.health_check') as mock_health_check:
        # Set up mock return value
        mock_health_check.return_value = True
        
        # Make request to health check endpoint
        response = client.get(f"{settings.API_V1_STR}/search/health")
        
        # Verify response
        assert response.status_code == 200
        result = response.json()
        assert result["healthy"] is True
        
        # Verify health_check was called
        mock_health_check.assert_called_once()
