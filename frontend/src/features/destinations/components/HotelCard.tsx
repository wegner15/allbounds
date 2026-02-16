import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin, Building2, Star } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { Hotel } from '../../../lib/types/api';

interface HotelCardProps {
  hotel: Hotel & { cover_image?: string | null };
}

const HotelCard: React.FC<HotelCardProps> = React.memo(({ hotel }) => {
  // Sanitize and truncate description
  const sanitizedDescription = hotel.summary || hotel.description
    ? DOMPurify.sanitize(hotel.summary || hotel.description || '')
    : '';

  // Get first 3 amenities
  const displayedAmenities = hotel.amenities?.slice(0, 3) || [];
  const remainingAmenitiesCount = (hotel.amenities?.length || 0) - 3;

  // Price category display
  const getPriceCategoryDisplay = (category?: string) => {
    if (!category) return null;
    const categoryMap: Record<string, string> = {
      'budget': '$',
      'mid-range': '$$',
      'luxury': '$$$',
      'ultra-luxury': '$$$$'
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  return (
    <article className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full">
      <Link
        to={`/destinations/${hotel.country?.slug || 'unknown'}/hotels/${hotel.slug}`}
        className="flex flex-col h-full min-h-[44px]"
        aria-label={`View details for ${hotel.name} hotel`}
      >
        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-200">
          {hotel.image_id || hotel.image_url ? (
            <OptimizedImage
              imageId={hotel.image_id || hotel.image_url}
              alt={`${hotel.name} hotel in ${hotel.city || 'destination'}`}
              variant="medium"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('card')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center" role="img" aria-label="Default hotel image">
              <Building2 className="w-12 h-12 text-white opacity-50" aria-hidden="true" />
            </div>
          )}

          {/* Price Category Badge */}
          {hotel.price_category && (
            <div className="absolute top-3 right-3 bg-white text-gray-900 text-sm font-semibold px-3 py-1 rounded-full shadow-md" role="status" aria-label={`Price category: ${hotel.price_category}`}>
              {getPriceCategoryDisplay(hotel.price_category)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Hotel Name - H3 for proper heading hierarchy */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {hotel.name}
          </h3>

          {/* Star Rating */}
          {hotel.stars && hotel.stars > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex" role="img" aria-label={`${hotel.stars} star hotel`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < hotel.stars!
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                      }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {hotel.stars} Star{hotel.stars !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* City Location */}
          {hotel.city && (
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-1 text-blue-500 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{hotel.city}</span>
            </div>
          )}

          {/* Description */}
          {sanitizedDescription && (
            <div
              className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}

          {/* Amenities */}
          {displayedAmenities.length > 0 && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2" role="list" aria-label="Hotel amenities">
                {displayedAmenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    role="listitem"
                    className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    title={amenity.description || amenity.name}
                  >
                    {amenity.icon && (
                      <span className="mr-1" aria-hidden="true">
                        {amenity.icon}
                      </span>
                    )}
                    <span className="truncate max-w-[100px]">{amenity.name}</span>
                  </div>
                ))}
                {remainingAmenitiesCount > 0 && (
                  <div className="flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium" role="listitem">
                    +{remainingAmenitiesCount} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
});

HotelCard.displayName = 'HotelCard';

export default HotelCard;
