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
def health_check():
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
    
    # Setup Celery-based Meilisearch sync listeners
    try:
        from app.db.search_sync_celery import setup_search_sync_listeners
        setup_search_sync_listeners()
        logger.info("Celery-based Meilisearch sync enabled")
    except Exception as e:
        logger.warning(f"Failed to setup Meilisearch sync: {e}. Sync will be disabled.")
    
    # Test Redis connection
    try:
        from app.core.cache import redis_client
        if redis_client:
            redis_client.ping()
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
