#!/usr/bin/env python3
"""
Script to update blog_posts index settings.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.search import search_service

def main():
    print("Updating blog_posts index settings...")
    
    # Get the blog_posts settings from the service
    blog_settings = search_service.INDEX_SETTINGS['blog_posts']
    
    print(f"\nSettings to apply:")
    print(f"  displayedAttributes: {blog_settings['displayedAttributes']}")
    
    # Update the blog_posts index settings
    if search_service.meilisearch_client.configure_index_settings('blog_posts', blog_settings):
        print("\n✓ Blog posts index settings updated successfully")
        print("\nThe cover_image_id field will now be returned in search results.")
        return 0
    else:
        print("\n✗ Failed to update blog posts index settings")
        return 1

if __name__ == "__main__":
    sys.exit(main())
