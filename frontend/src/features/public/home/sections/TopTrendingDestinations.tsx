import React from 'react';
import { Link } from 'react-router-dom';
import { useTrendingDestinations } from '../../hooks/useTrendingDestinations';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';
import { MapPin, ArrowRight } from 'lucide-react';

const TopTrendingDestinations: React.FC = () => {
  const { data: destinations, isLoading, error } = useTrendingDestinations();

  const renderSkeletons = () => (
    <>
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className={`relative rounded-xl overflow-hidden bg-gray-200 animate-pulse ${index === 1 ? 'row-span-2' : 'h-60'
            }`}
        ></div>
      ))}
    </>
  );

  if (error) {
    return (
      <div className="py-16 bg-[#f2f2f2]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load trending destinations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-[#f2f2f2]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-gray-700 mr-2" />
            <h2 className="text-4xl font-bold text-gray-900">Top Trending Destinations</h2>
          </div>
          <p className="text-gray-600 max-w-4xl mx-auto text-base leading-relaxed">
            Explore the World's Most Enchanting Destinations. Welcome to our curated list of top destinations around the globe.
            Whether you're a seasoned traveler or a wanderlust enthusiast, these breathtaking locations offer something for everyone.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {isLoading ? renderSkeletons() : destinations?.slice(0, 8).map((destination, index) => {
            const tourCount = (destination.packages?.length || 0) + (destination.group_trips?.length || 0);
            const activityCount = destination.attractions?.length || 0;

            return (
              <Link
                key={destination.id}
                to={`/destinations/${destination.slug}`}
                className={`relative rounded-xl overflow-hidden group cursor-pointer block shadow-sm hover:shadow-xl transition-shadow duration-300 ${index === 1 ? 'row-span-2' : 'h-60'
                  }`}
              >
                <img
                  src={getImageUrlWithFallback(destination.image_id, IMAGE_VARIANTS.LARGE, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80')}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient Overlay - Made much darker at the bottom for text visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-transparent"></div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                  <h3 className="text-2xl font-playfair font-bold text-white mb-2 tracking-wide drop-shadow-md">{destination.name}</h3>
                  <div className="flex flex-col gap-1 text-sm text-gray-200 font-lato">
                    {tourCount > 0 && <span className="drop-shadow-sm">{tourCount} Tours</span>}
                    {activityCount > 0 && <span className="drop-shadow-sm">{activityCount} Activities</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-lg transition-all duration-200"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TopTrendingDestinations;
