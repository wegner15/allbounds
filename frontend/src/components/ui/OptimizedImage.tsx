import React, { useState, useEffect, useRef } from 'react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

export type ImageVariant = 'thumbnail' | 'medium' | 'large' | 'public';

interface OptimizedImageProps {
  imageId: string | null | undefined;
  alt: string;
  variant?: ImageVariant;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  aspectRatio?: string;
  showSkeleton?: boolean;
  fallbackUrl?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  priority?: boolean;
}

/**
 * OptimizedImage component with lazy loading, skeleton loading states, and Cloudflare image optimization
 * 
 * Features:
 * - Lazy loading by default (can be overridden with loading="eager")
 * - Loading skeleton with shimmer effect
 * - Automatic fallback to placeholder image
 * - Cloudflare image variants for responsive sizes
 * - Intersection Observer for lazy loading
 * - Responsive image sizes
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  imageId,
  alt,
  variant = 'medium',
  className = '',
  objectFit = 'cover',
  loading = 'lazy',
  aspectRatio,
  showSkeleton = true,
  fallbackUrl,
  onLoad,
  onError,
  sizes,
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority || loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, loading]);

  const imageUrl = getImageUrlWithFallback(imageId, variant, fallbackUrl);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const skeletonClasses = `
    absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 
    animate-shimmer bg-[length:200%_100%]
  `;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Loading Skeleton */}
      {showSkeleton && isLoading && !hasError && (
        <div className={skeletonClasses} aria-label="Loading image">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-300 animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className={`w-full h-full transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ objectFit }}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
        />
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <svg
            className="w-12 h-12 mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
