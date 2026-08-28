import React from 'react';
import { Link } from 'react-router-dom';
import { useSimilarGroupTrips } from '../../lib/hooks/useGroupTrips';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { Calendar, MapPin, Users } from 'lucide-react';

interface SimilarGroupTripsProps {
  groupTripId: number;
  limit?: number;
}

const SimilarGroupTrips: React.FC<SimilarGroupTripsProps> = ({ groupTripId, limit = 4 }) => {
  const { data: similarTrips, isLoading, error } = useSimilarGroupTrips(groupTripId, limit);

  if (isLoading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Group Trips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !similarTrips || similarTrips.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Group Trips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarTrips.map((trip) => (
          <Link
            key={trip.id}
            to={`/group-trips/${trip.slug}`}
            className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={
                  trip.image_id
                    ? getImageUrlWithFallback(trip.image_id, IMAGE_VARIANTS.MEDIUM)
                    : trip.image_url || '/group_trips.jpeg'
                }
                alt={trip.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-lg line-clamp-2">{trip.name}</h3>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{trip.country?.name || 'Unknown Country'}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{trip.duration_days} days</span>
                </div>
                {trip.max_participants && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Max {trip.max_participants}</span>
                  </div>
                )}
              </div>

              {trip.price && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-500">From</span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-600">${trip.price}</span>
                      <span className="text-sm text-gray-500 ml-1">per person</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarGroupTrips;
