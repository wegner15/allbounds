# Map Coordinates Implementation

## Overview

The itinerary map uses coordinates from three sources to display locations on an interactive map.

## Data Sources

### 1. Itinerary Items
Each day in the itinerary can have coordinates:

**Backend Schema:** `backend/app/schemas/package_detail.py`
```python
class ItineraryItemDetail(BaseModel):
    id: int
    day_number: int
    title: str
    location: Optional[str] = None
    latitude: Optional[float] = None  # ✅ Added
    longitude: Optional[float] = None  # ✅ Added
    # ... other fields
```

**Frontend Type:** `frontend/src/lib/types/api.ts`
```typescript
export interface ItineraryItemDetail {
  id: number;
  day_number: number;
  title: string;
  location?: string;
  latitude?: number;  // ✅ Already exists
  longitude?: number;  // ✅ Already exists
  // ... other fields
}
```

### 2. Hotels
Hotels within itinerary items can have coordinates:

**Backend Schema:**
```python
class HotelSummary(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    latitude: Optional[float] = None  # ✅ Added
    longitude: Optional[float] = None  # ✅ Added
    # ... other fields
```

**Frontend Type:**
```typescript
export interface HotelSummary {
  id: number;
  name: string;
  city?: string;
  latitude?: number;  // ✅ Already exists
  longitude?: number;  // ✅ Already exists
  // ... other fields
}
```

### 3. Attractions
Attractions within itinerary items can have coordinates:

**Backend Schema:**
```python
class AttractionSummary(BaseModel):
    id: int
    name: str
    city: Optional[str] = None
    latitude: Optional[float] = None  # ✅ Added
    longitude: Optional[float] = None  # ✅ Added
    // ... other fields
}
```

**Frontend Type:**
```typescript
export interface AttractionSummary {
  id: number;
  name: string;
  city?: string;
  latitude?: number;  // ✅ Already exists
  longitude?: number;  // ✅ Already exists
  // ... other fields
}
```

## Map Implementation

### Component: `ItineraryMapLeaflet.tsx`

The map component extracts coordinates from all three sources:

```typescript
const { locations, routeCoordinates, center } = useMemo(() => {
  const locs: MapLocation[] = [];
  const route: LatLngExpression[] = [];
  
  // 1. Extract itinerary locations
  itineraryItems.forEach((item, index) => {
    if (item.latitude && item.longitude) {
      locs.push({
        day: item.day_number,
        location: item.location || `Day ${item.day_number}`,
        title: item.title,
        lat: item.latitude,
        lng: item.longitude,
        type: 'itinerary',
        isFirst: index === 0,
        isLast: index === itineraryItems.length - 1,
      });
      route.push([item.latitude, item.longitude]);
    }
    
    // 2. Extract hotel locations
    item.hotels?.forEach(hotel => {
      if (hotel.latitude && hotel.longitude) {
        locs.push({
          day: item.day_number,
          location: hotel.city || hotel.name,
          title: hotel.name,
          lat: hotel.latitude,
          lng: hotel.longitude,
          type: 'hotel',
        });
      }
    });
    
    // 3. Extract attraction locations
    item.attractions?.forEach(attraction => {
      if (attraction.latitude && attraction.longitude) {
        locs.push({
          day: item.day_number,
          location: attraction.city || attraction.name,
          title: attraction.name,
          lat: attraction.latitude,
          lng: attraction.longitude,
          type: 'attraction',
        });
      }
    });
  });
  
  return { locations: locs, routeCoordinates: route, center };
}, [itineraryItems]);
```

## Map Features

### Visual Elements

1. **Route Line**: Dashed line connecting itinerary points in order
2. **Markers**: Different colored markers for different types:
   - 🟢 Green: Start point (first day)
   - 🔴 Red: End point (last day)
   - 🔵 Teal: Regular itinerary points (with day number)
   - 🟠 Amber: Hotels
   - 🟣 Purple: Attractions

3. **Popups**: Click markers to see details
4. **Tooltips**: Hover over markers to see titles
5. **Legend**: Shows what each marker type represents
6. **Stats**: Summary of destinations, hotels, and attractions

### Fallback Behavior

If no coordinates are available:
- Shows a message: "Map coordinates not available for this tour"
- Doesn't render the map component
- Gracefully degrades to text-only itinerary

## Database Fields

### Itinerary Table
```sql
ALTER TABLE itinerary_items 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

### Hotels Table
```sql
ALTER TABLE hotels 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

### Attractions Table
```sql
ALTER TABLE attractions 
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8);
```

## Usage in PackageDetailPageNew

The map is automatically included when itinerary items exist:

```typescript
{packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0 && (
  <div className="mb-6 md:mb-8">
    <ItineraryMapLeaflet 
      itineraryItems={packageDetail.itinerary_items}
      packageName={packageDetail.name}
    />
  </div>
)}
```

## Adding Coordinates to Data

### Via Admin Panel

When creating/editing:
1. **Itinerary Items**: Add latitude/longitude for each day's main location
2. **Hotels**: Add coordinates when adding hotels to the system
3. **Attractions**: Add coordinates when adding attractions to the system

### Geocoding Services

You can use services like:
- Google Maps Geocoding API
- OpenStreetMap Nominatim
- Mapbox Geocoding API

To automatically convert addresses to coordinates.

## Testing

To test the map:

1. **Add coordinates to itinerary items** in the database
2. **Navigate to package detail page**
3. **Scroll to itinerary section**
4. **Map should display** with markers and route

Example coordinates (Kenya):
- Nairobi: -1.286389, 36.817223
- Maasai Mara: -1.406111, 35.006111
- Lake Nakuru: -0.303056, 36.080278
- Aberdare: -0.416667, 36.700000

## Status

✅ **Backend schemas updated** - latitude/longitude added to all three entities
✅ **Frontend types updated** - Already had coordinate fields
✅ **Map component exists** - ItineraryMapLeaflet.tsx ready to use
✅ **Integration ready** - Just need to add coordinates to database

## Next Steps

1. Add coordinates to existing itinerary items, hotels, and attractions in database
2. Update admin forms to include coordinate fields
3. Consider adding geocoding service for automatic coordinate lookup
4. Test map with real data
