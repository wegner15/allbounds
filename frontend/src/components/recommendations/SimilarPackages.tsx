import React from 'react';
import { Link } from 'react-router-dom';
import { useSimilarPackages } from '../../lib/hooks/usePackages';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

interface SimilarPackagesProps {
  packageId: number;
  limit?: number;
}

const SimilarPackages: React.FC<SimilarPackagesProps> = ({ packageId, limit = 4 }) => {
  const { data: similarPackages, isLoading, error } = useSimilarPackages(packageId, limit);

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !similarPackages || similarPackages.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Packages</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarPackages.map((pkg) => (
          <Link
            key={pkg.id}
            to={`/packages/${pkg.country?.slug || 'unknown'}/${pkg.slug}`}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  pkg.image_id
                    ? getImageUrlWithFallback(pkg.image_id, IMAGE_VARIANTS.MEDIUM)
                    : pkg.image_url || '/home-heros/hero4.jpeg'
                }
                alt={pkg.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-lg line-clamp-2">{pkg.name}</h3>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{pkg.country.name}</span>
              </div>

              {pkg.duration_days && (
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{pkg.duration_days} days</span>
                </div>
              )}

              {pkg.price && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-500">From</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">${pkg.price}</span>
                      <span className="text-sm text-gray-500 ml-1">per person</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarPackages;
