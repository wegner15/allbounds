#!/bin/bash
# Test script to verify caching is working

echo "=== Testing Redis Caching ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check Redis is running
echo "1. Checking Redis connection..."
if docker exec backend_redis_1 redis-cli PING 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis is running${NC}"
else
    echo -e "${RED}✗ Redis is not running${NC}"
    exit 1
fi
echo ""

# Test 2: Clear cache for clean test
echo "2. Clearing cache for clean test..."
docker exec backend_redis_1 redis-cli FLUSHDB > /dev/null 2>&1
echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

# Test 3: First request (cache miss)
echo "3. Testing first request (should be CACHE MISS)..."
START=$(date +%s%N)
curl -s http://localhost:8005/api/v1/packages/ > /dev/null
END=$(date +%s%N)
FIRST_TIME=$(( ($END - $START) / 1000000 ))
echo -e "${YELLOW}First request: ${FIRST_TIME}ms${NC}"
echo ""

# Wait a moment
sleep 1

# Test 4: Second request (cache hit)
echo "4. Testing second request (should be CACHE HIT)..."
START=$(date +%s%N)
curl -s http://localhost:8005/api/v1/packages/ > /dev/null
END=$(date +%s%N)
SECOND_TIME=$(( ($END - $START) / 1000000 ))
echo -e "${YELLOW}Second request: ${SECOND_TIME}ms${NC}"
echo ""

# Calculate improvement
IMPROVEMENT=$(( 100 - (SECOND_TIME * 100 / FIRST_TIME) ))
if [ $IMPROVEMENT -gt 50 ]; then
    echo -e "${GREEN}✓ Cache is working! ${IMPROVEMENT}% faster${NC}"
else
    echo -e "${RED}✗ Cache may not be working (only ${IMPROVEMENT}% improvement)${NC}"
fi
echo ""

# Test 5: Check cache keys
echo "5. Checking cache keys in Redis..."
CACHE_KEYS=$(docker exec backend_redis_1 redis-cli KEYS "cache:*" 2>/dev/null | wc -l)
if [ $CACHE_KEYS -gt 0 ]; then
    echo -e "${GREEN}✓ Found ${CACHE_KEYS} cache keys${NC}"
    echo "Sample keys:"
    docker exec backend_redis_1 redis-cli KEYS "cache:*" 2>/dev/null | head -5
else
    echo -e "${RED}✗ No cache keys found${NC}"
fi
echo ""

# Test 6: Check TTL
echo "6. Checking cache TTL..."
FIRST_KEY=$(docker exec backend_redis_1 redis-cli KEYS "cache:*" 2>/dev/null | head -1)
if [ ! -z "$FIRST_KEY" ]; then
    TTL=$(docker exec backend_redis_1 redis-cli TTL "$FIRST_KEY" 2>/dev/null)
    echo -e "${GREEN}✓ TTL for first key: ${TTL} seconds${NC}"
else
    echo -e "${YELLOW}⚠ No keys to check TTL${NC}"
fi
echo ""

# Test 7: Multiple requests to simulate page load
echo "7. Simulating 10 page loads..."
TOTAL_TIME=0
for i in {1..10}; do
    START=$(date +%s%N)
    curl -s http://localhost:8005/api/v1/packages/ > /dev/null
    END=$(date +%s%N)
    TIME=$(( ($END - $START) / 1000000 ))
    TOTAL_TIME=$(( TOTAL_TIME + TIME ))
    echo -n "."
done
echo ""
AVG_TIME=$(( TOTAL_TIME / 10 ))
echo -e "${YELLOW}Average time: ${AVG_TIME}ms${NC}"
if [ $AVG_TIME -lt 100 ]; then
    echo -e "${GREEN}✓ Excellent performance (cache working)${NC}"
elif [ $AVG_TIME -lt 200 ]; then
    echo -e "${YELLOW}⚠ Good performance${NC}"
else
    echo -e "${RED}✗ Slow performance (cache may not be working)${NC}"
fi
echo ""

# Test 8: Check Redis memory usage
echo "8. Checking Redis memory usage..."
REDIS_MEM=$(docker exec backend_redis_1 redis-cli INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
echo -e "${GREEN}✓ Redis memory: ${REDIS_MEM}${NC}"
echo ""

# Summary
echo "=== Summary ==="
echo "First request: ${FIRST_TIME}ms (cache miss)"
echo "Second request: ${SECOND_TIME}ms (cache hit)"
echo "Improvement: ${IMPROVEMENT}%"
echo "Average (10 requests): ${AVG_TIME}ms"
echo "Cache keys: ${CACHE_KEYS}"
echo "Redis memory: ${REDIS_MEM}"
echo ""

if [ $IMPROVEMENT -gt 50 ] && [ $CACHE_KEYS -gt 0 ]; then
    echo -e "${GREEN}✓✓✓ CACHING IS WORKING PERFECTLY! ✓✓✓${NC}"
    exit 0
else
    echo -e "${RED}✗✗✗ CACHING MAY HAVE ISSUES ✗✗✗${NC}"
    exit 1
fi
