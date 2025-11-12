#!/usr/bin/env python3
"""
Script to check blog_posts index settings in Meilisearch
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.search.meilisearch import meilisearch_client

def main():
    print("Checking blog_posts index settings...")
    
    if not meilisearch_client.is_configured():
        print("✗ Meilisearch is not configured")
        return 1
    
    try:
        index = meilisearch_client.get_index('blog_posts')
        if not index:
            print("✗ Could not get blog_posts index")
            return 1
        
        # Get index settings
        settings = index.get_settings()
        
        print("\n" + "=" * 60)
        print("BLOG_POSTS INDEX SETTINGS:")
        print("=" * 60)
        print(f"\nDisplayed Attributes: {settings.get('displayedAttributes')}")
        print(f"\nSearchable Attributes: {settings.get('searchableAttributes')}")
        print(f"\nFilterable Attributes: {settings.get('filterableAttributes')}")
        print(f"\nSortable Attributes: {settings.get('sortableAttributes')}")
        
        # Check if cover_image_id is in displayedAttributes
        displayed = settings.get('displayedAttributes', [])
        if 'cover_image_id' in displayed or displayed == ['*']:
            print("\n✓ cover_image_id is in displayedAttributes")
        else:
            print("\n✗ cover_image_id is NOT in displayedAttributes")
            print("   This is why it's not showing in search results!")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
