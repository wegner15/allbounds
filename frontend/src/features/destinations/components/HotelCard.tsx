import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin, Building2, Star, Clock, BedDouble, ArrowRight } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { Hotel } from '../../../lib/types/api';

export const calculateHotelLowestPrice = (hotel: any): number | null => {
  if (typeof hotel.lowestPrice === 'number' && hotel.lowestPrice > 0) {
    return hotel.lowestPrice;
  }

  const prices: number[] = [];

  if (Array.isArray(hotel.price_charts)) {
    hotel.price_charts.forEach((chart: any) => {
      if (chart.is_active !== false) {
        if (typeof chart.price === 'number' && chart.price > 0) {
          prices.push(chart.price);
        }
        if (typeof chart.booking_price === 'number' && chart.booking_price > 0) {
          prices.push(chart.booking_price);
        }
        if (Array.isArray(chart.night_rates)) {
          chart.night_rates.forEach((rate: any) => {
            if (rate.is_active !== false) {
              if (typeof rate.price === 'number' && rate.price > 0) {
                prices.push(rate.price);
              }
              if (typeof rate.price_per_night === 'number' && rate.price_per_night > 0) {
                prices.push(rate.price_per_night);
              }
            }
          });
        }
      }
    });
  }

  if (typeof hotel.price_per_night === 'number' && hotel.price_per_night > 0) {
    prices.push(hotel.price_per_night);
  }
  if (typeof hotel.price === 'number' && hotel.price > 0) {
    prices.push(hotel.price);
  }

  if (prices.length === 0) return null;
  return Math.min(...prices);
};

export const getHotelNightDurations = (hotel: any): number[] => {
  const set = new Set<number>();
  if (Array.isArray(hotel.price_charts)) {
    hotel.price_charts.forEach((chart: any) => {
      if (chart.is_active !== false && Array.isArray(chart.night_rates)) {
        chart.night_rates.forEach((rate: any) => {
          if (rate.is_active !== false && rate.nights && Number(rate.nights) > 0) {
            set.add(Number(rate.nights));
          }
        });
      }
    });
  }
  return Array.from(set).sort((a, b) => a - b);
};

interface HotelCardProps {
  hotel: Hotel & { cover_image?: string | null; lowestPrice?: number | null };
  isHotelPackage?: boolean;
}

const HotelCard: React.FC<HotelCardProps> = React.memo(({ hotel, isHotelPackage = false }) => {
  // Sanitize and truncate description
  const sanitizedDescription = hotel.summary || hotel.description
    ? DOMPurify.sanitize(hotel.summary || hotel.description || '')
    : '';

  // Get lowest price and night durations
  const lowestPrice = calculateHotelLowestPrice(hotel);
  const nightDurations = getHotelNightDurations(hotel);

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

          {/* Hotel Package Badge (Top Left) */}
          {isHotelPackage && (
            <div className="absolute top-3 left-3 bg-teal text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5" />
              <span>Hotel Package</span>
            </div>
          )}

          {/* Price Category Badge (Top Right) */}
          {hotel.price_category && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10" role="status" aria-label={`Price category: ${hotel.price_category}`}>
              {getPriceCategoryDisplay(hotel.price_category)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Destination & City Location */}
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            {hotel.city && (
              <div className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                <MapPin className="w-3.5 h-3.5 mr-1 text-teal flex-shrink-0" />
                <span className="truncate">{hotel.city}</span>
              </div>
            )}
            {hotel.hotel_type?.name && (
              <span className="text-xs text-gray-500 font-medium">
                {hotel.hotel_type.name}
              </span>
            )}
          </div>

          {/* Hotel Name - H3 for proper heading hierarchy */}
          <h3 className="text-lg font-bold font-playfair text-gray-900 mb-1.5 line-clamp-2 group-hover:text-teal transition-colors">
            {hotel.name}
          </h3>

          {/* Star Rating */}
          {hotel.stars && hotel.stars > 0 && (
            <div className="flex items-center mb-2.5">
              <div className="flex" role="img" aria-label={`${hotel.stars} star hotel`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(hotel.stars!)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                      }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="ml-1.5 text-xs font-semibold text-gray-600">
                {hotel.stars} Star
              </span>
            </div>
          )}

          {/* Description */}
          {sanitizedDescription && (
            <div
              className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 flex-grow leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
          )}

          {/* Amenities */}
          {displayedAmenities.length > 0 && (
            <div className="pt-2.5 pb-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-1.5" role="list" aria-label="Hotel amenities">
                {displayedAmenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    role="listitem"
                    className="flex items-center text-[11px] bg-teal-50/70 text-teal-800 border border-teal-100/80 px-2 py-0.5 rounded-md font-medium"
                    title={amenity.description || amenity.name}
                  >
                    <span>{amenity.name}</span>
                  </div>
                ))}
                {remainingAmenitiesCount > 0 && (
                  <div className="flex items-center text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium" role="listitem">
                    +{remainingAmenitiesCount} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer - Night Durations and Price */}
          <div className="flex items-end justify-between pt-3 mt-auto border-t border-gray-100">
            {nightDurations.length > 0 ? (
              <div className="flex items-center bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100 shadow-2xs">
                <Clock className="w-3.5 h-3.5 mr-1 text-teal flex-shrink-0" />
                <span className="text-xs font-bold text-teal-900">
                  {nightDurations.length === 1
                    ? `${nightDurations[0]} Nights`
                    : `${nightDurations.slice(0, 3).join(', ')} Nights`}
                </span>
              </div>
            ) : (
              <div className="text-xs text-teal font-semibold flex items-center gap-1 group-hover:underline">
                <span>{isHotelPackage ? 'View Package' : 'View Hotel'}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            )}

            {lowestPrice !== null && lowestPrice > 0 ? (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Starting From</div>
                <div className="text-lg sm:text-xl font-bold text-teal leading-none tracking-tight">
                  From ${lowestPrice.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-right text-xs text-gray-400 font-medium">
                Rates on request
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
});

HotelCard.displayName = 'HotelCard';

export default HotelCard;
