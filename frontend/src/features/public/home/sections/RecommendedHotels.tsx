import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useRecommendedHotels } from '../../hooks/useRecommendedHotels';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const RecommendedHotels: React.FC = () => {
  const locations = ['Kenya', 'Uganda', 'Zanzibar', 'Dubai', 'Seychelles', 'Mauritius', 'Cape Town'];
  const [activeTab, setActiveTab] = useState(locations[0]);

  const { data: hotels, isLoading, error } = useRecommendedHotels(activeTab);





  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 336; // 320px (w-80) + 16px (gap)
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'TOP RATED':
        return 'bg-yellow-400 text-black';
      case 'BEST SELLER':
        return 'bg-blue-500 text-white';
      case 'BREAKFAST INCLUDED':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse flex-shrink-0 w-80">
        <div className="w-full h-96 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 float-right"></div>
        </div>
      </div>
    ))
  );

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Recommended Hotels</h2>
        </div>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Exclusive discounts directly from hotels all over the World.</p>
        
        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {locations.map(location => (
            <button
              key={location}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === location 
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab(location)}
            >
              {location}
            </button>
          ))}
        </div>
        
        <div className="relative mb-8">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="hotels-container">
            {isLoading ? (
              renderSkeletons()
            ) : error ? (
              <div className="flex-shrink-0 w-80 text-center text-red-500">
                Failed to load hotels.
              </div>
            ) : (
              hotels?.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 group flex-shrink-0 w-80"
                >
                  <div className="relative">
                    <img
                      src={getImageUrlWithFallback(
                        hotel.image_id,
                        IMAGE_VARIANTS.MEDIUM,
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                      )}
                      alt={hotel.name}
                      className="w-full h-96 object-cover"
                    />
                    {hotel.price_category && (
                      <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded ${getTagColor(hotel.price_category)}`}>
                        {hotel.price_category}
                      </div>
                    )}
                    <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 h-8 line-clamp-2">
                      {hotel.summary || `${hotel.city}, ${hotel.country?.name}`}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-md font-bold text-sm">
                        <Star className="w-4 h-4 mr-1" fill="currentColor" />
                        <span>{hotel.stars}</span>
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        {hotel.stars} Stars
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Price Category</p>
                      <p className="text-xl font-bold text-gray-900">
                        {hotel.price_category}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollContainer('hotels-container', 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('hotels-container', 'right')}
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
            to="/hotels"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            More
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecommendedHotels;
