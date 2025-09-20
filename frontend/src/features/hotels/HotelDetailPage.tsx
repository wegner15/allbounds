import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

// Components
import Breadcrumb from '../../components/layout/Breadcrumb';
import Button from '../../components/ui/Button';
import ImageGallery from '../../components/ui/ImageGallery';

// API
import { apiClient } from '../../lib/api';
import type { HotelWithGallery } from '../../lib/types/api';

// Utils
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Fetch hotel details with gallery
  const { data: hotel, isLoading, error } = useQuery<HotelWithGallery>({
    queryKey: ['hotel-details', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Hotel slug is required');
      const response = await apiClient.get<HotelWithGallery>(`/api/v1/hotels/details/${slug}`);
      return response;
    },
  });

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

  if (error || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p>Error loading hotel details. Please try again later.</p>
          <Link to="/hotels" className="text-red-700 underline mt-2 inline-block">
            Back to Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{hotel.name} | AllBounds Vacations</title>
        <meta name="description" content={hotel.summary || hotel.description || `Stay at ${hotel.name} with AllBounds Vacations`} />
        <meta property="og:title" content={`${hotel.name} | AllBounds Vacations`} />
        <meta property="og:description" content={hotel.summary || hotel.description || `Stay at ${hotel.name} with AllBounds Vacations`} />
        {hotel.cover_image && (
          <meta property="og:image" content={getImageUrlWithFallback(hotel.cover_image, IMAGE_VARIANTS.LARGE)} />
        )}
      </Helmet>

      <div className="bg-paper min-h-screen">
        {/* Hero Section */}
        <div className="relative h-96 md:h-[500px]">
          {hotel.cover_image ? (
            <img
              src={getImageUrlWithFallback(hotel.cover_image, IMAGE_VARIANTS.LARGE)}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-teal to-primary"></div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl md:text-6xl font-playfair text-white mb-4">{hotel.name}</h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    {hotel.stars && (
                      <div className="flex text-yellow-400 text-lg">
                        {[...Array(Math.floor(hotel.stars))].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    )}
                    {hotel.city && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{hotel.city}</span>
                      </div>
                    )}
                    {hotel.price_category && (
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                        {hotel.price_category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Breadcrumb
            items={[
              { label: 'Hotels', path: '/hotels' },
              { label: hotel.country?.name || 'Country', path: `/destinations/${hotel.country?.slug}` },
              { label: hotel.name },
            ]}
            className="mb-8"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Hotel Overview */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-2xl font-playfair text-charcoal mb-4">About {hotel.name}</h2>
                {hotel.summary && (
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">{hotel.summary}</p>
                )}
                {hotel.description && (
                  <p className="text-gray-700 leading-relaxed mb-6">{hotel.description}</p>
                )}
                
                {/* Hotel Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.address && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Address</div>
                      <div className="font-semibold text-charcoal text-sm">{hotel.address}</div>
                    </div>
                  )}
                  {hotel.check_in_time && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Check-in</div>
                      <div className="font-semibold text-charcoal">{hotel.check_in_time}</div>
                    </div>
                  )}
                  {hotel.check_out_time && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">Check-out</div>
                      <div className="font-semibold text-charcoal">{hotel.check_out_time}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Gallery Section */}
              {hotel.gallery_images && hotel.gallery_images.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="text-2xl font-playfair text-charcoal mb-6">Photo Gallery</h2>
                  <ImageGallery
                    images={hotel.gallery_images}
                    coverImage={hotel.cover_image}
                    title={hotel.name}
                  />
                </div>
              )}

              {/* Amenities Section */}
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                  <h2 className="text-2xl font-playfair text-charcoal mb-6">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {hotel.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <span className="text-teal">✓</span>
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Booking Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Book Your Stay</h3>
                <div className="space-y-3">
                  <Button variant="primary" className="w-full">
                    Check Availability
                  </Button>
                  <Button variant="outline" className="w-full">
                    Get Quote
                  </Button>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Hotel Info */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">Hotel Information</h3>
                <div className="space-y-3 text-sm">
                  {hotel.stars && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating</span>
                      <div className="flex text-yellow-400">
                        {[...Array(Math.floor(hotel.stars))].map((_, i) => (
                          <span key={i}>⭐</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {hotel.price_category && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{hotel.price_category}</span>
                    </div>
                  )}
                  {hotel.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-medium">{hotel.city}</span>
                    </div>
                  )}
                  {hotel.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country</span>
                      <Link 
                        to={`/destinations/${hotel.country.slug}`}
                        className="font-medium text-teal hover:text-hover"
                      >
                        {hotel.country.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HotelDetailPage;
