import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { MapPin } from 'lucide-react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import type { CountryWithDetails, MediaAsset } from '../../../lib/types/api';

interface DestinationOverviewSectionProps {
  country: CountryWithDetails;
}

const DestinationOverviewSection: React.FC<DestinationOverviewSectionProps> = React.memo(({ country }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const mediaAssets = country.media_assets || [];

  // Calculate word count for description
  const getWordCount = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.trim().split(/\s+/).length;
  };

  const wordCount = country.description ? getWordCount(country.description) : 0;
  const shouldShowReadMore = wordCount > 300; // Lowered for 2-column layout

  // Sanitize HTML content
  const sanitizedDescription = country.description
    ? DOMPurify.sanitize(country.description, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'style', 'class']
    })
    : '';

  const handleOpenLightbox = (index: number) => {
    setSelectedAssetIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = () => {
    setSelectedAssetIndex(null);
    document.body.style.overflow = 'auto';
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAssetIndex !== null) {
      setSelectedAssetIndex((selectedAssetIndex - 1 + mediaAssets.length) % mediaAssets.length);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedAssetIndex !== null) {
      setSelectedAssetIndex((selectedAssetIndex + 1) % mediaAssets.length);
    }
  };

  const handleCarouselPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev - 1 + mediaAssets.length) % mediaAssets.length);
  };

  const handleCarouselNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIndex((prev) => (prev + 1) % mediaAssets.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const isVideo = (asset: MediaAsset) => {
    return asset.content_type?.startsWith('video/') || asset.file_path.endsWith('.mp4');
  };

  const getThumbnailUrl = (asset: MediaAsset) => {
    return asset.url || asset.file_path;
  };

  return (
    <section aria-label="Destination overview">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Description */}
        <div className={`${mediaAssets.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900">
              About {country.name}
            </h2>

            {/* Region Information */}
            {country.region && (
              <Link
                to={`/regions/${country.region.slug}`}
                className="text-primary-600 hover:text-primary-700 transition-colors duration-200 flex items-center gap-2 text-sm md:text-base font-medium"
                aria-label={`View ${country.region.name} region`}
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                <span>{country.region.name}</span>
              </Link>
            )}
          </div>

          {/* Description Content */}
          {sanitizedDescription ? (
            <div className="relative">
              <div
                className={`prose prose-sm md:prose-base max-w-none text-gray-700 leading-relaxed ${shouldShowReadMore && !isExpanded ? 'line-clamp-[15]' : ''
                  }`}
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />

              {/* Read More Button */}
              {shouldShowReadMore && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200 flex items-center gap-2 min-h-[44px] text-sm md:text-base"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Show less content' : 'Show more content'}
                  >
                    {isExpanded ? 'Read Less' : 'Read More'}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm md:text-base text-gray-600 italic">
              No description available for this destination.
            </p>
          )}
        </div>

        {mediaAssets.length > 0 && (
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl h-[400px] md:h-[500px] group shadow-lg">
              {/* Carousel Image */}
              <div
                className="w-full h-full cursor-pointer relative"
                onClick={() => handleOpenLightbox(currentSlideIndex)}
              >
                <img
                  src={getThumbnailUrl(mediaAssets[currentSlideIndex])}
                  alt={mediaAssets[currentSlideIndex].alt_text || `${country.name} gallery image ${currentSlideIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay with matching rounded corners */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  {isVideo(mediaAssets[currentSlideIndex]) ? (
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <PlayIcon className="w-8 h-8 text-primary-600 ml-1" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                      <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Image Count Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 z-10">
                  {currentSlideIndex + 1} / {mediaAssets.length}
                </div>
              </div>

              {/* Navigation Arrows */}
              {mediaAssets.length > 1 && (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 z-20"
                    onClick={handleCarouselPrev}
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-900 rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 z-20"
                    onClick={handleCarouselNext}
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {mediaAssets.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          goToSlide(index);
                        }}
                        className={`transition-all duration-300 rounded-full shadow-sm ${index === currentSlideIndex
                            ? 'w-8 h-2 bg-white'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                          }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500 text-center italic">
              {mediaAssets.length > 1 ? `Browse ${mediaAssets.length} photos and videos` : 'Click to view full size'}
            </p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedAssetIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseLightbox}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2"
            onClick={handleCloseLightbox}
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {mediaAssets.length > 1 && (
            <>
              <button
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
                onClick={handlePrev}
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              <button
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-3 bg-white/10 hover:bg-white/20 rounded-full"
                onClick={handleNext}
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="max-w-7xl w-full max-h-full flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {isVideo(mediaAssets[selectedAssetIndex]) ? (
              <video
                src={mediaAssets[selectedAssetIndex].url || mediaAssets[selectedAssetIndex].file_path}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
              />
            ) : (
              <img
                src={mediaAssets[selectedAssetIndex].url || mediaAssets[selectedAssetIndex].file_path}
                alt={mediaAssets[selectedAssetIndex].alt_text || country.name}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            )}

            {(mediaAssets[selectedAssetIndex].title || mediaAssets[selectedAssetIndex].caption) && (
              <div className="mt-6 text-center text-white max-w-3xl">
                {mediaAssets[selectedAssetIndex].title && (
                  <h3 className="text-xl font-bold mb-2">{mediaAssets[selectedAssetIndex].title}</h3>
                )}
                {mediaAssets[selectedAssetIndex].caption && (
                  <p className="text-white/80">{mediaAssets[selectedAssetIndex].caption}</p>
                )}
              </div>
            )}

            <div className="mt-4 text-white/50 text-sm">
              {selectedAssetIndex + 1} / {mediaAssets.length}
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

DestinationOverviewSection.displayName = 'DestinationOverviewSection';

export default DestinationOverviewSection;
