/**
 * Utility functions for handling Cloudflare Images
 */

export type CloudflareImageVariant = 'thumbnail' | 'small' | 'medium' | 'large' | 'public';

/**
 * Converts a Cloudflare image ID to a full delivery URL
 * @param imageId The Cloudflare image ID
 * @param variant The image variant/size to use
 * @returns The full Cloudflare delivery URL
 */
export const getCloudflareImageUrl = (
  imageId: string | null | undefined,
  variant: CloudflareImageVariant = 'medium'
): string => {
  if (!imageId) {
    return '';
  }

  // If it's already a full URL, return it
  if (imageId.startsWith('http')) {
    return imageId;
  }

  // Otherwise construct the Cloudflare delivery URL
  return `${import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL}/${imageId}/${variant}`;
};

/**
 * Determines if a string is a Cloudflare image ID
 * @param str The string to check
 * @returns True if the string appears to be a Cloudflare image ID
 */
export const isCloudflareImageId = (str: string | null | undefined): boolean => {
  if (!str) return false;
  
  // Cloudflare image IDs typically have this format: "fd3acee5-4dc5-48c8-06f5-5e222528d000"
  // They are UUID-like strings with hyphens
  return !str.startsWith('http') && 
         str.includes('-') && 
         str.length > 20;
};

/**
 * Gets the appropriate image URL for an entity that might have different image fields
 * @param entity The entity object that might have image_id, cover_image, or other image fields
 * @param fallbackUrl A fallback URL to use if no image is found
 * @returns The best available image URL
 */
export const DEFAULT_FALLBACK_IMAGE = '/home-heros/hero1.jpeg';

export const getEntityImageUrl = (
  entity: unknown,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): string => {
  const safeFallback = fallbackUrl && !fallbackUrl.includes('unsplash.com') ? fallbackUrl : DEFAULT_FALLBACK_IMAGE;

  // Try cover_image first (might be a Cloudflare ID or full URL)
  if ((entity as any)?.cover_image) {
    const cover = (entity as any).cover_image;
    if (isCloudflareImageId(cover)) {
      return getCloudflareImageUrl(cover, 'medium');
    }
    if (typeof cover === 'string' && !cover.includes('source.unsplash.com')) {
      return cover;
    }
  }

  // Then try image_id
  if ((entity as any)?.image_id) {
    const imgId = (entity as any).image_id;
    if (isCloudflareImageId(imgId)) {
      return getCloudflareImageUrl(imgId, 'medium');
    }
    if (typeof imgId === 'string' && !imgId.includes('source.unsplash.com')) {
      return imgId;
    }
  }
  
  // Finally use the fallback
  return safeFallback;
};
