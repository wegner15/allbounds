#!/bin/bash
# Quick fix to add BATCH_SIZE constant at the top of the SearchService class

cd /home/nashon/Work/MyCode/allbounds/backend

# Add a class-level constant for batch size
sed -i '/class SearchService:/a\    """Service for handling search functionality using Meilisearch."""\n    \n    BATCH_SIZE = 100  # Number of records to process at once\n    BATCH_SIZE_LARGE_TEXT = 50  # Smaller batch for entities with large text fields' app/services/search.py

echo "Added BATCH_SIZE constants to SearchService class"
echo ""
echo "CRITICAL: The .all() calls still need to be manually replaced with batched queries."
echo "Each index_* method should use:"
echo "  - offset/limit pattern"
echo "  - db.expunge_all() after each batch"
echo "  - accumulate success status"
echo ""
echo "Example pattern:"
echo "  offset = 0"
echo "  success = True"
echo "  while True:"
echo "      items = db.query(Model).filter(...).offset(offset).limit(BATCH_SIZE).all()"
echo "      if not items: break"
echo "      # process items..."
echo "      offset += BATCH_SIZE"
echo "      db.expunge_all()"
echo "  return success"
