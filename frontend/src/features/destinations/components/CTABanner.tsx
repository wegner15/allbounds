import React from 'react';
import { Link } from 'react-router-dom';
import { MapIcon, UsersIcon } from '@heroicons/react/24/outline';

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
              Discover our curated travel packages and join exciting group trips
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Primary CTA - View Packages */}
            <Link
              to={`/packages?country=${countrySlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-semibold rounded-lg shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
              aria-label={`View travel packages for ${countryName}`}
            >
              <MapIcon className="w-5 h-5" aria-hidden="true" />
              <span>View Packages</span>
            </Link>
            
            {/* Secondary CTA - Join Group Trips */}
            <Link
              to={`/group-trips?country=${countrySlug}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
              aria-label={`Join group trips to ${countryName}`}
            >
              <UsersIcon className="w-5 h-5" aria-hidden="true" />
              <span>Join Group Trips</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
