import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAttraction } from '../../../lib/hooks/useAttractions';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';
import ImageCarousel from '../../../components/ui/ImageCarousel';

const AttractionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: attraction, isLoading, error } = useAttraction(parseInt(id!));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!attraction || getAllImages().length <= 1) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          setSelectedImageIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          event.preventDefault();
          setSelectedImageIndex(prev => Math.min(getAllImages().length - 1, prev + 1));
          break;
        case 'Home':
          event.preventDefault();
          setSelectedImageIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setSelectedImageIndex(getAllImages().length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [attraction, selectedImageIndex]);

  // Reset selected image when attraction changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [attraction?.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };



  // Get all available images for the gallery
  const getAllImages = () => {
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

    if (attraction?.gallery_images) {
      images.push(...attraction.gallery_images.map(img => ({ ...img, filename: img.file_path })));
    }

    if (attraction?.cover_image) {
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Attraction not found</h2>
          <p className="text-gray-600 mb-6">The attraction you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/attractions"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Back to Attractions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  <svg className="flex-shrink-0 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  <span className="sr-only">Home</span>
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/attractions" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Attractions
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-500" aria-current="page">
                    {attraction.name}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImageCarousel images={getAllImages()} className="rounded-2xl overflow-hidden shadow-2xl" />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {attraction.name}
              </h1>

              {(attraction.city || attraction.address) && (
                <div className="flex items-center text-gray-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {attraction.city || attraction.address}
                  {attraction.country && `, ${attraction.country.name}`}
                </div>
              )}
            </div>


            {/* Description */}
            {attraction.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Attraction</h2>
                <p className="text-gray-600 leading-relaxed">
                  {attraction.description}
                </p>
              </div>
            )}

            {/* Attraction Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Visitor Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {attraction.opening_hours && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Opening Hours</span>
                      <p className="text-sm text-gray-600">{attraction.opening_hours}</p>
                    </div>
                  </div>
                )}

                {attraction.price !== undefined && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Entry Fee</span>
                      <p className="text-sm text-gray-600">
                        {attraction.price === 0 ? 'Free' : formatPrice(attraction.price)}
                      </p>
                    </div>
                  </div>
                )}

                {attraction.latitude && attraction.longitude && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <div>
                      <span className="text-sm font-medium text-gray-900">Coordinates</span>
                      <p className="text-sm text-gray-600">{attraction.latitude}, {attraction.longitude}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Map Placeholder */}
            {attraction.latitude && attraction.longitude && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p className="text-gray-500">Interactive map would be displayed here</p>
                    <p className="text-sm text-gray-400">Lat: {attraction.latitude}, Lng: {attraction.longitude}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
              {attraction.price && (
                <div className="mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(attraction.price)}
                  </div>
                  <div className="text-sm text-gray-600">entry fee</div>
                </div>
              )}

              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mb-4">
                Get Directions
              </button>

              <button className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors mb-6">
                Add to Itinerary
              </button>

              <div className="text-sm text-gray-600">
                <p className="mb-2">✓ Family-friendly</p>
                <p className="mb-2">✓ Wheelchair accessible</p>
                <p className="mb-2">✓ Photography allowed</p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Plan your visit</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Get personalized recommendations and travel tips for this attraction.
                </p>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Contact us →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttractionDetailPage;
