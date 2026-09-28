#!/usr/bin/env python3
"""
Seed Roles Script for AllBounds.

Ensures default roles ('admin', 'finance') exist in the database.
Can also optionally assign a role to a user by email.

Usage:
    # Inside docker:
    docker compose exec api python scripts/seed_roles.py

    # Assign finance role to a user:
    docker compose exec api python scripts/seed_roles.py --email finance@allboundtravel.com --role finance

    # On host (with local DB or production DATABASE_URL):
    python3 scripts/seed_roles.py
"""

import os
import sys
import argparse
from sqlalchemy import create_engine, text


def get_database_url() -> str:
    """Resolve database URL from environment or common defaults."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    
    # Try importing settings from app
    try:
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from app.core.config import settings
        if settings.DATABASE_URL:
            return settings.DATABASE_URL
    except Exception:
        pass
    
    # Default to docker network DB host
    return "postgresql://allbounds:allbounds@db:5432/allbounds"


def seed_roles(email: str = None, role_to_assign: str = None):
    db_url = get_database_url()
    print(f"Connecting to database...")

    try:
        engine = create_engine(db_url)
    except Exception as e:
        print(f"Error creating engine for {db_url}: {e}")
        # Try localhost if db host fails
        if "@db:" in db_url:
            fallback_url = db_url.replace("@db:", "@localhost:")
            print(f"Retrying connection with localhost: {fallback_url}")
            engine = create_engine(fallback_url)
        else:
            raise

    with engine.begin() as conn:
        print("Ensuring 'roles' table exists...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """))

        print("Ensuring 'user_roles' table exists...")
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_roles (
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
                PRIMARY KEY (user_id, role_id)
            );
        """))

        print("Seeding default roles ('admin', 'finance')...")
        conn.execute(text("""
            INSERT INTO roles (name, description, created_at, updated_at)
            VALUES 
                ('admin', 'System Administrator with full access', NOW(), NOW()),
                ('finance', 'Finance staff — access to finance, invoicing, billing, and reports', NOW(), NOW())
            ON CONFLICT (name) DO UPDATE 
            SET description = EXCLUDED.description,
                updated_at = NOW();
        """))

        # Optional user assignment
        if email and role_to_assign:
            print(f"Assigning role '{role_to_assign}' to user '{email}'...")
            result = conn.execute(text("""
                INSERT INTO user_roles (user_id, role_id)
                SELECT u.id, r.id
                FROM users u, roles r
                WHERE u.email = :email AND r.name = :role
                ON CONFLICT DO NOTHING;
            """), {"email": email, "role": role_to_assign})
            
            if result.rowcount > 0:
                print(f"Successfully assigned role '{role_to_assign}' to {email}")
            else:
                # Check if user exists
                user_check = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email}).fetchone()
                if not user_check:
                    print(f"Warning: User with email '{email}' not found.")
                else:
                    print(f"Role '{role_to_assign}' was already assigned to {email}.")

        # Display all current roles
        print("\nCurrent roles in database:")
        roles = conn.execute(text("SELECT id, name, description FROM roles ORDER BY id")).fetchall()
        for r in roles:
            print(f" - [{r[0]}] {r[1]}: {r[2]}")

    print("\nRole seeding completed successfully!")


def main():
    parser = argparse.ArgumentParser(description="Seed roles in the database for AllBounds")
    parser.add_argument("--email", help="Optional user email to assign a role to")
    parser.add_argument("--role", default="finance", help="Role name to assign (default: 'finance')")
    args = parser.parse_args()

    seed_roles(email=args.email, role_to_assign=args.role if args.email else None)


if __name__ == "__main__":
    main()
