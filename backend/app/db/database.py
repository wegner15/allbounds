import logging
from typing import Tuple, Optional
from sqlalchemy import create_engine, event, pool, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, TimeoutError as SQLAlchemyTimeoutError

from app.core.config import settings
from app.core.logging import request_id_var
from app.core.db_metrics import (
    db_pool_size,
    db_pool_checked_out,
    db_pool_overflow,
    db_pool_checkouts_total,
    db_pool_checkins_total,
    db_pool_connects_total,
    db_pool_pre_ping_failures_total,
)

# Set up logger for database operations
logger = logging.getLogger("app.database")

# Create SQLAlchemy engine with connection pool settings
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    connect_args={"connect_timeout": settings.DB_CONNECT_TIMEOUT},
    echo_pool=settings.LOG_LEVEL == "DEBUG",
)

# Connection pool event listeners for logging

@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log new database connections."""
    # Increment connection counter
    db_pool_connects_total.inc()
    
    # Get request_id from context if available
    request_id = request_id_var.get() if request_id_var.get() else None
    
    extra_data = {
        "event": "connect",
        "connection_id": id(dbapi_conn),
    }
    if request_id:
        extra_data["request_id"] = request_id
    
    logger.info(
        "New database connection established",
        extra=extra_data
    )

@event.listens_for(engine, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log connection checkout from pool."""
    pool_obj = connection_proxy._pool
    
    # Increment checkout counter
    db_pool_checkouts_total.inc()
    
    # Update gauge metrics
    db_pool_size.set(pool_obj.size())
    db_pool_checked_out.set(pool_obj.checkedout())
    db_pool_overflow.set(pool_obj.overflow())
    
    # Get request_id from context if available
    request_id = request_id_var.get() if request_id_var.get() else None
    
    extra_data = {
        "event": "checkout",
        "connection_id": id(dbapi_conn),
        "pool_size": pool_obj.size(),
        "checked_out": pool_obj.checkedout(),
        "overflow": pool_obj.overflow(),
    }
    if request_id:
        extra_data["request_id"] = request_id
    
    logger.debug(
        "Connection checked out from pool",
        extra=extra_data
    )

