import React, { lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Hooks
import { useCountryDetails } from '../../lib/hooks/useCountries';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

// Components - Eagerly loaded (above the fold)
import { CountryDetailSkeleton } from './components/CountryDetailSkeleton';
import { DestinationErrorDisplay, NotFoundError, NetworkError } from './components/DestinationErrorDisplay';
import { DestinationErrorBoundary } from './components/DestinationErrorBoundary';
import Breadcrumb from './components/Breadcrumb';
import DestinationHeroSection from './components/DestinationHeroSection';
import CTABanner from './components/CTABanner';
import DestinationOverviewSection from './components/DestinationOverviewSection';
import BestTimeToVisitSection from './components/BestTimeToVisitSection';

// Lazy loaded components (below the fold) - Code splitting for better initial load
const InteractiveMapSection = lazy(() => import('./components/InteractiveMapSection'));
const PackagesSection = lazy(() => import('./components/PackagesSection'));
const GroupTripsSection = lazy(() => import('./components/GroupTripsSection'));
const AttractionsSection = lazy(() => import('./components/AttractionsSection'));
const HotelsSection = lazy(() => import('./components/HotelsSection'));
const ActivitiesSection = lazy(() => import('./components/ActivitiesSection'));
const SocialSharingCard = lazy(() => import('./components/SocialSharingCard'));
const RelatedDestinationsSection = lazy(() => import('./components/RelatedDestinationsSection'));

// Section Navigation Component
import SectionNavigation from '../../components/ui/SectionNavigation';

// Tab Components
import AboutTab from './tabs/AboutTab';
import PackagesTab from './tabs/PackagesTab';
import GroupTripsTab from './tabs/GroupTripsTab';
import AttractionsTab from './tabs/AttractionsTab';
import HotelsTab from './tabs/HotelsTab';
import ActivitiesTab from './tabs/ActivitiesTab';

// Loading fallback component for lazy loaded sections
const SectionLoader: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

const CountryDetailPageNew: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch country details with all related data using custom hook
  // Retry logic (2 retries) is configured in the useCountryDetails hook
  const {
    data: country,
    isLoading,
    error,
    refetch
  } = useCountryDetails(slug || '');

  // Loading state
  if (isLoading) {
    return <CountryDetailSkeleton />;
  }

  // Error states
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for 404 error
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return (
        <NotFoundError
          destinationSlug={slug}
          onRetry={() => refetch()}
        />
      );
    }

    // Check for network error
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      return (
        <NetworkError
          onRetry={() => refetch()}
        />
      );
    }

    // Generic error
    return (
      <DestinationErrorDisplay
        type="server"
        title="Error Loading Destination"
        message="We encountered an error while loading this destination. Please try again later."
        onRetry={() => refetch()}
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // No data state
  if (!country) {
    return (
      <NotFoundError
        destinationSlug={slug}
      />
    );
  }

  // Prepare SEO data
  const pageTitle = `${country.name} | AllBounds Vacations`;
  const pageDescription = country.description
    ? country.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `Discover ${country.name} with AllBounds Vacations. Explore packages, group trips, attractions, and hotels.`;
  const pageImage = country.image_id
    ? getImageUrlWithFallback(country.image_id, IMAGE_VARIANTS.LARGE)
    : undefined;

  // Prepare breadcrumb items
  const breadcrumbItems = [
    { label: 'Destinations', href: '/destinations' }
  ];

  // Add region to breadcrumb if available
  if (country.region) {
    breadcrumbItems.push({
      label: country.region.name,
      href: `/regions/${country.region.slug}`
    });
  }

  return (
    <DestinationErrorBoundary>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {pageImage && <meta property="og:image" content={pageImage} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {pageImage && <meta name="twitter:image" content={pageImage} />}

        {/* Canonical URL */}
        <link rel="canonical" href={`${window.location.origin}/destinations/${country.slug}`} />
      </Helmet>

      {/* Skip to Content Link for Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={breadcrumbItems}
        currentPage={country.name}
      />

      {/* Hero Section */}
      <DestinationHeroSection country={country} />

      {/* Main Content Area - Scrollable Sections */}
      <main id="main-content" className="bg-gray-50 flex-grow">
        {/* Section Navigation */}
        <SectionNavigation
          sections={[
            { id: 'about', label: `About ${country.name}` },
            { id: 'packages', label: 'Travel Packages' },
            { id: 'group-trips', label: 'Group Trips' },
            { id: 'attractions', label: 'Attractions' },
            { id: 'hotels', label: 'Hotels' },
            { id: 'activities', label: 'Activities' },
            { id: 'deals', label: 'Deals' },
            { id: 'blog', label: 'Blog' },
          ]}
        />

        <div className="container mx-auto px-4 py-8">
          {/* About Section */}
          <section id="about" className="scroll-mt-24 mb-12">
            <AboutTab
              country={country}
              pageDescription={pageDescription}
              pageImage={pageImage}
            />
          </section>

          {/* Packages Section */}
          <section id="packages" className="scroll-mt-24 mb-12">
            <PackagesTab countryId={country.id} preview={true} destinationSlug={country.slug} />
          </section>

          {/* Group Trips Section */}
          <section id="group-trips" className="scroll-mt-24 mb-12">
            <GroupTripsTab countryId={country.id} preview={true} destinationSlug={country.slug} />
          </section>

          {/* Attractions Section */}
          <section id="attractions" className="scroll-mt-24 mb-12">
            <AttractionsTab countryName={country.name} preview={true} destinationSlug={country.slug} />
          </section>

          {/* Hotels Section */}
          <section id="hotels" className="scroll-mt-24 mb-12">
            <HotelsTab countryId={country.id} preview={true} destinationSlug={country.slug} />
          </section>

          {/* Activities Section */}
          <section id="activities" className="scroll-mt-24 mb-12">
            <ActivitiesTab countryId={country.id} preview={true} destinationSlug={country.slug} />
          </section>

          {/* Hot Deals Section */}
          <section id="deals" className="scroll-mt-24 mb-12">
            <PackagesTab
              countryId={country.id}
              preview={true}
              destinationSlug={country.slug}
              isDealsOnly={true}
              title="Deals"
            />
          </section>

          {/* Blog Section */}
          <section id="blog" className="scroll-mt-24 mb-12">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Latest from our Blog</h2>
              <div className="text-gray-600">Coming soon... Discover travel stories and tips for {country.name}.</div>
            </div>
          </section>

          {/* CTA Banner - Moved to bottom */}
          <div className="mb-12">
            <CTABanner
              countrySlug={country.slug}
              countryName={country.name}
            />
          </div>

          {/* Share Destination */}
          <section className="mb-16 max-w-2xl mx-auto">
            <Suspense fallback={<div className="h-40 bg-gray-100 rounded-lg animate-pulse" />}>
              <SocialSharingCard
                countryName={country.name}
                description={pageDescription}
                imageUrl={pageImage}
              />
            </Suspense>
          </section>

          {/* Related Destinations Section */}
          <section className="mt-16">
            <Suspense fallback={<SectionLoader />}>
              <RelatedDestinationsSection country={country} />
            </Suspense>
          </section>
        </div>
      </main>
    </DestinationErrorBoundary>
  );
};

export default CountryDetailPageNew;
