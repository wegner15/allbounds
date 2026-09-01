import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
  CalendarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import Breadcrumb from '../layout/Breadcrumb';
import OptimizedImage from '../ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../utils/imageUtils';
import type {
  PackageDetailResponse,
  MediaAssetSummary,
  HolidayTypeSummary
} from '../../lib/types/api';

interface HeroSectionProps {
  packageData: PackageDetailResponse;
  onBookNowClick: () => void;
  onDownloadBrochureClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ packageData, onBookNowClick, onDownloadBrochureClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Prepare images array - use media_assets if available, otherwise fallback to image_id
  const images: MediaAssetSummary[] = packageData.media_assets && packageData.media_assets.length > 0
    ? packageData.media_assets
    : packageData.image_id
      ? [{
        id: 0,
        image_id: packageData.image_id,
        title: packageData.name,
        alt_text: packageData.name,
        order_index: 0
      }]
      : [];

  const hasMultipleImages = images.length > 1;

  // Calculate lowest price from price charts or use base price
  const lowestPrice = React.useMemo(() => {
    if (packageData.price_charts && packageData.price_charts.length > 0) {
      const activePrices = packageData.price_charts
        .filter(chart => chart.is_active)
        .map(chart => chart.price);

      if (activePrices.length > 0) {
        return Math.min(...activePrices);
      }
    }
    return packageData.price || 0;
  }, [packageData.price_charts, packageData.price]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Auto-play carousel
  React.useEffect(() => {
    if (hasMultipleImages) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 6000); // 6 seconds between transitions
      return () => clearInterval(interval);
    }
  }, [hasMultipleImages, images.length]);

  const currentImage = images[currentImageIndex];

  return (
    <header className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden" role="banner" aria-label="Tour package hero">
      {/* Image Carousel - Horizontal Sliding Gallery */}
      <div className="absolute inset-0 overflow-hidden">
        {images.length > 0 ? (
          <>
            {/* Sliding container */}
            <div
              className="flex h-full transition-transform duration-1000 ease-out"
              style={{
                transform: `translateX(-${currentImageIndex * 100}%)`,
              }}
            >
              {images.map((image, index) => {
                // Get image ID from either image_id or storage_key
                const imageId = image.image_id || image.storage_key;

                return (
                  <div
                    key={imageId || index}
                    className="relative flex-shrink-0 w-full h-full"
                  >
                    <OptimizedImage
                      imageId={imageId}
                      alt={image.alt_text || packageData.name}
                      variant="large"
                      className="w-full h-full"
                      objectFit="cover"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      showSkeleton={index === 0}
                      sizes={getResponsiveImageSizes('hero')}
                    />

                    {/* Image Caption */}
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                        <p className="text-white text-sm md:text-base text-center drop-shadow-lg">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 z-10 backdrop-blur-sm shadow-lg"
                  aria-label="Previous image"
                >
                  <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 z-10 backdrop-blur-sm shadow-lg"
                  aria-label="Next image"
                >
                  <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {hasMultipleImages && (
              <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex
                      ? 'bg-white w-8 shadow-md'
                      : 'bg-white/50 hover:bg-white/75 w-2'
                      }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium z-10 shadow-lg">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 gradient-overlay-dark" />

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-end z-10">

        {/* Hero Content */}
        <div className="max-w-[1600px] mx-auto px-4 pb-6 md:pb-12">

          {/* Tour Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-3 leading-tight animate-slide-up drop-shadow-lg tracking-tight">
            {packageData.name}
          </h1>


          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white animate-fade-in">
            {/* Country */}
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/20">
              <MapPinIcon className="w-5 h-5 text-white/90" />
              <span className="text-sm md:text-base font-medium">
                {packageData.country.name}
              </span>
            </div>

            {/* Duration */}
            {packageData.duration_days && (
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20 transition-all duration-200 hover:bg-white/20">
                <CalendarIcon className="w-5 h-5 text-white/90" />
                <span className="text-sm md:text-base font-medium">
                  {packageData.duration_days} {packageData.duration_days === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            )}

            {/* Price */}
            {lowestPrice > 0 && (
              <div className="flex items-center space-x-2 bg-accent/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-accent-light/30 transition-all duration-200 hover:bg-accent shadow-lg">
                <CurrencyDollarIcon className="w-5 h-5 text-white" />
                <span className="text-sm md:text-base font-semibold">
                  From ${lowestPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* Download PDF Brochure Button */}
            {onDownloadBrochureClick && (
              <button
                type="button"
                onClick={onDownloadBrochureClick}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/40 text-white font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg ml-auto"
                aria-label="Download PDF brochure"
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-amber-300" />
                <span>Download Brochure (PDF)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating "Book Now" Button (Mobile Only) */}
      <button
        onClick={onBookNowClick}
        className="md:hidden fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full shadow-2xl font-semibold text-sm z-50 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-primary/50 animate-fade-in"
        aria-label="Book this tour"
      >
        Book Now
      </button>
    </header>
  );
};

export default HeroSection;
