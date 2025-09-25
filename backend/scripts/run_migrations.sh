#!/bin/bash
# Script to run database migrations in Docker

echo "Running database migrations..."

# Generate new migration if there are model changes
echo "Checking for model changes..."
alembic revision --autogenerate -m "Auto-generated migration"

# Apply all migrations
echo "Applying migrations..."
alembic upgrade head

echo "Migrations completed successfully!"
