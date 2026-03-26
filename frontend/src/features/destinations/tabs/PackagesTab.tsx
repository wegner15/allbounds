import React from 'react';
import { usePackages } from '../../../lib/hooks/usePackages';
import PaginatedGrid from '../components/PaginatedGrid';
import PackageCard from '../components/PackageCard';
import { Link } from 'react-router-dom';

interface PackagesTabProps {
    countryId: number;
    preview?: boolean;
    destinationSlug?: string;
    isDealsOnly?: boolean;
    title?: string;
}

const PackagesTab: React.FC<PackagesTabProps> = ({
    countryId,
    preview = false,
    destinationSlug,
    isDealsOnly = false,
    title
}) => {
    const { data: packages, isLoading, error } = usePackages({ country_id: countryId });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[...Array(preview ? 3 : 6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 py-8">Failed to load packages.</div>;
    }

    let displayPackages = packages?.filter(pkg => pkg.is_active) || [];

    if (isDealsOnly) {
        displayPackages = displayPackages.filter(pkg => pkg.is_deal);
    }

    if (isDealsOnly && displayPackages.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{title || "Hot Deals"}</h2>
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                    <p className="text-gray-600 text-lg">There are currently no special deals available for this destination.</p>
                    <p className="text-gray-500 mt-2">Check back later or browse our regular packages below.</p>
                </div>
            </div>
        );
    }

    const sectionTitle = title || (isDealsOnly ? "Hot Deals" : "Explore our Packages");

    return (
        <div>{/* removed py-6 since sections handle spacing */}
            <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">{sectionTitle}</h2>
            <PaginatedGrid
                items={displayPackages}
                renderItem={(pkg: any) => <PackageCard package={pkg} />}
                emptyMessage="No packages available for this destination yet."
                itemsPerPage={preview ? 9 : 9}
                showPagination={!preview}
            />

            {preview && displayPackages.length > 9 && destinationSlug && (
                <div className="mt-12 text-center">
                    <Link
                        to={isDealsOnly ? `/destinations/${destinationSlug}/deals` : `/destinations/${destinationSlug}/packages`}
                        className="inline-flex items-center px-8 py-4 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 uppercase tracking-wider text-sm"
                    >
                        {isDealsOnly ? "See All Deals" : "See All Packages"}
                    </Link>
                </div>
            )}
        </div>
    );
};

export default PackagesTab;
