"""
Cloudflare Images service for interacting with the Cloudflare Images API.
"""
import json
import logging
import requests
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta

from app.core.cloudflare_config import cloudflare_settings

logger = logging.getLogger(__name__)


class CloudflareImagesService:
    """
    Service for interacting with Cloudflare Images API.
    """
    
    def __init__(self):
        self.account_id = cloudflare_settings.account_id
        self.api_token = cloudflare_settings.api_token
        self.api_base_url = cloudflare_settings.api_base_url
        self.delivery_url = cloudflare_settings.delivery_url
        self.default_variants = cloudflare_settings.default_variants
        self.require_signed_urls = cloudflare_settings.require_signed_urls
        self.signing_key = cloudflare_settings.signing_key
        
        # Headers used for API requests
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     files: Optional[Dict] = None, params: Optional[Dict] = None) -> Dict:
        """
        Make a request to the Cloudflare Images API.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            data: Request data
            files: Files to upload
            params: Query parameters
            
        Returns:
            API response as dictionary
        """
        url = f"{self.api_base_url}/accounts/{self.account_id}/{endpoint}"
        
        headers = self.headers.copy()
        
        # If uploading files, don't set Content-Type header
        if files:
            headers.pop("Content-Type", None)
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data if data and not files else None,
                data=data if files and data else None,
                files=files,
                params=params
            )
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to Cloudflare Images API: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response: {e.response.text}")
            raise
    
    def upload_image(self, file_data: bytes, file_name: str, 
                    require_signed_urls: bool = None, metadata: Optional[Dict] = None) -> Dict:
        """
        Upload an image to Cloudflare Images.
        
        Args:
            file_data: Image file data as bytes
            file_name: Name of the file
            require_signed_urls: Whether to require signed URLs for this image
            metadata: Optional metadata to attach to the image
            
        Returns:
            Upload response with image details
        """
        endpoint = "images/v1"
        
        # Set default value for require_signed_urls if not provided
        if require_signed_urls is None:
            require_signed_urls = self.require_signed_urls
        
        # Prepare form data
        form_data = {
            "requireSignedURLs": "true" if require_signed_urls else "false"
        }
        
        # Add metadata if provided
        if metadata:
            form_data["metadata"] = json.dumps(metadata)
        
        # Prepare files
        files = {
            "file": (file_name, file_data)
        }
        
        return self._make_request("POST", endpoint, data=form_data, files=files)
    
    def get_direct_upload_url(self, require_signed_urls: bool = None, 
                             metadata: Optional[Dict] = None, 
                             expiry: Optional[datetime] = None) -> Dict:
        """
        Get a one-time upload URL for direct creator uploads.
        
        Args:
            require_signed_urls: Whether to require signed URLs for this image
            metadata: Optional metadata to attach to the image
            expiry: Optional expiry time for the upload URL
            
        Returns:
            Response with upload URL and image ID
        """
        endpoint = "images/v2/direct_upload"
        
        # Set default value for require_signed_urls if not provided
        if require_signed_urls is None:
            require_signed_urls = self.require_signed_urls
        
        # Prepare data
        data = {
            "requireSignedURLs": require_signed_urls
        }
        
        # Add metadata if provided
        if metadata:
            data["metadata"] = metadata
        
        # Add expiry if provided (must be between 2 minutes and 6 hours in the future)
        if expiry:
            # Ensure expiry is within allowed range
            now = datetime.utcnow()
            min_expiry = now + timedelta(minutes=2)
            max_expiry = now + timedelta(hours=6)
            
            if expiry < min_expiry:
                expiry = min_expiry
            elif expiry > max_expiry:
                expiry = max_expiry
                
            data["expiry"] = expiry.strftime("%Y-%m-%dT%H:%M:%SZ")
        
        return self._make_request("POST", endpoint, data=data)
    
    def get_image(self, image_id: str) -> Dict:
        """
        Get details of a specific image.
        
        Args:
            image_id: ID of the image
            
        Returns:
            Image details
        """
        endpoint = f"images/v1/{image_id}"
        return self._make_request("GET", endpoint)
    
    def list_images(self, page: int = 1, per_page: int = 100) -> Dict:
        """
        List images in the Cloudflare Images account.
        
        Args:
            page: Page number
            per_page: Number of images per page
            
        Returns:
            List of images
        """
        endpoint = "images/v1"
        params = {
            "page": page,
            "per_page": per_page
        }
        return self._make_request("GET", endpoint, params=params)
    
    def delete_image(self, image_id: str) -> Dict:
        """
        Delete an image from Cloudflare Images.
        
        Args:
            image_id: ID of the image to delete
            
        Returns:
            Deletion response
        """
        endpoint = f"images/v1/{image_id}"
        return self._make_request("DELETE", endpoint)
    
    def create_variant(self, variant_id: str, options: Dict, 
                      never_require_signed_urls: bool = False) -> Dict:
        """
        Create a new image variant.
        
        Args:
            variant_id: ID for the variant
            options: Variant options (width, height, fit, metadata)
            never_require_signed_urls: Whether to always allow public access
            
        Returns:
            Variant creation response
        """
        endpoint = "images/v1/variants"
        data = {
            "id": variant_id,
            "options": options,
            "neverRequireSignedURLs": never_require_signed_urls
        }
        return self._make_request("POST", endpoint, data=data)
    
    def list_variants(self) -> Dict:
        """
        List all image variants.
        
        Returns:
            List of variants
        """
        endpoint = "images/v1/variants"
        return self._make_request("GET", endpoint)
    
    def delete_variant(self, variant_id: str) -> Dict:
        """
        Delete an image variant.
        
        Args:
            variant_id: ID of the variant to delete
            
        Returns:
            Deletion response
        """
        endpoint = f"images/v1/variants/{variant_id}"
        return self._make_request("DELETE", endpoint)
    
    def generate_signed_url(self, image_id: str, variant_name: str, 
                           expiry: Optional[datetime] = None) -> str:
        """
        Generate a signed URL for a private image.
        
        Args:
            image_id: ID of the image
            variant_name: Name of the variant
            expiry: Optional expiry time for the signed URL
            
        Returns:
            Signed URL for the image
        """
        import time
        import hashlib
        import hmac
        import base64
        
        # Default expiry is 1 hour from now
        if not expiry:
            expiry = datetime.utcnow() + timedelta(hours=1)
        
        # Convert expiry to timestamp
        expiry_timestamp = int(expiry.timestamp())
        
        # Create the URL without signature
        url = f"{self.delivery_url}/{image_id}/{variant_name}"
        
        # Create the signature
        signature_payload = f"{image_id}/{variant_name}{expiry_timestamp}"
        signature = hmac.new(
            self.signing_key.encode(),
            signature_payload.encode(),
            hashlib.sha256
        ).digest()
        
        # Base64 encode the signature
        encoded_signature = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        
        # Return the signed URL
        return f"{url}?exp={expiry_timestamp}&sig={encoded_signature}"


# Create a singleton instance
cloudflare_images_service = CloudflareImagesService()
