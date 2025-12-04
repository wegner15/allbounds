import React from 'react';
import { Link } from 'react-router-dom';
import { Package as PackageIcon, ArrowRight } from 'lucide-react';
import PackageCard from './PackageCard';
import type { Package } from '../../../lib/types/api';

interface PackagesSectionProps {
  packages: Package[];
  countrySlug: string;
  countryName: string;
}

const PackagesSection: React.FC<PackagesSectionProps> = React.memo(({ 
  packages, 
  countrySlug,
  countryName 
}) => {
  // Filter active packages and limit to 6
  const activePackages = packages
    .filter(pkg => pkg.is_active)
    .slice(0, 6);

  // Don't render if no active packages
  if (activePackages.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8"
      aria-labelledby="packages-section-title"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="p-2 bg-teal-100 rounded-lg flex-shrink-0">
            <PackageIcon className="w-5 h-5 md:w-6 md:h-6 text-teal-600" />
          </div>
          <div className="min-w-0">
            <h2 
              id="packages-section-title"
              className="text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-gray-900"
            >
              Travel Packages
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mt-1 truncate">
              Explore our curated packages for {countryName}
            </p>
          </div>
        </div>

        {/* View All Link - Only show if there are more than 6 packages */}
        {packages.filter(pkg => pkg.is_active).length > 6 && (
          <Link
            to={`/packages?country=${countrySlug}`}
            className="hidden sm:flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium transition-colors group min-h-[44px] flex-shrink-0"
            aria-label={`View all packages for ${countryName}`}
          >
            <span className="text-sm md:text-base">View All</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Packages Grid - 1 column mobile, 2 columns desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {activePackages.map((pkg) => (
          <PackageCard key={pkg.id} package={pkg} />
        ))}
      </div>

      {/* Mobile View All Button */}
      {packages.filter(pkg => pkg.is_active).length > 6 && (
        <div className="mt-4 md:mt-6 sm:hidden">
          <Link
            to={`/packages?country=${countrySlug}`}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 min-h-[44px] bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-medium rounded-lg transition-colors"
            aria-label={`View all packages for ${countryName}`}
          >
            <span className="text-sm md:text-base">View All Packages</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Package Count Info */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100">
        <p className="text-xs md:text-sm text-gray-600 text-center">
          Showing {activePackages.length} of {packages.filter(pkg => pkg.is_active).length} available packages
        </p>
      </div>
    </section>
  );
});

PackagesSection.displayName = 'PackagesSection';

export default PackagesSection;
