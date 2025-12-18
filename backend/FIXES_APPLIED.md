# API Stability Fixes Applied

## Date: 2025-11-17

### Summary
Applied critical fixes to prevent API hangs and improve stability. These changes address database session leaks, threadpool exhaustion, and add automatic recovery mechanisms.

---

## 1. Fixed Background Task DB Session Leak ✅

**File**: `app/api/api_v1/endpoints/search.py`

**Problem**: 
- The `/index-all` endpoint was passing a database session to a background task
- When the endpoint returned, FastAPI closed the session via `get_db()`'s finally block
- The background task tried to use the closed session, causing connection leaks

**Fix**:
- Background task now creates its own session with proper try-finally cleanup
- Session is opened inside the background task and closed after completion

**Code Change**:
```python
# Before (BROKEN):
@router.post("/index-all")
def index_all(db: Session = Depends(get_db), background_tasks: BackgroundTasks, ...):
    background_tasks.add_task(search_service.index_all, db)  # ❌ Uses closed session

# After (FIXED):
@router.post("/index-all")
def index_all(background_tasks: BackgroundTasks, ...):
    def index_all_with_session():
        db = SessionLocal()
        try:
            search_service.index_all(db)
        finally:
            db.close()  # ✅ Properly managed session
    background_tasks.add_task(index_all_with_session)
```

---

## 2. Added Database Pool Monitoring Endpoint ✅

**File**: `app/main.py`

**New Endpoint**: `GET /health/db/pool`

**Purpose**: 
- Real-time monitoring of database connection pool status
- Helps diagnose pool exhaustion issues before they cause hangs

**Response Example**:
```json
{
  "status": "ok",
  "pool_size": 20,
  "checked_out": 5,
  "overflow": 0,
  "max_pool_size": 20,
  "max_overflow": 10,
  "total_capacity": 30,
  "available": 25,
  "utilization_percent": 16.67
}
```

**Usage**:
```bash
# Check pool status anytime
curl http://localhost:8005/health/db/pool

# Watch continuously
watch -n 2 'curl -s http://localhost:8005/health/db/pool | jq'
```

---

## 3. Converted Critical Endpoints to Async ✅

**Files**: 
- `app/main.py`
- `app/api/api_v1/endpoints/search.py`

**Problem**:
- Sync endpoints (`def`) run in Uvicorn's limited threadpool
- Under load, all worker threads can get blocked
- Health checks fail even though the event loop is fine

**Fix**:
- Converted lightweight endpoints to async (`async def`)
- These now run directly on the event loop, bypassing the threadpool
- Ensures health checks always respond, even when workers are saturated

**Endpoints Converted**:
- `GET /health` - Main health check
- `GET /health/db/pool` - Pool monitoring
- `GET /api/v1/search/health` - Meilisearch health

---

## 4. Enabled Uvicorn Access Logs ✅

**File**: `app/core/logging.py`

**Change**: 
```python
# Before:
uvicorn_logger.disabled = True

# After:
uvicorn_logger.disabled = False
```

**Benefit**: 
- See every request in logs with timing
- Easier to diagnose which endpoints are slow or hanging
- Complements existing RequestLoggingMiddleware

---

## 5. Hardened Uvicorn Configuration ✅

**File**: `docker-compose.yml`

**Changes**:
```yaml
# Before:
command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# After:
command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2 --log-level info --access-log
```

**Improvements**:
- ❌ Removed `--reload` (file watcher can cause hangs in Docker)
- ✅ Added `--workers 2` (multiple workers for resilience)
- ✅ Added `--access-log` (visibility into request handling)
- ✅ Set `--log-level info` (appropriate verbosity)

---

## 6. Added Aggressive Health Checks ✅

**File**: `docker-compose.yml`

**Changes**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "--max-time", "5", "http://localhost:8000/health"]
  interval: 15s      # Check every 15s (was 30s)
  timeout: 10s
  retries: 2         # Fail after 2 attempts (was 3)
  start_period: 40s
