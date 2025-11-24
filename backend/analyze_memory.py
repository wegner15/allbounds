#!/usr/bin/env python3
"""
Analyze memory monitor logs to detect leaks and trends.
Usage: python3 analyze_memory.py memory_monitor.log
"""

import sys
import csv
from datetime import datetime
from collections import defaultdict

def analyze_log(log_file):
    """Analyze memory log file and generate report."""
    
    processes = defaultdict(list)
    system_mem = []
    
    print(f"Analyzing: {log_file}\n")
    
    try:
        with open(log_file, 'r') as f:
            # Skip header lines
            for line in f:
                if line.startswith('Timestamp,'):
                    break
            
            reader = csv.DictReader(f)
            for row in reader:
                if row['PID'] == 'SYSTEM':
                    system_mem.append({
                        'timestamp': row['Timestamp'],
                        'info': row['Command']
                    })
                else:
                    pid = row['PID']
                    processes[pid].append({
                        'timestamp': row['Timestamp'],
                        'mem_pct': float(row['%MEM']),
                        'rss_mb': int(row['RSS_KB']) / 1024,
                        'vsz_mb': int(row['VSZ_KB']) / 1024,
                        'cmd': row['Command']
                    })
    except FileNotFoundError:
        print(f"Error: File not found: {log_file}")
        return
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    if not processes:
        print("No process data found in log file.")
        return
    
    # Analyze each process
    print("=" * 80)
    print("MEMORY LEAK ANALYSIS")
    print("=" * 80)
    
    for pid, data in sorted(processes.items()):
        if len(data) < 2:
            continue
        
        first = data[0]
        last = data[-1]
        max_mem = max(d['rss_mb'] for d in data)
        min_mem = min(d['rss_mb'] for d in data)
        avg_mem = sum(d['rss_mb'] for d in data) / len(data)
        
        growth = last['rss_mb'] - first['rss_mb']
        growth_pct = (growth / first['rss_mb'] * 100) if first['rss_mb'] > 0 else 0
        
        print(f"\nPID {pid}: {first['cmd'][:60]}")
        print(f"  Duration: {first['timestamp']} → {last['timestamp']}")
        print(f"  Samples: {len(data)}")
        print(f"  RSS Memory:")
        print(f"    Start:   {first['rss_mb']:.1f} MB")
        print(f"    End:     {last['rss_mb']:.1f} MB")
        print(f"    Min:     {min_mem:.1f} MB")
        print(f"    Max:     {max_mem:.1f} MB")
        print(f"    Average: {avg_mem:.1f} MB")
        print(f"  Growth: {growth:+.1f} MB ({growth_pct:+.1f}%)")
        
        # Leak detection
        if growth > 100:  # More than 100MB growth
            print(f"  ⚠️  WARNING: Significant memory growth detected!")
        elif growth > 50:
            print(f"  ⚠️  CAUTION: Moderate memory growth")
        elif growth < -50:
            print(f"  ✓  Memory decreased (worker may have restarted)")
        else:
            print(f"  ✓  Memory stable")
    
    # System memory summary
    if system_mem:
        print("\n" + "=" * 80)
        print("SYSTEM MEMORY SUMMARY")
        print("=" * 80)
        print(f"First check: {system_mem[0]['timestamp']} - {system_mem[0]['info']}")
        print(f"Last check:  {system_mem[-1]['timestamp']} - {system_mem[-1]['info']}")
    
    print("\n" + "=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    
    # Check for any process over 1GB
    high_mem_pids = [pid for pid, data in processes.items() 
                     if any(d['rss_mb'] > 1000 for d in data)]
    
    if high_mem_pids:
        print("⚠️  Processes exceeding 1GB detected:")
        for pid in high_mem_pids:
            max_mem = max(d['rss_mb'] for d in processes[pid])
            print(f"   PID {pid}: {max_mem:.1f} MB")
        print("   → Apply batching fix to search.py")
    else:
        print("✓  No processes exceeded 1GB")
    
    # Check for growth trends
    growing_pids = [pid for pid, data in processes.items()
                    if len(data) >= 3 and (data[-1]['rss_mb'] - data[0]['rss_mb']) > 50]
    
    if growing_pids:
        print("\n⚠️  Processes with growing memory:")
        for pid in growing_pids:
            data = processes[pid]
            growth = data[-1]['rss_mb'] - data[0]['rss_mb']
            print(f"   PID {pid}: +{growth:.1f} MB")
        print("   → Monitor for continued growth or OOM kills")
    else:
        print("\n✓  No significant memory growth detected")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_memory.py memory_monitor.log")
        sys.exit(1)
    
    analyze_log(sys.argv[1])
