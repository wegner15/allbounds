# 🔍 Memory Profiling Guide

## Setup

1. Install psutil (if not already installed):
```bash
pip install psutil
# or add to requirements.txt
```

2. Import the profiler in your endpoint file:
```python
from app.core.memory_profiler import profile_memory, profile_memory_detailed, MemoryMonitor
```

## Usage Methods

### Method 1: Simple Decorator (Recommended)

Add `@profile_memory` to any endpoint:

```python
from app.core.memory_profiler import profile_memory

@router.get("/packages/", response_model=List[PackageListResponse])
@profile_memory  # Add this line
def get_packages(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
):
    packages = package_service.get_packages(db, skip, limit)
    return [PackageListResponse.from_orm(pkg) for pkg in packages]
```

**Output in logs:**
```
🔍 MEMORY PROFILE: get_packages
  mem_before_mb: 165.23
  mem_after_mb: 245.67
  mem_increase_mb: 80.44
  traced_peak_mb: 82.15
```

### Method 2: Detailed Profiling

Use `@profile_memory_detailed` for top memory allocations:

```python
from app.core.memory_profiler import profile_memory_detailed

@router.get("/countries/")
@profile_memory_detailed  # More detailed
def get_countries(db: Session = Depends(get_db)):
    countries = country_service.get_countries(db)
    return [CountryResponse.from_orm(c) for c in countries]
```

**Output in logs:**
```
🔍 DETAILED MEMORY PROFILE: get_countries
  mem_before_mb: 165.23
  mem_after_mb: 245.67
  mem_increase_mb: 80.44
  traced_peak_mb: 82.15

Top 10 memory allocations in get_countries:
  #1: /app/app/services/country.py:45 - 25.34 MB (1250 blocks)
  #2: /app/app/schemas/country.py:30 - 18.22 MB (890 blocks)
  #3: /usr/lib/python3.12/sqlalchemy/orm/query.py:123 - 12.45 MB (450 blocks)
  ...
```

### Method 3: Monitor Specific Code Blocks

Use `MemoryMonitor` context manager:

```python
from app.core.memory_profiler import MemoryMonitor

@router.get("/packages/")
def get_packages(db: Session = Depends(get_db)):
    with MemoryMonitor("Database query"):
        packages = package_service.get_packages(db)
    
    with MemoryMonitor("Pydantic serialization"):
        result = [PackageListResponse.from_orm(pkg) for pkg in packages]
    
    return result
```

**Output:**
```
🔍 MEMORY MONITOR: Database query
  mem_increase_mb: 45.23

🔍 MEMORY MONITOR: Pydantic serialization
  mem_increase_mb: 35.21
```

### Method 4: Manual Snapshots

Log memory at specific points:

```python
from app.core.memory_profiler import log_memory_snapshot

@router.get("/packages/")
def get_packages(db: Session = Depends(get_db)):
    log_memory_snapshot("Before query")
    
    packages = package_service.get_packages(db)
    log_memory_snapshot("After query")
    
    result = [PackageListResponse.from_orm(pkg) for pkg in packages]
    log_memory_snapshot("After serialization")
    
    return result
```

## Quick Start: Profile All Hot Endpoints

Add profiling to the endpoints causing memory issues:

### 1. Profile packages endpoint:
```python
# app/api/api_v1/endpoints/packages.py
from app.core.memory_profiler import profile_memory_detailed

@router.get("/", response_model=List[PackageListResponse])
@profile_memory_detailed
def get_packages(db: Session = Depends(get_db), ...):
    # ... existing code
```

### 2. Profile countries endpoint:
```python
# app/api/api_v1/endpoints/countries.py
from app.core.memory_profiler import profile_memory_detailed

@router.get("/", response_model=List[CountryResponse])
@profile_memory_detailed
def get_countries(db: Session = Depends(get_db), ...):
    # ... existing code
```

### 3. Profile hotels, activities, attractions:
Same pattern - add `@profile_memory_detailed` above each endpoint.

## Viewing Results

### Check logs:
```bash
# Real-time monitoring
sudo docker compose logs api -f | grep "MEMORY PROFILE"

# Get last 50 memory profiles
sudo docker compose logs api --tail 500 | grep "MEMORY PROFILE"

# Filter by specific endpoint
sudo docker compose logs api | grep "get_packages"
```

### Analyze patterns:
```bash
# Find endpoints with highest memory increase
sudo docker compose logs api | grep "mem_increase_mb" | sort -t: -k2 -n | tail -20
```

## What to Look For

### 🚨 Red Flags:
1. **Large memory increase** (>100 MB per request)
   - Indicates loading too much data
   - Check query joins and relationships

2. **Memory not released** (mem_after stays high)
   - Objects staying in memory
   - Check for circular references

3. **High traced_peak_mb**
   - Temporary allocations during request
   - Check intermediate data structures

### ✅ Good Signs:
1. **Consistent memory increase** (~10-50 MB)
2. **Memory released after request** (GC working)
3. **Low traced_peak_mb** (efficient processing)

## Example: Finding the Problem

```python
# Add detailed profiling
@router.get("/packages/")
@profile_memory_detailed
def get_packages(db: Session = Depends(get_db)):
    with MemoryMonitor("Query execution"):
        packages = package_service.get_packages(db)
    
    with MemoryMonitor("Serialization"):
        result = [PackageListResponse.from_orm(pkg) for pkg in packages]
    
    return result
```

**If you see:**
```
🔍 MEMORY MONITOR: Query execution - mem_increase_mb: 150.00
🔍 MEMORY MONITOR: Serialization - mem_increase_mb: 5.00
```

**Diagnosis:** Query is loading too much data (150 MB), serialization is fine (5 MB)

**Fix:** Optimize query with better filtering, pagination, or selective column loading

## Advanced: Profile Service Layer

Add profiling to service methods:

```python
# app/services/package.py
from app.core.memory_profiler import profile_memory

class PackageService:
    @profile_memory
    def get_packages(self, db: Session, skip: int, limit: int):
        # ... existing code
```

## Production Considerations

⚠️ **Performance Impact:**
- `@profile_memory`: ~5-10ms overhead (acceptable)
- `@profile_memory_detailed`: ~50-100ms overhead (use sparingly)
- `tracemalloc`: ~10% memory overhead

**Recommendation:**
- Use `@profile_memory` in production (low overhead)
- Use `@profile_memory_detailed` only in development/staging
- Remove profiling after identifying issues

## Next Steps

1. **Add profiling to top 5 endpoints** (packages, countries, hotels, activities, attractions)
2. **Restart API and browse frontend**
3. **Check logs for memory patterns**
4. **Identify which endpoint/operation uses most memory**
5. **Optimize that specific code path**

## Quick Command Reference

```bash
# Add profiling
# Edit: app/api/api_v1/endpoints/packages.py
# Add: from app.core.memory_profiler import profile_memory_detailed
# Add: @profile_memory_detailed above endpoint

# Restart
sudo docker compose restart api

# Monitor
sudo docker compose logs api -f | grep "MEMORY"

# Analyze
sudo docker compose logs api --tail 1000 | grep "mem_increase_mb" | sort -t: -k2 -n
```

This will show you EXACTLY which routes and operations are consuming memory! 🎯
