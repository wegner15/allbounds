#!/usr/bin/env python3
"""
Quick script to check attraction data in database and Meilisearch
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.models.all_models  # noqa: F401
from app.db.database import SessionLocal
from app.models.attraction import Attraction
from app.search.meilisearch import meilisearch_client

def main():
    db = SessionLocal()
    
    try:
        # Check database
        print("=" * 60)
        print("ATTRACTIONS IN DATABASE:")
        print("=" * 60)
        attractions = db.query(Attraction).filter(Attraction.is_active == True).limit(5).all()
        
        for attr in attractions:
            print(f"\nID: {attr.id}")
            print(f"Name: {attr.name}")
            print(f"image_id: {attr.image_id}")
            print(f"cover_image: {attr.cover_image}")
        
        # Check Meilisearch
        print("\n" + "=" * 60)
        print("ATTRACTIONS IN MEILISEARCH:")
        print("=" * 60)
        
        if meilisearch_client.is_configured():
            index = meilisearch_client.get_index('attractions')
            if index:
                # Get first few documents
                results = index.get_documents({'limit': 5})
                for doc in results.results:
                    print(f"\nID: {doc.get('id')}")
                    print(f"Name: {doc.get('name')}")
                    print(f"image_id: {doc.get('image_id')}")
                    print(f"slug: {doc.get('slug')}")
            else:
                print("Could not get attractions index")
        else:
            print("Meilisearch not configured")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()
