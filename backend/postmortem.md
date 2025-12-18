# Postmortem: FastAPI Memory Growth and Query Explosion

## Summary

Over the past debugging cycle we investigated what initially appeared to be a severe memory leak and potential infrastructure issue in the Allbounds backend (FastAPI + SQLAlchemy + PostgreSQL). Under realistic traffic patterns, the API workers would grow to multiple gigabytes of memory and remain high even after traffic subsided. Database inspection showed long‑running `SELECT` queries against the `countries` tables and various related entities.

After systematically disabling infrastructure components (Meilisearch, Redis, Celery, OpenTelemetry, Prometheus, SQLAlchemy event listeners, pool pre‑ping, etc.), we ultimately traced the root cause to a single API endpoint: `/api/v1/countries/` when called with the `details=true` query parameter. That endpoint executed a huge joined query across many related tables and then attempted to serialize the result using a mismatched data model, causing runtime errors and pathological resource usage.

The issue has now been resolved by simplifying the endpoint: we removed the `details` parameter and restricted `/api/v1/countries/` to return only basic country data through a lightweight query. With this change in place, the application runs stably with normal memory usage, even with Meilisearch, Redis, Prometheus, and OpenTelemetry re‑enabled.

## Impact

- API workers would climb from ~150 MB to several gigabytes of RSS under traffic.
- Postgres frequently showed at least one massive `SELECT` query against `countries` and its relationships stuck in an `active` state.
- User‑facing impact was slow or failing responses when the problematic endpoint was hit via the frontend.
- The issue created significant confusion because it mimicked a deep runtime or infrastructure memory leak and made it difficult to trust observability tooling.

No permanent data corruption occurred, but the instability could have caused downtime or forced manual restarts under real production load.

## Timeline (High‑Level)

1. **Initial Symptom**  
   - Observed API workers with continually increasing memory usage, even when traffic slowed. `ps aux` showed `python3.12 ... --multiprocessing-fork` processes with rapidly growing RSS.
   - PostgreSQL inspection (`pg_stat_activity`) revealed a large query on `countries` and related tables running for extended periods.

2. **First Hypotheses**  
   - Suspected: OpenTelemetry instrumentation, Prometheus middleware, Redis, Meilisearch, Celery, SQLAlchemy pool listeners, or `pool_pre_ping` might be generating background loops or leaks.
   - Action: Commented out tracing and metrics imports, disabled services in `docker-compose`, and turned off event listeners and pre‑ping.

3. **Minimal Environment Testing**  
   - Ran with only FastAPI + PostgreSQL (using `docker-compose.minimal.yml`).
   - Despite the minimal environment, memory still grew quickly when the frontend was exercised.
   - This strongly indicated that the problem was in application code or query patterns, not in external services.

4. **Deeper Investigation**  
   - Added explicit logging to `app/api/api_v1/endpoints/countries.py` to trace calls to the `get_countries` endpoint, including the call stack.
   - Observed that `/api/v1/countries/` was often invoked with `details=true` when the frontend loaded.
   - PostgreSQL showed matching `SELECT` statements with large JOINs on `regions`, `packages`, `group_trips`, `hotels`, `attractions`, `accommodations`, and more.

5. **Discovery of the Serialization Bug**  
   - Inspected `get_countries_with_details` in `services/country.py`.
   - That function used `joinedload` to eagerly load many relationships and then constructed **Python dictionaries** for each country, returning `List[dict]`.
   - However, the `get_countries` endpoint assumed it was receiving ORM objects and tried to build `CountryResponse` models via attribute access like `c.id`, `c.name`, etc.
   - When `details=true` was set, the endpoint attempted `c.id` on a `dict`, causing `AttributeError: 'dict' object has no attribute 'id'`.
   - Logs showed this stack trace repeatedly as requests hit `/api/v1/countries/?details=true`.

6. **Why It Looked Like a Memory Leak**  
   - Every visit to the frontend triggered a fan‑out of requests, including the problematic `/api/v1/countries/?details=true` call.
   - That call executed a huge joined query loading a large object graph into memory.
   - Before completion, the endpoint crashed during serialization due to the dict/ORM mismatch.
   - The combination of heavy query + exception handling produced high CPU and memory usage that did not drop quickly, mimicking an "infinite" leak.

