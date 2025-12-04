import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import AttractionCard from './AttractionCard';
import type { Attraction } from '../../../lib/types/api';

interface AttractionsSectionProps {
  attractions: (Attraction & { cover_image?: string | null })[];
  countrySlug: string;
  countryName: string;
}

const AttractionsSection: React.FC<AttractionsSectionProps> = React.memo(({ 
  attractions, 
  countrySlug,
  countryName 
}) => {
  // Filter active attractions and limit to 8
  const activeAttractions = attractions
    .filter(attraction => attraction.is_active)
    .slice(0, 8);

  // Don't render if no active attractions
  if (activeAttractions.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8"
      aria-labelledby="attractions-section-title"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
            <MapPin className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
          <div className="min-w-0">
            <h2 
              id="attractions-section-title"
              className="text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-gray-900"
            >
              Top Attractions
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
              Must-see places and experiences in {countryName}
            </p>
          </div>
        </div>

        {/* View All Link - Only show if there are more than 8 attractions */}
        {attractions.filter(attraction => attraction.is_active).length > 8 && (
          <Link
            to={`/attractions?country=${countrySlug}`}
            className="hidden sm:flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium transition-colors group min-h-[44px] flex-shrink-0"
            aria-label={`View all attractions in ${countryName}`}
          >
            <span className="text-sm md:text-base">View All</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Attractions Grid - 1 column mobile, 2 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {activeAttractions.map((attraction) => (
          <AttractionCard key={attraction.id} attraction={attraction} />
        ))}
      </div>

      {/* Mobile View All Button */}
      {attractions.filter(attraction => attraction.is_active).length > 8 && (
        <div className="mt-4 md:mt-6 sm:hidden">
          <Link
            to={`/attractions?country=${countrySlug}`}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 min-h-[44px] bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium rounded-lg transition-colors"
            aria-label={`View all attractions in ${countryName}`}
          >
            <span className="text-sm md:text-base">View All Attractions</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Attraction Count Info */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
        <p className="text-xs md:text-sm text-gray-600 text-center">
          Showing {activeAttractions.length} of {attractions.filter(attraction => attraction.is_active).length} attractions
        </p>
      </div>
    </section>
  );
});

AttractionsSection.displayName = 'AttractionsSection';

export default AttractionsSection;
