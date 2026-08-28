import React from 'react';
import { Link } from 'react-router-dom';
import { useAttractions, type Attraction } from '../../lib/hooks/useAttractions';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { MapPin, Landmark } from 'lucide-react';

interface SimilarAttractionsProps {
  currentAttractionId: number;
  countryId?: number;
  limit?: number;
}

const SimilarAttractions: React.FC<SimilarAttractionsProps> = ({
  currentAttractionId,
  countryId,
  limit = 4,
}) => {
  const { data: attractions, isLoading, error } = useAttractions({ country_id: countryId, limit: 20 });

  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-200 mt-12">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6">Similar Attractions You Might Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !attractions) {
    return null;
  }

  const similarAttractions = attractions
    .filter((att) => att.id !== currentAttractionId && att.is_active !== false)
    .slice(0, limit);

  if (similarAttractions.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-gray-200 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-playfair text-charcoal">
            Similar Attractions & Landmarks
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Explore iconic landmarks, parks, and sights near your destination
          </p>
        </div>
        <Link
          to="/attractions"
          className="hidden sm:inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          View All Attractions &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarAttractions.map((att: Attraction) => {
          const countrySlug = att.country?.slug || 'explore';

          return (
            <Link
              key={att.id}
              to={`/attractions/${countrySlug}/${att.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={
                    att.image_id
                      ? getImageUrlWithFallback(att.image_id, IMAGE_VARIANTS.MEDIUM)
                      : att.cover_image || (att as any).image_url || '/home-heros/hero1.jpeg'
                  }
                  alt={att.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {att.country && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full flex items-center shadow-xs">
                    <MapPin className="w-3 h-3 mr-1 text-primary" />
                    {att.country.name}
                  </span>
                )}
                {att.category && (
                  <span className="absolute bottom-3 left-3 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    {att.category}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {att.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {att.summary || att.description?.replace(/<[^>]*>/g, '').slice(0, 100) || 'Must-see tourist attraction and landmark.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-primary font-semibold">
                  <span className="flex items-center">
                    <Landmark className="w-3.5 h-3.5 mr-1" />
                    Explore Landmark
                  </span>
                  <span>&rarr;</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarAttractions;
