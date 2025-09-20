#!/usr/bin/env python3
"""
Script to create Cloudflare Images variants directly using the Cloudflare API.
This script can be run inside the Docker container.
"""
import os
import json
import requests
import logging
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get Cloudflare credentials from environment variables
CLOUDFLARE_ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
CLOUDFLARE_API_TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN")

# API base URL
API_BASE_URL = "https://api.cloudflare.com/client/v4"

def create_variant(variant_id: str, options: Dict[str, Any], never_require_signed_urls: bool = True) -> Dict[str, Any]:
    """
    Create a Cloudflare Images variant.
    
    Args:
        variant_id: ID for the variant
        options: Variant options (width, height, fit, metadata)
        never_require_signed_urls: Whether to always allow public access
        
    Returns:
        API response as dictionary
    """
    url = f"{API_BASE_URL}/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1/variants"
    
    headers = {
        "Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {
        "id": variant_id,
        "options": options,
        "neverRequireSignedURLs": never_require_signed_urls
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 400:
            # Check if variant already exists (code 10007)
            try:
                error_data = e.response.json()
                errors = error_data.get("errors", [])
                if errors and errors[0].get("code") == 10007:
                    logger.info(f"Variant {variant_id} already exists")
                    return {"success": True, "result": {"id": variant_id, "options": options}}
            except:
                pass
        logger.error(f"HTTP error creating variant {variant_id}: {e}")
        return {"success": False, "errors": [{"message": str(e)}]}
    except Exception as e:
        logger.error(f"Error creating variant {variant_id}: {e}")
        return {"success": False, "errors": [{"message": str(e)}]}

def create_default_variants() -> List[Dict[str, Any]]:
    """
    Create default image variants in Cloudflare Images.
    
    Returns:
        List of created variants
    """
    if not CLOUDFLARE_ACCOUNT_ID or not CLOUDFLARE_API_TOKEN:
        logger.error("Cloudflare credentials not found in environment variables")
        return []
    
    variants = [
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
    
    results = []
    
    for variant in variants:
        logger.info(f"Creating variant: {variant['id']}")
        response = create_variant(
            variant_id=variant["id"],
            options=variant["options"],
            never_require_signed_urls=variant["never_require_signed_urls"]
        )
        
        if response.get("success"):
            logger.info(f"Successfully created variant: {variant['id']}")
            results.append(response.get("result", {}))
        else:
            errors = response.get("errors", [])
            logger.error(f"Failed to create variant {variant['id']}: {errors}")
    
    return results

if __name__ == "__main__":
    logger.info("Creating Cloudflare Images variants...")
    results = create_default_variants()
    logger.info(f"Created {len(results)} variants")
    for result in results:
        logger.info(f"Variant: {result.get('id')}")
    logger.info("Variant creation process completed")
