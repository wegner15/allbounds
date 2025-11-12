#!/usr/bin/env python3
"""
Script to manually index all packages into Meilisearch.
Run this from the backend directory: python index_packages.py
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.services.search import search_service

def main():
    """Index all packages into Meilisearch."""
    print("Starting package indexing...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Initialize indexes first
        print("Initializing search indexes...")
        if search_service.initialize_indexes():
            print("✓ Search indexes initialized successfully")
        else:
            print("✗ Failed to initialize some search indexes")
        
        # Index packages
        print("\nIndexing packages...")
        if search_service.index_packages(db):
            print("✓ Packages indexed successfully")
        else:
            print("✗ Failed to index packages")
        
        # Index other entities for complete search functionality
        print("\nIndexing other entities...")
        results = {
            "Countries": search_service.index_countries(db),
            "Regions": search_service.index_regions(db),
            "Activities": search_service.index_activities(db),
            "Attractions": search_service.index_attractions(db),
            "Accommodations": search_service.index_accommodations(db),
            "Group Trips": search_service.index_group_trips(db),
            "Blog Posts": search_service.index_blog_posts(db),
            "Hotel Types": search_service.index_hotel_types(db),
            "Inclusions": search_service.index_inclusions(db),
            "Exclusions": search_service.index_exclusions(db),
        }
        
        for entity, success in results.items():
            status = "✓" if success else "✗"
            print(f"{status} {entity}")
        
        print("\n✓ Indexing complete!")
        
    except Exception as e:
        print(f"\n✗ Error during indexing: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    main()
