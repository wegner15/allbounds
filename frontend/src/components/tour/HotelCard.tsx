import React from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../utils/imageUtils';
import type { HotelSummary } from '../../lib/types/api';
import { MapPin, Star } from 'lucide-react';

interface HotelCardProps {
  hotel: HotelSummary;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const { name, slug, summary, city, stars, image_id, amenities } = hotel;

  return (
    <Link
      to={`/hotels/${slug}`}
      className="group bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-gray-100 hover:border-primary/30 animate-fade-in"
    >
      {/* Hotel Image with 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <OptimizedImage
          imageId={image_id}
          alt={name}
          variant="medium"
          className="w-full h-full transition-transform duration-500 group-hover:scale-110"
          objectFit="cover"
          loading="lazy"
          aspectRatio="16/9"
          showSkeleton={true}
          sizes={getResponsiveImageSizes('card')}
        />
        
        {/* Star Rating Overlay */}
        {stars && stars > 0 && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
            <span className="text-sm font-bold text-charcoal">{stars}</span>
          </div>
        )}
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Hotel Details */}
      <div className="p-5">
        {/* Hotel Name */}
        <h3 className="text-lg font-semibold text-charcoal mb-2 line-clamp-1 group-hover:text-primary transition-colors font-playfair">
          {name}
        </h3>

        {/* City/Location */}
        {city && (
          <div className="flex items-center gap-1.5 text-gray-600 mb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{city}</span>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}

        {/* Amenities Tags (first 3) */}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity.id}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                {amenity.name}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100">
                +{amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-primary group-hover:text-primary-dark flex items-center gap-1.5 transition-colors">
            View Details
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
