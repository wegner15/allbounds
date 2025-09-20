import React from 'react';
import { Link } from 'react-router-dom';
import { useTrendingDestinations } from '../../hooks/useTrendingDestinations';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const TopTrendingDestinations: React.FC = () => {
  const { data: destinations, isLoading, error } = useTrendingDestinations();

  const renderSkeletons = () => (
    [...Array(6)].map((_, index) => (
      <div key={index} className="relative h-64 rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
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
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="text-3xl font-bold text-gray-900">Top Trending Destinations</h2>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Explore the World's Most Enchanting Destinations. Welcome to our curated list of top destinations around the globe. 
            Whether you're a seasoned traveler or a wanderlust enthusiast, these breathtaking locations offer something for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? renderSkeletons() : destinations?.map(destination => {
            const tourCount = (destination.packages?.length || 0) + (destination.group_trips?.length || 0);
            const activityCount = destination.attractions?.length || 0;

            return (
              <Link
                key={destination.id}
                to={`/destinations/${destination.slug}`}
                className="relative h-64 rounded-lg overflow-hidden group cursor-pointer block"
              >
                <img 
                  src={getImageUrlWithFallback(destination.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80')}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{destination.name}</h3>
                  <div className="flex items-center text-white/90 text-sm space-x-4">
                    {tourCount > 0 && <span>{tourCount} Tours</span>}
                    {activityCount > 0 && <span>{activityCount} Activities</span>}
                  </div>
                </div>
              </Link>
            );
          })}
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
