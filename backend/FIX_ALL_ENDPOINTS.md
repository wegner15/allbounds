# Critical Fix Needed

## Problem
Multiple endpoints are still returning ORM objects directly instead of serializing to Pydantic models.

## Files to Fix:
1. `app/api/api_v1/endpoints/activities.py` - lines 41, 57
2. `app/api/api_v1/endpoints/attractions.py` - lines 42, 55
3. `app/api/api_v1/endpoints/hotels.py` - lines 37, 49, 62
4. `app/api/api_v1/endpoints/regions.py` - line 27

## Required Changes:
Replace:
```python
return activities
```

With:
```python
return [ActivityResponse.from_orm(activity) for activity in activities]
```

Do this for ALL endpoints returning lists of ORM objects.
