import hashlib
import json
from typing import Any, Dict, Optional, Union
from fastapi import Request, Response
from datetime import datetime, timedelta

def generate_etag(data: Any) -> str:
    """
    Generate an ETag for the given data.
    
    Args:
        data: Data to generate ETag for
        
    Returns:
        ETag string
    """
    # Convert data to JSON string
    if isinstance(data, dict) or isinstance(data, list):
        data_str = json.dumps(data, sort_keys=True)
    else:
        data_str = str(data)
    
    # Generate MD5 hash
    return hashlib.md5(data_str.encode()).hexdigest()

def set_cache_headers(response: Response, etag: str, max_age: int = 3600) -> None:
    """
    Set cache headers on the response.
    
    Args:
        response: FastAPI response object
        etag: ETag value
        max_age: Cache max age in seconds
    """
    response.headers["ETag"] = f'"{etag}"'
    response.headers["Cache-Control"] = f"max-age={max_age}"

def check_if_modified(request: Request, etag: str) -> bool:
    """
    Check if the resource has been modified based on the If-None-Match header.
    
    Args:
        request: FastAPI request object
        etag: Current ETag value
        
    Returns:
        True if the resource has been modified, False otherwise
    """
    if_none_match = request.headers.get("If-None-Match")
    if if_none_match:
        # Remove quotes from ETag
        if_none_match = if_none_match.strip('"')
        return if_none_match != etag
    return True

class CacheControl:
    """
    Cache control decorator for FastAPI endpoints.
    """
    
    def __init__(self, max_age: int = 3600):
        """
        Initialize the cache control decorator.
        
        Args:
            max_age: Cache max age in seconds
        """
        self.max_age = max_age
    
    def __call__(self, func):
        """
        Decorator function.
        
        Args:
            func: Function to decorate
            
        Returns:
            Decorated function
        """
        async def wrapper(*args, **kwargs):
            # Get request object from kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                for _, arg in kwargs.items():
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            # If no request object found, just call the function
            if not request:
                return await func(*args, **kwargs)
            
            # Get response from function
            response = await func(*args, **kwargs)
            
            # Generate ETag for response
            etag = generate_etag(response)
            
            # Check if resource has been modified
            if not check_if_modified(request, etag):
                # Return 304 Not Modified
                return Response(status_code=304)
            
            # Set cache headers
            set_cache_headers(response, etag, self.max_age)
            
            return response
        
        return wrapper
