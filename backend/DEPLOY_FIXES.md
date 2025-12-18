# 🚀 Deploy Memory Leak Fixes

## All Fixes Applied ✅

1. ✅ **Increased connection pool** (20 → 50 connections)
2. ✅ **Added session cleanup** (`db.expunge_all()`)
3. ✅ **Removed circular relationships** from schemas
4. ✅ **Created lightweight list responses**
5. ✅ **Added Redis caching** to 13 hot endpoints

## Deployment Steps

### 1. Restart Services

```bash
cd ~/allbounds/backend

# Stop everything
sudo docker compose down

# Start fresh
sudo docker compose up -d

# Wait for services to be healthy
sleep 10
```

### 2. Verify Services Are Running

```bash
# Check all services
sudo docker compose ps

# Should show:
# api            running
# db             running (healthy)
# redis          running (healthy)
# meilisearch    running
# celery_worker  running

# Check logs
sudo docker compose logs -f api | head -30
```

### 3. Test Caching

```bash
# Run the test script
./test_caching.sh

# Expected output:
# ✓ Redis is running
# ✓ Cache cleared
# First request: 200-300ms
# Second request: 10-50ms (90% faster!)
# ✓ Cache is working! 80-90% faster
# ✓ Found 1+ cache keys
# ✓✓✓ CACHING IS WORKING PERFECTLY! ✓✓✓
```

### 4. Monitor Memory

```bash
# Watch memory in real-time
watch -n 2 'ps aux --sort=-%mem | grep python | head -5'

# Expected:
# Worker 1: 200-400 MB (stable)
# Worker 2: 200-400 MB (stable)
# Celery: 50-100 MB (stable)
```

### 5. Load Test

```bash
# Simulate 20 page loads (18 requests each = 360 total requests)
for i in {1..20}; do
  echo "Page load $i"
  curl -s http://localhost:8005/api/v1/packages/ > /dev/null &
  curl -s http://localhost:8005/api/v1/packages/featured > /dev/null &
  curl -s http://localhost:8005/api/v1/hotels/featured > /dev/null &
  curl -s http://localhost:8005/api/v1/attractions/ > /dev/null &
  curl -s http://localhost:8005/api/v1/activities/featured > /dev/null &
  curl -s http://localhost:8005/api/v1/countries/ > /dev/null &
  curl -s http://localhost:8005/api/v1/countries/with-packages > /dev/null &
  curl -s http://localhost:8005/api/v1/countries/with-hotels > /dev/null &
  curl -s http://localhost:8005/api/v1/regions/with-countries > /dev/null &
  curl -s http://localhost:8005/api/v1/holiday-types > /dev/null &
  wait
  sleep 1
done

# Check memory after
ps aux --sort=-%mem | grep python | head -3

# Should still be under 500 MB per worker
```

### 6. Check for OOM Kills

```bash
# Check syslog for OOM kills
sudo grep -i "out of memory\|killed process" /var/log/syslog | tail -20

# Should see NO new kills after deployment
```

## Expected Results

### Before Fixes
- Memory: 2-8 GB per worker
- OOM kills: Every 2-6 hours
- Response time: 200-500ms
- Cache hit rate: 0%

### After Fixes
- Memory: 200-500 MB per worker (stable)
- OOM kills: None
- Response time: 10-50ms (cached), 100-200ms (uncached)
- Cache hit rate: 90-95%

## Monitoring (24 Hours)

```bash
# Start long-term monitoring
./start_monitoring.sh

# After 24 hours, analyze
python3 analyze_memory.py memory_monitor.log

# Expected output:
# ✓ No processes exceeded 1GB
# ✓ No significant memory growth detected
# ✓ Memory stable at 200-500 MB
```

## Redis Cache Stats

```bash
# Check cache hit rate
docker exec backend_redis_1 redis-cli INFO stats | grep keyspace

# Expected after 1 hour:
# keyspace_hits: 5000+
# keyspace_misses: 200-500
# Hit rate: 90-95%

# Check cache keys
docker exec backend_redis_1 redis-cli KEYS "cache:*" | wc -l

# Expected: 10-50 keys (depending on traffic)

# Check Redis memory
docker exec backend_redis_1 redis-cli INFO memory | grep used_memory_human

# Expected: 10-50 MB (well under 256 MB limit)
```

## Troubleshooting

### Memory Still Growing?

1. **Check caching is working**:
   ```bash
   ./test_caching.sh
   ```

2. **Check logs for errors**:
   ```bash
   sudo docker compose logs api | grep -i error
   ```

3. **Check for other endpoints not cached**:
   ```bash
   sudo docker compose logs api | grep "Request started" | sort | uniq -c | sort -rn | head -20
   ```

4. **Profile memory**:
   ```bash
   # Install memory profiler
   pip install memory-profiler
   
   # Add to endpoint
   from memory_profiler import profile
   
   @profile
   def get_packages(...):
       ...
   ```

### Cache Not Working?

1. **Check Redis connection**:
   ```bash
   docker exec backend_redis_1 redis-cli PING
   ```

2. **Check cache decorator is applied**:
   ```bash
   grep -r "@cache_response" app/api/api_v1/endpoints/
   ```

3. **Check logs for cache hits/misses**:
   ```bash
   sudo docker compose logs api | grep -i "cache hit\|cache miss"
   ```

4. **Manually test**:
   ```bash
   # Clear cache
   docker exec backend_redis_1 redis-cli FLUSHDB
   
   # Make request
   curl http://localhost:8005/api/v1/packages/
   
   # Check keys
   docker exec backend_redis_1 redis-cli KEYS "cache:*"
   ```

### Still Getting OOM Kills?

If you still get OOM kills after these fixes:

1. **Check which process is killed**:
   ```bash
   sudo grep "Killed process" /var/log/syslog | tail -5
   ```

2. **Check if it's a different endpoint**:
   ```bash
   # Add caching to that endpoint
   @cache_response(ttl=300)
   ```

3. **Increase worker memory limit** (last resort):
   ```yaml
   # docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 2G
   ```

## Rollback (If Needed)

If something goes wrong:

```bash
cd ~/allbounds/backend

# Restore original files
git checkout app/db/database.py
git checkout app/schemas/package.py
git checkout app/api/api_v1/endpoints/packages.py
git checkout app/api/api_v1/endpoints/countries.py
git checkout docker-compose.yml

# Remove new files
rm app/core/cache_decorator.py

# Restart
sudo docker compose down
sudo docker compose up -d
```

## Success Criteria

After 24 hours, you should see:

- ✅ Memory stable at 200-500 MB per worker
- ✅ No OOM kills in syslog
- ✅ Cache hit rate 90-95%
- ✅ Response times 10-50ms (cached)
- ✅ No zombie processes
- ✅ Redis memory under 100 MB

## Summary

**All fixes deployed:**
1. Connection pool: 20 → 50
2. Session cleanup: `db.expunge_all()`
3. Lightweight schemas: No circular refs
4. Redis caching: 13 endpoints cached

**Expected impact:**
- Memory: 80-90% reduction
- Response time: 90% faster (cached)
- OOM kills: Eliminated
- Database load: 90% reduction

**Next steps:**
1. Deploy and restart services
2. Run `./test_caching.sh`
3. Monitor for 24 hours
4. Celebrate! 🎉
