import json
import logging
import time
import uuid
import traceback
from datetime import datetime
from typing import Dict, Any, Optional
from contextvars import ContextVar
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

# Context variables for request tracking
request_id_var: ContextVar[str] = ContextVar('request_id', default='')
user_id_var: ContextVar[Optional[int]] = ContextVar('user_id', default=None)

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for structured logging."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add request_id if available
        request_id = request_id_var.get()
        if request_id:
            log_data["request_id"] = request_id
        
        # Add user_id if available
        user_id = user_id_var.get()
        if user_id:
            log_data["user_id"] = user_id
        
        # Add exception info if available
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            log_data["traceback"] = traceback.format_exception(*record.exc_info)
        
        # Add extra fields if available
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        
        return json.dumps(log_data)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging request and response details."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.logger = logging.getLogger("api.request")
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)
        
        # Start timer
        start_time = time.time()
        
        # Log request
        self.logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "request": {
                    "id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "query": str(request.query_params),
                    "headers": dict(request.headers),
                    "client": request.client.host if request.client else None,
                }
            }
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            self.logger.info(
                f"Request completed: {request.method} {request.url.path} {response.status_code}",
                extra={
                    "response": {
                        "status_code": response.status_code,
                        "duration": duration,
                        "headers": dict(response.headers),
                    }
                }
            )
            
            # Add request ID to response headers
            response.headers["X-Request-ID"] = request_id
            
            return response
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time
            
            # Log error
            self.logger.error(
                f"Request failed: {request.method} {request.url.path}",
                exc_info=True,
                extra={
                    "error": {
                        "type": type(e).__name__,
                        "message": str(e),
                        "duration": duration,
                    }
                }
            )
            
            # Re-raise exception
            raise

def setup_logging(log_level: str = "INFO") -> None:
    """Configure logging for the application.
    
    Args:
        log_level: The log level to use (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Set log level
    import sys
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler with JSON formatter
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(JSONFormatter())
    
    # Add handler to root logger
    root_logger.addHandler(console_handler)
    
    # Configure specific loggers
    logging.getLogger("api").setLevel(numeric_level)
    logging.getLogger("api.request").setLevel(numeric_level)
    logging.getLogger("app").setLevel(numeric_level)
    
    # Disable uvicorn access logs (we have our own middleware)
    uvicorn_logger = logging.getLogger("uvicorn.access")
    uvicorn_logger.disabled = True
    
    # Log configuration complete
    logging.getLogger("app.startup").info(
        "Logging configured",
        extra={"log_level": log_level}
    )
