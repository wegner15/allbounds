#!/usr/bin/env python3
"""
Script to update attraction index settings and re-index.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.models.all_models  # noqa: F401

from app.db.database import SessionLocal
from app.services.search import search_service

def main():
    print("Updating attraction index settings...")
    
    # Update the attraction index settings
    attraction_settings = {
        'searchableAttributes': ['name', 'summary', 'description'],
        'displayedAttributes': ['id', 'name', 'summary', 'description', 'slug', 'country_id', 'image_id'],
        'sortableAttributes': ['name'],
        'filterableAttributes': ['is_active', 'country_id']
    }
    
    if search_service.meilisearch_client.configure_index_settings('attractions', attraction_settings):
        print("✓ Attraction index settings updated")
    else:
        print("✗ Failed to update settings")
        return 1
    
    # Re-index attractions
    print("\nRe-indexing attractions...")
    db = SessionLocal()
    try:
        if search_service.index_attractions(db):
            print("✓ Attractions re-indexed successfully")
            return 0
        else:
            print("✗ Failed to re-index attractions")
            return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
