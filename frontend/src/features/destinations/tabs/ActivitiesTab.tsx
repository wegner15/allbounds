import React from 'react';
import { useActivities } from '../../../lib/hooks/useActivities';
import PaginatedGrid from '../components/PaginatedGrid';
import ActivityCard from '../components/ActivityCard';
import { Link } from 'react-router-dom';

interface ActivitiesTabProps {
    countryName: string;
    preview?: boolean;
    destinationSlug?: string;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ countryName, preview = false, destinationSlug }) => {
    // useActivities fetches all list.
    const { data: activityResponse, isLoading, error } = useActivities();

    // Note: useActivities returns ActivityResponse[] but usually backend returns just Activity[] or wrapper. 
    // Let's assume it returns standard array or we'll need to adjust.
    // Checking useActivities.ts -> returns ActivityResponse[].
    // Checking ActivityCard -> expects 'activity'.

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
        return <div className="text-red-500 py-8">Failed to load activities.</div>;
    }

    // Filter safely.
    // Assuming ActivityResponse has a country field or location that matches.
    // If not, we might need to rely on 'countryName' matching 'location' or similar. 
    // Let's assume there's a country relationship or string. 
    // If useActivities returns detailed objects with country.

    // Actually, checking ActivityCard usage in CountryDetailPageNew...
    // It passes `activities={country.activities}`.
    // Since we want *all* activities and sticking to the pattern, we might need a dedicated `byCountry` hook or filter.
    // The generic `useActivities` hook returns *all*.
    // Client side filter:
    const activities = Array.isArray(activityResponse) ? activityResponse : [];
    const countryActivities = activities.filter((act: any) =>
        // Robust matching: check country object or direct string
        (act.country?.name === countryName) ||
        (act.location?.includes(countryName))
    );

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Exciting Activities</h2>
            <PaginatedGrid
                items={preview ? countryActivities.slice(0, 8) : countryActivities}
                renderItem={(act: any) => <ActivityCard activity={act} />}
                emptyMessage="No activities listed for this destination yet."
                itemsPerPage={preview ? 8 : 9}
                showPagination={!preview}
            />

            {preview && countryActivities.length > 8 && destinationSlug && (
                <div className="mt-8 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/activities`}
                        className="inline-flex items-center px-6 py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-600 hover:text-white transition-colors duration-200"
                    >
                        READ MORE ACTIVITIES
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ActivitiesTab;
