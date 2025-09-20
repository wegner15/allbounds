from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.security import verify_password, get_password_hash, create_access_token, create_refresh_token

class AuthService:
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user with email and password.
        
        Args:
            db: Database session
            email: User email
            password: User password
            
        Returns:
            The authenticated user or None if authentication fails
        """
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Create a new user.
        
        Args:
            db: Database session
            user_in: User creation data
            
        Returns:
            The created user
        """
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            is_active=user_in.is_active,
            is_superuser=user_in.is_superuser,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_last_login(self, db: Session, user: User) -> User:
        """
        Update the last login timestamp for a user.
        
        Args:
            db: Database session
            user: The user to update
            
        Returns:
            The updated user
        """
        user.last_login = datetime.utcnow()
        db.commit()
        db.refresh(user)
        return user
    
    def generate_tokens(self, user_id: int) -> dict:
        """
        Generate access and refresh tokens for a user.
        
        Args:
            user_id: The user ID
            
        Returns:
            A dictionary containing the access and refresh tokens
        """
        return {
            "access_token": create_access_token(user_id),
            "refresh_token": create_refresh_token(user_id),
            "token_type": "bearer",
        }

auth_service = AuthService()
