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
  
  // If imageId is already a full URL, return it as is
  if (imageId.startsWith('http')) {
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
export const getImageUrlWithFallback = (
  imageId: string | null | undefined, 
  variant: string = 'public',
  fallbackUrl?: string
): string => {
  const cloudflareUrl = getCloudflareImageUrl(imageId ? normalizeImageId(imageId) : imageId, variant);
  
  if (cloudflareUrl) {
    return cloudflareUrl;
  }
  
  // Return fallback or a default placeholder
  return fallbackUrl || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
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
 */
export const getResponsiveImageSizes = (context: 'hero' | 'card' | 'thumbnail' | 'gallery' | 'full'): string => {
  switch (context) {
    case 'hero':
      return '100vw';
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'thumbnail':
      return '(max-width: 640px) 80px, 120px';
    case 'gallery':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px';
    case 'full':
      return '100vw';
    default:
      return '100vw';
  }
};

/**
 * Get the appropriate variant based on the context and viewport
 */
export const getVariantForContext = (
  context: 'hero' | 'card' | 'thumbnail' | 'gallery' | 'full',
  isMobile: boolean = false
): ImageVariant => {
  if (context === 'thumbnail') return IMAGE_VARIANTS.THUMBNAIL;
  if (context === 'hero') return IMAGE_VARIANTS.LARGE;
  if (context === 'card') return isMobile ? IMAGE_VARIANTS.MEDIUM : IMAGE_VARIANTS.MEDIUM;
  if (context === 'gallery') return IMAGE_VARIANTS.LARGE;
  return IMAGE_VARIANTS.MEDIUM;
};
