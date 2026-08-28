/**
 * Utility functions for handling images, particularly Cloudflare Images
 */

// Cloudflare Images delivery URL from environment or fallback
const DEFAULT_CLOUDFLARE_DELIVERY_URL = 'https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ';
const CLOUDFLARE_DELIVERY_URL = (import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL || DEFAULT_CLOUDFLARE_DELIVERY_URL).replace(/\/+$/, '');

// Fallback image for missing or failed images (SVG data URL)
export const FALLBACK_IMAGE_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect fill="%23f3f4f6" width="800" height="600"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="400" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';

const normalizeImageId = (imageId: string) => {
  if (imageId.startsWith('cloudflare://')) {
    return imageId.replace('cloudflare://', '');
  }
  return imageId;
};

/**
 * Generate a Cloudflare image URL from an image ID
 * @param imageId - The Cloudflare image ID
 * @param variant - The image variant (default: 'public')
 * @returns The full image URL
 */
export const getCloudflareImageUrl = (imageId: string | null | undefined, variant: string = 'public'): string | null => {
  if (!imageId) {
    return null;
  }
  
  // If imageId is already a full Cloudflare delivery URL, ensure it uses the requested variant
  if (imageId.startsWith('http')) {
    if (imageId.includes('imagedelivery.net')) {
      return imageId.replace(/\/(thumbnail|medium|large|small|public)$/, `/${variant}`);
    }
    return imageId;
  }
  
  return `${CLOUDFLARE_DELIVERY_URL}/${normalizeImageId(imageId)}/${variant}`;
};

/**
 * Get an image URL with fallback to a placeholder
 * @param imageId - The Cloudflare image ID
 * @param variant - The image variant (default: 'public')
 * @param fallbackUrl - Fallback URL if imageId is not available
 * @returns The image URL or fallback
 */
export const DEFAULT_LOCAL_IMAGE = '/home-heros/hero1.jpeg';

export const getImageUrlWithFallback = (
  imageId: string | null | undefined, 
  variant: string = 'public',
  fallbackUrl?: string
): string => {
  const cloudflareUrl = getCloudflareImageUrl(imageId ? normalizeImageId(imageId) : imageId, variant);
  
  if (cloudflareUrl && !cloudflareUrl.includes('source.unsplash.com')) {
    return cloudflareUrl;
  }
  
  // Return fallback if not unsplash, or a local default image
  if (fallbackUrl && !fallbackUrl.includes('unsplash.com')) {
    return fallbackUrl;
  }

  return DEFAULT_LOCAL_IMAGE;
};

/**
 * Available Cloudflare image variants
 */
export const IMAGE_VARIANTS = {
  PUBLIC: 'public',
  THUMBNAIL: 'thumbnail', 
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

export type ImageVariant = typeof IMAGE_VARIANTS[keyof typeof IMAGE_VARIANTS];

/**
 * Get responsive image sizes attribute for different use cases
 * Optimized for mobile-first responsive design with proper breakpoints
 */
export const getResponsiveImageSizes = (context: 'hero' | 'card' | 'thumbnail' | 'gallery' | 'full'): string => {
  switch (context) {
    case 'hero':
      // Hero images: full width on all devices
      return '100vw';
    case 'card':
      // Card images: full width on mobile (< 640px), 50% on tablet (640-1024px), 33% on desktop (> 1024px)
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'thumbnail':
      // Thumbnail images: 80px on mobile, 120px on larger screens
      return '(max-width: 640px) 80px, (max-width: 768px) 96px, 120px';
    case 'gallery':
      // Gallery images: full width on mobile, 50% on tablet, max 800px on desktop
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px';
    case 'full':
      // Full-width images
      return '100vw';
    default:
      return '100vw';
  }
};

/**
 * Get the appropriate variant based on the context and viewport
 * Optimized for responsive design with proper variant selection
 */
export const getVariantForContext = (
  context: 'hero' | 'card' | 'thumbnail' | 'gallery' | 'full',
  isMobile: boolean = false
): ImageVariant => {
  if (context === 'thumbnail') return IMAGE_VARIANTS.THUMBNAIL;
  if (context === 'hero') return isMobile ? IMAGE_VARIANTS.MEDIUM : IMAGE_VARIANTS.LARGE;
  if (context === 'card') return IMAGE_VARIANTS.MEDIUM;
  if (context === 'gallery') return IMAGE_VARIANTS.LARGE;
  if (context === 'full') return IMAGE_VARIANTS.LARGE;
  return IMAGE_VARIANTS.MEDIUM;
};

/**
 * Detect if the current viewport is mobile
 * Uses window.matchMedia for accurate detection
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 768px)').matches;
};

/**
 * Detect if the current viewport is tablet
 */
export const isTabletViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 769px) and (max-width: 1024px)').matches;
};

/**
 * Detect if the current viewport is desktop
 */
export const isDesktopViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(min-width: 1025px)').matches;
};
