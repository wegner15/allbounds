import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useComprehensivePackageBySlug, useRecommendedPackages } from '../../lib/hooks/usePackages';
import { HeroSection, OverviewSection, ItinerarySection, InclusionsExclusionsSection, HotelsSection, AttractionsSection, ReviewsSection, BookingSidebar, StickyNavigation, RecommendedTours } from '../../components/tour';
import ItineraryMapLeaflet from '../../components/tour/ItineraryMapLeaflet';
import { PackageDetailSkeleton } from '../../components/tour/LoadingSkeletons';
import ErrorDisplay from '../../components/tour/ErrorDisplay';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import PackageBookingForm from '../../components/forms/PackageBookingForm';
import InquiryForm from '../../components/forms/InquiryForm';

const PackageDetailPageNew: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Fetch comprehensive package details
  const { data: packageDetail, isLoading, error, refetch } = useComprehensivePackageBySlug(slug!);
  
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

    if (packageDetail.reviews && packageDetail.reviews.length > 0) {
      sections.push({ id: 'reviews', label: 'Reviews' });
    }

    return sections;
  }, [packageDetail]);

  // Loading state with comprehensive skeleton
  if (isLoading) {
    return <PackageDetailSkeleton />;
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
      <ErrorDisplay
        type={isNetworkError ? 'network' : isNotFound ? 'notfound' : 'server'}
        onRetry={() => refetch()}
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // Handle missing package data
  if (!packageDetail) {
    return (
      <ErrorDisplay
        type="notfound"
        title="Package Not Found"
        message="The package you're looking for doesn't exist or may have been removed."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{packageDetail.name} | AllBounds Vacations</title>
        <meta name="title" content={`${packageDetail.name} | AllBounds Vacations`} />
        <meta 
          name="description" 
          content={packageDetail.summary || packageDetail.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${packageDetail.name} - ${packageDetail.duration_days} days in ${packageDetail.country.name}`} 
        />
        <meta name="keywords" content={`${packageDetail.name}, ${packageDetail.country.name}, tour package, travel, vacation, ${packageDetail.holiday_types?.map(ht => ht.name).join(', ')}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${packageDetail.name} | AllBounds Vacations`} />
        <meta 
          property="og:description" 
          content={packageDetail.summary || packageDetail.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${packageDetail.name}`} 
        />
        {packageDetail.image_id && (
          <meta property="og:image" content={getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.LARGE)} />
        )}
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AllBounds Vacations" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={`${packageDetail.name} | AllBounds Vacations`} />
        <meta 
          property="twitter:description" 
          content={packageDetail.summary || packageDetail.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `Explore ${packageDetail.name}`} 
        />
        {packageDetail.image_id && (
          <meta property="twitter:image" content={getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.LARGE)} />
        )}
        
        {/* Additional SEO Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="author" content="AllBounds Vacations" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Full Width */}
        <HeroSection 
          packageData={packageDetail} 
          onBookNowClick={() => setShowBookingForm(true)}
        />

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 lg:pb-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Column - Main Content */}
            <main className="flex-1 lg:w-2/3 min-w-0" role="main" aria-label="Tour package details">
              {/* Overview Section */}
              <div className="mb-6 md:mb-8">
                <OverviewSection packageData={packageDetail} />
              </div>

              {/* Itinerary Section */}
              {packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <ItinerarySection itineraryItems={packageDetail.itinerary_items} />
                </div>
              )}

              {/* Inclusions/Exclusions Section */}
              {(packageDetail.inclusion_items?.length > 0 || packageDetail.exclusion_items?.length > 0) && (
                <div className="mb-6 md:mb-8">
                  <InclusionsExclusionsSection 
                    inclusions={packageDetail.inclusion_items || []} 
                    exclusions={packageDetail.exclusion_items || []} 
                  />
                </div>
              )}

              {/* Hotels Section */}
              {packageDetail.hotels && packageDetail.hotels.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <HotelsSection hotels={packageDetail.hotels} />
                </div>
              )}

              {/* Attractions Section */}
              {packageDetail.attractions && packageDetail.attractions.length > 0 && (
                <div className="mb-6 md:mb-8">
                  <AttractionsSection attractions={packageDetail.attractions} />
                </div>
              )}

              {/* Itinerary Map Section */}
              {packageDetail.itinerary_items && packageDetail.itinerary_items.length > 0 && (
                <div id="map" className="mb-6 md:mb-8 scroll-mt-20">
                  <ItineraryMapLeaflet 
                    itineraryItems={packageDetail.itinerary_items}
                    packageName={packageDetail.name}
                  />
                </div>
              )}

              {/* Reviews Section */}
              {packageDetail.reviews && (
                <div className="mb-6 md:mb-8">
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
                  priceCharts={packageDetail.price_charts}
                  onBookNow={() => setShowBookingForm(true)}
                  onRequestQuote={() => setShowInquiryForm(true)}
                />
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile Floating CTA Button - Optimized touch targets */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 shadow-lg z-40 safe-area-inset-bottom">
          <div className="flex gap-2 sm:gap-3 max-w-screen-sm mx-auto">
            <button
              onClick={() => setShowBookingForm(true)}
              className="flex-1 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold py-3.5 px-4 sm:px-6 rounded-lg transition-colors touch-manipulation min-h-[48px]"
            >
              Book Now
            </button>
            <button
              onClick={() => setShowInquiryForm(true)}
              className="flex-1 bg-white hover:bg-gray-50 active:bg-gray-100 text-teal-600 font-semibold py-3.5 px-4 sm:px-6 rounded-lg border-2 border-teal-500 transition-colors touch-manipulation min-h-[48px]"
            >
              Request Quote
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

      {/* Booking Form Modal */}
      {packageDetail && (
        <PackageBookingForm
          packageData={packageDetail as any}
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            console.log('Booking submitted successfully');
            setShowBookingForm(false);
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
