import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Clock, MapPin } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { Package } from '../../../lib/types/api';

interface PackageCardProps {
  package: Package;
}

const PackageCard: React.FC<PackageCardProps> = React.memo(({ package: pkg }) => {
  // Sanitize and truncate description
  const sanitizedDescription = pkg.summary || pkg.description 
    ? DOMPurify.sanitize(pkg.summary || pkg.description || '')
    : '';
  
  return (
    <article className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full">
      <Link
        to={`/packages/${pkg.slug}`}
        className="flex flex-col h-full min-h-[44px]"
        aria-label={`View details for ${pkg.name} package`}
      >
        {/* Image */}
        <div className="relative w-full h-40 sm:h-48 md:h-52 overflow-hidden bg-gray-200">
          {pkg.image_id ? (
            <OptimizedImage
              imageId={pkg.image_id}
              alt={`${pkg.name} tour package in ${pkg.country?.name || 'destination'}`}
              variant="medium"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('card')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-primary flex items-center justify-center" role="img" aria-label="Default package image">
              <MapPin className="w-12 h-12 text-white opacity-50" aria-hidden="true" />
            </div>
          )}
          
          {/* Featured Badge */}
          {pkg.is_featured && (
            <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full shadow-md" role="status" aria-label="Featured package">
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Country and Holiday Type */}
        <div className="flex items-center justify-between mb-2 gap-2">
          {pkg.country && (
            <div className="flex items-center text-xs md:text-sm text-gray-600">
              <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-1 text-teal-500 flex-shrink-0" />
              <span className="font-medium truncate">{pkg.country.name}</span>
            </div>
          )}
          {pkg.holiday_types && pkg.holiday_types.length > 0 && (
            <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
              {pkg.holiday_types[0].name}
            </span>
          )}
        </div>

        {/* Package Name - H3 for proper heading hierarchy */}
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {pkg.name}
        </h3>

        {/* Description */}
        {sanitizedDescription && (
          <div
            className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        )}

        {/* Footer - Duration and Price */}
        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 text-gray-400 flex-shrink-0" />
            <span>{pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-base md:text-lg font-bold text-teal-600">
              ${pkg.price.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Rating (if available) */}
        {pkg.rating && pkg.rating > 0 && (
          <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
            <div className="flex text-yellow-400" role="img" aria-label={`Rating: ${pkg.rating.toFixed(1)} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(pkg.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-xs text-gray-600">
              {pkg.rating.toFixed(1)} ({pkg.review_count || 0} reviews)
            </span>
          </div>
        )}
        </div>
      </Link>
    </article>
  );
});

PackageCard.displayName = 'PackageCard';

export default PackageCard;
