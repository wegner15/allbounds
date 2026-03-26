import React from 'react';
import { useHotels } from '../../../lib/hooks/useHotels';
import PaginatedGrid from '../components/PaginatedGrid';
import HotelCard from '../components/HotelCard';
import { Link } from 'react-router-dom';

interface HotelsTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
    title?: string;
}

const HotelsTab: React.FC<HotelsTabProps> = ({ countryId, preview = false, destinationSlug, title }) => {
    // Client-side filtering as useHotels fetches all
    const { data: hotels, isLoading, error } = useHotels();

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
        return <div className="text-red-500 py-8">Failed to load hotels.</div>;
    }

    const countryHotels = hotels?.filter(hotel => hotel.country_id === countryId && hotel.is_active) || [];

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{title || "Stay at the Best Hotels"}</h2>
            <PaginatedGrid
                items={countryHotels}
                renderItem={(hotel) => <HotelCard hotel={hotel as any} />}
                emptyMessage="No hotels listed for this destination yet."
                itemsPerPage={preview ? 3 : 9}
                showPagination={true}
                loadMoreLabel={preview ? "Load More Hotels" : "Load More"}
            />
        </div>
    );
};

export default HotelsTab;
