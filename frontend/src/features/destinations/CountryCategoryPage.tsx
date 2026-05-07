import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCountryDetails } from '../../lib/hooks/useCountries';
import SeoHead from '../../components/seo/SeoHead';
import { CountryDetailSkeleton } from './components/CountryDetailSkeleton';
import { NotFoundError, NetworkError, DestinationErrorDisplay } from './components/DestinationErrorDisplay';
import DestinationHeroSection from './components/DestinationHeroSection';
import Breadcrumb from './components/Breadcrumb';

// Tabs (Full List components)
import PackagesTab from './tabs/PackagesTab';
import GroupTripsTab from './tabs/GroupTripsTab';
import AttractionsTab from './tabs/AttractionsTab';
import HotelsTab from './tabs/HotelsTab';
import ActivitiesTab from './tabs/ActivitiesTab';

type CategoryType = 'packages' | 'group-trips' | 'attractions' | 'hotels' | 'activities';

const CountryCategoryPage: React.FC = () => {
    const { slug, category } = useParams<{ slug: string; category: CategoryType }>();
    const { data: country, isLoading, error, refetch } = useCountryDetails(slug || '');

    if (isLoading) {
        return (
            <>
                <SeoHead
                    title="Loading Destination Category"
                    canonicalPath={`/destinations/${slug || ''}/${category || 'overview'}`}
                />
                <CountryDetailSkeleton />
            </>
        );
    }

    if (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('404')) {
            return (
                <>
                    <SeoHead
                        title="Destination Category Not Found"
                        canonicalPath={`/destinations/${slug || ''}/${category || 'overview'}`}
                        noIndex={true}
                    />
                    <NotFoundError destinationSlug={slug} onRetry={refetch} />
                </>
            );
        }
        if (errorMessage.includes('network')) {
            return (
                <>
                    <SeoHead
                        title="Destination Category Error"
                        canonicalPath={`/destinations/${slug || ''}/${category || 'overview'}`}
                        noIndex={true}
                    />
                    <NetworkError onRetry={refetch} />
                </>
            );
        }
        return (
            <>
                <SeoHead
                    title="Destination Category Error"
                    canonicalPath={`/destinations/${slug || ''}/${category || 'overview'}`}
                    noIndex={true}
                />
                <DestinationErrorDisplay type="server" onRetry={refetch} />
            </>
        );
    }

    if (!country) {
        return (
            <>
                <SeoHead
                    title="Destination Category Not Found"
                    canonicalPath={`/destinations/${slug || ''}/${category || 'overview'}`}
                    noIndex={true}
                />
                <NotFoundError destinationSlug={slug} />
            </>
        );
    }

    const canonicalCategory = category || 'overview';

    const renderCategory = () => {
        switch (category) {
            case 'packages': return <PackagesTab countryId={country.id} preview={false} />;
            case 'group-trips': return <GroupTripsTab countryId={country.id} preview={false} />;
            case 'attractions': return <AttractionsTab countryName={country.name} preview={false} />;
            case 'hotels': return <HotelsTab countryId={country.id} preview={false} />;
            case 'activities': return <ActivitiesTab countryId={country.id} preview={false} />;
            default: return <div>Category not found.</div>;
        }
    };

    const getCategoryLabel = () => {
        switch (category) {
            case 'packages': return 'Travel Packages';
            case 'group-trips': return 'Group Trips';
            case 'attractions': return 'Attractions';
            case 'hotels': return 'Hotels';
            case 'activities': return 'Activities';
            default: return 'Category';
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <SeoHead
                title={`${getCategoryLabel()} in ${country.name}`}
                canonicalPath={`/destinations/${country.slug}/${canonicalCategory}`}
            />

            <Breadcrumb
                items={[
                    { label: 'Destinations', href: '/destinations' },
                    { label: country.name, href: `/destinations/${country.slug}` }
                ]}
                currentPage={getCategoryLabel()}
            />

            <DestinationHeroSection country={country} />

            <main className="container mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link
                        to={`/destinations/${country.slug}`}
                        className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                    >
                        <span>&larr;</span> Back to {country.name} Overview
                    </Link>
                </div>

                {renderCategory()}
            </main>
        </div>
    );
};

export default CountryCategoryPage;
