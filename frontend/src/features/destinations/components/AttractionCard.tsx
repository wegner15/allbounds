import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin, Landmark, ArrowRight } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { Attraction } from '../../../lib/types/api';

interface AttractionCardProps {
  attraction: Attraction & { cover_image?: string | null };
}

const AttractionCard: React.FC<AttractionCardProps> = React.memo(({ attraction }) => {
  // Sanitize description
  const sanitizedDescription = attraction.summary || attraction.description
    ? DOMPurify.sanitize(attraction.summary || attraction.description || '')
    : '';

  const imageId = attraction.image_id || attraction.cover_image || attraction.image_url;

  return (
    <article className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full">
      <Link
        to={`/attractions/${attraction.slug}/`}
        className="flex flex-col h-full"
        aria-label={`View details for ${attraction.name} attraction`}
      >
        {/* Large Hero Image */}
        <div className="relative w-full h-60 sm:h-64 md:h-72 overflow-hidden bg-gray-200">
          {imageId ? (
            <OptimizedImage
              imageId={imageId}
              alt={`${attraction.name} attraction`}
              variant="large"
              className="w-full h-full transition-transform duration-500 group-hover:scale-105"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('card')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-charcoal flex items-center justify-center" role="img" aria-label="Default attraction image">
              <Landmark className="w-14 h-14 text-white opacity-60" aria-hidden="true" />
            </div>
          )}

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Location badge on image */}
          {(attraction.city || attraction.location) && (
            <div className="absolute bottom-3 left-3 inline-flex items-center px-3 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-300 flex-shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[220px]">
                {attraction.city || attraction.location}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col">
          <h3 className="text-lg md:text-xl font-playfair font-bold text-gray-900 mb-2.5 line-clamp-2 group-hover:text-primary transition-colors">
            {attraction.name}
          </h3>

          {sanitizedDescription && (
            <div
              className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-grow"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-semibold text-primary group-hover:text-primary-dark">
            <span>Explore Attraction</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </article>
  );
});

AttractionCard.displayName = 'AttractionCard';

export default AttractionCard;
