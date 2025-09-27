import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGroupTripDetailsBySlug } from '../../lib/hooks/useGroupTrips';
import { useAppStore } from '../../lib/store';
import { Helmet } from 'react-helmet-async';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { EnhancedItineraryDisplay } from '../../components/ui/EnhancedItineraryDisplay';
import { TextDisplay } from '../../components/ui/RichTextDisplay';


// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { format } from 'date-fns';

const GroupTripDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const addRecentlyViewed = useAppStore((state) => state.addRecentlyViewed);
  
  // Fetch group trip details with gallery
  const { data: tripDetail, isLoading, error } = useGroupTripDetailsBySlug(slug || '');
  
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
  
  if (error || !tripDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading group trip details. Please try again later.</p>
          <Link to="/group-trips" className="text-red-700 underline mt-2 inline-block">
            Back to Group Trips
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{tripDetail.name} | AllBounds Vacations</title>
        <meta name="description" content={tripDetail.description || ''} />
        <meta property="og:title" content={`${tripDetail.name} | AllBounds Vacations`} />
        <meta property="og:description" content={tripDetail.description || ''} />
        {tripDetail?.image_id && (
          <meta property="og:image" content={getImageUrlWithFallback(tripDetail.image_id, IMAGE_VARIANTS.LARGE)} />
        )}
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: 'Group Trips', path: '/group-trips' },
            { label: tripDetail.country.name, path: `/countries/${tripDetail.country.slug}` },
            { label: tripDetail.name },
          ]}
          className="mb-6"
        />

        {tripDetail.gallery_images && tripDetail.gallery_images.length > 0 && (
          <div className="mb-8">
            <ImageCarousel
              images={tripDetail.gallery_images.map((img: any) => ({ ...img, filename: img.file_path }))}
              autoPlay={true}
              showThumbnails={false}
              className="rounded-lg overflow-hidden shadow-lg"
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-playfair text-charcoal mb-4">{tripDetail.name}</h1>
            
            <div className="flex items-center mb-6">
              <div className="text-gray-600">
                {tripDetail.duration_days && `${tripDetail.duration_days} days`}
                {tripDetail.price && ` • From $${tripDetail.price}`}
              </div>
            </div>
            
            
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
              
              {/* Itinerary Section */}
              <EnhancedItineraryDisplay 
                entityType="group_trip" 
                entityId={tripDetail.id} 
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
                      {tripDetail.departures.map((departure: any) => (
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
                      {tripDetail.holiday_types.map((type: any) => (
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
                onClick={() => {
                  // Handle booking action
                  console.log('Join group trip clicked');
                }}
              >
                Join This Trip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupTripDetailPage;
