import boto3
import logging
from botocore.exceptions import ClientError
from typing import Optional, Dict, Any, BinaryIO, List, Tuple
from datetime import datetime, timedelta
from urllib.parse import urljoin

from app.core.config import settings

logger = logging.getLogger(__name__)

class CloudflareR2:
    """
    Cloudflare R2 storage client for handling media assets.
    """
    
    def __init__(self):
        """
        Initialize the Cloudflare R2 client using settings.
        """
        self.endpoint = settings.R2_ENDPOINT
        self.access_key = settings.R2_ACCESS_KEY
        self.secret_key = settings.R2_SECRET_KEY
        self.bucket_name = settings.R2_BUCKET_NAME
        
        # Initialize the S3 client (R2 uses S3-compatible API)
        self.client = None
        if self.endpoint and self.access_key and self.secret_key:
            self.client = boto3.client(
                's3',
                endpoint_url=self.endpoint,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name='auto'  # Cloudflare R2 uses 'auto' as region
            )
    
    def is_configured(self) -> bool:
        """
        Check if R2 is properly configured.
        
        Returns:
            bool: True if R2 is configured, False otherwise
        """
        return self.client is not None
    
    def upload_file(self, file_obj: BinaryIO, object_name: str, content_type: str) -> bool:
        """
        Upload a file to Cloudflare R2.
        
        Args:
            file_obj: File-like object to upload
            object_name: Name of the object in R2
            content_type: MIME type of the file
            
        Returns:
            bool: True if file was uploaded successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("R2 is not configured")
            return False
        
        try:
            self.client.upload_fileobj(
                file_obj,
                self.bucket_name,
                object_name,
                ExtraArgs={
                    'ContentType': content_type,
                    'CacheControl': 'max-age=31536000'  # Cache for 1 year
                }
            )
            return True
        except ClientError as e:
            logger.error(f"Error uploading file to R2: {e}")
            return False
    
    def delete_file(self, object_name: str) -> bool:
        """
        Delete a file from Cloudflare R2.
        
        Args:
            object_name: Name of the object in R2
            
        Returns:
            bool: True if file was deleted successfully, False otherwise
        """
        if not self.is_configured():
            logger.error("R2 is not configured")
            return False
        
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=object_name
            )
            return True
        except ClientError as e:
            logger.error(f"Error deleting file from R2: {e}")
            return False
    
    def generate_presigned_url(self, object_name: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for accessing a file.
        
        Args:
            object_name: Name of the object in R2
            expiration: Time in seconds for the URL to remain valid
            
        Returns:
            str: Presigned URL or None if an error occurred
        """
        if not self.is_configured():
            logger.error("R2 is not configured")
            return None
        
        try:
            url = self.client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_name
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return None
    
    def generate_presigned_post(self, object_name: str, expiration: int = 3600, 
                               conditions: Optional[List] = None, 
                               fields: Optional[Dict[str, str]] = None) -> Optional[Dict[str, Any]]:
        """
        Generate a presigned POST request for client-side uploads.
        
        Args:
            object_name: Name of the object in R2
            expiration: Time in seconds for the URL to remain valid
            conditions: List of conditions for the upload
            fields: Dictionary of fields to include in the form
            
        Returns:
            dict: Presigned POST data or None if an error occurred
        """
        if not self.is_configured():
            logger.error("R2 is not configured")
            return None
        
        try:
            if conditions is None:
                conditions = []
            
            if fields is None:
                fields = {}
            
            response = self.client.generate_presigned_post(
                self.bucket_name,
                object_name,
                Fields=fields,
                Conditions=conditions,
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logger.error(f"Error generating presigned POST: {e}")
            return None
    
    def list_files(self, prefix: str = "", max_keys: int = 1000) -> List[Dict[str, Any]]:
        """
        List files in the R2 bucket with a given prefix.
        
        Args:
            prefix: Prefix to filter objects
            max_keys: Maximum number of keys to return
            
        Returns:
            list: List of file metadata dictionaries
        """
        if not self.is_configured():
            logger.error("R2 is not configured")
            return []
        
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )
            
            if 'Contents' not in response:
                return []
            
            return [
                {
                    'key': obj['Key'],
                    'size': obj['Size'],
                    'last_modified': obj['LastModified'],
                    'etag': obj['ETag'].strip('"')
                }
                for obj in response['Contents']
            ]
        except ClientError as e:
            logger.error(f"Error listing files in R2: {e}")
            return []

# Create a singleton instance
r2_client = CloudflareR2()
