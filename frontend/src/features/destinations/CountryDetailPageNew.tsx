import React, { lazy, Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';

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
import WhyVisitSection from './components/WhyVisitSection';
import BestTimeToVisitSection from './components/BestTimeToVisitSection';
import DestinationFAQ from './components/DestinationFAQ';

// Lazy loaded components (below the fold) - Code splitting for better initial load
const InteractiveMapSection = lazy(() => import('./components/InteractiveMapSection'));
const SocialSharingCard = lazy(() => import('./components/SocialSharingCard'));
const RelatedDestinationsSection = lazy(() => import('./components/RelatedDestinationsSection'));

// Section Navigation Component
import SectionNavigation from '../../components/ui/SectionNavigation';

// New consolidated components
import DestinationExplorer from './components/DestinationExplorer';
import TravelGuideSection from './components/TravelGuideSection';

// Tab Components
import GroupTripsTab from './tabs/GroupTripsTab';

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
  const [explorerTab, setExplorerTab] = useState<string>('all');

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
    return (
      <>
        <SeoHead
          title="Loading Destination"
          canonicalPath={`/destinations/${slug || ''}`}
        />
        <CountryDetailSkeleton />
      </>
    );
  }

  // Error states
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for 404 error
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return (
        <>
          <SeoHead
            title="Destination Not Found"
            canonicalPath={`/destinations/${slug || ''}`}
            noIndex={true}
          />
          <NotFoundError
            destinationSlug={slug}
            onRetry={() => refetch()}
          />
        </>
      );
    }

    // Check for network error
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
      return (
        <>
          <SeoHead
            title="Destination Loading Error"
            canonicalPath={`/destinations/${slug || ''}`}
            noIndex={true}
          />
          <NetworkError
            onRetry={() => refetch()}
          />
        </>
      );
    }

    // Generic error
    return (
      <>
        <SeoHead
          title="Error Loading Destination"
          canonicalPath={`/destinations/${slug || ''}`}
          noIndex={true}
        />
        <DestinationErrorDisplay
          type="server"
          title="Error Loading Destination"
          message="We encountered an error while loading this destination. Please try again later."
          onRetry={() => refetch()}
          showBackButton={true}
          showHomeButton={true}
        />
      </>
    );
  }

  // No data state
  if (!country) {
    return (
      <>
        <SeoHead
          title="Destination Not Found"
          canonicalPath={`/destinations/${slug || ''}`}
          noIndex={true}
        />
        <NotFoundError
          destinationSlug={slug}
        />
      </>
    );
  }

  const pageDescription = country.description
    ? country.description.replace(/<[^>]*>/g, '').substring(0, 160)
    : `Discover ${country.name} with Allbound Vacations. Explore packages, group trips, attractions, and hotels.`;
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSubNavClick = (sectionId: string) => {
    if (['attractions', 'activities', 'packages', 'deals', 'hotels'].includes(sectionId)) {
      if (sectionId === 'attractions') setExplorerTab('attractions');
      else if (sectionId === 'activities') setExplorerTab('activities');
      else if (sectionId === 'packages') setExplorerTab('packages');
      else if (sectionId === 'deals') setExplorerTab('packages');
      else if (sectionId === 'hotels') setExplorerTab('hotels');
      
      // Scroll to the unified explore section
      scrollToSection('explore');
    } else {
      scrollToSection(sectionId);
    }
  };

  return (
    <DestinationErrorBoundary>
      <SeoHead
        title={country.name}
        description={pageDescription}
        canonicalPath={`/destinations/${country.slug}`}
        image={pageImage}
      />

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
            { id: 'overview', label: 'Overview' },
            { id: 'why-visit', label: `Why Visit ${country.name}` },
            { id: 'best-time', label: 'Best Time to Visit' },
            { id: 'explore', label: 'Explore' },
            { id: 'group-trips', label: 'Group Trips' },
            { id: 'travel-guide', label: 'Travel Guide' },
            { id: 'faq', label: 'FAQs & Tips' },
            { id: 'blog', label: 'Blog' },
            { id: 'share', label: 'Share' },
            { id: 'similar', label: 'Similar Destinations' },
          ]}
          onSectionClick={handleSubNavClick}
        />

        <div className="container mx-auto px-4 py-8">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-24 mb-20">
            <DestinationOverviewSection country={country} />
          </section>

          {/* Why Visit Section */}
          <section id="why-visit" className="scroll-mt-24 mb-20">
            <WhyVisitSection countryName={country.name} highlights={country.highlights} />
          </section>

          {/* Best Time to Visit Section */}
          <section id="best-time" className="scroll-mt-24 mb-20">
            <div className="space-y-6 md:space-y-8">
              <BestTimeToVisitSection visitInfo={country.visit_info} />
              
              {/* Interactive Map */}
              <Suspense fallback={<SectionLoader />}>
                <InteractiveMapSection country={country} />
              </Suspense>
            </div>
          </section>

          {/* Consolidated Destination Explorer Section */}
          <section id="explore" className="scroll-mt-24 mb-20">
            <DestinationExplorer
              countryId={country.id}
              countryName={country.name}
              destinationSlug={country.slug}
              activeTabId={explorerTab}
              onTabChange={(tab) => setExplorerTab(tab)}
            />
          </section>
        </div>

        {/* CTA Banner - Full Width */}
        <div className="py-16 md:py-20">
          <CTABanner
            countrySlug={country.slug}
            countryName={country.name}
          />
        </div>

        <div className="container mx-auto px-4 pb-12">
          {/* Group Trips Section */}
          <section id="group-trips" className="scroll-mt-24 mb-20">
            <GroupTripsTab countryId={country.id} preview={true} destinationSlug={country.slug} title={`Group Trips to ${country.name}`} />
          </section>

          {/* Travel Guide Section */}
          <section id="travel-guide" className="scroll-mt-24 mb-20">
            <TravelGuideSection countrySlug={country.slug} countryName={country.name} />
          </section>

          {/* FAQ Section */}
          <section id="faq" className="scroll-mt-24 mb-20">
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              {country.faqs && country.faqs.length > 0 ? (
                <DestinationFAQ faqs={country.faqs} />
              ) : (
                <p className="text-gray-500 text-sm">No FAQs found for this destination yet.</p>
              )}
            </div>
          </section>

          {/* Blog Section */}
          <section id="blog" className="scroll-mt-24 mb-20">
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-playfair font-bold text-gray-900 mb-6">Latest from our Blog</h2>
              <div className="text-gray-600">Coming soon... Discover travel stories and tips for {country.name}.</div>
            </div>
          </section>
        </div>

        {/* Share Destination - Full Width */}
        <section id="share" className="scroll-mt-24">
          <Suspense fallback={<div className="h-40 bg-gray-100 animate-pulse" />}>
            <SocialSharingCard
              countryName={country.name}
              description={pageDescription}
              imageUrl={pageImage}
              variant="banner"
            />
          </Suspense>
        </section>

        <div className="container mx-auto px-4">
          {/* Similar Destinations Section */}
          <section id="similar" className="scroll-mt-24 mt-20">
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
