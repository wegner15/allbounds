# Memory Monitoring Guide

## Quick Start

### 1. Start Monitoring
```bash
cd ~/allbounds/backend
chmod +x start_monitoring.sh
./start_monitoring.sh
```

This will:
- Start logging memory every 5 minutes
- Run in the background
- Save data to `memory_monitor.log`

### 2. Check Status
```bash
# View recent logs
tail -20 memory_monitor.log

# Watch live
tail -f memory_monitor.log

# Check if monitor is running
ps aux | grep monitor_memory
```

### 3. Analyze Results
```bash
# After 6-24 hours of monitoring
python3 analyze_memory.py memory_monitor.log
```

This will show:
- Memory growth trends per process
- Leak detection (processes growing >100MB)
- System memory summary
- Recommendations

### 4. Stop Monitoring
```bash
# Find the PID
cat memory_monitor.pid

# Stop it
kill $(cat memory_monitor.pid)
rm memory_monitor.pid
```

## What Gets Logged

Every 5 minutes, the script logs:
- All Python processes (FastAPI workers, Celery)
- PID, CPU%, Memory%, RSS (actual RAM), VSZ (virtual)
- System total/used/free memory
- Timestamp for trend analysis

## Log Format

CSV format for easy analysis:
```
Timestamp,PID,User,%CPU,%MEM,VSZ_KB,RSS_KB,Command
2025-11-25 00:15:00,12345,root,0.5,13.8,945052,549504,/usr/local/bin/python3.12...
```

## Interpreting Results

### Healthy Pattern
- RSS stays between 200-600 MB
- Small fluctuations (<50 MB)
- No continuous growth

### Memory Leak Pattern
- RSS grows continuously (500 → 700 → 900 → 1200 MB)
- Growth >100 MB over 6 hours
- Eventually triggers OOM kill

### After OOM Kill
- Process disappears from logs
- New PID appears with low memory
- Check `/var/log/syslog` for "Out of memory: Killed process"

## Customization

Edit `monitor_memory.sh` to change:
- `INTERVAL=300` - Change to 60 for 1-minute intervals
- `LOG_FILE` - Change log location
- Add filters for specific processes

## Example Analysis Session

```bash
# Start monitoring
./start_monitoring.sh

# Let it run for 12 hours
# ... wait ...

# Analyze
python3 analyze_memory.py memory_monitor.log

# Expected output if Meilisearch was the culprit:
# ✓ No processes exceeded 1GB
# ✓ No significant memory growth detected

# Or if leak persists:
# ⚠️ PID 12345: +450 MB growth
# → Investigate other causes
```

## Integration with OOM Detection

Combine with syslog monitoring:
```bash
# Check for OOM kills during monitoring period
sudo grep -i "out of memory\|killed process" /var/log/syslog | \
  grep "$(date +%Y-%m-%d)"
```

## Troubleshooting

**Monitor not starting?**
```bash
chmod +x monitor_memory.sh start_monitoring.sh
```

**No data in log?**
```bash
# Check if script is running
ps aux | grep monitor_memory

# Check permissions
ls -l memory_monitor.log
```

**Analysis script errors?**
```bash
# Ensure Python 3 is installed
python3 --version

# Check log file format
head -5 memory_monitor.log
```
