from prometheus_client import Counter, Histogram, Gauge, Summary
import time
from typing import Callable, Dict, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Define Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=(0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 7.5, 10.0, 25.0, 50.0, 75.0, 100.0, float("inf"))
)

REQUEST_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests in progress",
    ["method", "endpoint"]
)

DB_QUERY_LATENCY = Histogram(
    "db_query_duration_seconds",
    "Database query latency in seconds",
    ["operation", "table"],
    buckets=(0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0)
)

EXTERNAL_API_LATENCY = Histogram(
    "external_api_duration_seconds",
    "External API call latency in seconds",
    ["service", "endpoint"],
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0)
)

CACHE_HIT_COUNT = Counter(
    "cache_hit_total",
    "Total number of cache hits",
    ["cache_name"]
)

CACHE_MISS_COUNT = Counter(
    "cache_miss_total",
    "Total number of cache misses",
    ["cache_name"]
)

ERROR_COUNT = Counter(
    "error_total",
    "Total number of errors",
    ["type", "location"]
)

class PrometheusMiddleware(BaseHTTPMiddleware):
    """Middleware for collecting Prometheus metrics."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Extract endpoint from request
        endpoint = request.url.path
        method = request.method
        
        # Track request in progress
        REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).inc()
        
        # Track request latency
        start_time = time.time()
        
        try:
            # Process request
            response = await call_next(request)
            
            # Record metrics
            status_code = response.status_code
            duration = time.time() - start_time
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(duration)
            
            return response
        except Exception as e:
            # Record error metrics
            ERROR_COUNT.labels(type=type(e).__name__, location=f"{method}:{endpoint}").inc()
            raise
        finally:
            # Decrement in-progress counter
            REQUEST_IN_PROGRESS.labels(method=method, endpoint=endpoint).dec()

def track_db_query(operation: str, table: str) -> Callable:
    """Decorator for tracking database query latency."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                return func(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                DB_QUERY_LATENCY.labels(operation=operation, table=table).observe(duration)
        return wrapper
    return decorator

def track_external_api(service: str, endpoint: str) -> Callable:
    """Decorator for tracking external API call latency."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                return await func(*args, **kwargs)
            finally:
                duration = time.time() - start_time
                EXTERNAL_API_LATENCY.labels(service=service, endpoint=endpoint).observe(duration)
        return wrapper
    return decorator

def track_cache_hit(cache_name: str) -> None:
    """Track cache hit."""
    CACHE_HIT_COUNT.labels(cache_name=cache_name).inc()

def track_cache_miss(cache_name: str) -> None:
    """Track cache miss."""
    CACHE_MISS_COUNT.labels(cache_name=cache_name).inc()

def track_error(error_type: str, location: str) -> None:
    """Track error."""
    ERROR_COUNT.labels(type=error_type, location=location).inc()
