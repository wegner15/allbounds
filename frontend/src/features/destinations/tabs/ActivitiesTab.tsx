import React from 'react';
import { useActivities } from '../../../lib/hooks/useActivities';
import PaginatedGrid from '../components/PaginatedGrid';
import ActivityCard from '../components/ActivityCard';
import { Link } from 'react-router-dom';

interface ActivitiesTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
    title?: string;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ countryId, preview = false, destinationSlug, title }) => {
    const { data: activities, isLoading, error } = useActivities(countryId);

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

    const activeActivities = activities?.filter((act: any) => act.is_active) || [];

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{title || "Exciting Activities"}</h2>
            <PaginatedGrid
                items={activeActivities}
                renderItem={(act: any) => <ActivityCard activity={act} />}
                emptyMessage="No activities listed for this destination yet."
                itemsPerPage={preview ? 4 : 9}
                showPagination={!preview}
            />

            {preview && activeActivities.length > 4 && destinationSlug && (
                <div className="mt-12 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/activities`}
                        className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 uppercase tracking-wider text-sm"
                    >
                        See All Activities
                    </Link>
                </div>
            )}
        </div>
    );
};

export default ActivitiesTab;
