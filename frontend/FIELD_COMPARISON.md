# Package Detail Fields Comparison

## Backend Schema vs Frontend Display

This document compares the fields available in the backend `PackageDetailResponse` schema with what's actually displayed on the frontend.

### ✅ Package Basic Info

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | HeroSection (title) |
| slug | ✅ | ✅ | URL |
| summary | ✅ | ✅ | HeroSection (subtitle) |
| description | ✅ | ✅ | OverviewSection (HTML content) |
| duration_days | ✅ | ✅ | HeroSection, OverviewSection |
| price | ✅ | ✅ | HeroSection, BookingSidebar |
| image_id | ✅ | ✅ | HeroSection (hero image) |
| is_active | ✅ | ❌ (admin only) | - |
| is_featured | ✅ | ❌ (not displayed) | - |
| created_at | ✅ | ❌ (not needed) | - |
| updated_at | ✅ | ❌ (not needed) | - |

### ✅ Country

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | HeroSection, Breadcrumb |
| slug | ✅ | ✅ | Breadcrumb link |
| image_id | ✅ | ❌ (not displayed) | - |

### ✅ Holiday Types

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | HeroSection (tags) |
| slug | ✅ | ❌ (not used) | - |
| icon | ✅ | ✅ | HeroSection (tag icons) |

### ✅ Media Assets (Gallery)

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| image_id | ✅ | ✅ | HeroSection (carousel) |
| storage_key | ✅ | ❌ (not needed) | - |
| file_path | ✅ | ❌ (not needed) | - |
| filename | ✅ | ❌ (not needed) | - |
| title | ✅ | ✅ | Image title |
| caption | ✅ | ❌ (not displayed) | **MISSING** |
| alt_text | ✅ | ✅ | Image alt text |
| width | ✅ | ❌ (not needed) | - |
| height | ✅ | ❌ (not needed) | - |
| order_index | ✅ | ✅ | Carousel order |

### ✅ Itinerary Items

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| day_number | ✅ | ✅ | ItineraryDayCard |
| date | ✅ | ❌ (not displayed) | **MISSING** |
| title | ✅ | ✅ | ItineraryDayCard |
| description | ✅ | ✅ | ItineraryDayCard |
| location | ✅ | ❌ (not displayed) | **MISSING** |
| accommodation_notes | ✅ | ❌ (not displayed) | **MISSING** |
| hotels | ✅ | ✅ | ItineraryDayCard |
| attractions | ✅ | ✅ | ItineraryDayCard |
| custom_activities | ✅ | ✅ | ItineraryDayCard |
| linked_activities | ✅ | ✅ | ItineraryDayCard |

### ✅ Itinerary Activities (Custom)

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| time | ✅ | ✅ | ItineraryDayCard |
| activity_title | ✅ | ✅ | ItineraryDayCard |
| activity_description | ✅ | ✅ | ItineraryDayCard |
| location | ✅ | ✅ | ItineraryDayCard |
| duration_hours | ✅ | ✅ | ItineraryDayCard |
| is_meal | ✅ | ✅ | ItineraryDayCard (icon) |
| meal_type | ✅ | ✅ | ItineraryDayCard |
| order_index | ✅ | ✅ | Activity order |

### ✅ Inclusions

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | InclusionExclusionGrid |
| description | ✅ | ✅ | InclusionExclusionGrid (expandable) |
| icon | ✅ | ❌ (not displayed) | **MISSING** |
| category | ✅ | ✅ | InclusionExclusionGrid (grouping) |

### ✅ Exclusions

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | InclusionExclusionGrid |
| description | ✅ | ✅ | InclusionExclusionGrid (expandable) |
| icon | ✅ | ❌ (not displayed) | **MISSING** |
| category | ✅ | ✅ | InclusionExclusionGrid (grouping) |

### ✅ Hotels

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | HotelCard |
| slug | ✅ | ❌ (not used for link) | **MISSING** |
| summary | ✅ | ✅ | HotelCard |
| city | ✅ | ✅ | HotelCard |
| stars | ✅ | ✅ | HotelCard (star rating) |
| image_id | ✅ | ✅ | HotelCard |
| amenities | ✅ | ✅ | HotelCard |

### ✅ Amenities

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | HotelCard |
| icon | ✅ | ✅ | HotelCard |
| category | ✅ | ❌ (not displayed) | - |

### ✅ Attractions

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| name | ✅ | ✅ | AttractionCard |
| slug | ✅ | ❌ (not used for link) | **MISSING** |
| summary | ✅ | ✅ | AttractionCard |
| description | ✅ | ❌ (not displayed) | **MISSING** |
| city | ✅ | ✅ | AttractionCard |
| image_id | ✅ | ✅ | AttractionCard |

### ✅ Reviews

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| title | ✅ | ✅ | ReviewsSection |
| content | ✅ | ✅ | ReviewsSection |
| rating | ✅ | ✅ | ReviewsSection (stars) |
| reviewer_name | ✅ | ✅ | ReviewsSection |
| is_approved | ✅ | ✅ | ReviewsSection (filter) |
| is_featured | ✅ | ✅ | ReviewsSection (badge) |
| created_at | ✅ | ✅ | ReviewsSection (date) |

### ✅ Price Charts

| Field | Backend | Frontend Display | Location |
|-------|---------|------------------|----------|
| id | ✅ | ❌ (not needed) | - |
| title | ✅ | ❌ (not displayed) | **MISSING** |
| start_date | ✅ | ❌ (not displayed) | **MISSING** |
| end_date | ✅ | ❌ (not displayed) | **MISSING** |
| price | ✅ | ❌ (not displayed) | **MISSING** |
| is_active | ✅ | ❌ (not displayed) | **MISSING** |

## Summary of Missing Fields

### High Priority (Should be displayed)

1. **Itinerary Items:**
   - `date` - Specific date for the day (if available)
   - `location` - Main location for the day
   - `accommodation_notes` - Special notes about accommodation

2. **Inclusions/Exclusions:**
   - `icon` - Custom icons for each item (currently using generic check/x)

3. **Hotels:**
   - `slug` - Should link to hotel detail page

4. **Attractions:**
   - `slug` - Should link to attraction detail page
   - `description` - Full description (currently only showing summary)

5. **Price Charts:**
   - All fields - Should display seasonal pricing information

6. **Media Assets:**
   - `caption` - Image captions in gallery

### Medium Priority (Nice to have)

1. **Package:**
   - `is_featured` - Could show a "Featured Tour" badge

2. **Country:**
   - `image_id` - Could show country flag or image

3. **Holiday Types:**
   - `slug` - Could link to holiday type pages

## Recommendations

### Immediate Actions

1. **Add Price Charts Section** - Display seasonal pricing
2. **Add Itinerary Location & Date** - Show location and date for each day
3. **Add Accommodation Notes** - Display special accommodation information
4. **Add Icons to Inclusions/Exclusions** - Use custom icons if available
5. **Add Links to Hotels/Attractions** - Make them clickable to detail pages
6. **Add Image Captions** - Display captions in hero carousel

### Future Enhancements

1. Add "Featured Tour" badge if `is_featured` is true
2. Show country flag/image in breadcrumb or hero
3. Link holiday type tags to filtered package lists
4. Display full attraction descriptions in expandable cards
