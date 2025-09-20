#!/usr/bin/env python3
"""
Migration script to upload existing images to Cloudflare Images and update database records.

This script:
1. Fetches all entities with image_url fields
2. Downloads each image
3. Uploads it to Cloudflare Images
4. Updates the database record with the new image_id
5. Generates a report of the migration

Usage:
    python migrate_images_to_cloudflare.py [--dry-run]
"""

import argparse
import asyncio
import logging
import os
import sys
import time
from typing import Dict, List, Optional, Tuple
import urllib.request
from urllib.parse import urlparse

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.services.cloudflare_images import cloudflare_images_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('image_migration.log')
    ]
)
logger = logging.getLogger("image_migration")

# Tables and columns to migrate
TABLES_TO_MIGRATE = {
    "regions": ["id", "name", "image_url"],
    "countries": ["id", "name", "image_url"],
    "holiday_types": ["id", "name", "image_url"],
    "packages": ["id", "name", "image_url"],
    "group_trips": ["id", "name", "image_url"],
    "accommodations": ["id", "name", "image_url"],
    "attractions": ["id", "name", "image_url"],
    "activities": ["id", "name", "image_url"],
}

# Statistics
stats = {
    "total": 0,
    "success": 0,
    "failed": 0,
    "skipped": 0,
}

async def download_image(url: str, timeout: int = 10) -> Optional[bytes]:
    """
    Download an image from a URL.
    
    Args:
        url: The URL of the image to download
        timeout: Timeout in seconds
        
    Returns:
        The image data as bytes, or None if the download failed
    """
    try:
        # Skip invalid URLs
        if not url or not url.startswith(('http://', 'https://')):
            return None
            
        # Get the image data
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return response.read()
    except Exception as e:
        logger.error(f"Failed to download image from {url}: {e}")
        return None

async def process_table(table_name: str, columns: List[str], db: Session, dry_run: bool = False) -> Dict:
    """
    Process a table, uploading images to Cloudflare and updating records.
    
    Args:
        table_name: Name of the table to process
        columns: List of columns to select (id, name, image_url)
        db: Database session
        dry_run: If True, don't actually update the database
        
    Returns:
        Dictionary with statistics for this table
    """
    table_stats = {
        "total": 0,
        "success": 0,
        "failed": 0,
        "skipped": 0,
    }
    
    # Get all records with image_url
    query = text(f"SELECT {', '.join(columns)} FROM {table_name} WHERE image_url IS NOT NULL AND image_url != ''")
    result = db.execute(query)
    
    for row in result:
        row_dict = dict(zip(columns, row))
        table_stats["total"] += 1
        stats["total"] += 1
        
        id = row_dict["id"]
        name = row_dict["name"]
        image_url = row_dict["image_url"]
        
        logger.info(f"Processing {table_name} {id} ({name}): {image_url}")
        
        # Download the image
        image_data = await download_image(image_url)
        if not image_data:
            logger.warning(f"Skipping {table_name} {id}: Could not download image")
            table_stats["skipped"] += 1
            stats["skipped"] += 1
            continue
            
        # Get filename from URL
        parsed_url = urlparse(image_url)
        filename = os.path.basename(parsed_url.path)
        if not filename:
            filename = f"{table_name}_{id}.jpg"
            
        # Upload to Cloudflare Images
        try:
            if not dry_run:
                # Add metadata to help with organization
                metadata = {
                    "source": "migration",
                    "entity_type": table_name,
                    "entity_id": id,
                    "original_url": image_url
                }
                
                response = cloudflare_images_service.upload_image(
                    file_data=image_data,
                    file_name=filename,
                    metadata=metadata
                )
                
                # Get the image ID
                image_id = response.get("result", {}).get("id")
                
                if image_id:
                    # Update the database
                    update_query = text(f"UPDATE {table_name} SET image_id = :image_id WHERE id = :id")
                    db.execute(update_query, {"image_id": image_id, "id": id})
                    
                    logger.info(f"Updated {table_name} {id} with image_id {image_id}")
                    table_stats["success"] += 1
                    stats["success"] += 1
                else:
                    logger.error(f"Failed to get image_id for {table_name} {id}")
                    table_stats["failed"] += 1
                    stats["failed"] += 1
            else:
                # Dry run - just log what would happen
                logger.info(f"[DRY RUN] Would upload image for {table_name} {id}")
                table_stats["success"] += 1
                stats["success"] += 1
                
        except Exception as e:
            logger.error(f"Error uploading image for {table_name} {id}: {e}")
            table_stats["failed"] += 1
            stats["failed"] += 1
            
        # Add a small delay to avoid rate limiting
        await asyncio.sleep(0.5)
        
    return table_stats

async def main(dry_run: bool = False):
    """
    Main function to run the migration.
    
    Args:
        dry_run: If True, don't actually update the database
    """
    start_time = time.time()
    logger.info(f"Starting image migration {'(DRY RUN)' if dry_run else ''}")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Process each table
        table_results = {}
        for table_name, columns in TABLES_TO_MIGRATE.items():
            logger.info(f"Processing table {table_name}")
            table_stats = await process_table(table_name, columns, db, dry_run)
            table_results[table_name] = table_stats
            
            if not dry_run:
                db.commit()
                
        # Print summary
        logger.info("Migration complete!")
        logger.info(f"Total time: {time.time() - start_time:.2f} seconds")
        logger.info(f"Total records: {stats['total']}")
        logger.info(f"Successful: {stats['success']}")
        logger.info(f"Failed: {stats['failed']}")
        logger.info(f"Skipped: {stats['skipped']}")
        
        # Print table details
        for table_name, table_stats in table_results.items():
            logger.info(f"{table_name}: {table_stats['success']} successful, {table_stats['failed']} failed, {table_stats['skipped']} skipped")
            
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        if not dry_run:
            db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate images to Cloudflare Images")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually update the database")
    args = parser.parse_args()
    
    asyncio.run(main(args.dry_run))
