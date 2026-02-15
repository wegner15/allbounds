import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin, Landmark } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { Attraction } from '../../../lib/types/api';

interface AttractionCardProps {
  attraction: Attraction & { cover_image?: string | null };
}

const AttractionCard: React.FC<AttractionCardProps> = React.memo(({ attraction }) => {
  // Sanitize and truncate description
  const sanitizedDescription = attraction.summary || attraction.description
    ? DOMPurify.sanitize(attraction.summary || attraction.description || '')
    : '';

  return (
    <article className="group bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:border-orange-400 hover:shadow-md flex min-h-[80px]">
      <Link
        to={`/attractions/${attraction.country?.slug || 'unknown'}/${attraction.slug}`}
        className="flex w-full min-h-[44px]"
        aria-label={`View details for ${attraction.name} attraction`}
      >
        {/* Image - Left Side */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 overflow-hidden bg-gray-200">
          {attraction.image_id ? (
            <OptimizedImage
              imageId={attraction.image_id}
              alt={`${attraction.name} attraction`}
              variant="thumbnail"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('thumbnail')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center" role="img" aria-label="Default attraction image">
              <Landmark className="w-8 h-8 text-white opacity-70" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Content - Right Side */}
        <div className="flex-1 p-3 md:p-4 min-w-0">
          {/* Attraction Name - H3 for proper heading hierarchy */}
          <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {attraction.name}
          </h3>

          {/* Location */}
          {(attraction.city || attraction.location) && (
            <div className="flex items-center text-xs md:text-sm text-gray-600 mb-1 md:mb-2">
              <MapPin className="w-3 h-3 mr-1 text-orange-500 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">
                {attraction.city || attraction.location}
              </span>
            </div>
          )}

          {/* Description - 2 line truncation */}
          {sanitizedDescription && (
            <div
              className="text-xs md:text-sm text-gray-600 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}
        </div>
      </Link>
    </article>
  );
});

AttractionCard.displayName = 'AttractionCard';

export default AttractionCard;
