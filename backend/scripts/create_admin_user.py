#!/usr/bin/env python3
"""
Script to create an admin user for AllBounds
"""
import sys
import os

# Add the parent directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.user import User
from app.auth.security import get_password_hash
from app.services.auth import auth_service
from app.schemas.user import UserCreate

def create_superuser(
    email: str,
    password: str,
    first_name: str,
    last_name: str
) -> User:
    """
    Create a superuser with the given details
    """
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User with email {email} already exists")
            return user
        
        # Create user with superuser privileges
        user_in = UserCreate(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
            is_superuser=True
        )
        
        # Create the user directly without going through the API endpoint
        # which would disable the is_superuser flag
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            first_name=user_in.first_name,
            last_name=user_in.last_name,
            is_active=user_in.is_active,
            is_superuser=True,  # Ensure this is set to True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        print(f"Superuser {email} created successfully")
        return db_user
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Create an admin user for AllBounds")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--first-name", required=True, help="Admin first name")
    parser.add_argument("--last-name", required=True, help="Admin last name")
    
    args = parser.parse_args()
    
    create_superuser(
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name
    )
