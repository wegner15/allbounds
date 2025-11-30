import React from 'react';
import type { PackageDetailResponse } from '../../lib/types/api';
import { Clock, Users, TrendingUp, MapPin, Calendar, Award } from 'lucide-react';

interface OverviewSectionProps {
  packageData: PackageDetailResponse;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ packageData }) => {
  // Extract highlights from inclusions and attractions
  const highlights = React.useMemo(() => {
    const items: string[] = [];
    
    // Add featured inclusions as highlights
    if (packageData.inclusion_items && packageData.inclusion_items.length > 0) {
      packageData.inclusion_items.slice(0, 3).forEach(inclusion => {
        items.push(inclusion.name);
      });
    }
    
    // Add featured attractions as highlights
    if (packageData.attractions && packageData.attractions.length > 0) {
      packageData.attractions.slice(0, 3).forEach(attraction => {
        items.push(`Visit ${attraction.name}`);
      });
    }
    
    // Add hotel highlights
    if (packageData.hotels && packageData.hotels.length > 0) {
      const starRatings = packageData.hotels.filter(h => h.stars).map(h => h.stars);
      if (starRatings.length > 0) {
        const avgStars = Math.round(starRatings.reduce((a, b) => (a || 0) + (b || 0), 0) / starRatings.length);
        items.push(`${avgStars}-Star Accommodations`);
      }
    }
    
    return items.slice(0, 6); // Limit to 6 highlights
  }, [packageData]);

  // Determine group size (placeholder logic - can be enhanced)
  const groupSize = packageData.hotels && packageData.hotels.length > 0 
    ? '2-15 people' 
    : 'Flexible';

  // Determine difficulty (placeholder logic - can be enhanced based on activities)
  const difficulty = packageData.itinerary_items && packageData.itinerary_items.length > 7
    ? 'Moderate'
    : 'Easy';

  return (
    <section id="overview" className="scroll-mt-20 animate-fade-in" aria-labelledby="overview-heading">
      <article className="bg-white rounded-xl shadow-md p-5 sm:p-6 md:p-8 border border-gray-100">
        {/* Section Header */}
        <h2 id="overview-heading" className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-charcoal mb-4 md:mb-6">
          Tour Overview
        </h2>

        {/* Full Description */}
        {packageData.description && (
          <div 
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-6 md:mb-8 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: packageData.description }}
            role="article"
            aria-label="Tour description"
          />
        )}

        {/* Tour Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-6 md:mb-8">
          {/* Duration */}
          {packageData.duration_days && (
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5 sm:p-6 border border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center mr-3 shadow-md">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Duration</div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
                {packageData.duration_days} {packageData.duration_days === 1 ? 'Day' : 'Days'}
              </div>
            </div>
          )}

          {/* Group Size */}
          <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-5 sm:p-6 border border-accent/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent to-accent-dark rounded-xl flex items-center justify-center mr-3 shadow-md">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Group Size</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
              {groupSize}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-5 sm:p-6 border border-success/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wide">Difficulty</div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-charcoal font-playfair ml-13 sm:ml-15">
              {difficulty}
            </div>
          </div>
        </div>

        {/* Highlights Grid */}
        {highlights.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-charcoal mb-4 sm:mb-5 flex items-center font-playfair">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-accent to-accent-dark rounded-lg flex items-center justify-center mr-3 shadow-md">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Tour Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="flex items-start p-4 sm:p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mr-3 mt-0.5 shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-charcoal leading-relaxed">
                    {highlight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* "Why Choose This Tour" Callout Box */}
        <div className="bg-gradient-to-br from-primary via-primary-dark to-primary rounded-2xl p-6 sm:p-7 md:p-10 text-white shadow-2xl border border-primary-light/20 relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-start">
            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-5 shadow-lg">
              <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-playfair font-bold mb-4 drop-shadow-md">
                Why Choose This Tour?
              </h3>
              <div className="space-y-2 text-teal-50 text-sm sm:text-base">
                <p className="flex items-start">
                  <Calendar className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Carefully crafted {packageData.duration_days}-day itinerary designed to maximize your experience
                  </span>
                </p>
                {packageData.hotels && packageData.hotels.length > 0 && (
                  <p className="flex items-start">
                    <Award className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Handpicked accommodations ensuring comfort and authentic local experiences
                    </span>
                  </p>
                )}
                {packageData.inclusion_items && packageData.inclusion_items.length > 0 && (
                  <p className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      Comprehensive inclusions with {packageData.inclusion_items.length}+ features for a hassle-free journey
                    </span>
                  </p>
                )}
                <p className="flex items-start">
                  <Users className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Expert local guides who bring destinations to life with insider knowledge
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};
