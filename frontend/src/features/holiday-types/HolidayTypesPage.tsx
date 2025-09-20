import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import CloudflareImage from '../../components/ui/CloudflareImage';

// API Hooks
import { useHolidayTypes } from '../../lib/hooks/useHolidayTypes';

const HolidayTypesPage: React.FC = () => {
  // Fetch holiday types from API
  const { data: holidayTypes, isLoading, error } = useHolidayTypes();

  // Function to get an appropriate icon for each holiday type
  const getHolidayTypeIcon = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('safari')) return '🦁';
    if (lowerName.includes('beach')) return '🏖️';
    if (lowerName.includes('city')) return '🏙️';
    if (lowerName.includes('honeymoon')) return '💑';
    if (lowerName.includes('family')) return '👨‍👩‍👧‍👦';
    if (lowerName.includes('adventure')) return '🧗‍♂️';
    if (lowerName.includes('cruise')) return '🚢';
    if (lowerName.includes('mountain')) return '🏔️';
    if (lowerName.includes('luxury')) return '💎';
    if (lowerName.includes('food')) return '🍽️';
    if (lowerName.includes('wine')) return '🍷';
    if (lowerName.includes('cultural')) return '🏛️';
    if (lowerName.includes('historical')) return '🏺';
    if (lowerName.includes('wildlife')) return '🐘';
    if (lowerName.includes('sport')) return '⚽';
    
    // Default icon
    return '✈️';
  };

  return (
    <div className="bg-paper min-h-screen">
      <Helmet>
        <title>Holiday Types | AllBounds Vacations</title>
        <meta name="description" content="Explore our diverse range of holiday types and find your perfect vacation style." />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-cover bg-center h-64 md:h-80 flex items-center justify-center" style={{ backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?vacation)' }}>
        <div className="text-center text-white p-4 bg-black bg-opacity-50 rounded">
          <h1 className="text-3xl md:text-4xl font-playfair mb-2">Holiday Types</h1>
          <p className="text-lg md:text-xl">Find your perfect vacation style</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal"></div>
            <p className="mt-2">Loading holiday types...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading holiday types. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {holidayTypes?.map(holidayType => (
              <Link 
                key={holidayType.id} 
                to={`/holiday-types/${holidayType.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  {holidayType.image_id ? (
                    <CloudflareImage 
                      imageId={holidayType.image_id} 
                      variant="thumbnail"
                      alt={holidayType.name}
                      className="w-full h-full"
                      objectFit="cover"
                      placeholder={`https://source.unsplash.com/random/600x400/?${holidayType.name.toLowerCase()}`}
                    />
                  ) : (
                    <img 
                      src={`https://source.unsplash.com/random/600x400/?${holidayType.name.toLowerCase()}`} 
                      alt={holidayType.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-4 text-white">
                      <div className="flex items-center mb-2">
                        <span className="text-3xl mr-3">{getHolidayTypeIcon(holidayType.name)}</span>
                        <h2 className="text-xl font-medium">{holidayType.name}</h2>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4 line-clamp-3">{holidayType.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-charcoal font-medium">
                      View packages
                    </span>
                    <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayTypesPage;
