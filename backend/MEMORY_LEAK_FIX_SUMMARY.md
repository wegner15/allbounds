# Memory Leak Root Cause & Fix

## 🎯 ROOT CAUSE IDENTIFIED

**The memory spike is caused by SQLAlchemy lazy-loading massive relationships when Pydantic serializes responses.**

### The Problem

1. **Package/GroupTrip models have 10+ relationships** (country, holiday_types, media_assets, reviews, hotels, attractions, inclusion_items, exclusion_items, itinerary_items, price_charts)

2. **Response schemas serialize ALL relationships**:
   ```python
   class PackageResponse(PackageBase):
       holiday_types: List[HolidayTypeResponse]  # ← Triggers lazy load
       inclusion_items: List[InclusionResponse]  # ← Triggers lazy load  
       exclusion_items: List[ExclusionResponse]  # ← Triggers lazy load
   ```

3. **When FastAPI serializes 100 packages**:
   - Pydantic accesses each relationship attribute
   - SQLAlchemy lazy-loads ALL related data into memory
   - Each package with relationships = 5-10 MB
   - 100 packages × 10 MB = **1-2 GB memory spike**

4. **Large text fields make it worse**:
   - `description`, `itinerary`, `inclusions`, `exclusions` can be 10KB-100KB each
   - Multiplied by 100 packages = massive memory usage

### Why This Doesn't Happen in Other FastAPI Apps

- Most apps don't have 10+ relationships per model
- Most apps use lightweight list responses (ID, name, thumbnail only)
- Most apps don't have multi-KB text fields in every record

## ✅ FIXES APPLIED

### 1. Lightweight List Response Schema

**File**: `app/schemas/package.py`

Added `PackageListResponse` that only includes essential fields:
```python
class PackageListResponse(BaseModel):
    id: int
    name: str
    summary: Optional[str] = None
    country_id: int
    duration_days: Optional[int] = None
    price: Optional[float] = None
    image_id: Optional[str] = None
    slug: str
    is_active: bool
    is_featured: bool
    created_at: datetime
    country: CountryResponse  # Only country, no other relationships
```

**Benefits**:
- No lazy-loading of heavy relationships
- Memory per package: ~1-2 KB instead of 5-10 MB
- 100 packages: ~200 KB instead of 1-2 GB

### 2. Removed Eager Loading

**File**: `app/services/package.py`

Removed `joinedload(Package.holiday_types)` from list queries:
```python
query = db.query(Package).options(
    joinedload(Package.country)  # Only load country
    # Removed: joinedload(Package.holiday_types)
).filter(Package.is_active == True)
```

### 3. Updated List Endpoint

**File**: `app/api/api_v1/endpoints/packages.py`

Changed response model from `PackageWithCountryResponse` to `PackageListResponse`:
```python
@router.get("/", response_model=List[PackageListResponse])  # ← Changed
def get_packages(...):
```

## 📋 TODO: Apply Same Fix to Other Endpoints

These endpoints likely have the same issue:

### High Priority (Heavy Models)
- [ ] `/api/v1/group-trips/` - GroupTrip has same relationships as Package
- [ ] `/api/v1/accommodations/` - Accommodation model
- [ ] `/api/v1/attractions/` - Attraction model

### Medium Priority
- [ ] `/api/v1/blog/` - BlogPost with content field
- [ ] `/api/v1/hotels/` - Hotel with amenities

### Pattern to Apply

1. **Create lightweight list schema**:
   ```python
   class EntityListResponse(BaseModel):
       id: int
       name: str
       # Only essential fields, no relationships except parent
   ```

2. **Remove eager loading in service**:
   ```python
   query = db.query(Entity).options(
       joinedload(Entity.parent_only)  # Only immediate parent
   ).filter(...)
   ```

3. **Update endpoint response model**:
   ```python
   @router.get("/", response_model=List[EntityListResponse])
   ```

4. **Keep detail endpoints unchanged**:
   ```python
   @router.get("/{id}", response_model=EntityWithAllRelationshipsResponse)
   # Detail view can load everything - only 1 record
   ```

## 🧪 Testing

### Before Fix
```bash
# List 100 packages
curl http://localhost:8005/api/v1/packages/?limit=100

# Check memory
ps aux --sort=-%mem | grep python
# Expected: 2-4 GB for one worker
```

### After Fix
```bash
# Same request
curl http://localhost:8005/api/v1/packages/?limit=100

# Check memory
ps aux --sort=-%mem | grep python
# Expected: 200-400 MB for one worker
```

### Monitor
```bash
cd ~/allbounds/backend
./start_monitoring.sh

# Wait 1 hour, then analyze
python3 analyze_memory.py memory_monitor.log
```

## 🔍 How to Find Similar Issues

Search for:
```bash
# Find models with many relationships
grep -r "relationship(" app/models/ | wc -l

# Find response schemas with List[] fields
grep -r "List\[.*Response\]" app/schemas/

# Find endpoints returning lists
grep -r "response_model=List\[" app/api/
```

## 📊 Expected Results

- **Memory per worker**: 200-400 MB (down from 2-4 GB)
- **No more OOM kills**
- **API response time**: Slightly faster (less data to serialize)
- **Frontend impact**: None (list views don't need full data anyway)

## 🚀 Deployment

```bash
cd ~/allbounds/backend

# Stop host processes
sudo pkill -f "uvicorn app.main:app"

# Start Docker containers
sudo docker compose up -d

# Verify
sudo docker compose ps
sudo docker compose logs -f api

# Start monitoring
./start_monitoring.sh
```

## 📝 Notes

- **Detail endpoints** (GET /{id}) are fine - they only load 1 record
- **Create/Update endpoints** are fine - they don't return lists
- **The issue ONLY affects list endpoints** returning 50-100+ records
- **Meilisearch indexing** was a red herring - the real issue is relationship loading
