import React from 'react';
import { Link } from 'react-router-dom';
import { useTrendingDestinations } from '../../hooks/useTrendingDestinations';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const TopTrendingDestinations: React.FC = () => {
  const { data: destinations, isLoading, error } = useTrendingDestinations();

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 732; // 700px (w-[700px]) + 32px (gap-8)
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () => (
    [...Array(6)].map((_, index) => (
      <div key={index} className="relative flex-shrink-0 w-[700px] h-80 rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
    ))
  );

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load trending destinations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-4xl font-bold text-gray-900">Top Trending Destinations</h2>
          </div>
          <p className="text-gray-600 max-w-4xl mx-auto text-lg leading-relaxed">
            Discover the world's most captivating destinations in stunning landscape views. From vibrant cities to pristine beaches,
            our curated collection showcases the best travel experiences waiting for you.
          </p>
        </div>

        <div className="relative mb-8">
          <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide" id="destinations-container">
            {isLoading ? renderSkeletons() : destinations?.map(destination => {
              const tourCount = (destination.packages?.length || 0) + (destination.group_trips?.length || 0);
              const activityCount = destination.attractions?.length || 0;

              return (
                <Link
                  key={destination.id}
                  to={`/destinations/${destination.slug}`}
                  className="relative flex-shrink-0 w-[700px] h-80 rounded-lg overflow-hidden group cursor-pointer block"
                >
                  <img
                    src={getImageUrlWithFallback(destination.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80')}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                   <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex items-center">
                       <div className="text-white p-8 max-w-md">
                         <h3 className="text-3xl font-bold mb-3">{destination.name}</h3>
                         {destination.summary && (
                           <p className="text-white/90 text-base mb-4 line-clamp-3 leading-relaxed">{destination.summary}</p>
                         )}
                         <div className="flex items-center text-white/90 text-sm space-x-6">
                           {tourCount > 0 && <span className="flex items-center"><span className="w-2 h-2 bg-white/60 rounded-full mr-2"></span>{tourCount} Tours</span>}
                           {activityCount > 0 && <span className="flex items-center"><span className="w-2 h-2 bg-white/60 rounded-full mr-2"></span>{activityCount} Activities</span>}
                         </div>
                       </div>
                     </div>
                </Link>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollContainer('destinations-container', 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('destinations-container', 'right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          <Link
            to="/destinations"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopTrendingDestinations;
