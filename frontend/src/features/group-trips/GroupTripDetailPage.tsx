import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupTripDetailsBySlug } from '../../lib/hooks/useGroupTrips';
import { useAppStore } from '../../lib/store';
import SeoHead from '../../components/seo/SeoHead';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ImageCarousel from '../../components/ui/ImageCarousel';
import SeasonalPricingTable from '../../components/common/SeasonalPricingTable';
import { useEntityPriceCharts } from '../../lib/hooks/usePackagePriceCharts';

import { EnhancedItineraryDisplay } from '../../components/ui/EnhancedItineraryDisplay';
import { TextDisplay } from '../../components/ui/RichTextDisplay';
import GroupTripBookingForm from '../../components/forms/GroupTripBookingForm';
import SimilarGroupTrips from '../../components/recommendations/SimilarGroupTrips';


// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { format } from 'date-fns';

const GroupTripDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const addRecentlyViewed = useAppStore((state) => state.addRecentlyViewed);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [showBookingForm, setShowBookingForm] = React.useState(false);

  // Fetch group trip details with gallery
  const { data: tripDetail, isLoading, error } = useGroupTripDetailsBySlug(slug || '');
  const { data: fetchedPriceCharts } = useEntityPriceCharts('group_trip', tripDetail?.id || 0);
  const activePriceCharts = (tripDetail?.price_charts && tripDetail.price_charts.length > 0)
    ? tripDetail.price_charts
    : (fetchedPriceCharts || []);


  // Handle scroll to show/hide sticky card
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 400); // Show after scrolling 400px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prepare images for carousel: cover image first, then gallery images
  const carouselImages = useMemo(() => {
    if (!tripDetail) return [];

    const images: Array<{
      id: number;
      filename: string;
      alt_text?: string;
      title?: string;
      caption?: string;
      width?: number;
      height?: number;
      file_path: string;
    }> = [];

    // Add cover image first if it exists
    if (tripDetail.cover_image) {
      images.push({
        id: -1, // Use negative ID to distinguish from gallery images
        filename: 'cover-image',
        alt_text: `${tripDetail.name} - Cover Image`,
        title: tripDetail.name,
        caption: 'Cover Image',
        file_path: getImageUrlWithFallback(tripDetail.cover_image, IMAGE_VARIANTS.LARGE),
      });
    }

    // Add gallery images
    if (tripDetail.gallery_images && tripDetail.gallery_images.length > 0) {
      tripDetail.gallery_images.forEach((img) => {
        images.push({
          ...img,
          filename: img.file_path,
        });
      });
    }

    return images;
  }, [tripDetail]);

  // Add to recently viewed when data is available
  React.useEffect(() => {
    if (tripDetail) {
      addRecentlyViewed({
        id: tripDetail.id.toString(),
        type: 'groupTrip',
        title: tripDetail.name,
        image: tripDetail.cover_image ? getImageUrlWithFallback(tripDetail.cover_image, IMAGE_VARIANTS.THUMBNAIL) : undefined,
        slug: tripDetail.slug,
      });
    }
  }, [tripDetail, addRecentlyViewed]);

  if (isLoading) {
    return (
      <>
        <SeoHead
          title="Loading Group Trip"
          canonicalPath={`/group-trips/${slug || ''}`}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          </div>
        </div>
      </>
    );
  }

  if (error || !tripDetail) {
    return (
      <>
        <SeoHead
          title="Group Trip Not Found"
          canonicalPath={`/group-trips/${slug || ''}`}
          noIndex={true}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p>Error loading group trip details. Please try again later.</p>
            <Link to="/group-trips" className="text-red-700 underline mt-2 inline-block">
              Back to Group Trips
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SeoHead
        title={tripDetail.name}
        description={tripDetail.description || undefined}
        canonicalPath={`/group-trips/${tripDetail.slug}`}
        image={tripDetail?.cover_image ? getImageUrlWithFallback(tripDetail.cover_image, IMAGE_VARIANTS.LARGE) : undefined}
      />

      {/* Sticky Trip Info Card */}
      <div className={`fixed top-20 left-0 right-0 z-45 transition-all duration-300 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <h2 className="text-lg font-semibold text-charcoal truncate max-w-xs">
                  {tripDetail.name}
                </h2>
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
                  {tripDetail.duration_days && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tripDetail.duration_days} days
                    </span>
                  )}
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {tripDetail.country.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {tripDetail.price && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-xl font-bold text-primary">${tripDetail.price}</div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                )}
                <Button variant="primary" size="sm">
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Image Carousel */}
      {carouselImages.length > 0 && (
        <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
          <ImageCarousel
            images={carouselImages}
            autoPlay={true}
            showThumbnails={false}
            className="h-full"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <Breadcrumb
                items={[
                  { label: 'Group Trips', path: '/group-trips' },
                  { label: tripDetail.country.name, path: `/countries/${tripDetail.country.slug}` },
                  { label: tripDetail.name },
                ]}
                className="mb-4 text-white"
              />
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-4 text-white drop-shadow-lg">
                {tripDetail.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                {tripDetail.duration_days && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tripDetail.duration_days} days
                  </span>
                )}
                {tripDetail.price && (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    From ${tripDetail.price} per person
                  </span>
                )}
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {tripDetail.country.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`container mx-auto px-4 ${isScrolled ? 'py-24' : 'py-8'}`}>
        {/* Breadcrumb fallback if no cover image */}
        {!tripDetail.cover_image && (
          <Breadcrumb
            items={[
              { label: 'Group Trips', path: '/group-trips' },
              { label: tripDetail.country.name, path: `/countries/${tripDetail.country.slug}` },
              { label: tripDetail.name },
            ]}
            className="mb-6"
          />
        )}

        {/* Title fallback if no cover image */}
        {!tripDetail.cover_image && (
          <h1 className="text-4xl font-playfair text-charcoal mb-4">{tripDetail.name}</h1>
        )}



        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Title and basic info - only show if no cover image */}
            {!tripDetail.cover_image && (
              <>
                <h1 className="text-4xl font-playfair text-charcoal mb-4">{tripDetail.name}</h1>

                <div className="flex items-center mb-6">
                  <div className="text-gray-600">
                    {tripDetail.duration_days && `${tripDetail.duration_days} days`}
                    {tripDetail.price && ` • From $${tripDetail.price}`}
                  </div>
                </div>
              </>
            )}


            {/* Group Trip Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>

              {tripDetail.description && (
                <div className="mb-6">
                  <TextDisplay content={tripDetail.description} />
                </div>
              )}

              {tripDetail.inclusions && (
                <>
                  <h3 className="text-xl font-semibold mb-3">What's Included</h3>
                  <div className="mb-6">
                    <TextDisplay content={Array.isArray(tripDetail.inclusions) ? tripDetail.inclusions.join('\n') : tripDetail.inclusions} />
                  </div>
                </>
              )}

              {tripDetail.exclusions && (
                <>
                  <h3 className="text-xl font-semibold mb-3">What's Not Included</h3>
                  <div className="mb-6">
                    <TextDisplay content={Array.isArray(tripDetail.exclusions) ? tripDetail.exclusions.join('\n') : tripDetail.exclusions} />
                  </div>
                </>
              )}

              {/* Seasonal Pricing Section */}
              <div id="pricing" className="mb-6">
                <SeasonalPricingTable
                  priceCharts={activePriceCharts}
                  basePrice={tripDetail.price}
                  durationDays={tripDetail.duration_days}
                  title="Group Trip Seasonal Pricing"
                  onEnquire={() => setShowBookingForm(true)}
                  onCustomize={() => setShowBookingForm(true)}
                />
              </div>


              {/* Itinerary Section */}
              <EnhancedItineraryDisplay

                entityType="group_trip"
                entityId={tripDetail.id}
                isScrolled={isScrolled}
                className="mb-6"
              />

              {tripDetail.itinerary && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Legacy Itinerary</h3>
                  <div className="mb-6">
                    <TextDisplay content={String(tripDetail.itinerary)} />
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Trip Details</h2>

              <div className="space-y-4">
                {tripDetail.duration_days && (
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="ml-2">{tripDetail.duration_days} days</span>
                  </div>
                )}

                {tripDetail.max_participants && (
                  <div>
                    <span className="font-medium text-gray-600">Group Size:</span>
                    <span className="ml-2">Max {tripDetail.max_participants} people</span>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-600">Country:</span>
                  <span className="ml-2">{tripDetail.country.name}</span>
                </div>

                {tripDetail.price && (
                  <div>
                    <span className="font-medium text-gray-600">Price:</span>
                    <span className="ml-2 text-2xl font-bold text-primary">From ${tripDetail.price}</span>
                    <span className="text-gray-600 text-sm block">per person</span>
                  </div>
                )}

                {tripDetail.departures && tripDetail.departures.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">Departures:</span>
                    <div className="mt-2 space-y-2">
                      {tripDetail.departures.map((departure) => (
                        <div key={departure.id} className="text-sm">
                          {format(new Date(departure.start_date), 'MMM d, yyyy')} - {format(new Date(departure.end_date), 'MMM d, yyyy')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tripDetail.holiday_types && tripDetail.holiday_types.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-600">Holiday Types:</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {tripDetail.holiday_types.map((type) => (
                        <Badge key={type.id} variant="secondary">
                          {type.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                onClick={() => setShowBookingForm(true)}
              >
                Join This Trip
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Group Trips Section */}
        <SimilarGroupTrips groupTripId={tripDetail.id} limit={4} />
      </div>

      {/* Booking Form Modal */}
      <GroupTripBookingForm
        groupTripData={tripDetail}
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        onSuccess={() => {
          // Could show a success message here
          console.log('Group trip booking submitted successfully');
        }}
      />
    </>
  );
};

export default GroupTripDetailPage;