@event.listens_for(engine, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log connection return to pool."""
    # Increment checkin counter
    db_pool_checkins_total.inc()
    
    # Update checked_out gauge (it will decrease after checkin)
    pool_obj = engine.pool
    db_pool_checked_out.set(pool_obj.checkedout())
    
    # Get request_id from context if available
    request_id = request_id_var.get() if request_id_var.get() else None
    
    extra_data = {
        "event": "checkin",
        "connection_id": id(dbapi_conn),
    }
    if request_id:
        extra_data["request_id"] = request_id
    
    logger.debug(
        "Connection returned to pool",
        extra=extra_data
    )

@event.listens_for(engine, "close")
def receive_close(dbapi_conn, connection_record):
    """Log connection closure."""
    # Get request_id from context if available
    request_id = request_id_var.get() if request_id_var.get() else None
    
    extra_data = {
        "event": "close",
        "connection_id": id(dbapi_conn),
    }
    if request_id:
        extra_data["request_id"] = request_id
    
    logger.debug(
        "Connection closed",
        extra=extra_data
    )

@event.listens_for(engine, "invalidate")
def receive_invalidate(dbapi_conn, connection_record, exception):
    """Log stale connection detection (pool pre-ping failures)."""
    # Increment pre-ping failure counter
    db_pool_pre_ping_failures_total.inc()
    
    # Get request_id from context if available
    request_id = request_id_var.get() if request_id_var.get() else None
    
    extra_data = {
        "event": "invalidate",
        "connection_id": id(dbapi_conn) if dbapi_conn else None,
        "exception": str(exception) if exception else "pre-ping failure",
    }
    if request_id:
        extra_data["request_id"] = request_id
    
    logger.warning(
        "Stale connection detected and invalidated",
        extra=extra_data
    )

# Log pool statistics at startup
def log_pool_stats():
    """Log connection pool statistics."""
    pool_obj = engine.pool
    
    # Initialize gauge metrics
    db_pool_size.set(pool_obj.size())
    db_pool_checked_out.set(pool_obj.checkedout())
    db_pool_overflow.set(pool_obj.overflow())
    
    logger.info(
        "Database connection pool initialized",
        extra={
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_recycle": settings.DB_POOL_RECYCLE,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "connect_timeout": settings.DB_CONNECT_TIMEOUT,
            "pool_pre_ping": settings.DB_POOL_PRE_PING,
            "current_size": pool_obj.size(),
            "checked_out": pool_obj.checkedout(),
            "overflow": pool_obj.overflow(),
        }
    )

# Create SessionLocal class
# NOTE: expire_on_commit defaults to True, which expires objects after commit
# This is good for memory management but can cause DetachedInstanceError
# We keep default True and handle serialization before session closes
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
    # expire_on_commit=True (default) - objects expire after commit, freeing memory
)

# Create Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    """
    Database session dependency with error handling for connection pool issues.
    
    Raises:
        HTTPException: 503 status code when database connection fails or pool is exhausted
    """
    from fastapi import HTTPException
    import uuid
    
    # Generate request_id for logging context
    request_id = str(uuid.uuid4())
    
    try:
        db = SessionLocal()
    except SQLAlchemyTimeoutError as e:
        # Pool exhaustion - all connections in use and timeout reached
        error_msg = "Database connection pool exhausted"
        logger.error(
            f"{error_msg}: {str(e)}",
            extra={
                "request_id": request_id,
                "error_type": "pool_timeout",
                "error_details": str(e),
            }
        )
        raise HTTPException(
            status_code=503,
            detail=f"{error_msg}. Please try again later."
        )
    except OperationalError as e:
        # Database connection failure - database unreachable or connection refused
        error_msg = "Database temporarily unavailable"
        logger.error(
            f"Database connection failed: {str(e)}",
            extra={
                "request_id": request_id,
                "error_type": "operational_error",
                "error_details": str(e),
            }
        )
        raise HTTPException(
            status_code=503,
            detail=f"{error_msg}. Please try again later."
        )
    except Exception as e:
        # Catch any other unexpected database errors
        error_msg = "Database error occurred"
        logger.error(
            f"Unexpected database error: {str(e)}",
            extra={
                "request_id": request_id,
                "error_type": "unexpected_error",
                "error_details": str(e),
            }
        )
        raise HTTPException(
            status_code=503,
            detail=f"{error_msg}. Please try again later."
        )
    
    try:
        yield db
    finally:
        # CRITICAL: Expunge all objects to free memory before closing
        # This prevents lazy-loading during response serialization from keeping objects in memory
        try:
            db.expunge_all()
        except Exception as e:
            logger.warning(f"Error during expunge_all: {e}")
        
        try:
            # Rollback any pending transaction
            db.rollback()
        except Exception as e:
            logger.warning(f"Error during rollback: {e}")
        
        try:
            # Close the session (returns connection to pool)
            db.close()
        except Exception as e:
            logger.warning(f"Error during close: {e}")
        
        # Force garbage collection to immediately free memory
        import gc
        gc.collect()

# Database health check function
async def check_database_health() -> Tuple[bool, Optional[str]]:
    """
    Check database connectivity by executing a simple query.
    
    Returns:
        Tuple of (is_healthy: bool, error_message: Optional[str])
    """
    try:
        # Create a new connection with timeout
        db = SessionLocal()
        try:
            # Execute simple SELECT 1 query to verify connectivity
            result = db.execute(text("SELECT 1"))
            result.fetchone()
            logger.debug("Database health check passed")
            return (True, None)
        finally:
            db.close()
    except OperationalError as e:
        error_msg = f"Database operational error: {str(e)}"
        logger.error(f"Database health check failed: {error_msg}")
        return (False, error_msg)
    except SQLAlchemyTimeoutError as e:
        error_msg = f"Database connection timeout: {str(e)}"
        logger.error(f"Database health check failed: {error_msg}")
        return (False, error_msg)
    except Exception as e:
        error_msg = f"Unexpected database error: {str(e)}"
        logger.error(f"Database health check failed: {error_msg}")
        return (False, error_msg)
