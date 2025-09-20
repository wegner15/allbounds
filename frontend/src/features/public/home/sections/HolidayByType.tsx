import React from 'react';
import { Link } from 'react-router-dom';
import { useHolidayTypes } from '../../../../lib/hooks/useHolidayTypes';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const HolidayByType: React.FC = () => {
  const { data: holidayTypes, isLoading, error } = useHolidayTypes();

  const renderSkeletons = () => (
    [...Array(3)].map((_, index) => (
      <div key={index} className="relative h-80 rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
    ))
  );

  if (error) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load holiday types.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Holidays By Type</h2>
          <p className="text-gray-600 max-w-4xl mx-auto">
            Explore our diverse range of holidays categorized by type, designed to cater to every traveler's preferences and interests. 
            Whether you're craving a Safari, Beach escape, Honeymoon, Family Holidays, or City Breaks, we have the perfect holiday waiting for you. 
            Discover our curated selection and embark on an unforgettable travel experience that matches your unique style and desires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {isLoading ? renderSkeletons() : holidayTypes?.slice(0, 3).map(type => (
            <div key={type.id} className="relative h-80 rounded-lg overflow-hidden group">
              <img 
                src={getImageUrlWithFallback(type.image_id, IMAGE_VARIANTS.MEDIUM, 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80')}
                alt={type.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{type.name}</h3>
                <p className="text-white/90 mb-4 line-clamp-2">{type.description}</p>
                <Link
                  to={`/holiday-types/${type.slug}`}
                  className="inline-block bg-white text-gray-900 px-6 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/holiday-types"
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

export default HolidayByType;
