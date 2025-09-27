import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useRecommendedHotels, useCountriesWithHotels } from '../../hooks/useRecommendedHotels';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const RecommendedHotels: React.FC = () => {
  const { data: countries, isLoading: countriesLoading } = useCountriesWithHotels();
  const [activeTab, setActiveTab] = useState<string>('');

  // Set the first country as active when countries are loaded
  React.useEffect(() => {
    if (countries && countries.length > 0 && !activeTab) {
      setActiveTab(countries[0].name);
    }
  }, [countries, activeTab]);

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
          {countriesLoading ? (
            <div className="flex gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          ) : countries && countries.length > 0 ? (
            countries.map(country => (
              <button
                key={country.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === country.name
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab(country.name)}
              >
                {country.name}
              </button>
            ))
          ) : (
            <div className="text-gray-500 text-sm">No countries with hotels available</div>
          )}
        </div>
        
        <div className="relative mb-8">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="hotels-container">
            {countriesLoading || isLoading ? (
              renderSkeletons()
            ) : error ? (
              <div className="flex-shrink-0 w-80 text-center text-red-500">
                Failed to load hotels.
              </div>
            ) : (
              hotels?.map((hotel) => (
                <Link
                  key={hotel.id}
                  to={`/hotels/${hotel.slug}`}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group flex-shrink-0 w-80 border border-gray-100"
                >
                  <div className="relative">
                    <img
                      src={hotel.image_url || getImageUrlWithFallback(
                        hotel.image_id,
                        IMAGE_VARIANTS.MEDIUM,
                        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                      )}
                      alt={hotel.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hotel.price_category && (
                      <div className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-sm ${getTagColor(hotel.price_category)}`}>
                        {hotel.price_category}
                      </div>
                    )}
                    <button
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all duration-200 shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        // Handle favorite functionality
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 mr-1" fill="currentColor" />
                          <span className="text-sm font-semibold text-gray-800">{hotel.stars}</span>
                        </div>
                        <span className="text-xs text-gray-600 ml-2">
                          ({hotel.stars} Stars)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {hotel.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                      {hotel.summary || `${hotel.city}, ${hotel.country?.name}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {hotel.city}, {hotel.country?.name}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">From</p>
                        <p className="text-lg font-bold text-green-600">
                          ${hotel.price_category === 'Budget' ? '50' : hotel.price_category === 'Mid-range' ? '120' : hotel.price_category === 'Luxury' ? '300' : '100'}/night
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
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
