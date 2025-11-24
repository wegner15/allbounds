"""
Cache decorator for FastAPI endpoints.
"""

import json
import hashlib
from functools import wraps
from typing import Callable, Optional
from fastapi import Request
from app.core.cache import get_cache, set_cache
import logging

logger = logging.getLogger(__name__)


def cache_response(ttl: int = 300, key_prefix: Optional[str] = None):
    """
    Decorator to cache FastAPI endpoint responses in Redis.
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Optional prefix for cache key (default: endpoint path)
    
    Usage:
        @router.get("/packages/")
        @cache_response(ttl=300)
        def get_packages(...):
            return packages
    """
    def decorator(func: Callable):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            # Extract request from kwargs if present
            request = kwargs.get('request') or next((arg for arg in args if isinstance(arg, Request)), None)
            
            # Generate cache key from endpoint path and query params
            if request:
                path = request.url.path
                query = str(sorted(request.query_params.items()))
            else:
                # Fallback: use function name and kwargs
                path = func.__name__
                query = str(sorted(kwargs.items()))
            
            # Create unique cache key
            cache_key_base = key_prefix or path
            cache_key_hash = hashlib.md5(query.encode()).hexdigest()[:8]
            cache_key = f"cache:{cache_key_base}:{cache_key_hash}"
            
            # Try to get from cache
            cached_data = get_cache(cache_key)
            if cached_data is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_data
            
            # Cache miss - call the function
            logger.debug(f"Cache MISS: {cache_key}")
            result = await func(*args, **kwargs)
            
            # Store in cache
            set_cache(cache_key, result, ttl=ttl)
            
            return result
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Extract request from kwargs if present
            request = kwargs.get('request') or next((arg for arg in args if isinstance(arg, Request)), None)
            
            # Generate cache key from endpoint path and query params
            if request:
                path = request.url.path
                query = str(sorted(request.query_params.items()))
            else:
                # Fallback: use function name and kwargs
                path = func.__name__
                query = str(sorted(kwargs.items()))
            
            # Create unique cache key
            cache_key_base = key_prefix or path
            cache_key_hash = hashlib.md5(query.encode()).hexdigest()[:8]
            cache_key = f"cache:{cache_key_base}:{cache_key_hash}"
            
            # Try to get from cache
            cached_data = get_cache(cache_key)
            if cached_data is not None:
                logger.debug(f"Cache HIT: {cache_key}")
                return cached_data
            
            # Cache miss - call the function
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)
            
            # Store in cache
            set_cache(cache_key, result, ttl=ttl)
            
            return result
        
        # Return appropriate wrapper based on function type
        import inspect
        if inspect.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator


def invalidate_cache(pattern: str):
    """
    Invalidate cache entries matching a pattern.
    
    Args:
        pattern: Redis key pattern (e.g., "cache:/api/v1/packages/*")
    
    Usage:
        # After creating/updating a package
        invalidate_cache("cache:/api/v1/packages/*")
    """
    from app.core.cache import redis_client
    
    if not redis_client:
        return
    
    try:
        # Find all keys matching pattern
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
            logger.info(f"Invalidated {len(keys)} cache entries matching: {pattern}")
    except Exception as e:
        logger.error(f"Error invalidating cache: {e}")
