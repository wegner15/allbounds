import React from 'react';
import { Link } from 'react-router-dom';
import type { HotelSummary } from '../../lib/types/api';
import HotelCard from './HotelCard';
import { Building2, ArrowRight } from 'lucide-react';

interface HotelsSectionProps {
  hotels: HotelSummary[];
  showViewAll?: boolean;
}

const HotelsSection: React.FC<HotelsSectionProps> = ({ 
  hotels, 
  showViewAll = false 
}) => {
  // Don't render if no hotels
  if (!hotels || hotels.length === 0) {
    return null;
  }

  return (
    <section id="hotels" className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-gray-50 to-white scroll-mt-20" aria-labelledby="hotels-heading">
      <div className="container mx-auto px-0">
        {/* Section Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 px-4">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 id="hotels-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
                Accommodations
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium ml-13 sm:ml-15">
              Carefully selected hotels for your comfort and convenience
            </p>
          </div>

          {/* View All Link - Optional */}
          {showViewAll && (
            <Link
              to="/hotels"
              className="hidden md:flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-all duration-200 hover:scale-105 group touch-manipulation min-h-[44px] px-4 py-2 rounded-lg hover:bg-primary/10"
            >
              View All Hotels
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          )}
        </header>

        {/* Hotels Grid - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-4" role="list" aria-label="Hotel accommodations">
          {hotels.map((hotel) => (
            <article key={hotel.id} role="listitem">
              <HotelCard hotel={hotel} />
            </article>
          ))}
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <div className="md:hidden mt-6 sm:mt-8 text-center px-4">
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 active:text-teal-800 font-medium transition-colors px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-white active:bg-gray-50 touch-manipulation min-h-[44px]"
            >
              View All Hotels
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Hotel Count Badge */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{hotels.length}</span>{' '}
            {hotels.length === 1 ? 'hotel' : 'hotels'} included in this tour
          </p>
        </div>
      </div>
    </section>
  );
};

export default HotelsSection;
