import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAttractionTrips } from '../../hooks/useAttractionTrips';
import { RichTextDisplay } from '../../components/ui/RichTextDisplay';
import Button from '../../components/ui/Button';
import ImageCarousel from '../../components/ui/ImageCarousel';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AttractionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: attractionData, isLoading, error } = useAttractionTrips(slug || '');
  const { attraction, packages = [], group_trips = [], total_packages = 0, total_group_trips = 0 } = attractionData || {};


  // Get all available images for the gallery (memoized to avoid recalculation)
  const getAllImages = useMemo(() => {
    if (!attraction) return [];
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

    if (attraction.gallery_images) {
      images.push(...attraction.gallery_images.map(img => ({ ...img, filename: img.file_path })));
    }

    if (attraction.cover_image) {
      const coverImageUrl = getImageUrlWithFallback(attraction.cover_image, IMAGE_VARIANTS.LARGE);
      if (!images.some(img => img.file_path === coverImageUrl)) {
        images.unshift({
          id: 0, // Placeholder ID
          file_path: coverImageUrl,
          filename: coverImageUrl,
          alt_text: `${attraction.name} Cover Image`,
        });
      }
    }

    return images;
  }, [attraction]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attraction details...</p>
        </div>
      </div>
    );
  }

  if (error || !attractionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Attraction Not Found</h1>
          <p className="text-gray-600 mb-6">The attraction you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Attraction Info */}
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{attraction?.city && `${attraction.city}, `}{attraction?.country?.name}</span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {attraction?.name}
              </h1>
              
              {attraction?.summary && (
                <p className="text-xl text-gray-600 mb-6">
                  {attraction.summary}
                </p>
              )}

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-6">
                {attraction?.duration_minutes && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{Math.floor(attraction.duration_minutes / 60)}h {attraction.duration_minutes % 60}m visit</span>
                  </div>
                )}
                
                {attraction?.price && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>From ${attraction.price}</span>
                  </div>
                )}
              </div>

              {attraction?.opening_hours && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Opening Hours</h3>
                  <p className="text-gray-700">{attraction.opening_hours}</p>
                </div>
              )}
            </div>

            {/* Attraction Image Gallery */}
            <div className="lg:order-first">
              <ImageCarousel images={getAllImages} className="rounded-lg overflow-hidden shadow-lg" autoPlay={true} showThumbnails={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {attraction?.description && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Attraction</h2>
                <RichTextDisplay content={attraction.description} />
              </div>
            )}

            {/* Packages Section */}
            {packages?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Travel Packages ({total_packages})
                  </h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        const container = document.getElementById('packages-scroll');
                        if (container) container.scrollLeft -= 300;
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        const container = document.getElementById('packages-scroll');
                        if (container) container.scrollLeft += 300;
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  id="packages-scroll"
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {packages?.map(pkg => (
                    <div key={pkg?.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <Link to={`/packages/${pkg?.slug}`}>
                        <img
                          src={getImageUrlWithFallback(pkg?.cover_image, IMAGE_VARIANTS.MEDIUM)}
                          alt={pkg?.name}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <div className="p-4">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {pkg?.country && (
                            <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                              {pkg?.country?.name}
                            </span>
                          )}
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {pkg?.duration_days} days
                          </span>
                        </div>

                        <Link to={`/packages/${pkg?.slug}`} className="block">
                          <h3 className="text-lg font-medium text-charcoal hover:text-hover transition-colors mb-2">
                            {pkg?.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pkg?.summary}</p>
                        
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-bold text-lg">From ${pkg?.price}</span>
                            <span className="text-gray-600 text-sm"> / person</span>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Group Trips Section */}
            {group_trips?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Group Trips ({total_group_trips})
                  </h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        const container = document.getElementById('group-trips-scroll');
                        if (container) container.scrollLeft -= 300;
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        const container = document.getElementById('group-trips-scroll');
                        if (container) container.scrollLeft += 300;
                      }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div 
                  id="group-trips-scroll"
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {group_trips?.map((trip) => {
                    return (
                      <div key={trip.id} className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <Link to={`/group-trips/${trip.slug}`}>
                          <img 
                            src={getImageUrlWithFallback(trip.cover_image, IMAGE_VARIANTS.MEDIUM, 'https://source.unsplash.com/random/600x400/?group,travel')} 
                            alt={trip.name}
                            className="w-full h-48 object-cover"
                          />
                        </Link>
                        <div className="p-4">
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {trip?.country && (
                              <span className="inline-block bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                                📍 {trip?.country?.name}
                              </span>
                            )}
                            {trip?.duration_days && (
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                ⏱️ {trip.duration_days} days
                              </span>
                            )}
                          </div>

                          <Link to={`/group-trips/${trip?.slug}`} className="block">
                            <h3 className="text-lg font-semibold text-charcoal hover:text-hover transition-colors mb-2">
                              {trip?.name}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip?.summary}</p>
                          
                          {/* Trip Details */}
                          <div className="space-y-2 mb-4">
                            {/* Group Size */}
                            {trip?.max_participants && (
                              <div className="flex items-center text-sm text-gray-600">
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>
                                  Group size: {`Max ${trip?.max_participants}`} people
                                </span>
                              </div>
                            )}

                          </div>
                          
                          
                          {/* Price */}
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-baseline">
                                <span className="text-sm text-gray-500">From</span>
                                <span className="font-bold text-xl text-primary ml-1">${trip.price}</span>
                              </div>
                              <span className="text-gray-600 text-xs">per person</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="mt-4 pt-3 border-t border-gray-100">
                            <Link to={`/group-trips/${trip.slug}`}>
                              <Button variant="primary" size="sm" className="w-full">
                                View Details & Book
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No trips message */}
            {packages?.length === 0 && group_trips?.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">No Trips Available</h2>
                <p className="text-gray-600 mb-6">
                  Currently, there are no travel packages or group trips that include this attraction.
                </p>
                <Link to="/packages">
                  <Button>Browse All Packages</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Interactive Map */}
            {attraction?.latitude && attraction?.longitude && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Map</h3>
                <div className="h-64 rounded-lg overflow-hidden">
                  <MapContainer
                    center={[attraction?.latitude, attraction?.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[attraction?.latitude, attraction?.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <h4 className="font-semibold">{attraction?.name}</h4>
                          {attraction?.city && (
                            <p className="text-sm text-gray-600">{attraction?.city}, {attraction?.country?.name}</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">
                      {attraction?.address || 'Address not available'}
                      {attraction?.city && (
                        <>
                          <br />
                          {attraction?.city}, {attraction?.country?.name}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {attraction?.latitude && attraction?.longitude && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Coordinates</p>
                      <p className="text-gray-600">
                        {attraction?.latitude?.toFixed(6)}, {attraction?.longitude?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Travel Packages:</span>
                    <span className="font-medium">{total_packages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group Trips:</span>
                    <span className="font-medium">{total_group_trips}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetailPage;
