import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrendingAttractions } from '../../hooks/useTrendingAttractions';
import { useCountriesWithAttractions } from '../../hooks/useRecommendedHotels';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const TrendingAttractions: React.FC = () => {
  const { data: availableCountries, isLoading: countriesLoading } = useCountriesWithAttractions();
  const locations = availableCountries?.map(country => country.name) || [];
  const [activeTab, setActiveTab] = useState<string>('');

  // Set initial active tab when countries load
  React.useEffect(() => {
    if (locations.length > 0 && !activeTab) {
      setActiveTab(locations[0]);
    }
  }, [locations, activeTab]);

  const { data: attractions, isLoading, error } = useTrendingAttractions(activeTab);

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 336; // 320px (w-80) + 16px (gap)
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () => (
    [...Array(8)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse flex-shrink-0 w-80">
        <div className="w-full h-40 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))
  );

  if (countriesLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Trending Attractions</h2>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Discover top-rated attractions and must-see sights from around the world.</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Trending Attractions</h2>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Discover top-rated attractions and must-see sights from around the world.</p>
          <p className="text-gray-500 text-center">No attractions available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Trending Attractions</h2>
        </div>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Discover top-rated attractions and must-see sights from around the world.</p>

        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {locations.map(location => (
            <button
              key={location}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === location
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              onClick={() => setActiveTab(location)}
            >
              {location}
            </button>
          ))}
        </div>

        <div className="relative mb-8">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="attractions-container">
            {isLoading ? renderSkeletons() : error ? (
              <div className="flex-shrink-0 w-80 text-center text-red-500">Failed to load trending attractions.</div>
            ) : attractions?.slice(0, 8).map(attraction => (
              <Link
                key={attraction.id}
                to={`/attractions/${attraction.country?.slug || 'unknown'}/${attraction.slug}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 group block flex-shrink-0 w-80"
              >
                <img
                  src={getImageUrlWithFallback(attraction.cover_image || attraction.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80')}
                  alt={attraction.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-primary transition-colors">{attraction.name}</h3>
                  <p className="text-sm text-gray-500">{attraction.country?.name}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollContainer('attractions-container', 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('attractions-container', 'right')}
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
            to={
              availableCountries?.find(c => c.name === activeTab)?.slug
                ? `/destinations/${availableCountries.find(c => c.name === activeTab)?.slug}/attractions`
                : activeTab
                  ? `/attractions?country=${encodeURIComponent(activeTab)}`
                  : '/attractions'
            }
            className="inline-flex items-center text-primary hover:text-primary-dark font-medium group transition-colors"
          >
            <span>More {activeTab ? `${activeTab} ` : ''}Attractions</span>
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrendingAttractions;
