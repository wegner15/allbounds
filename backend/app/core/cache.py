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

_redis_client = None

def get_redis_client():
    global _redis_client
    if _redis_client is not None:
        try:
            _redis_client.ping()
            return _redis_client
        except Exception:
            _redis_client = None

    try:
        client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3
        )
        client.ping()
        _redis_client = client
        logger.info(f"Redis connected successfully: {settings.REDIS_URL}")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Caching will be disabled.")
        return None

def __getattr__(name):
    if name == "redis_client":
        return get_redis_client()
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")


def get_cache(key: str) -> Optional[Any]:
    """
    Get value from cache.
    
    Args:
        key: Cache key
        
    Returns:
        Cached value or None if not found or error
    """
    client = get_redis_client()
    if not client:
        return None
        
    try:
        value = client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        logger.error(f"Error getting cache key {key}: {e}")
        return None


def set_cache(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """
    Set value in cache.
    """
    client = get_redis_client()
    if not client:
        return False
        
    try:
        ttl = ttl or settings.REDIS_CACHE_TTL
        client.setex(
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
    """
    client = get_redis_client()
    if not client:
        return False
        
    try:
        client.delete(key)
        return True
    except Exception as e:
        logger.error(f"Error deleting cache key {key}: {e}")
        return False


def delete_pattern(pattern: str) -> int:
    """
    Delete all keys matching a pattern.
    """
    client = get_redis_client()
    if not client:
        return 0
        
    try:
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
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
