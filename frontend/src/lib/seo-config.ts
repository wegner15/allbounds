/**
 * Central SEO configuration — all SEO-related constants live here.
 * Update this file when the domain, brand name, or social handles change.
 */

export const SITE_URL = 'https://allboundvacations.com';
export const SITE_NAME = 'Allbound Vacations';
export const SITE_TWITTER_HANDLE = '@AllboundVacations';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo/og-default.png`;
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_LOCALE = 'en_US';
export const DEFAULT_DESCRIPTION =
  'Discover extraordinary destinations and create unforgettable travel experiences with Allbound Vacations. Explore tour packages, group trips, hotels, and activities across Africa and beyond.';

/**
 * Build an absolute canonical URL from a relative path.
 * Always returns a fully-qualified URL (never a relative path).
 */
export function buildAbsoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
