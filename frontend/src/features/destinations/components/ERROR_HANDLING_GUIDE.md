# Destination Page Error Handling Guide

This guide explains how to use the error handling and loading state components for the destination page.

## Table of Contents
- [Error Display Components](#error-display-components)
- [Loading Skeleton Components](#loading-skeleton-components)
- [Image Components with Fallbacks](#image-components-with-fallbacks)
- [Error Boundary](#error-boundary)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Error Display Components

### DestinationErrorDisplay

Main error display component with support for different error types.

```tsx
import { DestinationErrorDisplay } from './components/DestinationErrorDisplay';

<DestinationErrorDisplay
  type="network"  // 'network' | 'server' | 'notfound' | 'generic'
  title="Custom Title"  // Optional
  message="Custom message"  // Optional
  onRetry={() => refetch()}  // Optional retry callback
  showBackButton={true}  // Optional, default true
  showHomeButton={true}  // Optional, default true
  destinationSlug="bali"  // Optional, used for 404 messages
/>
```

### NotFoundError

Specialized component for 404 errors.

```tsx
import { NotFoundError } from './components/DestinationErrorDisplay';

<NotFoundError
  destinationSlug="bali"
  onRetry={() => refetch()}
/>
```

### NetworkError

Specialized component for network/connection errors.

```tsx
import { NetworkError } from './components/DestinationErrorDisplay';

<NetworkError
  onRetry={() => refetch()}
/>
```

### SectionError

Compact error display for section-level failures.

```tsx
import { SectionError } from './components/DestinationErrorDisplay';

<SectionError
  message="Failed to load packages"
  sectionName="Packages"
  onRetry={() => refetchPackages()}
/>
```

### EmptyState

Display for sections with no data.

```tsx
import { EmptyState } from './components/DestinationErrorDisplay';
import { Package } from 'lucide-react';

<EmptyState
  icon={<Package className="w-16 h-16" />}
  title="No Packages Available"
  message="There are currently no packages for this destination."
  actionLabel="Browse All Packages"
  actionLink="/packages"
/>
```

## Loading Skeleton Components

### Section-Specific Skeletons

```tsx
import {
  BestTimeToVisitSkeleton,
  MapSkeleton,
  PackageCardSkeleton,
  GroupTripCardSkeleton,
  AttractionCardSkeleton,
  HotelCardSkeleton,
  ActivityCardSkeleton,
  RelatedDestinationCardSkeleton
} from './components/DestinationLoadingSkeletons';

// Use individual skeletons
{isLoading && <BestTimeToVisitSkeleton />}
{isLoading && <MapSkeleton />}
```

### Generic Section Skeleton

```tsx
import { SectionSkeleton } from './components/DestinationLoadingSkeletons';

<SectionSkeleton
  cardType="package"  // 'package' | 'grouptrip' | 'attraction' | 'hotel' | 'activity' | 'destination'
  cardCount={6}  // Number of skeleton cards to show
  columns={2}  // 1 | 2 | 3 | 4
/>
```

### Full Page Skeleton

```tsx
import { CountryDetailSkeleton } from './components/CountryDetailSkeleton';

{isLoading && <CountryDetailSkeleton />}
```

## Image Components with Fallbacks

### DestinationImage

Base image component with automatic fallback handling.

```tsx
import { DestinationImage } from './components/DestinationImage';

<DestinationImage
  imageId={country.image_id}
  alt="Bali, Indonesia"
  variant="MEDIUM"  // 'THUMBNAIL' | 'SMALL' | 'MEDIUM' | 'LARGE'
  className="w-full h-64"
  fallbackType="gradient"  // 'gradient' | 'icon'
  gradientColors={['from-primary/80', 'to-primary-dark']}
/>
```

### CardImage

Image for cards with consistent aspect ratios.

```tsx
import { CardImage } from './components/DestinationImage';

<CardImage
  imageId={package.image_id}
  alt={package.name}
  variant="MEDIUM"
  aspectRatio="video"  // 'square' | 'video' | 'wide' | 'portrait'
  fallbackType="gradient"
/>
```

### HeroImage

Hero section image with gradient overlay.

```tsx
import { HeroImage } from './components/DestinationImage';

<div className="relative h-[500px]">
  <HeroImage
    imageId={country.image_id}
    alt={country.name}
    overlayOpacity={60}  // 0-100
  />
</div>
```

### ThumbnailImage

Small thumbnail images.

```tsx
import { ThumbnailImage } from './components/DestinationImage';

<ThumbnailImage
  imageId={attraction.image_id}
  alt={attraction.name}
  size="md"  // 'sm' | 'md' | 'lg'
/>
```

## Error Boundary

Wrap your page component with the error boundary to catch runtime errors.

```tsx
import { DestinationErrorBoundary } from './components/DestinationErrorBoundary';

const MyPage = () => {
  return (
    <DestinationErrorBoundary>
      {/* Your page content */}
    </DestinationErrorBoundary>
  );
};
```

## Usage Examples

### Complete Page Error Handling

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCountryDetails } from '../../lib/hooks/useCountries';
import {
  DestinationErrorBoundary,
  NotFoundError,
  NetworkError,
  DestinationErrorDisplay,
  CountryDetailSkeleton
} from './components';

const CountryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: country, isLoading, error, refetch } = useCountryDetails(slug || '');

  // Loading state
  if (isLoading) {
    return <CountryDetailSkeleton />;
  }

  // Error states
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return <NotFoundError destinationSlug={slug} onRetry={() => refetch()} />;
    }

    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return <NetworkError onRetry={() => refetch()} />;
    }

    return (
      <DestinationErrorDisplay
        type="server"
        onRetry={() => refetch()}
      />
    );
  }

  // No data state
  if (!country) {
    return <NotFoundError destinationSlug={slug} />;
  }

  return (
    <DestinationErrorBoundary>
      {/* Your page content */}
    </DestinationErrorBoundary>
  );
};
```

### Section with Error Handling

```tsx
import React from 'react';
import { SectionError, SectionSkeleton } from './components';

