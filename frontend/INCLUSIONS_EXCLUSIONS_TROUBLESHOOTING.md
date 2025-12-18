# Inclusions & Exclusions Troubleshooting Guide

## Problem Statement

User reports: **"I can't see inclusions and exclusions"**

## Root Cause Analysis

Based on the backend data you provided, the issue is likely one of the following:

### 1. Data Structure Mismatch

**Your Backend Response:**
```json
{
  "inclusions": null,
  "exclusions": null,
  "inclusion_items": [...],  // ← Has data
  "exclusion_items": [...]   // ← Has data
}
```

**Frontend Expects:**
```typescript
{
  inclusion_items: InclusionDetail[];
  exclusion_items: ExclusionDetail[];
}
```

**Issue:** The old endpoint returns `inclusions`/`exclusions` as null, while the new comprehensive endpoint should return `inclusion_items`/`exclusion_items`.

### 2. Wrong Endpoint Being Called

The frontend should be calling:
```
GET /api/v1/packages/comprehensive/{slug}
```

But might be calling:
```
GET /api/v1/packages/slug/{slug}  // Old endpoint
```

## Quick Diagnosis

### Step 1: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to package detail page
4. Look for API call
5. Check the URL - should be `/packages/comprehensive/...`
6. Check response - should have `inclusion_items` and `exclusion_items`

### Step 2: Check Console Logs

The API client logs all requests:
```
API Request: GET http://localhost:8005/api/v1/packages/comprehensive/ultimate-highland-to-savannah-safari
```

Look for this in console.

### Step 3: Use Debug Page

Navigate to:
```
http://localhost:5173/debug/package/ultimate-highland-to-savannah-safari
```

This will show:
- Number of inclusions found
- Number of exclusions found
- Full details of each item
- Raw JSON response

## Solutions

### Solution 1: Verify Correct Hook Usage

**File:** `frontend/src/features/packages/PackageDetailPageNew.tsx`

**Current Code:**
```tsx
const { data: packageDetail, isLoading, error, refetch } = useComprehensivePackageBySlug(slug!);
```

**Verify:** This is correct! ✅

### Solution 2: Check Backend Endpoint

**File:** `backend/app/api/api_v1/endpoints/packages.py`

Ensure the comprehensive endpoint exists and returns correct data:

```python
@router.get("/comprehensive/{slug}", response_model=PackageDetailResponse)
async def get_comprehensive_package_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    package = get_package_detail_by_slug(db, slug)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package
```

### Solution 3: Check Database Data

Run this query to verify data exists:

```sql
-- Check if package has inclusions
SELECT p.name, COUNT(pi.id) as inclusion_count
FROM packages p
LEFT JOIN package_inclusions pi ON p.id = pi.package_id
WHERE p.slug = 'ultimate-highland-to-savannah-safari'
GROUP BY p.id, p.name;

-- Check if package has exclusions
SELECT p.name, COUNT(pe.id) as exclusion_count
FROM packages p
LEFT JOIN package_exclusions pe ON p.id = pe.package_id
WHERE p.slug = 'ultimate-highland-to-savannah-safari'
GROUP BY p.id, p.name;
```

### Solution 4: Check Conditional Rendering

**File:** `frontend/src/features/packages/PackageDetailPageNew.tsx`

The section only renders if data exists:

```tsx
{(packageDetail.inclusion_items?.length > 0 || packageDetail.exclusion_items?.length > 0) && (
  <div className="mb-6 md:mb-8">
    <InclusionsExclusionsSection 
      inclusions={packageDetail.inclusion_items || []} 
      exclusions={packageDetail.exclusion_items || []} 
    />
  </div>
)}
```

**Debug:** Add console.log to check:

```tsx
console.log('Inclusions:', packageDetail.inclusion_items);
console.log('Exclusions:', packageDetail.exclusion_items);
```

## Expected Behavior

When working correctly, you should see:

### In Browser Network Tab:
```
Request URL: http://localhost:8005/api/v1/packages/comprehensive/ultimate-highland-to-savannah-safari
Status: 200 OK
Response: {
  "inclusion_items": [
    {
      "id": 1,
      "name": "Transport",
      "description": "Description",
      "icon": "train",
      "category": "Transportation"
    },
    ...
  ],
  "exclusion_items": [...]
}
```

### On the Page:
- Section titled "What's Included & Excluded"
- Two columns: "What's Included" and "What's Not Included"
- Items grouped by category
- Custom icons (if provided) or check/x icons
- Expandable descriptions

## Common Mistakes

### ❌ Wrong: Using old endpoint
```tsx
const { data } = usePackageBySlug(slug);  // Old endpoint
```

### ✅ Correct: Using comprehensive endpoint
```tsx
const { data } = useComprehensivePackageBySlug(slug);  // New endpoint
```

### ❌ Wrong: Checking wrong field names
```tsx
if (packageDetail.inclusions?.length > 0)  // Old field name
```

### ✅ Correct: Using correct field names
```tsx
if (packageDetail.inclusion_items?.length > 0)  // New field name
```

## Testing Steps

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8005
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Navigate to Package:**
   ```
   http://localhost:5173/packages/ultimate-highland-to-savannah-safari
   ```

4. **Verify Sections Visible:**
   - [ ] Hero section loads
   - [ ] Overview section loads
   - [ ] **Inclusions/Exclusions section loads** ← Check this!
   - [ ] Hotels section loads (if data exists)
   - [ ] Attractions section loads (if data exists)

5. **Check Inclusions Display:**
   - [ ] Section header "What's Included & Excluded"
   - [ ] Left column "What's Included"
   - [ ] Right column "What's Not Included"
   - [ ] Items grouped by category
   - [ ] Icons display (custom or generic)
   - [ ] Descriptions expandable on click

## Still Not Working?

If inclusions/exclusions still don't show after checking all above:

1. **Clear browser cache and reload**
2. **Check browser console for errors**
3. **Verify API is returning data** (use debug page)
4. **Check if section is being hidden by CSS**
5. **Verify React DevTools** - check component props

## Contact Points

If issue persists, provide:
1. Screenshot of Network tab showing API request/response
2. Screenshot of Console tab showing any errors
3. Screenshot of page (what you see vs what you expect)
4. Browser and version
5. Steps to reproduce

## Quick Fix Script

Run this to verify everything:

```bash
# Check if backend is running
curl http://localhost:8005/api/v1/packages/comprehensive/ultimate-highland-to-savannah-safari | jq '.inclusion_items | length'

# Should return a number > 0
```

If this returns 0 or error, the issue is in the backend, not frontend.
