import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface CTABannerProps {
  countrySlug: string;
  countryName: string;
}

const CTABanner: React.FC<CTABannerProps> = ({ countrySlug, countryName }) => {
  return (
    <section 
      className="bg-gradient-to-r from-primary to-primary-dark py-8 md:py-12"
      aria-label="Call to action"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Ready to Explore {countryName}?
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto">
              Discover our curated travel packages and plan your dream trip
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {/* Primary CTA - View Packages */}
            <Link
              to={`/packages?country=${countrySlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50"
              aria-label={`View travel packages for ${countryName}`}
            >
              <MapIcon className="w-5 h-5" aria-hidden="true" />
              <span className="text-base">View Packages</span>
            </Link>
            
            {/* Secondary CTA - Book Destination */}
            <Link
              to={`/destinations/${countrySlug}/book`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-transparent text-white font-bold rounded-xl border-2 border-white/80 hover:bg-white hover:text-primary hover:border-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
              aria-label={`Plan my ${countryName} trip`}
            >
              <CalendarIcon className="w-5 h-5" aria-hidden="true" />
              <span className="text-base">Plan My {countryName} Trip</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
