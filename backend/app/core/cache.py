"""
Redis caching utilities.
"""

import json
import logging
from typing import Optional, Any
from functools import wraps
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Redis client
try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    # Test connection
    redis_client.ping()
    logger.info(f"Redis connected successfully: {settings.REDIS_URL}")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}. Caching will be disabled.")
    redis_client = None


def get_cache(key: str) -> Optional[Any]:
    """
    Get value from cache.
    
    Args:
        key: Cache key
        
    Returns:
        Cached value or None if not found or error
    """
    if not redis_client:
        return None
        
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.error(f"Error getting cache key {key}: {e}")
        return None


def set_cache(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """
    Set value in cache.
    
    Args:
        key: Cache key
        value: Value to cache (must be JSON serializable)
        ttl: Time to live in seconds (default from settings)
        
    Returns:
        True if successful, False otherwise
    """
    if not redis_client:
        return False
        
    try:
        ttl = ttl or settings.REDIS_CACHE_TTL
        redis_client.setex(
            key,
            ttl,
            json.dumps(value, default=str)
        )
        return True
    except Exception as e:
        logger.error(f"Error setting cache key {key}: {e}")
        return False


def delete_cache(key: str) -> bool:
    """
    Delete value from cache.
    
    Args:
        key: Cache key
        
    Returns:
        True if successful, False otherwise
    """
    if not redis_client:
        return False
        
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Error deleting cache key {key}: {e}")
        return False


def delete_pattern(pattern: str) -> int:
    """
    Delete all keys matching a pattern.
    
    Args:
        pattern: Pattern to match (e.g., "packages:*")
        
    Returns:
        Number of keys deleted
    """
    if not redis_client:
        return 0
        
    try:
        keys = redis_client.keys(pattern)
        if keys:
            return redis_client.delete(*keys)
        return 0
    except Exception as e:
        logger.error(f"Error deleting cache pattern {pattern}: {e}")
        return 0


def cache_response(key_prefix: str, ttl: Optional[int] = None):
    """
    Decorator to cache function responses.
    
    Args:
        key_prefix: Prefix for cache key
        ttl: Time to live in seconds
        
    Example:
        @cache_response("packages", ttl=300)
        def get_packages():
            return db.query(Package).all()
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{key_prefix}:{func.__name__}"
            if args:
                cache_key += f":{':'.join(str(arg) for arg in args)}"
            if kwargs:
                cache_key += f":{':'.join(f'{k}={v}' for k, v in sorted(kwargs.items()))}"
            
            # Try to get from cache
            cached_value = get_cache(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            # Execute function
            logger.debug(f"Cache miss: {cache_key}")
            result = func(*args, **kwargs)
            
            # Cache the result
            set_cache(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator


def invalidate_cache(key_prefix: str):
    """
    Decorator to invalidate cache after function execution.
    
    Args:
        key_prefix: Prefix pattern to invalidate (e.g., "packages:*")
        
    Example:
        @invalidate_cache("packages:*")
        def create_package(package_data):
            return db.add(Package(**package_data))
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            # Invalidate cache after successful execution
            deleted = delete_pattern(key_prefix)
            if deleted > 0:
                logger.info(f"Invalidated {deleted} cache keys matching {key_prefix}")
            return result
        return wrapper
    return decorator


def get_redis_info() -> dict:
    """
    Get Redis server information.
    
    Returns:
        Dictionary with Redis info or error message
    """
    if not redis_client:
        return {"status": "disconnected", "error": "Redis client not initialized"}
    
    try:
        info = redis_client.info()
        return {
            "status": "connected",
            "version": info.get("redis_version"),
            "used_memory": info.get("used_memory_human"),
            "connected_clients": info.get("connected_clients"),
            "total_commands_processed": info.get("total_commands_processed"),
            "keyspace": redis_client.info("keyspace"),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
