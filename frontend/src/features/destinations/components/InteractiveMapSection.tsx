import React, { lazy, Suspense } from 'react';
import { MapPin } from 'lucide-react';
import type { CountryWithDetails } from '../../../lib/types/api';

// Lazy load the map component for better initial page load performance
const MapContent = lazy(() => import('./MapContent'));

interface InteractiveMapSectionProps {
  country: CountryWithDetails;
}

const InteractiveMapSection: React.FC<InteractiveMapSectionProps> = ({ country }) => {
  // Check if country exists and has coordinates
  if (!country) {
    return null;
  }
  
  const hasCoordinates = country.latitude != null && country.longitude != null;

  // Don't render if no coordinates available
  if (!hasCoordinates) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
            Explore {country.name}
          </h2>
          <p className="text-sm text-gray-600 mt-1">Interactive map with attractions</p>
        </div>
      </div>

      {/* Map Container with Lazy Loading */}
      <Suspense
        fallback={
          <div 
            className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-100 flex items-center justify-center"
            style={{ height: '400px' }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        }
      >
        <MapContent country={country} />
      </Suspense>
    </section>
  );
};

export default InteractiveMapSection;
