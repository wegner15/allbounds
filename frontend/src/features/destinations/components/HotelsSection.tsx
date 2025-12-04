import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import HotelCard from './HotelCard';
import type { Hotel } from '../../../lib/types/api';

interface HotelsSectionProps {
  hotels: (Hotel & { cover_image?: string | null })[];
  countrySlug: string;
  countryName: string;
}

const HotelsSection: React.FC<HotelsSectionProps> = React.memo(({ 
  hotels, 
  countrySlug,
  countryName 
}) => {
  // Filter active hotels, prioritize those with images, and limit to 6
  const activeHotels = hotels
    .filter(hotel => hotel.is_active)
    .sort((a, b) => {
      // Prioritize hotels with images
      if (a.image_id && !b.image_id) return -1;
      if (!a.image_id && b.image_id) return 1;
      return 0;
    })
    .slice(0, 6);

  // Don't render if no active hotels
  if (activeHotels.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8"
      aria-labelledby="hotels-section-title"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Building2 className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h2 
              id="hotels-section-title"
              className="text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-gray-900"
            >
              Featured Hotels
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
              Comfortable accommodations in {countryName}
            </p>
          </div>
        </div>

        {/* View All Link - Only show if there are more than 6 hotels */}
        {hotels.filter(hotel => hotel.is_active).length > 6 && (
          <Link
            to={`/hotels?country=${countrySlug}`}
            className="hidden sm:flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group min-h-[44px] flex-shrink-0"
            aria-label={`View all hotels in ${countryName}`}
          >
            <span className="text-sm md:text-base">View All</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Hotels Grid - 1 column mobile, 2 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {activeHotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>

      {/* Mobile View All Button */}
      {hotels.filter(hotel => hotel.is_active).length > 6 && (
        <div className="mt-4 md:mt-6 sm:hidden">
          <Link
            to={`/hotels?country=${countrySlug}`}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors"
            aria-label={`View all hotels in ${countryName}`}
          >
            <span className="text-sm md:text-base">View All Hotels</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Hotel Count Info */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
        <p className="text-xs md:text-sm text-gray-600 text-center">
          Showing {activeHotels.length} of {hotels.filter(hotel => hotel.is_active).length} available hotels
        </p>
      </div>
    </section>
  );
});

HotelsSection.displayName = 'HotelsSection';

export default HotelsSection;
