import React from 'react';
import { Link } from 'react-router-dom';
import { useActivities } from '../../lib/hooks/useActivities';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { MapPin, Compass } from 'lucide-react';
import type { ActivityResponse } from '../../lib/types/api';

interface SimilarActivitiesProps {
  currentActivitySlug: string;
  countryId?: number;
  limit?: number;
}

const SimilarActivities: React.FC<SimilarActivitiesProps> = ({
  currentActivitySlug,
  countryId,
  limit = 4,
}) => {
  const { data: activities, isLoading, error } = useActivities(countryId);

  if (isLoading) {
    return (
      <div className="py-12 border-t border-gray-200 mt-12">
        <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6">Similar Activities You Might Like</h2>
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

  if (error || !activities) {
    return null;
  }

  const similarActivities = activities
    .filter((act) => act.slug !== currentActivitySlug && act.is_active !== false)
    .slice(0, limit);

  if (similarActivities.length === 0) {
    return null;
  }

  return (
    <div className="py-12 border-t border-gray-200 mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-playfair text-charcoal">
            Similar Activities You Might Like
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Discover more experiences and excursions for your journey
          </p>
        </div>
        <Link
          to="/activities"
          className="hidden sm:inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          View All Activities &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarActivities.map((act: ActivityResponse) => {
          const primaryCountry = act.countries?.[0];
          const countrySlug = primaryCountry?.slug || 'explore';

          return (
            <Link
              key={act.id}
              to={`/activities/${countrySlug}/${act.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-100">
                <img
                  src={
                    act.image_id
                      ? getImageUrlWithFallback(act.image_id, IMAGE_VARIANTS.MEDIUM)
                      : act.image_url || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={act.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {primaryCountry && (
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full flex items-center shadow-xs">
                    <MapPin className="w-3 h-3 mr-1 text-primary" />
                    {primaryCountry.name}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {act.name}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {act.summary || act.description?.replace(/<[^>]*>/g, '').slice(0, 100) || 'Exciting activity and tour experience.'}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-primary font-semibold">
                  <span className="flex items-center">
                    <Compass className="w-3.5 h-3.5 mr-1" />
                    Explore Excursion
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

export default SimilarActivities;
