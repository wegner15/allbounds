import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User
from app.auth.security import get_password_hash

def test_login(client: TestClient, test_user):
    """Test login endpoint."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": test_user["email"],
            "password": "password",
        },
    )
    tokens = response.json()
    assert response.status_code == 200
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"

def test_login_incorrect_password(client: TestClient, test_user):
    """Test login endpoint with incorrect password."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": test_user["email"],
            "password": "wrong_password",
        },
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_incorrect_email(client: TestClient):
    """Test login endpoint with incorrect email."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": "nonexistent@example.com",
            "password": "password",
        },
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_register(client: TestClient):
    """Test register endpoint."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json={
            "email": "new_user@example.com",
            "password": "password123",
            "first_name": "New",
            "last_name": "User",
        },
    )
    new_user = response.json()
    assert response.status_code == 200
    assert new_user["email"] == "new_user@example.com"
    assert new_user["first_name"] == "New"
    assert new_user["last_name"] == "User"
    assert new_user["is_active"] is True
    assert new_user["is_superuser"] is False

def test_register_existing_email(client: TestClient, test_user):
    """Test register endpoint with existing email."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/register",
        json={
            "email": test_user["email"],
            "password": "password123",
            "first_name": "Another",
            "last_name": "User",
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "The user with this email already exists in the system"

def test_refresh_token(client: TestClient, token_headers):
    """Test refresh token endpoint."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/refresh",
        headers=token_headers,
    )
    tokens = response.json()
    assert response.status_code == 200
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token_type"] == "bearer"
