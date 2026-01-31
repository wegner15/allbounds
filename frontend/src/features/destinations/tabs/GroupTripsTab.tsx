import React from 'react';
import { useGroupTrips } from '../../../lib/hooks/useGroupTrips';
import PaginatedGrid from '../components/PaginatedGrid';
import GroupTripCard from '../components/GroupTripCard';
import { Link } from 'react-router-dom';

interface GroupTripsTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
}

const GroupTripsTab: React.FC<GroupTripsTabProps> = ({ countryId, preview = false, destinationSlug }) => {
    const { data: groupTrips, isLoading, error } = useGroupTrips({ country_id: countryId });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 py-8">Failed to load group trips.</div>;
    }

    const activeTrips = groupTrips?.filter(trip => trip.is_active) || [];

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Join our Group Trips</h2>
            <PaginatedGrid
                items={preview ? activeTrips.slice(0, 8) : activeTrips}
                renderItem={(trip) => <GroupTripCard groupTrip={trip as any} />}
                emptyMessage="No group trips scheduled for this destination yet."
                itemsPerPage={preview ? 8 : 9}
                showPagination={!preview}
            />

            {preview && activeTrips.length > 8 && destinationSlug && (
                <div className="mt-8 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/group-trips`}
                        className="inline-flex items-center px-6 py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-600 hover:text-white transition-colors duration-200"
                    >
                        READ MORE GROUP TRIPS
                    </Link>
                </div>
            )}
        </div>
    );
};

export default GroupTripsTab;
