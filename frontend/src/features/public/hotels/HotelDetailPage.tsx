import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelBySlug } from '../../../lib/hooks/useHotels';
import PackageBookingForm from '../../../components/forms/PackageBookingForm';
import InquiryForm from '../../../components/forms/InquiryForm';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import GridGallery from '../../../components/ui/GridGallery';
import SimilarHotels from '../../../components/recommendations/SimilarHotels';
import { MapPin, Star, Clock, DollarSign } from 'lucide-react';
import { TextDisplay } from '../../../components/ui/RichTextDisplay';

const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: hotel, isLoading, error } = useHotelBySlug(slug!);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  // Group all images for the gallery
  const getAllImages = useMemo(() => {
    if (!hotel) return [];
    const images = [...(hotel.gallery_images || [])];

    if (hotel.cover_image && !images.some(img => img.file_path === hotel.cover_image)) {
      images.unshift({
        id: 0,
        file_path: hotel.cover_image,
        filename: 'cover',
        alt_text: hotel.name,
      });
    }
    return images;
  }, [hotel]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hotel not found</h2>
          <Link to="/hotels" className="text-blue-600 hover:text-blue-700">Back to Hotels</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: 'Destinations', path: '/destinations' },
              { label: hotel?.country?.name || 'Country', path: `/destinations/${hotel?.country?.slug}` },
              { label: `${hotel?.country?.name || ''} Hotels`, path: `/destinations/${hotel?.country?.slug}/hotels` },
              { label: hotel?.name || 'Hotel' },
            ]}
          />
        </div>
      </div>

      {/* Hero Section - Header & Gallery */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-playfair">
                {hotel.name}
              </h1>
              {hotel.stars && (
                <div className="flex items-center gap-1">
                  {renderStars(hotel.stars)}
                  <span className="ml-2 text-sm text-gray-600">
                    {hotel.stars} star{hotel.stars !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              {(hotel.city || hotel.address) && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  <span>
                    {hotel.city || hotel.address}
                    {hotel.country && `, ${hotel.country.name}`}
                  </span>
                </div>
              )}
              {hotel.price_category && (
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1 text-blue-600" />
                  <span className="font-medium text-gray-900">{hotel.price_category} category</span>
                </div>
              )}
            </div>
          </div>

          {/* Grid Gallery */}
          <GridGallery images={getAllImages} className="mb-8" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {hotel.description && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hotel</h2>
                <TextDisplay content={hotel.description} />
              </div>
            )}

            {/* Check-in/Check-out */}
            {(hotel.check_in_time || hotel.check_out_time) && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.check_in_time && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <span className="block text-xs text-blue-600 uppercase font-bold tracking-wider">Check-in</span>
                        <p className="text-lg font-semibold text-gray-900">{hotel.check_in_time}</p>
                      </div>
                    </div>
                  )}

                  {hotel.check_out_time && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
                      <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <Clock size={24} />
                      </div>
                      <div>
                        <span className="block text-xs text-orange-600 uppercase font-bold tracking-wider">Check-out</span>
                        <p className="text-lg font-semibold text-gray-900">{hotel.check_out_time}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Map Section */}
            {hotel.latitude && hotel.longitude && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="h-80 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 font-medium">Interactive Map View</p>
                    <p className="text-sm text-gray-400">Lat: {hotel.latitude}, Lng: {hotel.longitude}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities Section */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-playfair">Hotel Amenities</h2>

                {/* Categorize amenities */}
                {Object.entries(
                  hotel.amenities.reduce((acc, amenity) => {
                    const category = amenity.category || 'General';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(amenity);
                    return acc;
                  }, {} as Record<string, typeof hotel.amenities>)
                ).map(([category, items]) => (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all duration-300"
                        >
                          <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            {/* Icon fallback logic */}
                            {amenity.name.toLowerCase().includes('wifi') ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg> :
                              amenity.name.toLowerCase().includes('pool') ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1.45-1.92l-4-1A2 2 0 0013.1 6.32l-3.3 3.3a2 2 0 01-1.4.58H5a2 2 0 00-2 2v2a2 2 0 002 2h2.8a2 2 0 011.4.58l3.3 3.3a2 2 0 002.45.24l4-1A2 2 0 0021 16z" /></svg> :
                                amenity.name.toLowerCase().includes('restaurant') || amenity.name.toLowerCase().includes('dining') ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.253 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.168.477-4.253 1.253" /></svg> :
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            }
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 block">{amenity.name}</span>
                            {amenity.description && (
                              <span className="text-xs text-gray-500 line-clamp-1">{amenity.description}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8 border border-gray-100">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-bold">Starting from</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{hotel.price_category}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  Book Your Stay
                </button>

                <button
                  onClick={() => setShowInquiryForm(true)}
                  className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all active:scale-[0.98]"
                >
                  Send Inquiry
                </button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-green-100 p-1 rounded-full text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Free cancellation available</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="bg-green-100 p-1 rounded-full text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Instant confirmation</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">Expert Assistance</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Need help choosing the right room? Our travel specialists are here to help.
                </p>
                <button className="text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center gap-2">
                  Chat with an expert <Clock size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Hotels Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SimilarHotels countryId={hotel.country_id!} currentHotelId={hotel.id} />
      </div>

      {/* Booking Form Modal */}
      {hotel && (
        <PackageBookingForm
          packageData={{
            id: hotel.id,
            name: hotel.name,
            slug: hotel.slug,
            description: hotel.description || '',
            summary: hotel.summary,
            country: hotel.country as any,
            country_id: hotel.country_id!,
            is_active: hotel.is_active,
            is_published: true,
            is_featured: hotel.is_featured,
            created_at: hotel.created_at,
            updated_at: hotel.updated_at,
          } as any}
          bookingType="hotel"
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            console.log('Hotel booking submitted successfully');
          }}
        />
      )}

      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={showInquiryForm}
        onClose={() => setShowInquiryForm(false)}
        onSuccess={() => {
          console.log('Inquiry submitted successfully');
        }}
        defaultSubject={hotel ? `Inquiry about ${hotel.name}` : ''}
        defaultMessage={hotel ? `I'm interested in staying at ${hotel.name}. Please provide more information about availability and rates.` : ''}
      />
    </div>
  );
};

export default HotelDetailPage;
