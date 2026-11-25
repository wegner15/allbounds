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

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_LOGO = `${SITE_URL}/logo/main_logo.png`;
export const ORGANIZATION_EMAIL = 'bookings@allboundvacations.com';
export const ORGANIZATION_DESCRIPTION =
  'Allbound Vacations is an East African bespoke travel agency and safari tour operator with offices in Kampala, Uganda and Nairobi, Kenya, crafting tailor-made wildlife safaris, gorilla trekking expeditions, luxury lodge stays, and scheduled group trips across Africa and beyond.';

export const ORGANIZATION_SAME_AS = [
  'https://facebook.com/AllboundVacations',
  'https://instagram.com/AllboundVacations',
  'https://twitter.com/AllboundVacations',
  'https://youtube.com/AllboundVacations',
];

export const ORGANIZATION_AREA_SERVED = [
  'Uganda',
  'Kenya',
  'Tanzania',
  'Rwanda',
  'Zanzibar',
  'South Africa',
  'East Africa',
  'Africa',
];

export const ORGANIZATION_OFFICES = [
  {
    name: 'Uganda Office (Kampala)',
    city: 'Kampala',
    country: 'Uganda',
    countryCode: 'UG',
    telephone: '+256-782-594-008',
    displayPhone: '+(256) 782 594 008',
    email: ORGANIZATION_EMAIL,
  },
  {
    name: 'Kenya Office (Nairobi)',
    city: 'Nairobi',
    country: 'Kenya',
    countryCode: 'KE',
    telephone: '+254-723-927-458',
    displayPhone: '+(254) 723 927 458',
    email: ORGANIZATION_EMAIL,
  },
] as const;

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
 * Normalize a relative path or absolute URL into a canonical absolute URL
 * with trailing-slash compliance (and without hash fragments or tracking queries).
 */
export function normalizeCanonicalUrl(urlOrPath: string): string {
  if (!urlOrPath) return `${SITE_URL}/`;

  const withoutHash = urlOrPath.split('#')[0];
  const withoutQuery = withoutHash.split('?')[0].trim();

  if (!withoutQuery || withoutQuery === '/') {
    return `${SITE_URL}/`;
  }

  if (/^https?:\/\//i.test(withoutQuery)) {
    try {
      const parsed = new URL(withoutQuery);
      const normalizedPath = normalizeTrailingSlash(parsed.pathname || '/');
      return `${parsed.origin}${normalizedPath}`;
    } catch {
      return normalizeTrailingSlash(withoutQuery);
    }
  }

  const cleanPath = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  return `${SITE_URL}${normalizeTrailingSlash(cleanPath)}`;
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
