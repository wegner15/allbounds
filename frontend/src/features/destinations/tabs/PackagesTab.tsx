import React from 'react';
import { usePackages } from '../../../lib/hooks/usePackages';
import PaginatedGrid from '../components/PaginatedGrid';
import PackageCard from '../components/PackageCard';

interface PackagesTabProps {
    countryId: number;
}

const PackagesTab: React.FC<PackagesTabProps> = ({ countryId }) => {
    const { data: packages, isLoading, error } = usePackages({ country_id: countryId });

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
        return <div className="text-red-500 py-8">Failed to load packages.</div>;
    }

    const activePackages = packages?.filter(pkg => pkg.is_active) || [];

    return (
        <div className="py-6">
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Explore our Packages</h2>
            <PaginatedGrid
                items={activePackages}
                renderItem={(pkg) => <PackageCard package={pkg} />}
                emptyMessage="No packages available for this destination yet."
            />
        </div>
    );
};

export default PackagesTab;
