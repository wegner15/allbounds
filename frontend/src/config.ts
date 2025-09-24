// API configuration
export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Other global configuration
export const SITE_NAME = 'AllBounds';
export const SITE_DESCRIPTION = 'Your Ultimate Travel Companion';

// Cloudflare configuration
export const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
export const CLOUDFLARE_IMAGES_DELIVERY_URL = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL || 'https://imagedelivery.net';
