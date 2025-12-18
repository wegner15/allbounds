# 🔬 OpenTelemetry Memory Leak Test

## Hypothesis
OpenTelemetry instrumentation (specifically `opentelemetry-instrumentation-sqlalchemy`) is causing an infinite memory leak by continuously collecting metrics or traces in a background loop.

## Evidence
1. Memory grows **continuously** even with ZERO traffic after initial page load
2. CPU stays at 20-30% constantly (something running in background)
3. Memory growth: 134 MB → 1.4 GB in 30 seconds with NO requests
4. Growth rate: ~250 MB every 10 seconds

## Test
Temporarily removed:
- `opentelemetry-api==1.20.0`
- `opentelemetry-sdk==1.20.0`
- `opentelemetry-exporter-otlp==1.20.0`
- `opentelemetry-instrumentation-fastapi==0.41b0`
- `opentelemetry-instrumentation-sqlalchemy==0.41b0`

## Expected Result
If OpenTelemetry is the cause:
- Memory should stabilize after initial page load
- CPU should drop to near 0% when idle
- No continuous growth

## Commands to Test
```bash
# Rebuild without OpenTelemetry
cd ~/allbounds/backend
sudo docker compose build api

# Start fresh
sudo docker compose down
sudo docker compose up -d

# Monitor memory (should stay stable)
watch -n 5 'ps aux --sort=-%mem | grep "python3.12.*spawn" | head -2'
```

## Results
[To be filled after testing]
