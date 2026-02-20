import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock } from 'lucide-react';
import { useTrendingActivities } from '../../hooks/useTrendingActivities';
import { useCountriesWithActivities } from '../../hooks/useRecommendedHotels';

const TrendingActivities: React.FC = () => {
  const { data: availableCountries, isLoading: countriesLoading } = useCountriesWithActivities();
  const locations = availableCountries?.map(country => country.name) || [];
  const [activeTab, setActiveTab] = useState<string>('');

  // Set initial active tab when countries load
  React.useEffect(() => {
    if (locations.length > 0 && !activeTab) {
      setActiveTab(locations[0]);
    }
  }, [locations, activeTab]);

  const { data: activities, isLoading, error } = useTrendingActivities(activeTab);

  const scrollContainer = (containerId: string, direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 336; // 320px (w-80) + 16px (gap)
      const scrollLeft = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse flex-shrink-0 w-80">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4 float-right"></div>
        </div>
      </div>
    ))
  );

  if (countriesLoading) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Trending Activities</h2>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Exclusive discounts on activities all over the World.</p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">Trending Activities</h2>
          </div>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Exclusive discounts on activities all over the World.</p>
          <p className="text-gray-500 text-center">No activities available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Trending Activities</h2>
        </div>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Exclusive discounts on activities all over the World.</p>

        <div className="flex justify-center flex-wrap gap-2 mb-8">
          {locations.map(location => (
            <button
              key={location}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === location
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
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" id="activities-container">
            {isLoading ? renderSkeletons() : error ? (
              <div className="flex-shrink-0 w-80 text-center text-red-500">Failed to load trending activities.</div>
            ) : !activities || activities.length === 0 ? (
              <div className="w-full text-center text-gray-500">No trending activities found for {activeTab}.</div>
            ) : activities.slice(0, 8).map(activity => (
              <Link
                key={activity.id}
                to={`/destinations/${activity.countries?.[0]?.slug || 'unknown'}/activities/${activity.slug}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 group block flex-shrink-0 w-80"
              >
                <div className="relative">
                  <img
                    src={
                      activity.cover_image?.storage_key
                        ? `${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${activity.cover_image.storage_key}/medium`
                        : activity.image_url || 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={activity.name}
                    className="w-full h-48 object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors mb-2">{activity.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{activity.summary || activity.countries?.map(c => c.name).join(', ') || 'No description available'}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{activity.duration || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                      <span className="font-bold mr-1">{activity.rating || 'N/A'}</span>
                      <span>({activity.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => scrollContainer('activities-container', 'left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-all duration-200 z-10"
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollContainer('activities-container', 'right')}
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
            to="/activities"
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

export default TrendingActivities;
