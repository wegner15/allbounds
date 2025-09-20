/**
 * Utility functions for handling images, particularly Cloudflare Images
 */

// Cloudflare Images delivery URL from environment or fallback
const CLOUDFLARE_DELIVERY_URL = 'https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ';

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
  
  return `${CLOUDFLARE_DELIVERY_URL}/${imageId}/${variant}`;
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
  const cloudflareUrl = getCloudflareImageUrl(imageId, variant);
  
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
