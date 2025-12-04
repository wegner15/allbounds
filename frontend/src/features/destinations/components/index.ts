// Export all destination components for easy importing

// Navigation components
export { default as Breadcrumb } from './Breadcrumb';

// Main page components
export { default as DestinationHeroSection } from './DestinationHeroSection';
export { default as CTABanner } from './CTABanner';
export { default as DestinationOverviewSection } from './DestinationOverviewSection';
export { default as BestTimeToVisitSection } from './BestTimeToVisitSection';
export { default as InteractiveMapSection } from './InteractiveMapSection';
export { default as PackagesSection } from './PackagesSection';
export { default as GroupTripsSection } from './GroupTripsSection';
export { default as AttractionsSection } from './AttractionsSection';
export { default as HotelsSection } from './HotelsSection';
export { default as ActivitiesSection } from './ActivitiesSection';
export { default as QuickActionsSidebar } from './QuickActionsSidebar';
export { default as TravelTipsCard } from './TravelTipsCard';
export { default as SocialSharingCard } from './SocialSharingCard';
export { default as RelatedDestinationsSection } from './RelatedDestinationsSection';

// Card components
export { default as PackageCard } from './PackageCard';
export { default as GroupTripCard } from './GroupTripCard';
export { default as AttractionCard } from './AttractionCard';
export { default as HotelCard } from './HotelCard';
export { default as ActivityCard } from './ActivityCard';
export { default as DestinationCard } from './DestinationCard';

// Loading states
export { default as CountryDetailSkeleton } from './CountryDetailSkeleton';
export {
  BestTimeToVisitSkeleton,
  MapSkeleton,
  PackageCardSkeleton,
  GroupTripCardSkeleton,
  AttractionCardSkeleton,
  HotelCardSkeleton,
  ActivityCardSkeleton,
  RelatedDestinationCardSkeleton,
  SectionSkeleton
} from './DestinationLoadingSkeletons';

// Error handling
export { default as DestinationErrorBoundary } from './DestinationErrorBoundary';
export {
  DestinationErrorDisplay,
  SectionError,
  EmptyState,
  NotFoundError,
  NetworkError
} from './DestinationErrorDisplay';

// Image components
export {
  DestinationImage,
  CardImage,
  HeroImage,
  ThumbnailImage
} from './DestinationImage';

// Demo/Testing components
export { default as ErrorHandlingDemo } from './ErrorHandlingDemo';
