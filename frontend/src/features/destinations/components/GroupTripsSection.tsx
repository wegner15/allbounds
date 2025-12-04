import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import GroupTripCard from './GroupTripCard';
import type { GroupTripWithDepartures } from '../../../lib/types/api';

interface GroupTripsSectionProps {
  groupTrips: GroupTripWithDepartures[];
  countrySlug: string;
  countryName: string;
}

const GroupTripsSection: React.FC<GroupTripsSectionProps> = React.memo(({ 
  groupTrips, 
  countrySlug,
  countryName 
}) => {
  // Filter active group trips and limit to 6
  const activeGroupTrips = groupTrips
    .filter(trip => trip.is_active)
    .slice(0, 6);

  // Don't render if no active group trips
  if (activeGroupTrips.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-white rounded-lg shadow-sm p-6 md:p-8"
      aria-labelledby="group-trips-section-title"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 
              id="group-trips-section-title"
              className="text-2xl md:text-3xl font-playfair font-bold text-gray-900"
            >
              Group Trips
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Join organized group adventures in {countryName}
            </p>
          </div>
        </div>

        {/* View All Link - Only show if there are more than 6 group trips */}
        {groupTrips.filter(trip => trip.is_active).length > 6 && (
          <Link
            to={`/group-trips?country=${countrySlug}`}
            className="hidden md:flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group"
            aria-label={`View all group trips for ${countryName}`}
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Group Trips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeGroupTrips.map((trip) => (
          <GroupTripCard key={trip.id} groupTrip={trip} />
        ))}
      </div>

      {/* Mobile View All Button */}
      {groupTrips.filter(trip => trip.is_active).length > 6 && (
        <div className="mt-6 md:hidden">
          <Link
            to={`/group-trips?country=${countrySlug}`}
            className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            aria-label={`View all group trips for ${countryName}`}
          >
            <span>View All Group Trips</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Group Trip Count Info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600 text-center">
          Showing {activeGroupTrips.length} of {groupTrips.filter(trip => trip.is_active).length} available group trips
        </p>
      </div>
    </section>
  );
});

GroupTripsSection.displayName = 'GroupTripsSection';

export default GroupTripsSection;
