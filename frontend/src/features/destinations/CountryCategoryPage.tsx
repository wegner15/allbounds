import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCountryDetails } from '../../lib/hooks/useCountries';
import SeoHead from '../../components/seo/SeoHead';
import { CountryDetailSkeleton } from './components/CountryDetailSkeleton';
import { NotFoundError, NetworkError, DestinationErrorDisplay } from './components/DestinationErrorDisplay';
import DestinationHeroSection from './components/DestinationHeroSection';
import Breadcrumb from './components/Breadcrumb';
import SectionNavigation from '../../components/ui/SectionNavigation';

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
    const navigate = useNavigate();

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
            case 'hotels': return <HotelsTab countryId={country.id} preview={false} hotelsData={country.hotels} />;
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

    const getCategoryDescription = () => {
        switch (category) {
            case 'packages':
                return `Discover the ultimate handpicked travel packages and custom tours across ${country.name}. From thrilling wildlife safaris in famous national reserves to cultural expeditions, luxury beach retreats, and adventure-filled itineraries, we design journeys that suit your unique style.`;
            case 'group-trips':
                return `Join a vibrant community of explorers on our scheduled small-group departures to ${country.name}. Perfect for solo travelers, couples, or friends looking to travel together, our group tours offer an affordable, social, and expertly-guided way to discover iconic destinations.`;
            case 'attractions':
                return `Explore the must-see landmarks, historical sites, and breathtaking natural wonders of ${country.name}. Plan your sightseeing checklist with our detailed guides on national parks, volcanic calderas, scenic vistas, and UNESCO World Heritage sites.`;
            case 'hotels':
                return `Find the best boutique lodges, luxury safari camps, eco-resorts, and city hotels in ${country.name}. Whether you are looking for an ultra-luxury tented suite with wilderness views or a cozy budget-friendly guest house, explore our premium options.`;
            case 'activities':
                return `Get active and dive into unique experiences across ${country.name}. Browse cultural walks, chimpanzee and gorilla trekking permits, hiking, white-water rafting, hot air balloon flights, and authentic culinary sessions.`;
            default:
                return `Explore all tourist categories, guides, accommodations, and packages for ${country.name}.`;
        }
    };

    const subNavSections = [
        { id: 'overview', label: 'Overview' },
        { id: 'activities', label: 'Experiences' },
        { id: 'packages', label: 'Featured Packages' },
        { id: 'hotels', label: 'Where to Stay' },
        { id: 'attractions', label: 'Must-See Attractions' },
        { id: 'group-trips', label: 'Group Trips' },
    ];

    const handleSubNavClick = (sectionId: string) => {
        if (sectionId === 'overview') {
            navigate(`/destinations/${country.slug}`);
        } else {
            navigate(`/destinations/${country.slug}/${sectionId}`);
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

            {/* Sub-Navigation Menu */}
            <SectionNavigation
                sections={subNavSections}
                activeSectionId={category}
                onSectionClick={handleSubNavClick}
            />

            <main className="container mx-auto px-4 py-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to={`/destinations/${country.slug}`}
                        className="text-primary-dark hover:text-primary font-semibold flex items-center gap-1.5 transition-colors duration-200 text-sm md:text-base"
                    >
                        <span>&larr;</span> Back to {country.name} Overview
                    </Link>
                </div>

                {/* SEO Category Intro Block */}
                <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 mb-8 shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair mb-3">
                        {getCategoryLabel()} in {country.name}
                    </h1>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-4xl">
                        {getCategoryDescription()}
                    </p>
                </div>

                {renderCategory()}
            </main>
        </div>
    );
};

export default CountryCategoryPage;
