import React from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Clock, MapPin, Users, Calendar, AlertCircle } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { GroupTripWithDepartures } from '../../../lib/types/api';

interface GroupTripCardProps {
  groupTrip: GroupTripWithDepartures;
}

const GroupTripCard: React.FC<GroupTripCardProps> = React.memo(({ groupTrip }) => {
  // Sanitize and truncate description
  const sanitizedDescription = groupTrip.description 
    ? DOMPurify.sanitize(groupTrip.description)
    : '';

  // Get next departure
  const nextDeparture = groupTrip.departures
    .filter(d => d.is_active && new Date(d.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

  // Check if fully booked
  const isFullyBooked = nextDeparture && nextDeparture.available_spots === 0;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <article className="group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full">
      <Link
        to={`/group-trips/${groupTrip.slug}`}
        className="flex flex-col h-full min-h-[44px]"
        aria-label={`View details for ${groupTrip.name} group trip`}
      >
        {/* Image */}
        <div className="relative w-full h-40 sm:h-48 md:h-52 overflow-hidden bg-gray-200">
          {groupTrip.image_id ? (
            <OptimizedImage
              imageId={groupTrip.image_id}
              alt={`${groupTrip.name} group trip`}
              variant="medium"
              className="w-full h-full transition-transform duration-300 group-hover:scale-110"
              objectFit="cover"
              loading="lazy"
              sizes={getResponsiveImageSizes('card')}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-400 to-primary flex items-center justify-center" role="img" aria-label="Default group trip image">
              <Users className="w-12 h-12 text-white opacity-50" aria-hidden="true" />
            </div>
          )}
          
          {/* Fully Booked Badge */}
          {isFullyBooked && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md flex items-center space-x-1" role="status" aria-label="Fully booked">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              <span>Fully Booked</span>
            </div>
          )}

          {/* Available Spots Badge */}
          {nextDeparture && !isFullyBooked && nextDeparture.available_spots <= 5 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md" role="status" aria-label={`Only ${nextDeparture.available_spots} spots remaining`}>
              Only {nextDeparture.available_spots} spots left
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Group Trip Name - H3 for proper heading hierarchy */}
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
          {groupTrip.name}
        </h3>

        {/* Description */}
        {sanitizedDescription && (
          <div
            className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        )}

        {/* Next Departure Info */}
        {nextDeparture && (
          <div className="mb-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
            <div className="flex items-center text-sm text-teal-800 font-medium mb-2">
              <Calendar className="w-4 h-4 mr-2 text-teal-600" />
              <span>Next Departure</span>
            </div>
            <div className="text-sm text-gray-700 font-semibold">
              {formatDate(nextDeparture.start_date)}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
              <div className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                <span>{nextDeparture.available_spots} spots available</span>
              </div>
              {groupTrip.max_participants && (
                <span className="text-gray-500">
                  Max: {groupTrip.max_participants}
                </span>
              )}
            </div>
          </div>
        )}

        {/* No Upcoming Departures */}
        {!nextDeparture && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>No upcoming departures</span>
            </div>
          </div>
        )}

        {/* Footer - Duration and Price */}
        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center text-xs md:text-sm text-gray-600">
            <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 text-gray-400 flex-shrink-0" />
            <span>{groupTrip.duration_days} {groupTrip.duration_days === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">From</div>
            <div className="text-base md:text-lg font-bold text-teal-600">
              ${(nextDeparture?.price || groupTrip.price).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Participant Limits */}
        {(groupTrip.min_participants || groupTrip.max_participants) && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            {groupTrip.min_participants && (
              <span>Min: {groupTrip.min_participants} people</span>
            )}
            {groupTrip.max_participants && (
              <span>Max: {groupTrip.max_participants} people</span>
            )}
          </div>
        )}
        </div>
      </Link>
    </article>
  );
});

GroupTripCard.displayName = 'GroupTripCard';

export default GroupTripCard;
