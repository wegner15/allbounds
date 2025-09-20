import React from 'react';
import { Link } from 'react-router-dom';
import { useSpecialDeals } from '../../hooks/useSpecialDeals';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../../utils/imageUtils';

const SpecialTopDeals: React.FC = () => {
  const { data: deals, isLoading, error } = useSpecialDeals();

  const renderSkeletons = () => (
    [...Array(6)].map((_, index) => (
      <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-gray-200 animate-pulse"></div>
    ))
  );

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-500">Failed to load special deals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Special Top Deals</h2>
            <p className="text-gray-600 max-w-2xl">
              Enjoy our seasonal holiday special offers, meticulously curated to provide you with unforgettable experiences at exceptional value.
            </p>
          </div>
          <Link 
            to="/packages" 
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            View All Deals
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {isLoading ? renderSkeletons() : deals?.map(deal => (
            <Link
              key={deal.id}
              to={`/packages/${deal.slug}`}
              className="relative h-48 rounded-lg overflow-hidden group cursor-pointer block"
            >
              <img 
                src={getImageUrlWithFallback(deal.image_id, IMAGE_VARIANTS.THUMBNAIL, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80')}
                alt={deal.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg">{deal.name}</h3>
                  <p className="text-white/80 text-sm">From ${deal.price}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecialTopDeals;
