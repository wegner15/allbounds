#!/usr/bin/env python3
"""
Script to check and fix blog post cover_image_id fields.
This script helps identify blog posts that may need image IDs populated.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.models.all_models  # noqa: F401

from app.db.database import SessionLocal
from app.models.blog import BlogPost

def main():
    """Check blog post cover_image_id fields."""
    print("Checking blog post cover_image_id fields...")
    
    db = SessionLocal()
    
    try:
        # Get all blog posts
        blog_posts = db.query(BlogPost).all()
        
        print(f"\nTotal blog posts: {len(blog_posts)}")
        print("=" * 60)
        
        with_image = 0
        without_image = 0
        
        for post in blog_posts:
            if post.cover_image_id:
                print(f"✓ {post.title}: Has cover_image_id ({post.cover_image_id})")
                with_image += 1
            else:
                print(f"⚠ {post.title}: No cover_image_id")
                without_image += 1
        
        print("\n" + "=" * 60)
        print(f"Blog posts with cover_image_id: {with_image}")
        print(f"Blog posts without cover_image_id: {without_image}")
        
        if without_image > 0:
            print("\nNote: Blog posts without cover_image_id will not show images in search results.")
            print("You can set cover_image_id via the API or admin panel.")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())
