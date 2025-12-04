import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Image as ImageIcon } from 'lucide-react';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

interface DestinationImageProps {
  imageId?: string | null;
  alt: string;
  variant?: keyof typeof IMAGE_VARIANTS;
  className?: string;
  fallbackType?: 'gradient' | 'icon';
  gradientColors?: string[];
  enableBlurUp?: boolean;
  lazyLoad?: boolean;
}

export const DestinationImage: React.FC<DestinationImageProps> = React.memo(({
  imageId,
  alt,
  variant = 'MEDIUM',
  className = '',
  fallbackType = 'gradient',
  gradientColors = ['from-primary/80', 'to-primary-dark'],
  enableBlurUp = true,
  lazyLoad = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazyLoad);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isInView) return;

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
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, isInView]);

  // If no image ID or image failed to load, show fallback
  if (!imageId || imageError) {
    if (fallbackType === 'icon') {
      return (
        <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      );
    }

    // Gradient fallback
    return (
      <div className={`bg-gradient-to-br ${gradientColors.join(' ')} flex items-center justify-center ${className}`}>
        <MapPin className="w-16 h-16 text-white/80" />
      </div>
    );
  }

  const imageUrl = getImageUrlWithFallback(imageId, IMAGE_VARIANTS[variant]);
  const thumbnailUrl = enableBlurUp && imageId 
    ? getImageUrlWithFallback(imageId, IMAGE_VARIANTS.THUMBNAIL)
    : undefined;

  return (
    <div className={`relative ${className}`} ref={imgRef}>
      {/* Blur-up placeholder - tiny thumbnail */}
      {enableBlurUp && thumbnailUrl && isLoading && isInView && (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Main Image - only load when in view */}
      {isInView && (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
          loading="lazy"
        />
      )}
    </div>
  );
});

DestinationImage.displayName = 'DestinationImage';

// Card Image Component with consistent aspect ratio
interface CardImageProps {
  imageId?: string | null;
  alt: string;
  variant?: keyof typeof IMAGE_VARIANTS;
  aspectRatio?: 'square' | 'video' | 'wide' | 'portrait';
  fallbackType?: 'gradient' | 'icon';
  enableBlurUp?: boolean;
}

export const CardImage: React.FC<CardImageProps> = React.memo(({
  imageId,
  alt,
  variant = 'MEDIUM',
  aspectRatio = 'video',
  fallbackType = 'gradient',
  enableBlurUp = true
}) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  };

  return (
    <DestinationImage
      imageId={imageId}
      alt={alt}
      variant={variant}
      className={aspectClasses[aspectRatio]}
      fallbackType={fallbackType}
      enableBlurUp={enableBlurUp}
      lazyLoad={true}
    />
  );
});

CardImage.displayName = 'CardImage';

// Hero Image Component with gradient overlay
interface HeroImageProps {
  imageId?: string | null;
  alt: string;
  overlayOpacity?: number;
  enableBlurUp?: boolean;
}

export const HeroImage: React.FC<HeroImageProps> = React.memo(({
  imageId,
  alt,
  overlayOpacity = 60,
  enableBlurUp = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fallback gradient for hero
  if (!imageId || imageError) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-secondary">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="w-24 h-24 text-white/30" />
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrlWithFallback(imageId, IMAGE_VARIANTS.LARGE);
  const thumbnailUrl = enableBlurUp 
    ? getImageUrlWithFallback(imageId, IMAGE_VARIANTS.THUMBNAIL)
    : undefined;

  return (
    <>
      {/* Blur-up placeholder - tiny thumbnail */}
      {enableBlurUp && thumbnailUrl && isLoading && (
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
      )}
      
      {/* Hero Image - eager loading for above-the-fold content */}
      <img
        src={imageUrl}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        fetchPriority="high"
      />
      
      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black to-transparent"
        style={{ opacity: overlayOpacity / 100 }}
      />
    </>
  );
});

HeroImage.displayName = 'HeroImage';

// Thumbnail Image Component
interface ThumbnailImageProps {
  imageId?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = React.memo(({
  imageId,
  alt,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };

  return (
    <DestinationImage
      imageId={imageId}
      alt={alt}
      variant="THUMBNAIL"
      className={`${sizeClasses[size]} rounded-lg`}
      fallbackType="icon"
      enableBlurUp={false}
      lazyLoad={true}
    />
  );
});

ThumbnailImage.displayName = 'ThumbnailImage';

export default DestinationImage;
