# EXAMPLE: Fixed index_packages() method with batching
# Copy this pattern to all 11 index_* methods in app/services/search.py

def index_packages(self, db: Session) -> bool:
    """
    Index all active packages in batches to prevent OOM errors.
    
    Args:
        db: Database session
        
    Returns:
        bool: True if packages were indexed successfully, False otherwise
    """
    BATCH_SIZE = 50  # Smaller batch for packages due to large text fields
    offset = 0
    success = True
    
    while True:
        # Fetch batch using offset/limit instead of .all()
        packages = db.query(Package).filter(Package.is_active == True).offset(offset).limit(BATCH_SIZE).all()
        
        if not packages:
            break  # No more records
        
        documents = []
        for package in packages:
            # Format inclusion and exclusion items for search
            inclusion_items_text = ""
            if package.inclusion_items:
                inclusion_items_text = ", ".join([inc.name for inc in package.inclusion_items])
            
            exclusion_items_text = ""
            if package.exclusion_items:
                exclusion_items_text = ", ".join([exc.name for exc in package.exclusion_items])
            
            documents.append({
                'id': package.id,
                'name': package.name,
                'summary': package.summary,
                'description': package.description,
                'slug': package.slug,
                'country_id': package.country_id,
                'duration_days': package.duration_days,
                'price': package.price,
                'image_id': package.image_id,
                'itinerary': package.itinerary,
                'inclusions': package.inclusions,
                'exclusions': package.exclusions,
                'inclusion_items': inclusion_items_text,
                'exclusion_items': exclusion_items_text,
                'is_active': package.is_active,
                'is_featured': package.is_featured
            })
        
        # Submit batch to Meilisearch
        if not self.meilisearch_client.add_documents(self.PACKAGE_INDEX, documents):
            success = False
        
        # Move to next batch
        offset += BATCH_SIZE
        
        # CRITICAL: Free memory by expunging all objects from session
        db.expunge_all()
    
    return success


# Apply this same pattern to these methods:
# - index_regions() - use BATCH_SIZE = 100
# - index_countries() - use BATCH_SIZE = 100  
# - index_activities() - use BATCH_SIZE = 100
# - index_attractions() - use BATCH_SIZE = 100
# - index_accommodations() - use BATCH_SIZE = 100
# - index_packages() - use BATCH_SIZE = 50 (shown above)
# - index_group_trips() - use BATCH_SIZE = 50
# - index_blog_posts() - use BATCH_SIZE = 50
# - index_hotel_types() - use BATCH_SIZE = 100
# - index_inclusions() - use BATCH_SIZE = 100
# - index_exclusions() - use BATCH_SIZE = 100
