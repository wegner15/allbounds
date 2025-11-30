import React from 'react';
import { Link } from 'react-router-dom';
import type { AttractionSummary } from '../../lib/types/api';
import AttractionCard from './AttractionCard';
import { Landmark, ArrowRight } from 'lucide-react';

interface AttractionsSectionProps {
  attractions: AttractionSummary[];
  showViewAll?: boolean;
}

const AttractionsSection: React.FC<AttractionsSectionProps> = ({ 
  attractions, 
  showViewAll = false 
}) => {
  // Don't render if no attractions
  if (!attractions || attractions.length === 0) {
    return null;
  }

  return (
    <section id="attractions" className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-white to-gray-50 scroll-mt-20" aria-labelledby="attractions-heading">
      <div className="container mx-auto px-0">
        {/* Section Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 px-4">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center shadow-lg" aria-hidden="true">
                <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 id="attractions-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal font-playfair">
                Attractions & Highlights
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 font-medium ml-13 sm:ml-15">
              Discover the amazing places you'll visit on this tour
            </p>
          </div>

          {/* View All Link - Optional */}
          {showViewAll && (
            <Link
              to="/attractions"
              className="hidden md:flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group touch-manipulation min-h-[44px]"
            >
              View All Attractions
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </header>

        {/* Attractions Grid - 3 columns desktop, 2 tablet, 1 mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4" role="list" aria-label="Tour attractions">
          {attractions.map((attraction) => (
            <article key={attraction.id} role="listitem">
              <AttractionCard attraction={attraction} />
            </article>
          ))}
        </div>

        {/* Mobile View All Link */}
        {showViewAll && (
          <div className="md:hidden mt-6 sm:mt-8 text-center px-4">
            <Link
              to="/attractions"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 active:text-teal-800 font-medium transition-colors px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 touch-manipulation min-h-[44px]"
            >
              View All Attractions
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Attraction Count Badge */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{attractions.length}</span>{' '}
            {attractions.length === 1 ? 'attraction' : 'attractions'} featured in this tour
          </p>
        </div>
      </div>
    </section>
  );
};

export default AttractionsSection;
