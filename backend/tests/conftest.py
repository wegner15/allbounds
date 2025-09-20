import os
import pytest
from typing import Dict, Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.core.config import settings

# Create a test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create a test engine
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Create a test session
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """
    Create a fresh database for each test.
    """
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for the test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        
    # Drop the database tables
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db: Session) -> Generator[TestClient, None, None]:
    """
    Create a test client with a database session.
    """
    def override_get_db():
        try:
            yield db
        finally:
            pass
    
    # Override the get_db dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create a test client
    with TestClient(app) as client:
        yield client
    
    # Clear the dependency overrides
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(client: TestClient, db: Session) -> Dict[str, str]:
    """
    Create a test user and return the user data.
    """
    from app.models.user import User
    from app.auth.security import get_password_hash
    
    # Create a test user
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("password"),
        first_name="Test",
        last_name="User",
        is_active=True,
        is_superuser=False,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

@pytest.fixture(scope="function")
def test_superuser(client: TestClient, db: Session) -> Dict[str, str]:
    """
    Create a test superuser and return the user data.
    """
    from app.models.user import User
    from app.auth.security import get_password_hash
    
    # Create a test superuser
    user = User(
        email="admin@example.com",
        hashed_password=get_password_hash("password"),
        first_name="Admin",
        last_name="User",
        is_active=True,
        is_superuser=True,
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

@pytest.fixture(scope="function")
def token_headers(client: TestClient, test_user: Dict[str, str]) -> Dict[str, str]:
    """
    Create a token for the test user and return the headers.
    """
    # Login to get the token
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": test_user["email"],
            "password": "password",
        },
    )
    
    # Get the token from the response
    tokens = response.json()
    access_token = tokens["access_token"]
    
    # Return the headers with the token
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture(scope="function")
def superuser_token_headers(client: TestClient, test_superuser: Dict[str, str]) -> Dict[str, str]:
    """
    Create a token for the test superuser and return the headers.
    """
    # Login to get the token
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        data={
            "username": test_superuser["email"],
            "password": "password",
        },
    )
    
    # Get the token from the response
    tokens = response.json()
    access_token = tokens["access_token"]
    
    # Return the headers with the token
    return {"Authorization": f"Bearer {access_token}"}
