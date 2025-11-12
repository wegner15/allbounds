#!/usr/bin/env python3
"""
Script to update existing Meilisearch indexes with new fields.
Uses update_documents to merge new fields without deleting existing data.
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all models first to ensure they're registered
import app.models.all_models  # noqa: F401

from app.db.database import SessionLocal
from app.services.search import search_service

def main():
    """Update existing Meilisearch indexes with new fields."""
    print("Starting Meilisearch update with new fields...")
    print("(This will merge new fields into existing documents)")
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Index all entities - this will use add_documents which updates existing docs
        print("\nUpdating all entities with new fields...")
        results = search_service.index_all(db)
        
        print("\nUpdate Results:")
        print("-" * 50)
        for index_name, success in results.items():
            status = "✓" if success else "✗"
            print(f"{status} {index_name}: {'Success' if success else 'Failed'}")
        
        print("\n" + "=" * 50)
        successful = sum(1 for s in results.values() if s)
        total = len(results)
        print(f"Completed: {successful}/{total} indexes successful")
        
        if successful == total:
            print("\n✓ All data updated successfully with new fields!")
            return 0
        else:
            print("\n⚠ Some indexes failed. Check logs for details.")
            return 1
            
    except Exception as e:
        print(f"\n✗ Error during update: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
