from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse
from app.services.auth import auth_service
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login timestamp
    auth_service.update_last_login(db, user)
    
    # Generate tokens
    tokens = auth_service.generate_tokens(user.id)
    return tokens

@router.post("/refresh", response_model=Token)
def refresh_token(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
) -> Any:
    """
    Refresh access token.
    """
    tokens = auth_service.generate_tokens(current_user.id)
    return tokens

@router.post("/register", response_model=UserResponse)
def register(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system",
        )
    
    # For security, don't allow setting is_superuser from API
    if user_in.is_superuser:
        user_in.is_superuser = False
        
    user = auth_service.create_user(db, user_in)
    return user
