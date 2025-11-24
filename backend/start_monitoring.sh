#!/bin/bash
# Start memory monitoring in the background

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LOG_FILE="$SCRIPT_DIR/memory_monitor.log"
PID_FILE="$SCRIPT_DIR/memory_monitor.pid"

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Memory monitor already running (PID: $OLD_PID)"
        echo "To stop it: kill $OLD_PID"
        exit 1
    else
        echo "Removing stale PID file"
        rm "$PID_FILE"
    fi
fi

# Make monitor script executable
chmod +x "$SCRIPT_DIR/monitor_memory.sh"

# Start monitoring in background
echo "Starting memory monitor..."
nohup "$SCRIPT_DIR/monitor_memory.sh" > /dev/null 2>&1 &
MONITOR_PID=$!

# Save PID
echo $MONITOR_PID > "$PID_FILE"

echo "✓ Memory monitor started (PID: $MONITOR_PID)"
echo "  Log file: $LOG_FILE"
echo "  To stop: kill $MONITOR_PID"
echo "  To analyze: python3 analyze_memory.py $LOG_FILE"
echo ""
echo "Monitoring every 5 minutes. Check logs with:"
echo "  tail -f $LOG_FILE"
