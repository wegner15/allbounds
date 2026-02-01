import React from 'react';
import { Link } from 'react-router-dom';
import type { Activity } from '../../../lib/types/api';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = React.memo(({ activity }) => {
  // Use image_id which backend now populates with the resolved URL
  const imageId = (activity as any).image_id;

  return (
    <article className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      <Link
        to={`/activities/${activity.slug}`}
        className="block min-h-[44px]"
        aria-label={`View details for ${activity.name} activity`}
      >
        {/* Image with Overlay */}
        <div className="relative h-64 overflow-hidden bg-gray-200">
          {imageId ? (
            <OptimizedImage
              imageId={imageId}
              alt={`${activity.name} activity`}
              variant="medium"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('card')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center" role="img" aria-label="Default activity image">
              <span className="text-white text-6xl font-bold opacity-20" aria-hidden="true">
                {activity.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden="true" />

          {/* Content Overlay */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {activity.name}
            </h3>

            {activity.summary && (
              <p className="text-sm text-white/90 line-clamp-2 mb-3">
                {activity.summary}
              </p>
            )}

            {/* Quick View Badge - appears on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true">
              <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                View Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
});

ActivityCard.displayName = 'ActivityCard';

export default ActivityCard;
