import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useComprehensivePackageBySlug, useRecommendedPackages } from '../../lib/hooks/usePackages';
import { HeroSection, OverviewSection, ItinerarySection, InclusionsExclusionsSection, HotelsSection, AttractionsSection, GallerySection, ReviewsSection, BookingSidebar, StickyNavigation, RecommendedTours, BlogsSection, PackageBrochureModal } from '../../components/tour';
import ItineraryMapLeaflet from '../../components/tour/ItineraryMapLeaflet';
import { PackageDetailSkeleton } from '../../components/tour/LoadingSkeletons';
import ErrorDisplay from '../../components/tour/ErrorDisplay';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import PackageBookingForm from '../../components/forms/PackageBookingForm';
import InquiryForm from '../../components/forms/InquiryForm';
import Breadcrumb from '../../components/layout/Breadcrumb';
import SeasonalPricingTable from '../../components/common/SeasonalPricingTable';
import { useEntityPriceCharts } from '../../lib/hooks/usePackagePriceCharts';
import SeoHead from '../../components/seo/SeoHead';
import { buildAbsoluteUrl, SITE_NAME } from '../../lib/seo-config';
import type { HolidayTypeSummary } from '../../lib/types/api';

const PackageDetailPageNew: React.FC = () => {
  const { slug, destination } = useParams<{ slug: string; destination?: string }>();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [selectedBookingChart, setSelectedBookingChart] = useState<any | null>(null);
  const [selectedBookingHotel, setSelectedBookingHotel] = useState<any | null>(null);

  // Fetch comprehensive package details
  const { data: packageDetail, isLoading, error, refetch } = useComprehensivePackageBySlug(slug!);
  const { data: fetchedPriceCharts } = useEntityPriceCharts('package', packageDetail?.id || 0);
  const activePriceCharts = (packageDetail?.price_charts && packageDetail.price_charts.length > 0)
    ? packageDetail.price_charts
    : (fetchedPriceCharts || []);

  const handleOpenBooking = (chart?: any, hotel?: any) => {
    setSelectedBookingChart(chart || null);
    setSelectedBookingHotel(hotel || null);
    setShowBookingForm(true);
  };

  const handleOpenInquiry = (chart?: any, hotel?: any) => {
    setSelectedBookingChart(chart || null);
    setSelectedBookingHotel(hotel || null);
    setShowInquiryForm(true);
  };


  // Fetch recommended packages from the same country
  const { data: recommendedPackages } = useRecommendedPackages(
    packageDetail?.country?.id || 0,
    packageDetail?.id || 0,
    4
  );

  // Define navigation sections based on available data
  const navigationSections = useMemo(() => {
    if (!packageDetail) return [];

    const sections = [
      { id: 'overview', label: 'Overview' }
    ];

    if (packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0) {
      sections.push({ id: 'itinerary', label: 'Itinerary' });
    }

    if (packageDetail.inclusion_items?.length > 0 || packageDetail.exclusion_items?.length > 0) {
      sections.push({ id: 'inclusions', label: 'Inclusions' });
    }

    if (packageDetail.hotels && packageDetail.hotels.length > 0) {
      sections.push({ id: 'hotels', label: 'Hotels' });
    }

    if (packageDetail.attractions && packageDetail.attractions.length > 0) {
      sections.push({ id: 'attractions', label: 'Attractions' });
    }

    if (packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0) {
      sections.push({ id: 'map', label: 'Map' });
    }

    if (packageDetail.media_assets && packageDetail.media_assets.length > 0) {
      sections.push({ id: 'gallery', label: 'Gallery' });
    }

    if (packageDetail.blog_posts && packageDetail.blog_posts.length > 0) {
      sections.push({ id: 'blogs', label: 'Stories & Guides' });
    }

    // Always include Pricing section
    sections.push({ id: 'pricing', label: 'Pricing' });

    if (packageDetail.reviews && packageDetail.reviews.length > 0) {
      sections.push({ id: 'reviews', label: 'Reviews' });
    }

    return sections;
  }, [packageDetail]);

  // Loading state with comprehensive skeleton
  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Loading Package"
          canonicalPath={`/packages/${slug || ''}`}
        />
        <PackageDetailSkeleton />
      </>
    );
  }

  // Error state with detailed error handling
  if (error) {
    // Determine error type
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isNetworkError = errorMessage.toLowerCase().includes('network') ||
      errorMessage.toLowerCase().includes('fetch');
    const isNotFound = errorMessage.toLowerCase().includes('404') ||
      errorMessage.toLowerCase().includes('not found');

    return (
      <>
        <SeoHead
          title={isNotFound ? 'Package Not Found' : 'Error Loading Package'}
          canonicalPath={`/packages/${slug || ''}`}
          noIndex={true}
        />
        <ErrorDisplay
          type={isNetworkError ? 'network' : isNotFound ? 'notfound' : 'server'}
          onRetry={() => refetch()}
          showBackButton={true}
          showHomeButton={true}
        />
      </>
    );
  }

  // Handle missing package data
  if (!packageDetail) {
    return (
      <>
        <SeoHead
          title="Package Not Found"
          canonicalPath={`/packages/${slug || ''}`}
          noIndex={true}
        />
        <ErrorDisplay
          type="notfound"
          title="Package Not Found"
          message="The package you're looking for doesn't exist or may have been removed."
          showBackButton={true}
          showHomeButton={true}
        />
      </>
    );
  }

  const destinationSlug = destination || packageDetail.country?.slug;
  const canonicalPackagePath = destinationSlug
    ? `/packages/${destinationSlug}/${packageDetail.slug}`
    : `/packages/${packageDetail.slug}`;

  const rawDescription = packageDetail.summary ||
    packageDetail.description?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ||
    `Explore ${packageDetail.name} - ${packageDetail.duration_days} days in ${packageDetail.country.name}`;
  const metaDescription = rawDescription.length > 155
    ? `${rawDescription.substring(0, 152).trim()}...`
    : rawDescription;

  // Build JSON-LD structured data for this tour package
  const packageJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: packageDetail.name,
      description: metaDescription,
      image: packageDetail.image_id ? getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.LARGE) : undefined,
      url: buildAbsoluteUrl(canonicalPackagePath),
      provider: {
        '@type': 'TravelAgency',
        name: SITE_NAME,
        url: 'https://allboundvacations.com',
      },
      touristType: packageDetail.holiday_types?.map(ht => ht.name) || ['Travel'],
      itinerary: packageDetail.duration_days
        ? { '@type': 'ItemList', numberOfItems: packageDetail.duration_days }
        : undefined,
      offers: activePriceCharts && activePriceCharts.length > 0
        ? activePriceCharts.slice(0, 1).map((chart: any) => ({
            '@type': 'Offer',
            price: chart.base_price ?? chart.price ?? '',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: buildAbsoluteUrl(canonicalPackagePath),
          }))
        : undefined,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://allboundvacations.com' },
        { '@type': 'ListItem', position: 2, name: 'Packages', item: buildAbsoluteUrl('/packages') },
        { '@type': 'ListItem', position: 3, name: packageDetail.country.name, item: buildAbsoluteUrl(`/destinations/${packageDetail.country.slug}`) },
        { '@type': 'ListItem', position: 4, name: packageDetail.name, item: buildAbsoluteUrl(canonicalPackagePath) },
      ],
    },
  ];

  return (
    <>
      <SeoHead
        title={packageDetail.name}
        description={metaDescription}
        canonicalPath={canonicalPackagePath}
        image={packageDetail.image_id ? getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.LARGE) : undefined}
        type="article"
        keywords={[
          packageDetail.name,
          packageDetail.country.name,
          'tour package',
          'travel',
          'vacation',
          ...(packageDetail.holiday_types?.map((ht: HolidayTypeSummary) => ht.name) || []),
        ]}
        structuredData={packageJsonLd}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Full Width */}
        <HeroSection
          packageData={packageDetail}
          onBookNowClick={() => setShowBookingForm(true)}
          onDownloadBrochureClick={() => setShowBrochureModal(true)}
        />

        {/* Package Context Section (Breadcrumbs, Tags, Summary) */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            <div className="mb-4">
              <Breadcrumb
                items={[
                  { label: 'Packages', path: '/packages' },
                  { label: packageDetail.country.name, path: `/countries/${packageDetail.country.slug}` },
                  { label: packageDetail.name }
                ]}
                variant="light"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {packageDetail.is_featured && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <i className="fas fa-star mr-2" />
                  Featured Tour
                </span>
              )}
              {packageDetail.holiday_types && packageDetail.holiday_types.length > 0 && (
                <>
                  {packageDetail.holiday_types.map((type: HolidayTypeSummary) => (
                    <span
                      key={type.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                    >
                      {type.icon && <i className={`fas fa-${type.icon} mr-2`} />}
                      {type.name}
                    </span>
                  ))}
                </>
              )}
            </div>

            {packageDetail.summary && (
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                {packageDetail.summary}
              </p>
            )}
          </div>
        </div>

        {/* Sticky Navigation */}
        {navigationSections.length > 0 && (
          <StickyNavigation
            sections={navigationSections}
            offset={80}
            onBookNow={() => setShowBookingForm(true)}
            packageName={packageDetail.name}
          />
        )}

        {/* Main Content - Two Column Layout */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 pb-20 lg:pb-6">
          <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
            {/* Left Column - Main Content */}
            <main className="flex-1 lg:w-2/3 min-w-0" role="main" aria-label="Tour package details">
              {/* Overview Section */}
              <div className="mb-4 md:mb-5">
                <OverviewSection packageData={packageDetail} />
              </div>

              {/* Itinerary Section */}
              {packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <ItinerarySection itineraryItems={packageDetail.itinerary_items} />
                </div>
              )}

              {/* Inclusions/Exclusions Section */}
              {(packageDetail.inclusion_items?.length > 0 || packageDetail.exclusion_items?.length > 0) && (
                <div className="mb-4 md:mb-5">
                  <InclusionsExclusionsSection
                    inclusions={packageDetail.inclusion_items || []}
                    exclusions={packageDetail.exclusion_items || []}
                  />
                </div>
              )}

              {/* Hotels Section */}
              {packageDetail.hotels && packageDetail.hotels.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <HotelsSection hotels={packageDetail.hotels} />
                </div>
              )}

              {/* Attractions Section */}
              {packageDetail.attractions && packageDetail.attractions.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <AttractionsSection attractions={packageDetail.attractions} />
                </div>
              )}

              {/* Itinerary Map Section */}
              {packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0 && (
                <div id="map" className="mb-4 md:mb-5 scroll-mt-20">
                  <ItineraryMapLeaflet
                    itineraryItems={packageDetail.itinerary_items}
                    packageName={packageDetail.name}
                  />
                </div>
              )}

              {/* Gallery Section */}
              {packageDetail.media_assets && packageDetail.media_assets.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <GallerySection
                    images={packageDetail.media_assets}
                    title={packageDetail.name}
                  />
                </div>
              )}

              {/* Related Travel Stories & Blog Articles */}
              {packageDetail.blog_posts && packageDetail.blog_posts.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <BlogsSection blogs={packageDetail.blog_posts} />
                </div>
              )}

              {/* Seasonal Pricing Section */}
              <div id="pricing" className="mb-4 md:mb-5 scroll-mt-20">
                <SeasonalPricingTable
                  priceCharts={activePriceCharts}
                  basePrice={packageDetail.price}
                  durationDays={packageDetail.duration_days}
                  packageType={packageDetail.package_type}
                  onEnquire={(chart, hotel) => handleOpenInquiry(chart, hotel)}
                  onCustomize={(chart, hotel) => handleOpenBooking(chart, hotel)}
                />
              </div>

              {/* Reviews Section */}
              {packageDetail.reviews && packageDetail.reviews.length > 0 && (
                <div className="mb-4 md:mb-5">
                  <ReviewsSection reviews={packageDetail.reviews} />
                </div>
              )}
            </main>

            {/* Right Column - Booking Sidebar (Desktop Only) */}
            <aside className="hidden lg:block lg:w-1/3 flex-shrink-0" role="complementary" aria-label="Booking information">
              <div className="lg:sticky lg:top-24">
                <BookingSidebar
                  packageSlug={packageDetail.slug}
                  price={packageDetail.price}
                  durationDays={packageDetail.duration_days}
                  priceCharts={activePriceCharts}
                  onBookNow={(chart, hotel) => handleOpenBooking(chart, hotel)}
                  onRequestQuote={(chart, hotel) => handleOpenInquiry(chart, hotel)}
                  onDownloadBrochure={() => setShowBrochureModal(true)}
                />
              </div>
            </aside>

          </div>
        </div>

        {/* Mobile Floating CTA Button - Optimized touch targets */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-40 safe-area-inset-bottom">
          <div className="flex gap-2 sm:gap-3 max-w-screen-md mx-auto">
            <button
              onClick={() => handleOpenBooking()}
              className="flex-1 bg-primary hover:bg-primary-dark active:bg-primary-dark text-white font-semibold py-3.5 px-4 sm:px-6 rounded-lg transition-colors touch-manipulation min-h-[48px]"
            >
              Book Now
            </button>
            <button
              onClick={() => handleOpenInquiry()}
              className="flex-1 bg-quote-btn hover:bg-quote-btn-dark active:bg-quote-btn-dark text-white font-semibold py-3.5 px-4 sm:px-6 rounded-lg transition-colors touch-manipulation min-h-[48px]"
            >
              Request Quote
            </button>
            <button
              onClick={() => setShowBrochureModal(true)}
              className="px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-semibold rounded-lg transition-colors touch-manipulation min-h-[48px] flex items-center justify-center text-xs"
              title="Download Brochure"
            >
              Brochure
            </button>
          </div>
        </div>

        {/* Recommended Tours Section */}
        {recommendedPackages && recommendedPackages.length > 0 && (
          <RecommendedTours
            tours={recommendedPackages}
            title="Similar Tours You Might Like"
            subtitle={`Explore more amazing tours in ${packageDetail.country.name}`}
          />
        )}
      </div>

      {/* Package Brochure Download & Preview Modal */}
      {packageDetail && (
        <PackageBrochureModal
          isOpen={showBrochureModal}
          onClose={() => setShowBrochureModal(false)}
          packageData={packageDetail}
          priceCharts={activePriceCharts}
        />
      )}

      {/* Booking Form Modal */}
      {packageDetail && (
        <PackageBookingForm
          packageData={packageDetail as any}
          isOpen={showBookingForm}
          initialPriceChart={selectedBookingChart}
          initialHotelOption={selectedBookingHotel}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedBookingChart(null);
            setSelectedBookingHotel(null);
          }}
          onSuccess={() => {
            console.log('Booking submitted successfully');
            setShowBookingForm(false);
            setSelectedBookingChart(null);
            setSelectedBookingHotel(null);
          }}
        />
      )}

      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={showInquiryForm}
        onClose={() => setShowInquiryForm(false)}
        onSuccess={() => {
          console.log('Inquiry submitted successfully');
          setShowInquiryForm(false);
        }}
        defaultSubject={`Inquiry about ${packageDetail.name}`}
        defaultMessage={`I'm interested in the ${packageDetail.name} package. Please provide more information.`}
      />
    </>
  );
};

export default PackageDetailPageNew;
