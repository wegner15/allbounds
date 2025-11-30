import React from 'react';

// Hero Section Skeleton
export const HeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[40vh] md:h-[60vh] bg-gray-200 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="container mx-auto">
          <div className="h-4 bg-white/30 rounded w-32 mb-4" />
          <div className="h-12 md:h-16 bg-white/30 rounded w-3/4 mb-4" />
          <div className="h-6 bg-white/30 rounded w-1/2 mb-6" />
          <div className="flex gap-4">
            <div className="h-10 bg-white/30 rounded w-24" />
            <div className="h-10 bg-white/30 rounded w-32" />
            <div className="h-10 bg-white/30 rounded w-28" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Section Skeleton
export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="space-y-3 mb-8">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6 h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
};

// Itinerary Section Skeleton
export const ItinerarySkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-32" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inclusions/Exclusions Section Skeleton
export const InclusionsExclusionsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((col) => (
          <div key={col} className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Hotels Section Skeleton
export const HotelsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Attractions Section Skeleton
export const AttractionsSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Reviews Section Skeleton
export const ReviewsSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/6" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Booking Sidebar Skeleton
export const BookingSidebarSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse sticky top-24">
      <div className="h-10 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="space-y-4 mb-6">
        <div className="h-12 bg-primary/20 rounded-lg" />
        <div className="h-12 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
          </div>
        ))}
      </div>
      <div className="border-t pt-4">
        <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Full Page Skeleton
export const PackageDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSkeleton />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <OverviewSkeleton />
            <ItinerarySkeleton />
            <InclusionsExclusionsSkeleton />
            <HotelsSkeleton />
            <AttractionsSkeleton />
            <ReviewsSkeleton />
          </div>
          <div className="hidden lg:block lg:w-1/3">
            <BookingSidebarSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
};
