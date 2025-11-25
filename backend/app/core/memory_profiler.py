"""
Memory profiling utilities for FastAPI endpoints.
"""
import tracemalloc
import logging
from functools import wraps
from typing import Callable
import psutil
import os

logger = logging.getLogger(__name__)

def get_memory_usage():
    """Get current memory usage in MB."""
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / 1024 / 1024  # Convert to MB


def profile_memory(func: Callable):
    """
    Decorator to profile memory usage of a function.
    
    Usage:
        @router.get("/packages/")
        @profile_memory
        def get_packages(db: Session = Depends(get_db)):
            return packages
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Start memory tracking
        mem_before = get_memory_usage()
        tracemalloc.start()
        
        # Execute function
        result = func(*args, **kwargs)
        
        # Get memory stats
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        mem_after = get_memory_usage()
        
        # Log memory usage
        logger.warning(
            f"🔍 MEMORY PROFILE: {func.__name__}",
            extra={
                "function": func.__name__,
                "mem_before_mb": round(mem_before, 2),
                "mem_after_mb": round(mem_after, 2),
                "mem_increase_mb": round(mem_after - mem_before, 2),
                "traced_current_mb": round(current / 1024 / 1024, 2),
                "traced_peak_mb": round(peak / 1024 / 1024, 2),
            }
        )
        
        return result
    
    return wrapper


def profile_memory_detailed(func: Callable):
    """
    Decorator with detailed memory profiling including top allocations.
    
    Usage:
        @profile_memory_detailed
        def get_packages(db: Session = Depends(get_db)):
            return packages
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Start detailed tracking
        mem_before = get_memory_usage()
        tracemalloc.start()
        
        # Execute function
        result = func(*args, **kwargs)
        
        # Get detailed stats
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        mem_after = get_memory_usage()
        
        # Log summary
        logger.warning(
            f"🔍 DETAILED MEMORY PROFILE: {func.__name__}",
            extra={
                "function": func.__name__,
                "mem_before_mb": round(mem_before, 2),
                "mem_after_mb": round(mem_after, 2),
                "mem_increase_mb": round(mem_after - mem_before, 2),
                "traced_peak_mb": round(peak / 1024 / 1024, 2),
            }
        )
        
        # Log top 10 memory allocations
        logger.warning(f"Top 10 memory allocations in {func.__name__}:")
        for index, stat in enumerate(top_stats[:10], 1):
            frame = stat.traceback[0] if stat.traceback else None
            if frame:
                logger.warning(
                    f"  #{index}: {frame.filename}:{frame.lineno} - "
                    f"{stat.size / 1024 / 1024:.2f} MB ({stat.count} blocks)"
                )
            else:
                logger.warning(
                    f"  #{index}: Unknown location - "
                    f"{stat.size / 1024 / 1024:.2f} MB ({stat.count} blocks)"
                )
        
        return result
    
    return wrapper


class MemoryMonitor:
    """Context manager for monitoring memory in code blocks."""
    
    def __init__(self, label: str = "Code block"):
        self.label = label
        self.mem_before = 0
        
    def __enter__(self):
        self.mem_before = get_memory_usage()
        tracemalloc.start()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        mem_after = get_memory_usage()
        
        logger.warning(
            f"🔍 MEMORY MONITOR: {self.label}",
            extra={
                "label": self.label,
                "mem_before_mb": round(self.mem_before, 2),
                "mem_after_mb": round(mem_after, 2),
                "mem_increase_mb": round(mem_after - self.mem_before, 2),
                "traced_peak_mb": round(peak / 1024 / 1024, 2),
            }
        )


def log_memory_snapshot(label: str = "Memory snapshot"):
    """Log current memory usage snapshot."""
    mem_usage = get_memory_usage()
    
    if tracemalloc.is_tracing():
        current, peak = tracemalloc.get_traced_memory()
        logger.warning(
            f"📊 {label}",
            extra={
                "label": label,
                "process_memory_mb": round(mem_usage, 2),
                "traced_current_mb": round(current / 1024 / 1024, 2),
                "traced_peak_mb": round(peak / 1024 / 1024, 2),
            }
        )
    else:
        logger.warning(
            f"📊 {label}",
            extra={
                "label": label,
                "process_memory_mb": round(mem_usage, 2),
            }
        )
