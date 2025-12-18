# 🚨 Emergency Memory Leak Mitigation

## Current Status

**Memory growth:** 160 MB → 900+ MB in 60 seconds (CRITICAL)

## Root Cause (Suspected)

Despite all fixes, memory continues to grow. Possible causes:

1. **Python memory allocator** - Not releasing memory back to OS
2. **SQLAlchemy session cache** - Objects staying in memory despite expunge
3. **Pydantic model cache** - Internal caching keeping references
4. **Circular references** - Python GC not collecting fast enough
5. **Database result sets** - Large query results staying in memory

## Mitigations Applied

### 1. ✅ Explicit Garbage Collection
Added `gc.collect()` after every request in `database.py`

### 2. ✅ Aggressive Worker Restarts
Changed `--limit-max-requests` from 10,000 → **100**

**Effect:** Workers restart every 100 requests, forcing memory cleanup

### 3. ✅ Manual Pydantic Construction
Changed from `from_orm()` to manual object construction to avoid ANY attribute access

### 4. ✅ All Previous Fixes
- `lazy='noload'` on all relationships
- `db.expunge_all()` session cleanup
- Explicit serialization in all endpoints
- Removed circular `joinedload()`

## Expected Behavior Now

**With 100 request limit:**
- Worker starts: 160 MB
- After 50 requests: 300-400 MB
- After 100 requests: **WORKER RESTARTS** → back to 160 MB
- Cycle repeats

**This prevents OOM kills** but doesn't solve the root cause.

## Monitoring

```bash
# Watch workers restart
watch -n 2 'ps aux | grep "python3.12.*spawn" | head -2'

# Check logs for worker restarts
sudo docker compose logs api --tail 50 | grep "Shutting down\|Started"
```

## If This Still Fails

### Option 1: Reduce Concurrent Load
- Limit frontend to fewer concurrent requests
- Add request queuing
- Implement rate limiting

### Option 2: Increase Worker Count, Reduce Memory Per Worker
```yaml
command: uvicorn app.main:app --workers 4 --limit-max-requests 50
```

More workers, each handling fewer requests before restart.

### Option 3: Use Gunicorn Instead of Uvicorn
Gunicorn has better memory management:
```yaml
command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --max-requests 100
```

### Option 4: Profile Memory Usage
Install memory profiler:
```python
from memory_profiler import profile

@profile
def get_countries(db):
    # ... code
```

### Option 5: Switch to Async Queries
Use async SQLAlchemy to reduce memory footprint:
```python
from sqlalchemy.ext.asyncio import AsyncSession

async def get_countries(db: AsyncSession):
    result = await db.execute(select(Country))
    return result.scalars().all()
```

## Production Deployment

**DEPLOY IMMEDIATELY** with current mitigations:

```bash
cd ~/allbounds/backend
git pull
sudo docker compose down
sudo docker compose up -d
```

**Monitor closely:**
- Workers should restart every 100 requests
- Memory should cycle: 160 MB → 400 MB → restart → 160 MB
- No OOM kills (workers restart before hitting limit)

## Performance Impact

**Downside of frequent restarts:**
- Slight latency spike during restart (~1-2 seconds)
- More CPU usage (worker initialization)
- Connection pool churn

**Upside:**
- No OOM kills
- Predictable memory usage
- System stays stable

## Long-Term Solution

Need to investigate with proper profiling tools:

1. **Memory profiler** - Find exact allocation source
2. **SQLAlchemy query logging** - See what's being loaded
3. **Python GC stats** - Check collection efficiency
4. **Async rewrite** - Better memory management

## Summary

**Current state:** Emergency mitigation in place
**Expected result:** Stable but with performance cost
**Next step:** Deploy and monitor, then investigate root cause

This is a **band-aid solution** - the real fix requires deeper investigation.

🚨 **DEPLOY NOW TO PREVENT PRODUCTION OUTAGE!**