const PackagesSection: React.FC = ({ packages, isLoading, error, refetch }) => {
  if (isLoading) {
    return <SectionSkeleton cardType="package" cardCount={6} columns={2} />;
  }

  if (error) {
    return (
      <SectionError
        message="Failed to load packages"
        sectionName="Packages"
        onRetry={refetch}
      />
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <EmptyState
        icon={<Package className="w-16 h-16" />}
        title="No Packages Available"
        message="Check back later for new packages!"
      />
    );
  }

  return (
    <div>
      {/* Render packages */}
    </div>
  );
};
```

### Image with Fallback

```tsx
import React from 'react';
import { CardImage } from './components/DestinationImage';

const PackageCard: React.FC = ({ package }) => {
  return (
    <div className="card">
      <CardImage
        imageId={package.image_id}
        alt={package.name}
        variant="MEDIUM"
        aspectRatio="video"
        fallbackType="gradient"
      />
      <div className="card-content">
        <h3>{package.name}</h3>
        {/* More content */}
      </div>
    </div>
  );
};
```

## Best Practices

### 1. Always Provide Retry Functionality

```tsx
// ✅ Good
<NetworkError onRetry={() => refetch()} />

// ❌ Bad
<NetworkError />
```

### 2. Use Appropriate Error Types

```tsx
// ✅ Good - Specific error types
if (error.status === 404) return <NotFoundError />;
if (error.message.includes('network')) return <NetworkError />;

// ❌ Bad - Generic error for everything
return <DestinationErrorDisplay type="generic" />;
```

### 3. Show Loading States Immediately

```tsx
// ✅ Good - Immediate feedback
if (isLoading) return <CountryDetailSkeleton />;

// ❌ Bad - Delayed or no loading state
if (isLoading) return null;
```

### 4. Handle Empty States Gracefully

```tsx
// ✅ Good - Helpful empty state
if (packages.length === 0) {
  return (
    <EmptyState
      title="No Packages Available"
      message="Check back later!"
      actionLabel="Browse All Packages"
      actionLink="/packages"
    />
  );
}

// ❌ Bad - Just hide the section
if (packages.length === 0) return null;
```

### 5. Use Error Boundaries for Runtime Errors

```tsx
// ✅ Good - Wrapped in error boundary
<DestinationErrorBoundary>
  <MyComponent />
</DestinationErrorBoundary>

// ❌ Bad - No error boundary
<MyComponent />
```

### 6. Provide Context in Error Messages

```tsx
// ✅ Good - Specific message
<SectionError
  message="Failed to load packages for Bali"
  sectionName="Packages"
/>

// ❌ Bad - Generic message
<SectionError message="Error" />
```

### 7. Use Appropriate Image Fallbacks

```tsx
// ✅ Good - Gradient for hero images
<HeroImage imageId={id} alt={name} />

// ✅ Good - Icon for small thumbnails
<ThumbnailImage imageId={id} alt={name} size="sm" />

// ❌ Bad - Same fallback everywhere
<img src={imageUrl} alt={name} />
```

## Testing

To test error handling components, use the ErrorHandlingDemo component:

```tsx
import { ErrorHandlingDemo } from './components/ErrorHandlingDemo';

// In your development route
<Route path="/demo/errors" element={<ErrorHandlingDemo />} />
```

This provides an interactive demo of all error and loading states.

## Accessibility

All error and loading components follow accessibility best practices:

- Semantic HTML structure
- ARIA labels for icon-only buttons
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)
- Focus management

## Performance

- Loading skeletons are lightweight (CSS-only animations)
- Error boundaries have minimal overhead
- Images use lazy loading by default
- Optimized Cloudflare Images variants
- Efficient fallback rendering

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Documentation

- [Task 15 Implementation](../../../.kiro/specs/destination-page-redesign/TASK_15_IMPLEMENTATION.md)
- [Image Optimization Guide](../../../utils/imageUtils.ts)
- [API Error Handling](../../../lib/api.ts)
