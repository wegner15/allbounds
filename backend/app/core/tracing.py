import logging
import importlib.util
from typing import Optional

# Core OpenTelemetry imports
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

# Optional instrumentation imports - will be imported dynamically if available
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Check if optional dependencies are available
def is_module_available(module_name):
    return importlib.util.find_spec(module_name) is not None

logger = logging.getLogger(__name__)

def setup_tracing(app, service_name: str = "allbounds-backend", endpoint: Optional[str] = None) -> None:
    """
    Set up OpenTelemetry tracing for the application.
    
    Args:
        app: FastAPI application
        service_name: Name of the service
        endpoint: OTLP endpoint for exporting traces
    """
    try:
        # Create a resource with service information
        resource = Resource.create({"service.name": service_name})
        
        # Create a tracer provider
        tracer_provider = TracerProvider(resource=resource)
        
        # If an endpoint is provided, set up the OTLP exporter
        if endpoint:
            # Create an OTLP exporter
            otlp_exporter = OTLPSpanExporter(endpoint=endpoint)
            
            # Add the exporter to the tracer provider
            tracer_provider.add_span_processor(BatchSpanProcessor(otlp_exporter))
            logger.info(f"OpenTelemetry tracing configured with OTLP exporter to {endpoint}")
        else:
            logger.info("OpenTelemetry tracing configured without exporter")
        
        # Set the tracer provider
        trace.set_tracer_provider(tracer_provider)
        
        # Instrument FastAPI
        FastAPIInstrumentor.instrument_app(app, tracer_provider=tracer_provider)
        
        # Conditionally instrument SQLAlchemy if available
        if is_module_available("opentelemetry.instrumentation.sqlalchemy"):
            try:
                from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
                SQLAlchemyInstrumentor().instrument(tracer_provider=tracer_provider)
                logger.info("SQLAlchemy instrumentation enabled")
            except ImportError:
                logger.warning("SQLAlchemy instrumentation not available")
        else:
            logger.warning("SQLAlchemy instrumentation module not found")
        
        # Conditionally instrument requests if available
        if is_module_available("opentelemetry.instrumentation.requests"):
            try:
                from opentelemetry.instrumentation.requests import RequestsInstrumentor
                RequestsInstrumentor().instrument(tracer_provider=tracer_provider)
                logger.info("Requests instrumentation enabled")
            except ImportError:
                logger.warning("Requests instrumentation not available")
        
        # Conditionally instrument aiohttp if available
        if is_module_available("opentelemetry.instrumentation.aiohttp_client"):
            try:
                from opentelemetry.instrumentation.aiohttp_client import AioHttpClientInstrumentor
                AioHttpClientInstrumentor().instrument(tracer_provider=tracer_provider)
                logger.info("AioHttp instrumentation enabled")
            except ImportError:
                logger.warning("AioHttp instrumentation not available")
        
        logger.info("OpenTelemetry instrumentation complete")
    except Exception as e:
        logger.error(f"Failed to set up OpenTelemetry tracing: {e}")

def get_tracer(name: str) -> trace.Tracer:
    """
    Get a tracer for the given name.
    
    Args:
        name: Name of the tracer
        
    Returns:
        Tracer instance
    """
    return trace.get_tracer(name)

def extract_context_from_headers(headers: dict) -> trace.SpanContext:
    """
    Extract trace context from HTTP headers.
    
    Args:
        headers: HTTP headers
        
    Returns:
        Span context
    """
    return TraceContextTextMapPropagator().extract(headers)

def inject_context_into_headers(headers: dict) -> None:
    """
    Inject trace context into HTTP headers.
    
    Args:
        headers: HTTP headers to inject context into
    """
    TraceContextTextMapPropagator().inject(headers)
