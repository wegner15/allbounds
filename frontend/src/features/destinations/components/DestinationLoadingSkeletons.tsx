import React from 'react';

// Section-specific loading skeletons for destination page

// Best Time to Visit Section Skeleton
export const BestTimeToVisitSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
      
      {/* Monthly ratings grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 h-24">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-full" />
          </div>
        ))}
      </div>

      {/* General notes */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
      </div>
    </div>
  );
};

// Interactive Map Section Skeleton
export const MapSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-[300px] md:h-[400px] bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Package Card Skeleton
export const PackageCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image */}
      <div className="h-48 bg-gray-200" />
      
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-5/6" />
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

// Group Trip Card Skeleton
export const GroupTripCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image */}
      <div className="h-48 bg-gray-200" />
      
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        
        {/* Departure info */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        
        {/* Participants */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
        
        {/* Price */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

// Attraction Card Skeleton (horizontal layout)
export const AttractionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4 animate-pulse">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
};

// Hotel Card Skeleton
export const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image */}
      <div className="h-48 bg-gray-200" />
      
      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
        </div>
        
        {/* Amenities */}
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-gray-100 rounded w-20" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Activity Card Skeleton
export const ActivityCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-200" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        
        {/* Duration and price */}
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-5 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
};

// Related Destination Card Skeleton
export const RelatedDestinationCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image */}
      <div className="aspect-[4/3] bg-gray-200" />
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );
};

// Section Skeleton with header
interface SectionSkeletonProps {
  title?: string;
  cardCount?: number;
  cardType?: 'package' | 'grouptrip' | 'attraction' | 'hotel' | 'activity' | 'destination';
  columns?: 1 | 2 | 3 | 4;
}

export const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  title,
  cardCount = 4,
  cardType = 'package',
  columns = 2
}) => {
  const CardComponent = {
    package: PackageCardSkeleton,
    grouptrip: GroupTripCardSkeleton,
    attraction: AttractionCardSkeleton,
    hotel: HotelCardSkeleton,
    activity: ActivityCardSkeleton,
    destination: RelatedDestinationCardSkeleton
  }[cardType];

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  }[columns];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 animate-pulse">
      {/* Section header */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>

      {/* Cards grid */}
      <div className={`grid ${gridCols} gap-4 md:gap-6`}>
        {[...Array(cardCount)].map((_, i) => (
          <CardComponent key={i} />
        ))}
      </div>
    </div>
  );
};

export default SectionSkeleton;
