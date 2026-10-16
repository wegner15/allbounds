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
  'Discover extraordinary destinations with Allbound Vacations. Explore curated safari packages, luxury stays, and unforgettable group trips across Africa and beyond.';

/**
 * Ensure a URL or pathname ends with a trailing slash (unless it targets a file with an extension).
 */
export function normalizeTrailingSlash(urlOrPath: string): string {
  if (!urlOrPath) return '/';

  const [baseAndQuery, hash] = urlOrPath.split('#');
  const [base, query] = baseAndQuery.split('?');

  const lastSegment = base.split('/').pop() || '';
  const hasFileExtension = /\.[a-z0-9]+$/i.test(lastSegment);

  let normalizedBase = base;
  if (!hasFileExtension && !normalizedBase.endsWith('/')) {
    normalizedBase = `${normalizedBase}/`;
  }

  let result = normalizedBase;
  if (query !== undefined) {
    result += `?${query}`;
  }
  if (hash !== undefined) {
    result += `#${hash}`;
  }
  return result;
}

/**
 * Build an absolute canonical URL from a relative path or full URL.
 * Always returns a fully-qualified URL with trailing slash compliance.
 */
export function buildAbsoluteUrl(path: string): string {
  const normalized = normalizeTrailingSlash(path);
  if (/^https?:\/\//i.test(normalized)) return normalized;
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${SITE_URL}${cleanPath}`;
}

