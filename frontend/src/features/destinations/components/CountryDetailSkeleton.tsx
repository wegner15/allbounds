import React from 'react';
import { 
  BestTimeToVisitSkeleton,
  MapSkeleton,
  SectionSkeleton
} from './DestinationLoadingSkeletons';

// Hero Section Skeleton
const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] bg-gray-200 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="container mx-auto">
          {/* Breadcrumb skeleton */}
          <div className="h-4 bg-white/20 rounded w-48 mb-4" />
          {/* Title skeleton */}
          <div className="h-12 md:h-16 bg-white/30 rounded w-2/3 mb-4" />
          {/* Description skeleton */}
          <div className="space-y-2 max-w-2xl">
            <div className="h-4 bg-white/20 rounded w-full" />
            <div className="h-4 bg-white/20 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Section Skeleton
const OverviewSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      
      {/* Description skeleton */}
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
      </div>

      {/* Quick facts grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-20" />
        ))}
      </div>
    </div>
  );
};



// Sidebar Skeleton
const SidebarSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-primary/20 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
      </div>

      {/* Travel Tips Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0" />
              <div className="flex-1 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Full Page Skeleton
export const CountryDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSkeleton />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Section */}
            <OverviewSkeleton />

            {/* Best Time to Visit Section */}
            <BestTimeToVisitSkeleton />

            {/* Map Section */}
            <MapSkeleton />

            {/* Packages Section */}
            <SectionSkeleton cardType="package" cardCount={6} columns={2} />

            {/* Group Trips Section */}
            <SectionSkeleton cardType="grouptrip" cardCount={6} columns={2} />

            {/* Attractions Section */}
            <SectionSkeleton cardType="attraction" cardCount={8} columns={2} />

            {/* Hotels Section */}
            <SectionSkeleton cardType="hotel" cardCount={6} columns={2} />

            {/* Activities Section */}
            <SectionSkeleton cardType="activity" cardCount={6} columns={3} />

            {/* Related Destinations */}
            <SectionSkeleton cardType="destination" cardCount={4} columns={4} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SidebarSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryDetailSkeleton;
