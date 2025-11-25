"""
Simple Redis caching for FastAPI responses.
Works by caching the serialized response data.
"""
import json
import hashlib
import logging
from typing import Optional, Any, Callable
from functools import wraps
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Redis client
try:
    redis_client = redis.from_url(
        settings.REDIS_URL,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )
    redis_client.ping()
    logger.info(f"Redis cache connected: {settings.REDIS_URL}")
except Exception as e:
    logger.warning(f"Redis cache disabled: {e}")
    redis_client = None


def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """Generate cache key from prefix and arguments."""
    # Create a string from all arguments
    key_parts = [str(arg) for arg in args]
    key_parts.extend([f"{k}={v}" for k, v in sorted(kwargs.items())])
    key_string = ":".join(key_parts)
    
    # Hash if too long
    if len(key_string) > 100:
        key_hash = hashlib.md5(key_string.encode()).hexdigest()[:12]
        return f"cache:{prefix}:{key_hash}"
    
    return f"cache:{prefix}:{key_string}" if key_string else f"cache:{prefix}"


def cache_endpoint(ttl: int = 300, key_prefix: Optional[str] = None):
    """
    Cache FastAPI endpoint responses in Redis.
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Optional prefix for cache key
        
    Usage:
        @router.get("/packages/")
        @cache_endpoint(ttl=300, key_prefix="packages_list")
        def get_packages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
            return package_service.get_packages(db, skip, limit)
    """
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Skip caching if Redis not available
            if not redis_client:
                return func(*args, **kwargs)
            
            # Extract only serializable arguments (skip db session, etc.)
            cache_args = {}
            for k, v in kwargs.items():
                if k not in ['db', 'request', 'current_user']:  # Skip non-serializable
                    if isinstance(v, (str, int, float, bool, type(None))):
                        cache_args[k] = v
            
            # Generate cache key
            prefix = key_prefix or func.__name__
            cache_key = get_cache_key(prefix, **cache_args)
            
            # Try to get from cache
            try:
                cached = redis_client.get(cache_key)
                if cached:
                    logger.debug(f"Cache HIT: {cache_key}")
                    return json.loads(cached)
            except Exception as e:
                logger.error(f"Cache read error: {e}")
            
            # Cache miss - execute function
            logger.debug(f"Cache MISS: {cache_key}")
            result = func(*args, **kwargs)
            
            # Store in cache
            try:
                # Serialize result
                serialized = json.dumps(result, default=str)
                redis_client.setex(cache_key, ttl, serialized)
                logger.debug(f"Cached: {cache_key} (TTL: {ttl}s)")
            except Exception as e:
                logger.error(f"Cache write error: {e}")
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache_pattern(pattern: str):
    """
    Invalidate all cache keys matching a pattern.
    
    Args:
        pattern: Pattern to match (e.g., "cache:packages:*")
    """
    if not redis_client:
        return 0
    
    try:
        keys = redis_client.keys(pattern)
        if keys:
            count = redis_client.delete(*keys)
            logger.info(f"Invalidated {count} cache keys: {pattern}")
            return count
        return 0
    except Exception as e:
        logger.error(f"Cache invalidation error: {e}")
        return 0


def clear_all_cache():
    """Clear all cache keys."""
    return invalidate_cache_pattern("cache:*")
