#!/bin/bash
# Script to run database migrations in Docker

echo "Running database migrations..."
cd /home/nashon/MyCode/allbounds/backend
alembic upgrade head

echo "Migrations completed successfully!"
