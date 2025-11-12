#!/usr/bin/env python3
"""
Script to index all existing data to Meilisearch.
Run this once to populate the search indexes with existing database data.
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all models first to ensure they're registered
from app.models.region import Region
from app.models.country import Country
from app.models.activity import Activity
from app.models.attraction import Attraction
from app.models.accommodation import Accommodation
from app.models.hotel import Hotel
from app.models.package import Package
from app.models.group_trip import GroupTrip
from app.models.blog import BlogPost
from app.models.hotel_type import HotelType
from app.models.inclusion_exclusion import Inclusion, Exclusion

from app.db.database import SessionLocal
from app.services.search import search_service

def main():
    """Index all data to Meilisearch."""
    print("Starting Meilisearch indexing...")
    
    # Initialize indexes with settings
    print("\n1. Initializing indexes...")
    if search_service.initialize_indexes():
        print("✓ Indexes initialized successfully")
    else:
        print("✗ Failed to initialize some indexes")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Index all entities
        print("\n2. Indexing all entities...")
        results = search_service.index_all(db)
        
        print("\nIndexing Results:")
        print("-" * 50)
        for index_name, success in results.items():
            status = "✓" if success else "✗"
            print(f"{status} {index_name}: {'Success' if success else 'Failed'}")
        
        print("\n" + "=" * 50)
        successful = sum(1 for s in results.values() if s)
        total = len(results)
        print(f"Completed: {successful}/{total} indexes successful")
        
        if successful == total:
            print("\n✓ All data indexed successfully!")
            return 0
        else:
            print("\n⚠ Some indexes failed. Check logs for details.")
            return 1
            
    except Exception as e:
        print(f"\n✗ Error during indexing: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
