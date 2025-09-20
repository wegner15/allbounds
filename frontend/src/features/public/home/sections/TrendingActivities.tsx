import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock } from 'lucide-react';
import { useTrendingActivities } from '../../hooks/useTrendingActivities';

const TrendingActivities: React.FC = () => {
  const locations = ['Kenya', 'Uganda', 'Zanzibar', 'Dubai', 'Seychelles', 'Mauritius'];
  const [activeTab, setActiveTab] = useState(locations[0]);

  const { data: activities, isLoading, error } = useTrendingActivities(activeTab);

  const renderSkeletons = () => (
    [...Array(4)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg overflow-hidden border border-gray-200 animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
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
          <h2 className="text-3xl font-bold text-gray-900">Trending Activities</h2>
        </div>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">Exclusive discounts on activities all over the World.</p>
        
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
            <div className="col-span-full text-center text-red-500">Failed to load trending activities.</div>
          ) : !activities || activities.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">No trending activities found for {activeTab}.</div>
          ) : activities.map(activity => (
            <div key={activity.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300 group">
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
                {/* Placeholder for tags */}
                <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 truncate h-12 group-hover:text-blue-600 transition-colors">{activity.name}</h3>
                <p className="text-sm text-gray-500 mb-2 h-5 truncate">{activity.countries?.map(c => c.name).join(', ') || 'No location specified'}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{activity.duration || 'N/A'}</span>
                </div>
                <div className="flex items-center mb-4">
                   <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        <span className="font-bold mr-1">{activity.rating || 'N/A'}</span>
                        <span>({activity.review_count || 0} reviews)</span>
                    </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">From</p>
                  <p className="text-xl font-bold text-gray-900">US${activity.price || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
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
