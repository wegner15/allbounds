import React, { lazy, Suspense, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SeoHead from '../../components/seo/SeoHead';
import { buildCountryGraph } from '../../lib/schema-builders';

// Hooks
import { useCountryDetails } from '../../lib/hooks/useCountries';
import { usePaginatedBlogs } from '../../lib/hooks/useBlogs';

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

  // Fetch country-related blog posts (when country name is loaded)
  const { data: relatedBlogsData } = usePaginatedBlogs(
    country?.name ? { search: country.name, limit: 3 } : undefined
  );
  const countryBlogs = country?.name ? (relatedBlogsData?.items || []) : [];

  // Automatically scroll to target section on initial page load or reload if URL contains a hash fragment
  // Unconditional hook call before early returns prevents React Rule of Hooks violations (Minified Error #310)
  React.useEffect(() => {
    if (!isLoading && country) {
      const rawHash = window.location.hash.replace('#', '');
      if (rawHash) {
        const targetId =
          rawHash === 'attractions' ? 'section-attractions' :
          rawHash === 'activities' ? 'section-activities' :
          rawHash === 'packages' ? 'section-packages' :
          rawHash === 'hotels' || rawHash === 'accommodation' ? 'section-hotels' :
          rawHash === 'explore' ? 'group-trips' : rawHash;

        const timer = setTimeout(() => {
          const element = document.getElementById(targetId);
          if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          }
        }, 350);

        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, country]);

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
    { label: 'Destinations', href: '/destinations/' }
  ];

  // Add region to breadcrumb if available
  if (country.region) {
    breadcrumbItems.push({
      label: country.region.name,
      href: `/regions/${country.region.slug}/`
    });
  }

  const formattedUpdatedAt = country.updated_at
    ? new Date(country.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  const countryGraph = buildCountryGraph({
    name: country.name,
    slug: country.slug,
    description: pageDescription,
    image: pageImage,
    canonicalPath: `/destinations/${country.slug}/`,
    region: country.region
      ? { name: country.region.name, slug: country.region.slug }
      : undefined,
    attractions: (country.attractions || []).slice(0, 10).map((a: any) => ({
      name: a.name,
      slug: a.slug,
      description: a.summary || a.description,
    })),
    faqs: country.faqs,
    dateModified: country.updated_at,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations/' },
      ...(country.region
        ? [{ name: country.region.name, url: `/regions/${country.region.slug}/` }]
        : []),
      { name: country.name, url: `/destinations/${country.slug}/` },
    ],
  });

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
    // Mutate URL hash so section link is updated in browser address bar
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${sectionId}`);
    } else {
      window.location.hash = sectionId;
    }

    if (sectionId === 'explore') {
      scrollToSection('group-trips');
    } else {
      scrollToSection(sectionId);
    }
  };



  return (
    <DestinationErrorBoundary>
      <SeoHead
        title={country.name}
        description={pageDescription}
        canonicalPath={`/destinations/${country.slug}/`}
        image={pageImage}
        type="article"
        keywords={[
          country.name,
          country.region?.name,
          'destination', 'travel', 'vacation', 'tour',
        ].filter(Boolean) as string[]}
        structuredData={countryGraph}
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
      <div id="main-content" className="bg-gray-50 flex-grow">
        {/* Section Navigation */}
        <SectionNavigation
          sections={[
            { id: 'overview', label: 'Overview' },
            { id: 'why-visit', label: `Why Visit ${country.name}` },
            { id: 'best-time', label: 'Best Time to Visit' },
            { id: 'section-attractions', label: 'Attractions' },
            { id: 'section-activities', label: 'Activities' },
            { id: 'section-packages', label: 'Tour Packages' },
            { id: 'section-hotel-packages', label: 'Hotel Packages' },
            { id: 'section-hotels', label: 'Accommodation' },
            { id: 'explore', label: 'Explore' },
          ]}
          onSectionClick={handleSubNavClick}
        />

        <div className="fluid-container py-8">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-24 mb-20">
            {formattedUpdatedAt && (
              <p className="text-xs text-gray-500 mb-3 text-right">
                Last updated:{' '}
                <time dateTime={country.updated_at}>{formattedUpdatedAt}</time>
              </p>
            )}
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

        <div className="fluid-container pb-12">
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

          {/* Related Blog Posts (only rendered when matching articles exist) */}
          {countryBlogs.length > 0 && (
            <section id="blog" className="scroll-mt-24 mb-20">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-playfair font-bold text-gray-900">
                    {country.name} Travel Stories &amp; Guides
                  </h2>
                  <Link
                    to="/blog/"
                    className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                  >
                    View all articles &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {countryBlogs.map((post) => (
                    <article
                      key={post.id}
                      className="group border border-gray-200/80 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                    >
                      {post.cover_image_id && (
                        <Link to={`/blog/${post.slug}/`} className="block h-44 overflow-hidden bg-gray-100">
                          <img
                            src={getImageUrlWithFallback(post.cover_image_id, IMAGE_VARIANTS.MEDIUM)}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      )}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-lg font-playfair font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
                          <Link to={`/blog/${post.slug}/`}>{post.title}</Link>
                        </h3>
                        {post.summary && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-grow">
                            {post.summary.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                        <Link
                          to={`/blog/${post.slug}/`}
                          className="text-sm font-semibold text-primary hover:text-primary-dark mt-auto"
                        >
                          Read guide &rarr;
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
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
      </div>
    </DestinationErrorBoundary>
  );
};

export default CountryDetailPageNew;