7. **Resolution**  
   - Short‑term fix: we removed the `details` parameter from the `get_countries` endpoint and always used the simple `get_countries` service, which returns lightweight ORM objects with basic fields.
   - The serialized output now matches the Pydantic `CountryResponse` model correctly, with no type mismatch.
   - After redeploying, memory usage stabilized around ~150–200 MB per worker. PostgreSQL no longer showed long‑running `countries` queries at idle.
   - We re‑enabled Meilisearch sync, Redis caching, Prometheus metrics, and OpenTelemetry; the system remained stable, confirming these were not the root cause.

## Root Cause

The root cause was **an endpoint design and implementation bug**, not a fundamental leak in Python, FastAPI, or SQLAlchemy.

Specifically:

1. The `/api/v1/countries/` endpoint supported a `details=true` mode that:
   - Performed a very large joined query over many related tables using `joinedload`.
   - Returned a list of dictionaries representing a denormalized country + related data graph.

2. The same endpoint then tried to treat the returned items as ORM models when constructing `CountryResponse` instances, using attribute access (e.g., `c.id`) on those dictionaries.

3. Under typical frontend behavior, this endpoint was called with `details=true`, so each page load triggered:
   - A heavy multi‑join SQL query (high CPU and memory).
   - A serialization error (`AttributeError`) that prevented clean completion.

This combination led to high transient memory usage and made the problem appear like a systemic memory leak when it was really a pathological endpoint.

## Lessons Learned

1. **Be cautious with "mega" detail endpoints**  
   Endpoints that attempt to return a fully joined, deeply nested object graph (countries + packages + hotels + attractions + media assets, etc.) are extremely fragile. They can easily explode in complexity and resource usage as data volume grows. A safer approach is to use more focused detail endpoints or to pre‑aggregate data into purpose‑built read models.

2. **Keep data contracts consistent**  
   Having a service return `List[dict]` while the endpoint assumes ORM models is a recipe for subtle runtime failures. Pydantic models and service functions should have clearly defined, consistent contracts: either operate on ORM entities or on dictionaries/DTOs, but not both accidentally.

3. **Use the database as a debugging ally**  
   Inspecting `pg_stat_activity` was crucial. It showed exactly which queries were running and for how long, allowing us to correlate resource spikes with a specific endpoint and query pattern instead of blaming generic "memory leaks".

4. **Minimize confounding factors during debugging**  
   Temporarily disabling Redis, Meilisearch, Celery, Prometheus, OpenTelemetry, and SQLAlchemy event listeners helped us systematically rule out potential culprits. Although these were not the root cause, the minimal environment gave us confidence to focus on application‑level logic.

5. **Frontend can amplify backend issues**  
   The frontend was calling multiple heavy endpoints in parallel (e.g., `with-hotels`, `with-activities`, `with-attractions`, `with-packages`, and `countries?details=true`). Even if each endpoint seems reasonable in isolation, together they can overload the backend. Design APIs with the actual frontend call patterns in mind.

6. **Instrumentation is not the enemy**  
   While it was reasonable to suspect OpenTelemetry and Prometheus, the final resolution showed that they were not at fault. With the underlying query and serialization issues fixed, we were able to re‑enable observability tooling without reintroducing instability.

## Follow‑Up Actions

- Keep `/api/v1/countries/` restricted to basic country data unless a carefully designed, paginated, and profiled detail endpoint is implemented.
- When we need richer country detail for specific pages, design:
  - Dedicated endpoints with limited scope (e.g., countries + featured hotels only).
  - Clear Pydantic response models that match the actual data structures returned.
- Add lightweight logging or metrics around query latency and response sizes per endpoint so that future regressions are easier to spot.

With these changes, the backend now runs smoothly under the previous traffic scenario. Memory usage is stable, database connections are correctly pooled and returned, and we have regained confidence in the behavior of the system.
