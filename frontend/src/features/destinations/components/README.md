# Destination Page Components

This directory contains components for the redesigned destination (country) detail page.

## Components

### DestinationHeroSection

The hero section component for the destination page that displays:
- Full-width background image with Cloudflare optimization
- Responsive image variants (large for desktop, medium for mobile)
- Gradient overlay for text readability
- Destination name as prominent heading with Playfair font
- Destination summary/description with proper truncation
- Responsive height (500px desktop, 400px mobile)
- Fallback gradient background when no image is available

**Props:**
- `country: CountryWithDetails` - The country data including name, summary, and image_id

**Features:**
- Uses OptimizedImage component for lazy loading and Cloudflare image optimization
- Responsive design with different image variants for mobile and desktop
- Gradient overlay ensures text readability over any background
- Fallback gradient when no image is available
- Proper semantic HTML with ARIA labels for accessibility

**Usage:**
```tsx
import DestinationHeroSection from './components/DestinationHeroSection';

<DestinationHeroSection country={countryData} />
```

### DestinationOverviewSection

The overview section component that displays destination description and quick facts:
- Quick facts grid showing statistics (packages, attractions, hotels, group trips)
- Responsive grid layout (2x2 mobile, 4x1 desktop)
- Icons for each quick fact using Lucide icons
- Rich text rendering with DOMPurify sanitization
- "Read More" expansion for long descriptions (>500 words)
- Region information with link to region page
- Hover effects on quick fact cards

**Props:**
- `country: CountryWithDetails` - The country data including description, region, and related content

**Features:**
- Sanitizes HTML content using DOMPurify to prevent XSS attacks
- Automatically detects long descriptions and provides expand/collapse functionality
- Quick facts display with color-coded icons and hover effects
- Links to region page for easy navigation
- Responsive design with mobile-first approach

**Usage:**
```tsx
import DestinationOverviewSection from './components/DestinationOverviewSection';

<DestinationOverviewSection country={countryData} />
```

## Implementation Notes

- The hero section uses the `line-clamp-3` utility to truncate long summaries to 3 lines
- Images are loaded with `priority={true}` and `loading="eager"` for above-the-fold content
- The overview section uses `line-clamp-[20]` to limit description height before expansion
- DOMPurify sanitization allows safe HTML tags while preventing malicious scripts
- The component follows the design requirements from the destination-page-redesign spec
- Responsive breakpoints: mobile (< 768px), desktop (>= 768px)

### BestTimeToVisitSection

The best time to visit section component that displays monthly visit ratings:
- Monthly ratings calendar showing all 12 months in a 3x4 grid
- Color coding for ratings (excellent: green, good: teal, fair: yellow, poor: gray)
- General travel notes below the monthly calendar
- Rating legend explaining color meanings
- Conditional rendering only when visit_info data is available

**Props:**
- `visitInfo?: CountryVisitInfo` - Visit information with monthly ratings and general notes

**Features:**
- Color-coded monthly ratings for easy visual scanning
- Hover effects on month cards
- Responsive grid layout
- Only renders when visit information is available

**Usage:**
```tsx
import BestTimeToVisitSection from './components/BestTimeToVisitSection';

<BestTimeToVisitSection visitInfo={country.visit_info} />
```

### InteractiveMapSection

The interactive map section component using React Leaflet:
- OpenStreetMap tiles for map rendering
- Destination marker at center coordinates
- Attraction markers with custom icons
- Popup on marker click showing attraction name and link
- Responsive height (400px desktop, 300px mobile)
- Lazy loading for improved initial page load
- Conditional rendering only when coordinates are available

**Props:**
- `country: CountryWithDetails` - Country data with coordinates and attractions

**Features:**
- Lazy-loaded map component to improve performance
- Custom markers for destination and attractions
- Interactive popups with links to attraction details
- Responsive design
- Only renders when coordinates are available

**Usage:**
```tsx
import InteractiveMapSection from './components/InteractiveMapSection';

<InteractiveMapSection country={countryData} />
```

### PackagesSection

The packages section component that displays travel packages for the destination:
- Section header with icon and "View All" link
- Responsive grid layout (2 columns desktop, 1 column mobile)
- Displays maximum of 6 active packages
- "View All" link to packages page with country filter pre-applied
- Package count information
- Conditional rendering only when packages exist

**Props:**
- `packages: Package[]` - Array of package data
- `countrySlug: string` - Country slug for filtering on packages page
- `countryName: string` - Country name for display in section header

**Features:**
- Filters to show only active packages
- Limits display to 6 packages for optimal page performance
- "View All" button links to packages page with country pre-filtered
- Shows package count information
- Mobile-optimized with full-width "View All" button
- Only renders when active packages exist

**Usage:**
```tsx
import PackagesSection from './components/PackagesSection';

<PackagesSection 
  packages={country.packages}
  countrySlug={country.slug}
  countryName={country.name}
/>
```

### PackageCard

Individual package card component used within PackagesSection:
- Package image with "medium" variant optimization
- Hover effects (shadow elevation and scale)
- Featured badge for featured packages
- Country and holiday type display
- Package name with truncation
- Description with 2-line truncation
- Duration and price information
- Star rating display (if available)
- Click navigation to package detail page
- Fallback gradient when no image available

**Props:**
- `package: Package` - Package data including name, description, price, duration, etc.

**Features:**
- Uses OptimizedImage component with "medium" variant
- Hover effects with smooth transitions (scale and shadow)
- Featured badge for highlighted packages
- Sanitized HTML description rendering
- Star rating visualization
- Responsive design
- Fallback gradient background when no image

**Usage:**
```tsx
import PackageCard from './components/PackageCard';

<PackageCard package={packageData} />
```

### CountryDetailSkeleton

Loading skeleton component for the entire country detail page:
- Skeleton for hero section
- Skeleton for overview section
- Skeleton for content sections
- Smooth loading animation

**Features:**
- Provides visual feedback during data loading
- Matches the layout of the actual page
- Smooth pulse animation
- Improves perceived performance

**Usage:**
```tsx
import { CountryDetailSkeleton } from './components/CountryDetailSkeleton';

{isLoading && <CountryDetailSkeleton />}
```

## Additional Implementation Notes

### PackagesSection
- The "View All" link includes the country slug as a query parameter for filtering
- Mobile view shows a full-width button instead of inline link
- Package count is displayed at the bottom of the section
- The section gracefully handles empty package arrays by not rendering

### PackageCard
- Uses DOMPurify to sanitize HTML content in descriptions
- Implements line-clamp utilities for text truncation
- Hover effects use CSS transitions for smooth animations
- Star ratings are rendered as SVG icons for crisp display
- Price is formatted with locale-specific number formatting
- Duration displays singular/plural "day/days" correctly

### Performance Considerations
- Images use lazy loading except for hero section
- Package cards use "medium" variant for optimal file size
- Components implement conditional rendering to avoid unnecessary DOM elements
- Hover effects use CSS transforms for GPU acceleration
