#!/usr/bin/env python3
"""
Quick script to check blog post data in database and Meilisearch
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.models.all_models  # noqa: F401
from app.db.database import SessionLocal
from app.models.blog import BlogPost
from app.search.meilisearch import meilisearch_client

def main():
    db = SessionLocal()
    
    try:
        # Check database
        print("=" * 60)
        print("BLOG POSTS IN DATABASE:")
        print("=" * 60)
        blog_posts = db.query(BlogPost).filter(BlogPost.is_active == True).limit(5).all()
        
        for post in blog_posts:
            print(f"\nID: {post.id}")
            print(f"Title: {post.title}")
            print(f"cover_image_id: {post.cover_image_id}")
            print(f"Slug: {post.slug}")
        
        # Check Meilisearch
        print("\n" + "=" * 60)
        print("BLOG POSTS IN MEILISEARCH:")
        print("=" * 60)
        
        if meilisearch_client.is_configured():
            index = meilisearch_client.get_index('blog_posts')
            if index:
                # Get first few documents
                results = index.get_documents({'limit': 5})
                for doc in results.results:
                    # Convert Document object to dict
                    doc_dict = doc.__dict__
                    print(f"\nID: {doc_dict.get('id')}")
                    print(f"Title: {doc_dict.get('title')}")
                    print(f"cover_image_id: {doc_dict.get('cover_image_id')}")
                    print(f"Slug: {doc_dict.get('slug')}")
            else:
                print("Could not get blog_posts index")
        else:
            print("Meilisearch not configured")
            
    finally:
        db.close()

if __name__ == "__main__":
    main()
