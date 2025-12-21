import React from 'react';
import { useAttractions } from '../../../lib/hooks/useAttractions';
import PaginatedGrid from '../components/PaginatedGrid';
import AttractionCard from '../components/AttractionCard';

interface AttractionsTabProps {
    countryName: string; // useAttractions uses country name string currently
}

const AttractionsTab: React.FC<AttractionsTabProps> = ({ countryName }) => {
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
        <div className="py-6">
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Must-See Attractions</h2>
            <PaginatedGrid
                items={activeAttractions}
                renderItem={(attr) => <AttractionCard attraction={attr as any} />}
                emptyMessage="No attractions listed for this destination yet."
            />
        </div>
    );
};

export default AttractionsTab;
