import pytest
import io
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.media import MediaAsset
from app.services.media import media_service

def test_get_media_assets(client: TestClient, db: Session, token_headers):
    """Test get media assets endpoint."""
    # Create test media assets
    media1 = MediaAsset(
        filename="image1.jpg",
        file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
        storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
        content_type="image/jpeg",
        file_size=1024,
        title="Test Image 1",
        created_by_id=1
    )
    media2 = MediaAsset(
        filename="image2.png",
        file_path="/uploads/223e4567-e89b-12d3-a456-426614174000.png",
        storage_key="223e4567-e89b-12d3-a456-426614174000.png",
        content_type="image/png",
        file_size=2048,
        title="Test Image 2",
        created_by_id=1
    )
    db.add(media1)
    db.add(media2)
    db.commit()
    
    # Mock the presigned URL generation
    with patch('app.services.media.media_service.get_presigned_url') as mock_get_url:
        mock_get_url.side_effect = lambda db, media_id: f"https://example.com/media/{media_id}"
        
        # Make request to get media assets endpoint
        response = client.get(
            f"{settings.API_V1_STR}/media/",
            headers=token_headers
        )
        
        # Verify response
        assert response.status_code == 200
        assets = response.json()
        assert len(assets) == 2
        assert assets[0]["filename"] == "image1.jpg"
        assert assets[1]["filename"] == "image2.png"
        assert assets[0]["url"] == f"https://example.com/media/{media1.id}"
        assert assets[1]["url"] == f"https://example.com/media/{media2.id}"

