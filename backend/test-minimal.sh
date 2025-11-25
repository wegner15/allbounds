#!/bin/bash

echo "🧪 Testing MINIMAL FastAPI + PostgreSQL setup"
echo "=============================================="
echo ""
echo "This will test with:"
echo "  ✅ FastAPI"
echo "  ✅ PostgreSQL"
echo "  ✅ SQLAlchemy"
echo "  ❌ Redis (disabled)"
echo "  ❌ Meilisearch (disabled)"
echo "  ❌ Celery (disabled)"
echo "  ❌ OpenTelemetry (disabled)"
echo "  ❌ Prometheus (disabled)"
echo ""

# Stop everything
echo "1. Stopping all services..."
sudo docker compose down
sleep 2

# Rebuild without OpenTelemetry
echo ""
echo "2. Rebuilding API (without OpenTelemetry)..."
sudo docker compose -f docker-compose.minimal.yml build api

# Start minimal setup
echo ""
echo "3. Starting minimal setup (FastAPI + PostgreSQL only)..."
sudo docker compose -f docker-compose.minimal.yml up -d

echo ""
echo "4. Waiting 20 seconds for startup..."
sleep 20

# Check initial memory
echo ""
echo "5. Initial memory usage:"
ps aux --sort=-%mem | grep "python3.12.*spawn" | head -2 | awk '{print "   Worker: "$6/1024" MB"}'

echo ""
echo "6. Making ONE test request..."
curl -s http://localhost:8005/api/v1/countries/ > /dev/null
echo "   ✅ Request completed"

echo ""
echo "7. Waiting 30 seconds with NO traffic..."
sleep 30

# Check memory after idle
echo ""
echo "8. Memory after 30s idle (should be STABLE):"
ps aux --sort=-%mem | grep "python3.12.*spawn" | head -2 | awk '{print "   Worker: "$6/1024" MB"}'

echo ""
echo "9. Waiting another 30 seconds..."
sleep 30

# Final check
echo ""
echo "10. Final memory check (should still be STABLE):"
ps aux --sort=-%mem | grep "python3.12.*spawn" | head -2 | awk '{print "   Worker: "$6/1024" MB"}'

echo ""
echo "=============================================="
echo "✅ Test complete!"
echo ""
echo "Expected result:"
echo "  - Memory should stay at ~150-200 MB"
echo "  - NO continuous growth"
echo "  - CPU should be near 0% when idle"
echo ""
echo "If memory is stable, the leak was in:"
echo "  - OpenTelemetry, OR"
echo "  - Redis, OR"
echo "  - Meilisearch, OR"
echo "  - Celery"
echo ""
echo "Check logs with:"
echo "  sudo docker compose -f docker-compose.minimal.yml logs api"
