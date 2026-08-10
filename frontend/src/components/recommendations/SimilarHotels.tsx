import { useHotels } from '../../lib/hooks/useHotels';
import HotelCard from '../../features/destinations/components/HotelCard';
import type { Hotel } from '../../lib/types/api';

interface SimilarHotelsProps {
    countryId?: number;
    currentHotelId: number;
    limit?: number;
}

const SimilarHotels: React.FC<SimilarHotelsProps> = ({ countryId, currentHotelId, limit = 4 }) => {
    const { data: hotels, isLoading, error } = useHotels(countryId);

    if (isLoading) {
        return (
            <div className="py-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Hotels</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(limit)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-96"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !hotels) {
        return null;
    }

    const similarHotels = hotels
        .filter((hotel) => hotel.id !== currentHotelId && hotel.is_active && (!countryId || hotel.country_id === countryId || hotel.country?.id === countryId))
        .slice(0, limit);

    if (similarHotels.length === 0) {
        return null;
    }

    return (
        <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Hotels You Might Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel as any} />
                ))}
            </div>
        </div>
    );
};

export default SimilarHotels;
