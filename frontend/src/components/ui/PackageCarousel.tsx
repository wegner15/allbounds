import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';
import { useActivePackagePriceCharts } from '../../lib/hooks/usePackagePriceCharts';
import type { Package } from '../../lib/types/api';

interface PackageCarouselProps {
  packages: Package[];
  isLoading?: boolean;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

// Component for carousel price display
const CarouselPriceDisplay: React.FC<{ packageId: number; basePrice: number }> = ({ packageId, basePrice }) => {
  const { data: priceCharts } = useActivePackagePriceCharts(packageId);

  const lowestPrice = priceCharts && priceCharts.length > 0
    ? Math.min(...priceCharts.map(chart => chart.price))
    : basePrice;

  return (
    <div className="flex items-center">
      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
      From ${lowestPrice.toFixed(2)}
    </div>
  );
};

const PackageCarousel: React.FC<PackageCarouselProps> = ({
  packages,
  isLoading = false,
  className = '',
  autoPlay = true,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && packages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length);
      }, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval, packages.length]);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="h-64 md:h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-charcoal mb-2"></div>
            <p>Loading featured packages...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packages || packages.length === 0) {
    return (
      <div className={`bg-gray-200 ${className}`}>
        <div className="h-64 md:h-80 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p>No featured packages available</p>
          </div>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + packages.length) % packages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const currentPackage = packages[currentIndex];

  return (
    <div className={`relative overflow-hidden bg-gray-900 ${className}`}>
      {/* Main Package Display */}
      <div className="relative w-full h-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrlWithFallback(currentPackage.image_id, IMAGE_VARIANTS.LARGE)}
            alt={currentPackage.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 md:px-8">
            <div className="max-w-2xl">
              {/* Featured Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-black mb-4">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Featured Package
              </div>

              {/* Package Title */}
              <h2 className="text-2xl md:text-4xl font-playfair font-bold text-white mb-2">
                {currentPackage.name}
              </h2>

              {/* Package Summary */}
              {currentPackage.summary && (
                <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">
                  {currentPackage.summary}
                </p>
              )}

              {/* Package Details */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-white/80 text-sm">
                {currentPackage.country && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentPackage.country.name}
                  </div>
                )}

                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {currentPackage.duration_days} days
                </div>

                <CarouselPriceDisplay packageId={currentPackage.id} basePrice={currentPackage.price} />
              </div>

              {/* CTA Button */}
              <Link
                to={`/packages/${currentPackage.slug}`}
                className="inline-flex items-center px-6 py-3 bg-teal hover:bg-teal-dark text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Package Details
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {packages.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Previous package"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
              aria-label="Next package"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {packages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {packages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to package ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Package Counter */}
        {packages.length > 1 && (
          <div className="absolute top-6 right-6 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentIndex + 1} / {packages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageCarousel;