#!/usr/bin/env python3
"""
Script to create a superuser directly in the database
"""
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def main(email: str, password: str, first_name: str, last_name: str):
    # Get database URL from environment or use default
    database_url = os.environ.get("DATABASE_URL", "postgresql://allbounds:allbounds@db:5432/allbounds")
    
    # Create database connection
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if user already exists
        query = text("SELECT id FROM users WHERE email = :email")
        result = db.execute(query, {"email": email})
        user = result.fetchone()
        
        if user:
            print(f"User with email {email} already exists")
            return
        
        # Create user with superuser privileges
        hashed_password = get_password_hash(password)
        now = datetime.datetime.utcnow()
        
        # Insert directly into the users table
        insert_query = text("""
            INSERT INTO users (
                email, hashed_password, first_name, last_name, 
                is_active, is_superuser, created_at, updated_at
            ) VALUES (
                :email, :hashed_password, :first_name, :last_name,
                TRUE, TRUE, :now, :now
            )
        """)
        
        db.execute(insert_query, {
            "email": email,
            "hashed_password": hashed_password,
            "first_name": first_name,
            "last_name": last_name,
            "now": now
        })
        
        db.commit()
        print(f"Superuser {email} created successfully")
    except Exception as e:
        print(f"Error creating superuser: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Create a superuser for AllBounds")
    parser.add_argument("--email", required=True, help="Admin email")
    parser.add_argument("--password", required=True, help="Admin password")
    parser.add_argument("--first-name", required=True, help="Admin first name")
    parser.add_argument("--last-name", required=True, help="Admin last name")
    
    args = parser.parse_args()
    
    main(
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name
    )
