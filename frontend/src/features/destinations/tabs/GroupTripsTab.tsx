import React from 'react';
import { useGroupTrips } from '../../../lib/hooks/useGroupTrips';
import PaginatedGrid from '../components/PaginatedGrid';
import GroupTripCard from '../components/GroupTripCard';
import { Link } from 'react-router-dom';

interface GroupTripsTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
    title?: string;
}

const GroupTripsTab: React.FC<GroupTripsTabProps> = ({ countryId, preview = false, destinationSlug, title }) => {
    const { data: groupTrips, isLoading, error } = useGroupTrips({ country_id: countryId });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-pulse">
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
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{title || "Join our Group Trips"}</h2>
            <PaginatedGrid
                items={activeTrips}
                renderItem={(trip) => <GroupTripCard groupTrip={trip as any} />}
                emptyMessage="No group trips scheduled for this destination yet."
                itemsPerPage={preview ? 9 : 9}
                showPagination={!preview}
            />

            {preview && activeTrips.length > 9 && destinationSlug && (
                <div className="mt-12 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/group-trips`}
                        className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 uppercase tracking-wider text-sm"
                    >
                        See All Group Trips
                    </Link>
                </div>
            )}
        </div>
    );
};

export default GroupTripsTab;