```

**Benefit**:
- Detects hangs within ~30 seconds
- Faster recovery via autoheal

---

## 7. Added Autoheal Service ✅

**File**: `docker-compose.yml`

**New Service**:
```yaml
autoheal:
  image: willfarrell/autoheal:latest
  restart: unless-stopped
  environment:
    - AUTOHEAL_CONTAINER_LABEL=all
    - AUTOHEAL_INTERVAL=10
    - AUTOHEAL_START_PERIOD=60
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

**How It Works**:
1. Monitors all containers with healthchecks every 10 seconds
2. When API healthcheck fails (after 2 retries = 30s)
3. Autoheal automatically restarts the API container
4. Total recovery time: ~40-50 seconds

**Note**: This is a safety net, not a fix. It keeps the API available while we monitor for root causes.

---

## How to Apply These Changes

```bash
# 1. Pull the autoheal image
sudo docker-compose pull autoheal

# 2. Rebuild and restart all services
sudo docker-compose up -d --build

# 3. Watch logs to verify
sudo docker-compose logs -f api autoheal

# 4. Test the new endpoints
curl http://localhost:8005/health
curl http://localhost:8005/health/db/pool
```

---

## Monitoring After Deployment

### Check Health Status
```bash
# See container health
sudo docker-compose ps

# Watch autoheal activity
sudo docker-compose logs -f autoheal | grep -i restart
```

### Monitor Pool Usage
```bash
# Real-time pool monitoring
watch -n 2 'curl -s http://localhost:8005/health/db/pool | jq'

# Alert if utilization > 80%
curl -s http://localhost:8005/health/db/pool | jq -e '.utilization_percent > 80'
```

### Check for Hangs
```bash
# If API seems slow, check pool first
curl http://localhost:8005/health/db/pool

# Then check Prometheus metrics
curl http://localhost:8005/metrics | grep http_requests_in_progress
```

---

## Expected Improvements

1. **No more DB session leaks** from background tasks
2. **Health checks always respond** (async, bypasses threadpool)
3. **Automatic recovery** within 40-50s if hangs still occur
4. **Better visibility** via access logs and pool monitoring
5. **More resilient** with 2 workers instead of 1

---

## If Hangs Still Occur

The autoheal will keep the API running, but collect this data:

```bash
# 1. Check pool status during hang
curl http://localhost:8005/health/db/pool

# 2. Check which endpoints are slow
sudo docker-compose logs api | grep -E "Request completed.*[0-9]{4,}" | tail -20

# 3. Check restart frequency
sudo docker-compose logs autoheal | grep -c "Restarting container"

# 4. Check worker thread count
sudo docker-compose exec api python -c "import threading; print(threading.active_count())"
```

If restarts happen frequently (> 1/hour), we need to investigate:
- Long-running queries (check slow query logs)
- External API timeouts (Meilisearch, Cloudflare)
- Memory leaks (check `docker stats`)
- CPU-bound operations in sync endpoints

---

## Next Steps (Optional)

If issues persist, consider:

1. **Increase pool size** (if utilization consistently > 70%)
   ```yaml
   - DB_POOL_SIZE=30
   - DB_MAX_OVERFLOW=20
   ```

2. **Add query timeouts** to prevent long-running queries
   ```python
   connect_args={"options": "-c statement_timeout=30000"}
   ```

3. **Convert more endpoints to async** (especially list/search endpoints)

4. **Add request timeouts** at the Uvicorn level
   ```yaml
   command: uvicorn ... --timeout-keep-alive 30
   ```

5. **Profile slow endpoints** with py-spy or cProfile

---

## Files Modified

- ✅ `app/api/api_v1/endpoints/search.py` - Fixed session leak
- ✅ `app/main.py` - Added pool endpoint, converted to async
- ✅ `app/core/logging.py` - Enabled Uvicorn access logs
- ✅ `docker-compose.yml` - Hardened config, added autoheal
- ✅ `FIXES_APPLIED.md` - This document

---

## Rollback Instructions

If needed, revert to previous state:

```bash
git checkout HEAD~1 app/api/api_v1/endpoints/search.py
git checkout HEAD~1 app/main.py
git checkout HEAD~1 app/core/logging.py
git checkout HEAD~1 docker-compose.yml
sudo docker-compose up -d --build
```
