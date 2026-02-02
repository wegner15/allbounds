#!/usr/bin/env python3
"""
Script to fix NULL boolean fields in the database.
This updates all NULL values for is_featured and is_active fields to their default values.
"""

import sys
from pathlib import Path

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.db.database import engine


def fix_null_booleans():
    """Update NULL boolean fields to their default values."""
    
    updates = [
        # Activities
        ("activities", "is_featured", False),
        ("activities", "is_active", True),
        
        # Packages
        ("packages", "is_featured", False),
        ("packages", "is_active", True),
        ("packages", "is_published", False),
        ("packages", "is_deal", False),
        
        # Group Trips
        ("group_trips", "is_featured", False),
        ("group_trips", "is_active", True),
        
        # Hotels
        ("hotels", "is_featured", False),
        ("hotels", "is_active", True),
        
        # Blog Posts
        ("blog_posts", "is_featured", False),
        ("blog_posts", "is_active", True),
        ("blog_posts", "is_published", False),
        
        # Attractions
        ("attractions", "is_active", True),
        
        # Accommodations
        ("accommodations", "is_active", True),
        
        # Inclusions
        ("inclusions", "is_active", True),
        
        # Exclusions
        ("exclusions", "is_active", True),
        
        # Media Assets
        ("media_assets", "is_active", True),
        
        # Regions
        ("regions", "is_active", True),
        
        # Countries
        ("countries", "is_active", True),
        
        # Holiday Types
        ("holiday_types", "is_active", True),
        
        # Hotel Types
        ("hotel_types", "is_active", True),
        
        # Group Trip Departures
        ("group_trip_departures", "is_active", True),
        
        # Reviews
        ("reviews", "is_featured", False),
        ("reviews", "is_approved", False),
    ]
    
    with engine.connect() as conn:
        for table, column, default_value in updates:
            try:
                # Check if column exists and has NULL values
                check_query = text(f"""
                    SELECT COUNT(*) 
                    FROM {table} 
                    WHERE {column} IS NULL
                """)
                result = conn.execute(check_query)
                null_count = result.scalar()
                
                if null_count > 0:
                    # Update NULL values
                    update_query = text(f"""
                        UPDATE {table} 
                        SET {column} = :default_value 
                        WHERE {column} IS NULL
                    """)
                    conn.execute(update_query, {"default_value": default_value})
                    conn.commit()
                    print(f"✓ Updated {null_count} NULL values in {table}.{column} to {default_value}")
                else:
                    print(f"✓ No NULL values found in {table}.{column}")
                    
            except Exception as e:
                print(f"✗ Error updating {table}.{column}: {e}")
                conn.rollback()
    
    print("\n✓ Database boolean fields fixed successfully!")


if __name__ == "__main__":
    print("Fixing NULL boolean fields in the database...\n")
    fix_null_booleans()
