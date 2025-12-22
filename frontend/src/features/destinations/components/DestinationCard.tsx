import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import type { Country } from '../../../lib/types/api';

interface DestinationCardProps {
  destination: Country;
}

const DestinationCard: React.FC<DestinationCardProps> = React.memo(({ destination }) => {
  const imageUrl = getImageUrlWithFallback(destination.image_id, IMAGE_VARIANTS.MEDIUM);

  return (
    <article className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
      <Link
        to={`/destinations/${destination.slug}`}
        className="block min-h-[44px] h-full flex flex-col"
        aria-label={`Explore ${destination.name} destination${destination.region ? ` in ${destination.region.name}` : ''}`}
      >
        {/* Destination Image */}
        <div className="relative h-48 overflow-hidden bg-gray-200 flex-shrink-0">
          <img
            src={imageUrl}
            alt={`Scenic view of ${destination.name}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" aria-hidden="true" />

          {/* Destination name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-playfair font-bold text-white mb-1">
              {destination.name}
            </h3>
            {destination.region && (
              <div className="flex items-center space-x-1 text-white/90 text-sm">
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{destination.region.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Destination Info */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Summary/Description */}
          {destination.summary && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {destination.summary}
            </p>
          )}

          {/* Explore Link */}
          <div className="flex items-center justify-between text-teal-600 group-hover:text-teal-700 transition-colors mt-auto">
            <span className="text-sm font-medium">Explore Destination</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </div>
        </div>
      </Link>
    </article>
  );
});

DestinationCard.displayName = 'DestinationCard';

export default DestinationCard;
