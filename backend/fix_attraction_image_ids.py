#!/usr/bin/env python3
"""
Script to extract image_id from cover_image URLs and populate the image_id field.
"""

import sys
import os
import re

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.models.all_models  # noqa: F401

from app.db.database import SessionLocal
from app.models.attraction import Attraction

def extract_image_id_from_url(url: str) -> str:
    """
    Extract the image ID from a Cloudflare Images URL.
    Example: https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ/7508c42c-720d-423f-2308-1f352c33c900/medium
    Returns: 7508c42c-720d-423f-2308-1f352c33c900
    """
    if not url:
        return None
    
    # Pattern to match Cloudflare Images URL
    pattern = r'https://imagedelivery\.net/[^/]+/([^/]+)/'
    match = re.search(pattern, url)
    
    if match:
        return match.group(1)
    
    return None

def main():
    """Fix attraction image_id fields."""
    print("Fixing attraction image_id fields...")
    
    db = SessionLocal()
    
    try:
        # Get all attractions
        attractions = db.query(Attraction).all()
        
        updated_count = 0
        skipped_count = 0
        
        for attraction in attractions:
            # Skip if image_id is already set
            if attraction.image_id:
                print(f"✓ {attraction.name}: image_id already set ({attraction.image_id})")
                skipped_count += 1
                continue
            
            # Skip if no cover_image
            if not attraction.cover_image:
                print(f"⚠ {attraction.name}: No cover_image URL")
                skipped_count += 1
                continue
            
            # Extract image_id from cover_image URL
            image_id = extract_image_id_from_url(attraction.cover_image)
            
            if image_id:
                attraction.image_id = image_id
                print(f"✓ {attraction.name}: Set image_id to {image_id}")
                updated_count += 1
            else:
                print(f"✗ {attraction.name}: Could not extract image_id from {attraction.cover_image}")
        
        # Commit changes
        if updated_count > 0:
            db.commit()
            print(f"\n✓ Updated {updated_count} attractions")
        else:
            print(f"\n⚠ No attractions needed updating")
        
        print(f"Skipped: {skipped_count}")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
