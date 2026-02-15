import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHotelBySlug } from '../../../lib/hooks/useHotels';
import PackageBookingForm from '../../../components/forms/PackageBookingForm';
import InquiryForm from '../../../components/forms/InquiryForm';
import Breadcrumb from '../../../components/layout/Breadcrumb';
import GridGallery from '../../../components/ui/GridGallery';
import { MapPin, Star, Clock, DollarSign } from 'lucide-react';

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
              { label: 'Hotels', path: '/hotels' },
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
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {hotel.description}
                </p>
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