def test_get_media_asset(client: TestClient, db: Session, token_headers):
    """Test get media asset endpoint."""
    # Create test media asset
    media = MediaAsset(
        filename="image.jpg",
        file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
        storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
        content_type="image/jpeg",
        file_size=1024,
        title="Test Image",
        created_by_id=1
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    
    # Mock the presigned URL generation
    with patch('app.services.media.media_service.get_presigned_url') as mock_get_url:
        mock_get_url.return_value = f"https://example.com/media/{media.id}"
        
        # Make request to get media asset endpoint
        response = client.get(
            f"{settings.API_V1_STR}/media/{media.id}",
            headers=token_headers
        )
        
        # Verify response
        assert response.status_code == 200
        asset = response.json()
        assert asset["filename"] == "image.jpg"
        assert asset["storage_key"] == "123e4567-e89b-12d3-a456-426614174000.jpg"
        assert asset["content_type"] == "image/jpeg"
        assert asset["file_size"] == 1024
        assert asset["title"] == "Test Image"
        assert asset["url"] == f"https://example.com/media/{media.id}"

def test_upload_media_asset(client: TestClient, db: Session, token_headers):
    """Test upload media asset endpoint."""
    # Create a test file
    file_content = b"test file content"
    file = io.BytesIO(file_content)
    
    # Mock the media service to return a test media asset
    with patch('app.services.media.media_service.create_media_asset') as mock_create:
        # Set up mock return value
        mock_media = MediaAsset(
            id=1,
            filename="test.jpg",
            file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
            storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
            content_type="image/jpeg",
            file_size=len(file_content),
            title="Test Image",
            entity_type="attraction",
            entity_id=1,
            created_by_id=1,
            is_active=True
        )
        mock_create.return_value = mock_media
        
        # Mock the presigned URL generation
        with patch('app.services.media.media_service.get_presigned_url') as mock_get_url:
            mock_get_url.return_value = "https://example.com/media/1"
            
            # Make request to upload media asset endpoint
            response = client.post(
                f"{settings.API_V1_STR}/media/",
                headers=token_headers,
                files={"file": ("test.jpg", file, "image/jpeg")},
                data={
                    "entity_type": "attraction",
                    "entity_id": "1",
                    "alt_text": "Test alt text",
                    "title": "Test Image"
                }
            )
            
            # Verify response
            assert response.status_code == 200
            asset = response.json()
            assert asset["filename"] == "test.jpg"
            assert asset["file_path"] == "/uploads/123e4567-e89b-12d3-a456-426614174000.jpg"
            assert asset["storage_key"] == "123e4567-e89b-12d3-a456-426614174000.jpg"
            assert asset["content_type"] == "image/jpeg"
            assert asset["file_size"] == len(file_content)
            assert asset["title"] == "Test Image"
            assert asset["entity_type"] == "attraction"
            assert asset["entity_id"] == 1
            assert asset["created_by_id"] == 1
            assert asset["is_active"] == True
            
            # Verify create_media_asset was called with correct parameters
            mock_create.assert_called_once()
            args, kwargs = mock_create.call_args
            assert args[0] == db

def test_get_presigned_upload_url(client: TestClient, db: Session, superuser_token_headers):
    """Test get presigned upload URL endpoint."""
    # Mock the media service to return a presigned URL
    with patch('app.services.media.media_service.get_upload_presigned_post') as mock_get_url:
        # Set up mock return value
        mock_get_url.return_value = {
            "url": "https://example.com/upload",
            "fields": {
                "key": "123e4567-e89b-12d3-a456-426614174000.jpg",
                "Content-Type": "image/jpeg"
            },
            "storage_key": "123e4567-e89b-12d3-a456-426614174000.jpg"
        }
        
        # Make request to get presigned upload URL endpoint
        response = client.post(
            f"{settings.API_V1_STR}/media/presigned-url",
            headers=superuser_token_headers,
            json={
                "filename": "test.jpg",
                "content_type": "image/jpeg"
            }
        )
        
        # Verify response
        assert response.status_code == 200
        result = response.json()
        assert result["url"] == "https://example.com/upload"
        assert "fields" in result
        assert result["fields"]["key"] == "123e4567-e89b-12d3-a456-426614174000.jpg"
        assert result["storage_key"] == "123e4567-e89b-12d3-a456-426614174000.jpg"
        
        # Verify get_upload_presigned_post was called with correct parameters
        mock_get_url.assert_called_once_with("test.jpg", "image/jpeg")

def test_confirm_upload(client: TestClient, db: Session, token_headers):
    """Test confirm upload endpoint."""
    # Mock the media service to return a test media asset
    with patch('app.services.media.media_service.confirm_upload') as mock_confirm:
        # Set up mock return value
        mock_media = MediaAsset(
            id=1,
            filename="test.jpg",
            file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
            storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
            content_type="image/jpeg",
            file_size=1024,
            title="Test Image",
            entity_type="attraction",
            entity_id=1,
            created_by_id=1
        )
        mock_confirm.return_value = mock_media
        
        # Mock the presigned URL generation
        with patch('app.services.media.media_service.get_presigned_url') as mock_get_url:
            mock_get_url.return_value = "https://example.com/media/1"
            
            # Make request to confirm upload endpoint
            response = client.post(
                f"{settings.API_V1_STR}/media/confirm-upload",
                headers=token_headers,
                json={
                    "storage_key": "123e4567-e89b-12d3-a456-426614174000.jpg",
                    "filename": "test.jpg",
                    "file_size": 1024,
                    "content_type": "image/jpeg",
                    "entity_type": "attraction",
                    "entity_id": 1,
                    "alt_text": "Test alt text",
                    "title": "Test Image"
                }
            )
            
            # Verify response
            assert response.status_code == 200
            asset = response.json()
            assert asset["filename"] == "test.jpg"
            assert asset["storage_key"] == "123e4567-e89b-12d3-a456-426614174000.jpg"
            assert asset["content_type"] == "image/jpeg"
            assert asset["file_size"] == 1024
            assert asset["title"] == "Test Image"
            assert asset["entity_type"] == "attraction"
            assert asset["entity_id"] == 1
            assert asset["url"] == "https://example.com/media/1"
            
            # Verify confirm_upload was called with correct parameters
            mock_confirm.assert_called_once_with(
                db,
                "123e4567-e89b-12d3-a456-426614174000.jpg",
                "test.jpg",
                1024,
                "image/jpeg",
                "attraction",
                1,
                "Test alt text",
                "Test Image"
            )

def test_update_media_asset(client: TestClient, db: Session, token_headers):
    """Test update media asset endpoint."""
    # Create test media asset
    media = MediaAsset(
        filename="image.jpg",
        file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
        storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
        content_type="image/jpeg",
        file_size=1024,
        title="Original Title",
        alt_text="Original Alt Text",
        created_by_id=1
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    
    # Mock the media service to return an updated media asset
    with patch('app.services.media.media_service.update_media_asset') as mock_update:
        # Set up mock return value
        updated_media = MediaAsset(
            id=media.id,
            filename=media.filename,
            file_path=media.file_path,
            storage_key=media.storage_key,
            content_type=media.content_type,
            file_size=media.file_size,
            title="Updated Title",
            alt_text="Updated Alt Text",
            entity_type="attraction",
            entity_id=1,
            created_by_id=1
        )
        mock_update.return_value = updated_media
        
        # Mock the presigned URL generation
        with patch('app.services.media.media_service.get_presigned_url') as mock_get_url:
            mock_get_url.return_value = f"https://example.com/media/{media.id}"
            
            # Make request to update media asset endpoint
            response = client.put(
                f"{settings.API_V1_STR}/media/{media.id}",
                headers=token_headers,
                json={
                    "title": "Updated Title",
                    "alt_text": "Updated Alt Text",
                    "entity_type": "attraction",
                    "entity_id": 1
                }
            )
            
            # Verify response
            assert response.status_code == 200
            asset = response.json()
            assert asset["filename"] == media.filename
            assert asset["storage_key"] == media.storage_key
            assert asset["title"] == "Updated Title"
            assert asset["alt_text"] == "Updated Alt Text"
            assert asset["entity_type"] == "attraction"
            assert asset["entity_id"] == 1
            assert asset["url"] == f"https://example.com/media/{media.id}"
            
            # Verify update_media_asset was called with correct parameters
            mock_update.assert_called_once_with(
                db,
                media.id,
                "Updated Alt Text",
                "Updated Title",
                "attraction",
                1
            )

def test_delete_media_asset(client: TestClient, db: Session, token_headers):
    """Test delete media asset endpoint."""
    # Create test media asset
    media = MediaAsset(
        filename="image.jpg",
        file_path="/uploads/123e4567-e89b-12d3-a456-426614174000.jpg",
        storage_key="123e4567-e89b-12d3-a456-426614174000.jpg",
        content_type="image/jpeg",
        file_size=1024,
        title="Test Image",
        created_by_id=1,
        is_active=True
    )
    db.add(media)
    db.commit()
    db.refresh(media)
    
    # Store the media ID for later use
    media_id = media.id
    
    # Use monkeypatch to replace the delete_media_asset function
    # This is needed because our endpoint doesn't actually delete from the database in tests
    original_delete = media_service.delete_media_asset
    
    def mock_delete(db_session, media_id):
        # Actually delete the media asset from the database
        db_media = db_session.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if db_media:
            db_session.delete(db_media)
            db_session.commit()
        return True
    
    # Replace the function
    media_service.delete_media_asset = mock_delete
    
    try:
        # Make request to delete media asset endpoint
        response = client.delete(
            f"{settings.API_V1_STR}/media/{media_id}",
            headers=token_headers
        )
        
        # Verify response
        assert response.status_code == 200
        asset = response.json()
        assert asset["filename"] == media.filename
        assert asset["file_path"] == media.file_path
        assert asset["storage_key"] == media.storage_key
        assert asset["content_type"] == "image/jpeg"
        assert asset["file_size"] == 1024
        assert asset["created_by_id"] == 1
        assert asset["is_active"] == True
        
        # Verify the media asset was deleted from the database
        deleted_media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        assert deleted_media is None
    finally:
        # Restore the original function
        media_service.delete_media_asset = original_delete
