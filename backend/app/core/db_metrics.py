"""
Database connection pool metrics for Prometheus monitoring.

This module defines Prometheus metrics for tracking database connection pool
behavior, including pool size, connection lifecycle events, and failures.
"""

from prometheus_client import Counter, Gauge

# Gauge metrics for current pool state
db_pool_size = Gauge(
    "db_pool_size",
    "Current size of the database connection pool"
)

db_pool_checked_out = Gauge(
    "db_pool_checked_out",
    "Number of connections currently checked out from the pool"
)

db_pool_overflow = Gauge(
    "db_pool_overflow",
    "Number of overflow connections currently in use"
)

# Counter metrics for connection lifecycle events
db_pool_checkouts_total = Counter(
    "db_pool_checkouts_total",
    "Total number of connection checkouts from the pool"
)

db_pool_checkins_total = Counter(
    "db_pool_checkins_total",
    "Total number of connection checkins to the pool"
)

db_pool_connects_total = Counter(
    "db_pool_connects_total",
    "Total number of new database connections created"
)

# Counter metrics for connection failures
db_pool_pre_ping_failures_total = Counter(
    "db_pool_pre_ping_failures_total",
    "Total number of stale connections detected by pool pre-ping"
)

db_connection_timeouts_total = Counter(
    "db_connection_timeouts_total",
    "Total number of connection pool timeout errors"
)
