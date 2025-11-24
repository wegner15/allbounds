#!/bin/bash
# Memory monitoring script for FastAPI workers
# Logs memory usage every 5 minutes to track OOM issues

LOG_FILE="/home/nashon/allbounds/backend/memory_monitor.log"
INTERVAL=300  # 5 minutes in seconds

echo "Starting memory monitor - logging to: $LOG_FILE"
echo "Press Ctrl+C to stop"
echo ""

# Create log file with header
echo "=== Memory Monitor Started: $(date) ===" >> "$LOG_FILE"
echo "Timestamp,PID,User,%CPU,%MEM,VSZ_KB,RSS_KB,Command" >> "$LOG_FILE"

while true; do
    # Get current timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Get Python processes sorted by memory
    ps aux --sort=-%mem | grep -E "python|PID" | grep -v grep | while read line; do
        # Only log if it's a Python process (not the header)
        if echo "$line" | grep -q "python"; then
            # Extract fields
            USER=$(echo "$line" | awk '{print $1}')
            PID=$(echo "$line" | awk '{print $2}')
            CPU=$(echo "$line" | awk '{print $3}')
            MEM=$(echo "$line" | awk '{print $4}')
            VSZ=$(echo "$line" | awk '{print $5}')
            RSS=$(echo "$line" | awk '{print $6}')
            CMD=$(echo "$line" | awk '{for(i=11;i<=NF;i++) printf $i" "; print ""}')
            
            # Log to file
            echo "$TIMESTAMP,$PID,$USER,$CPU,$MEM,$VSZ,$RSS,$CMD" >> "$LOG_FILE"
        fi
    done
    
    # Also log total system memory
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "Total:%sMB Used:%sMB Free:%sMB", $2,$3,$4}')
    echo "$TIMESTAMP,SYSTEM,system,0,0,0,0,$TOTAL_MEM" >> "$LOG_FILE"
    
    # Print to console
    echo "[$TIMESTAMP] Logged memory snapshot"
    
    # Sleep for interval
    sleep $INTERVAL
done
