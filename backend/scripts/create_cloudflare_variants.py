#!/usr/bin/env python3
"""
Script to create Cloudflare Images variants.
"""
import sys
import os
import logging
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.cloudflare_images import cloudflare_images_service

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_variants():
    """Create standard image variants in Cloudflare Images."""
    variants = [
        {
            "id": "public",
            "options": {
                "metadata": "keep"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "thumbnail",
            "options": {
                "width": 200,
                "height": 200,
                "fit": "cover",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "medium",
            "options": {
                "width": 800,
                "height": 600,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        },
        {
            "id": "large",
            "options": {
                "width": 1200,
                "height": 900,
                "fit": "scale-down",
                "metadata": "none"
            },
            "never_require_signed_urls": True
        }
    ]

    for variant in variants:
        try:
            logger.info(f"Creating variant: {variant['id']}")
            response = cloudflare_images_service.create_variant(
                variant_id=variant["id"],
                options=variant["options"],
                never_require_signed_urls=variant["never_require_signed_urls"]
            )
            if response.get("success"):
                logger.info(f"Successfully created variant: {variant['id']}")
            else:
                errors = response.get("errors", [])
                if errors and errors[0].get("code") == 10007:  # Variant already exists
                    logger.info(f"Variant {variant['id']} already exists")
                else:
                    logger.error(f"Failed to create variant {variant['id']}: {errors}")
        except Exception as e:
            logger.error(f"Error creating variant {variant['id']}: {e}")

if __name__ == "__main__":
    create_variants()
    logger.info("Variant creation process completed")
