import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTrendingAttractions } from '../../hooks/useTrendingAttractions';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const TrendingAttractions: React.FC = () => {
  const locations = ['Kenya', 'Uganda', 'Tanzania', 'Dubai', 'South Africa', 'Egypt', 'Turkey', 'Greece', 'Thailand'];
  const [activeTab, setActiveTab] = useState(locations[0]);

  const { data: attractions, isLoading, error } = useTrendingAttractions(activeTab);

  const renderSkeletons = () => (
    [...Array(8)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse">
        <div className="w-full h-40 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))
  );

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? renderSkeletons() : error ? (
            <div className="col-span-full text-center text-red-500">Failed to load trending attractions.</div>
          ) : attractions?.map(attraction => (
            <Link 
                key={attraction.id} 
                to={`/attractions/${attraction.slug}`}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 group block"
            >
              <img 
                src={getImageUrlWithFallback(attraction.cover_image || attraction.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80')}
                alt={attraction.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors">{attraction.name}</h3>
                <p className="text-sm text-gray-500">{attraction.country?.name}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/attractions"
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

export default TrendingAttractions;
