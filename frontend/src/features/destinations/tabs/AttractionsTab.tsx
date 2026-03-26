import React from 'react';
import { useAttractions } from '../../../lib/hooks/useAttractions';
import PaginatedGrid from '../components/PaginatedGrid';
import AttractionCard from '../components/AttractionCard';
import { Link } from 'react-router-dom';

interface AttractionsTabProps {
    countryName: string;
    preview?: boolean;
    destinationSlug?: string;
    title?: string;
}

const AttractionsTab: React.FC<AttractionsTabProps> = ({ countryName, preview = false, destinationSlug, title }) => {
    const { data: attractions, isLoading, error } = useAttractions({ country: countryName });

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
        return <div className="text-red-500 py-8">Failed to load attractions.</div>;
    }

    const activeAttractions = attractions?.filter(attr => attr.is_active) || []; // Assuming API handles country filter, but safety filter for active.

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{title || "Must-See Attractions"}</h2>
            <PaginatedGrid
                items={activeAttractions}
                renderItem={(attr) => <AttractionCard attraction={attr as any} />}
                emptyMessage="No attractions listed for this destination yet."
                itemsPerPage={preview ? 3 : 9}
                showPagination={!preview}
            />

            {preview && activeAttractions.length > 3 && destinationSlug && (
                <div className="mt-12 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/attractions`}
                        className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 uppercase tracking-wider text-sm"
                    >
                        See All Attractions
                    </Link>
                </div>
            )}
        </div>
    );
};

export default AttractionsTab;
