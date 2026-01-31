import React from 'react';
import { usePackages } from '../../../lib/hooks/usePackages';
import PaginatedGrid from '../components/PaginatedGrid';
import PackageCard from '../components/PackageCard';
import { Link } from 'react-router-dom';

interface PackagesTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
}

const PackagesTab: React.FC<PackagesTabProps> = ({ countryId, preview = false, destinationSlug }) => {
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
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Explore our Packages</h2>
            <PaginatedGrid
                items={preview ? activePackages.slice(0, 8) : activePackages}
                renderItem={(pkg) => <PackageCard package={pkg} />}
                emptyMessage="No packages available for this destination yet."
                itemsPerPage={preview ? 8 : 9}
                showPagination={!preview}
            />

            {preview && activePackages.length > 8 && destinationSlug && (
                <div className="mt-8 text-center">
                    <Link
                        to={`/destinations/${destinationSlug}/packages`}
                        className="inline-flex items-center px-6 py-3 border border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-600 hover:text-white transition-colors duration-200"
                    >
                        READ MORE PACKAGES
                    </Link>
                </div>
            )}
        </div>
    );
};

export default PackagesTab;
