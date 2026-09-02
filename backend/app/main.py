import logging
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

# Import all models to ensure they're registered in the correct order
from app.models.all_models import __all__ as all_models

from app.api.api_v1.api import api_router
from app.core.config import settings
from app.core.logging import setup_logging, RequestLoggingMiddleware
from app.core.metrics import PrometheusMiddleware
from app.core.tracing import setup_tracing

# Set up logging
setup_logging(settings.LOG_LEVEL)
logger = logging.getLogger("app.startup")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for Allbounds tour company website",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    # Disable automatic redirect for trailing slashes
    redirect_slashes=False
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add request logging middleware
app.add_middleware(RequestLoggingMiddleware)

# Add Prometheus metrics middleware
app.add_middleware(PrometheusMiddleware)

# Create metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Set up OpenTelemetry tracing
if hasattr(settings, 'ENABLE_TRACING') and settings.ENABLE_TRACING:
    setup_tracing(app, service_name="allbounds-backend", endpoint=getattr(settings, 'OTLP_ENDPOINT', None))
    logger.info("OpenTelemetry tracing enabled")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    """Health check endpoint for the API."""
    return {"status": "ok"}

@app.get("/health/db")
async def database_health_check():
    """
    Health check endpoint for database connectivity.
    
    Returns:
        200 with {"status": "healthy"} when database is accessible
        503 with {"status": "unhealthy", "error": "..."} when database is not accessible
    """
    from app.db.database import check_database_health
    
    is_healthy, error_message = await check_database_health()
    
    if is_healthy:
        logger.info("Database health check: healthy")
        return {"status": "healthy"}
    else:
        logger.info(f"Database health check: unhealthy - {error_message}")
        return Response(
            content='{"status": "unhealthy", "error": "' + (error_message or "Unknown error") + '"}',
            status_code=503,
            media_type="application/json"
        )

@app.get("/health/db/pool")
async def database_pool_status():
    """
    Get current database connection pool status.
    
    Returns:
        Connection pool statistics including size, checked out connections, and overflow.
    """
    from app.db.database import engine
    
    pool = engine.pool
    
    return {
        "status": "ok",
        "pool_size": pool.size(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "max_pool_size": settings.DB_POOL_SIZE,
        "max_overflow": settings.DB_MAX_OVERFLOW,
        "total_capacity": settings.DB_POOL_SIZE + settings.DB_MAX_OVERFLOW,
        "available": (settings.DB_POOL_SIZE + settings.DB_MAX_OVERFLOW) - pool.checkedout(),
        "utilization_percent": round((pool.checkedout() / (settings.DB_POOL_SIZE + settings.DB_MAX_OVERFLOW)) * 100, 2)
    }

@app.middleware("http")
async def add_cloudflare_cache_header(request: Request, call_next):
    """Add Cloudflare cache header for public frontend GET requests."""
    response = await call_next(request)
    
    if request.method == "GET" and "authorization" not in request.headers:
        path = request.url.path
        
        # Don't cache admin, paginated, auth, or health routes
        admin_paths = ["/paginated", "/auth", "/users", "/bookings", "/email-logs", "/stats", "/visa-applications", "/metrics", "/health"]
        
        if path.startswith(f"{settings.API_V1_STR}/") and not any(p in path for p in admin_paths):
            response.headers["Cache-Control"] = "public, max-age=3600"
            
    return response

@app.middleware("http")
async def add_correlation_id_header(request: Request, call_next):
    """Add correlation ID header to response."""
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = request.headers.get("X-Correlation-ID", "")
    return response

@app.on_event("startup")
async def startup_event():
    """Run startup tasks."""
    # Log database connection pool statistics
    from app.db.database import log_pool_stats
    log_pool_stats()
    
    # Register DB change listeners so inserts/updates/deletes keep Meilisearch in sync.
    try:
        from app.db.search_sync import setup_search_sync_listeners

        setup_search_sync_listeners()
        logger.info("Meilisearch sync listeners enabled")
    except Exception as e:
        logger.warning(f"Failed to setup Meilisearch sync listeners: {e}")
    
    # Test Redis connection
    try:
        from app.core.cache import get_redis_client
        client = get_redis_client()
        if client:
            client.ping()
            logger.info("Redis connection successful")
        else:
            logger.warning("Redis client not initialized. Caching disabled.")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Caching disabled.")
    
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Run shutdown tasks."""
    logger.info("Application shutdown complete")
