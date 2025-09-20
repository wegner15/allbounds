import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../../lib/store';
import { Helmet } from 'react-helmet-async';
import { usePackageDetailsBySlug } from '../../lib/hooks/usePackages';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { EnhancedItineraryDisplay } from '../../components/ui/EnhancedItineraryDisplay';
import { TextDisplay } from '../../components/ui/RichTextDisplay';

// Import types from API

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

const PackageDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const addRecentlyViewed = useAppStore((state) => state.addRecentlyViewed);
  
  // Fetch package details with gallery
  const { data: packageDetail, isLoading, error } = usePackageDetailsBySlug(slug!);
  
  // Add to recently viewed when data is available
  React.useEffect(() => {
    if (packageDetail) {
      addRecentlyViewed({
        id: packageDetail.id.toString(),
        type: 'package',
        title: packageDetail.name,
        image: packageDetail.image_id ? getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.THUMBNAIL) : undefined,
        slug: packageDetail.slug,
      });
    }
  }, [packageDetail, addRecentlyViewed]);
  
  if (isLoading) {
    return (
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
    );
  }
  
  if (error || !packageDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading package details. Please try again later.</p>
          <Link to="/packages" className="text-red-700 underline mt-2 inline-block">
            Back to Packages
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{packageDetail.name} | AllBounds Vacations</title>
        <meta name="description" content={packageDetail.description || ''} />
        <meta property="og:title" content={`${packageDetail.name} | AllBounds Vacations`} />
        <meta property="og:description" content={packageDetail.description || ''} />
        {packageDetail?.image_id && (
          <meta property="og:image" content={getImageUrlWithFallback(packageDetail.image_id, IMAGE_VARIANTS.LARGE)} />
        )}
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Packages', path: '/packages' },
            { label: packageDetail.country.name, path: `/countries/${packageDetail.country.slug}` },
            { label: packageDetail.name },
          ]}
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-playfair text-charcoal mb-4">{packageDetail.name}</h1>
            
            <div className="flex items-center mb-6">
              <div className="text-gray-600">
                {packageDetail.duration_days && `${packageDetail.duration_days} days`}
                {packageDetail.price && ` • From $${packageDetail.price}`}
              </div>
            </div>
            
            {/* Hero Image Carousel */}
            {packageDetail.gallery_images && packageDetail.gallery_images.length > 0 && (
              <div className="mb-6">
                <ImageCarousel
                  images={packageDetail.gallery_images}
                  autoPlay={true}
                  showThumbnails={false}
                  className="h-64 md:h-80"
                />
              </div>
            )}
            
            {/* Package Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Overview</h2>
              
              {packageDetail.description && (
                <div className="mb-6">
                  <TextDisplay content={packageDetail.description} />
                </div>
              )}
              
              {packageDetail.inclusions && (
                <>
                  <h3 className="text-xl font-semibold mb-3">What's Included</h3>
                  <div className="mb-6">
                    <TextDisplay content={packageDetail.inclusions} />
                  </div>
                </>
              )}
              
              {packageDetail.exclusions && (
                <>
                  <h3 className="text-xl font-semibold mb-3">What's Not Included</h3>
                  <div className="mb-6">
                    <TextDisplay content={packageDetail.exclusions} />
                  </div>
                </>
              )}
              
              {/* Itinerary Section */}
              <EnhancedItineraryDisplay 
                entityType="package" 
                entityId={packageDetail.id} 
                className="mb-6"
              />

              {packageDetail.itinerary && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Legacy Itinerary</h3>
                  <div className="mb-6">
                    {Array.isArray(packageDetail.itinerary) ? (
                      <div className="space-y-4">
                        {packageDetail.itinerary.map((day: any, index: number) => (
                          <div key={index} className="border-l-4 border-primary pl-4">
                            <h4 className="font-semibold">Day {index + 1}</h4>
                            <p className="text-gray-600">{day.description || day.title}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <TextDisplay content={packageDetail.itinerary} />
                    )}
                  </div>
                </>
              )}

              {/* Gallery Section */}
              {packageDetail.gallery_images && packageDetail.gallery_images.length > 1 && (
                <>
                  <h3 className="text-xl font-semibold mb-3">Photo Gallery</h3>
                  <div className="mb-6">
                    <ImageCarousel
                      images={packageDetail.gallery_images}
                      autoPlay={false}
                      showThumbnails={true}
                      className="h-64 md:h-96"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6">
                <div className="text-center mb-6">
                  {packageDetail.price && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Starting from</span>
                      <div className="text-3xl font-bold text-primary">${packageDetail.price}</div>
                      <span className="text-sm text-gray-500">per person</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  {packageDetail.duration_days && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-gray-600">Duration</span>
                      </div>
                      <span className="text-gray-900">{packageDetail.duration_days} days</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium text-gray-600">Destination</span>
                    </div>
                    <span className="text-gray-900">{packageDetail.country.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium text-gray-600">Group Size</span>
                    </div>
                    <span className="text-gray-900">2-12 people</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium text-gray-600">Instant Confirmation</span>
                    </div>
                    <span className="text-green-600 font-medium">Available</span>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mb-3"
                  onClick={() => {
                    // Handle booking action
                    console.log('Book now clicked');
                  }}
                >
                  Book Now
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => {
                    // Handle inquiry action
                    console.log('Send inquiry clicked');
                  }}
                >
                  Send Inquiry
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Need help planning?</p>
                  <div className="flex items-center justify-center text-sm text-primary">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call us: +256754969593
                  </div>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Why book with us?</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Free cancellation up to 24 hours
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Best price guarantee
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    24/7 customer support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PackageDetailPage;
