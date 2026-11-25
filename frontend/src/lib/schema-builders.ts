/**
 * Shared Unified `@graph` JSON-LD Schema Builders for Allbound Vacations.
 *
 * Every builder emits a single `@context: "https://schema.org"` object with a
 * `@graph` array anchored to `@id: "https://allboundvacations.com/#organization"`
 * and normalized trailing-slash canonical URLs.
 */

import {
  SITE_URL,
  SITE_NAME,
  ORGANIZATION_ID,
  WEBSITE_ID,
  ORGANIZATION_LOGO,
  ORGANIZATION_EMAIL,
  ORGANIZATION_DESCRIPTION,
  ORGANIZATION_SAME_AS,
  ORGANIZATION_AREA_SERVED,
  normalizeCanonicalUrl,
} from './seo-config';

export { normalizeCanonicalUrl };

export type JsonLdNode = Record<string, unknown>;

export interface JsonLdGraph {
  '@context': 'https://schema.org';
  '@graph': JsonLdNode[];
  [key: string]: unknown;
}

export interface BreadcrumbItemInput {
  name: string;
  url?: string;
}

export interface RatingInput {
  ratingValue: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export interface ReviewInput {
  authorName: string;
  ratingValue: number;
  reviewBody?: string;
  datePublished?: string;
  title?: string;
}

export interface FaqInput {
  question: string;
  answer: string;
}

export interface PriceChartInput {
  title?: string;
  price?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  night_rates?: Array<{
    nights?: number;
    price?: number | null;
    room_type?: string | null;
    is_active?: boolean;
  }>;
}

export interface ItineraryItemInput {
  day_number?: number;
  title?: string;
  description?: string | null;
  location?: string | null;
}

export interface DepartureInput {
  start_date: string;
  end_date?: string | null;
  price?: number | null;
  available_slots?: number | null;
  is_active?: boolean;
}

export interface AuthorInput {
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  job_title?: string | null;
  avatar_url?: string | null;
  credentials?: string | null;
  same_as?: string[] | null;
  url?: string | null;
}

export interface OrganizationGraphInput {
  aggregateRating?: RatingInput;
}

export interface PackageGraphInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  country?: { name: string; slug?: string } | null;
  price?: number | null;
  priceCharts?: PriceChartInput[] | null;
  currency?: string;
  durationDays?: number | null;
  itinerary?: ItineraryItemInput[] | null;
  holidayTypes?: Array<{ name: string } | string> | null;
  inclusions?: Array<{ name?: string; title?: string } | string> | null;
  aggregateRating?: RatingInput | null;
  reviews?: ReviewInput[] | null;
  faqs?: FaqInput[] | null;
  dateModified?: string | null;
  datePublished?: string | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface GroupTripGraphInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  country?: { name: string; slug?: string } | null;
  price?: number | null;
  priceCharts?: PriceChartInput[] | null;
  currency?: string;
  durationDays?: number | null;
  maxParticipants?: number | null;
  departures?: DepartureInput[] | null;
  itinerary?: ItineraryItemInput[] | null;
  holidayTypes?: Array<{ name: string } | string> | null;
  aggregateRating?: RatingInput | null;
  reviews?: ReviewInput[] | null;
  dateModified?: string | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface HotelGraphInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  country?: { name: string; slug?: string; code?: string | null } | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  stars?: number | null;
  priceCategory?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  amenities?: Array<{ name: string } | string> | null;
  priceCharts?: PriceChartInput[] | null;
  currency?: string;
  aggregateRating?: RatingInput | null;
  reviews?: ReviewInput[] | null;
  dateModified?: string | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface AttractionGraphInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  country?: { name: string; slug?: string; code?: string | null } | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: string | null;
  price?: number | null;
  currency?: string;
  isAccessibleForFree?: boolean;
  touristType?: string[];
  aggregateRating?: RatingInput | null;
  reviews?: ReviewInput[] | null;
  dateModified?: string | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface CountryGraphInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  region?: { name: string; slug?: string } | null;
  attractions?: Array<{ name: string; slug?: string; description?: string | null }> | null;
  faqs?: FaqInput[] | null;
  dateModified?: string | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface BlogPostingGraphInput {
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  image?: string | string[] | null;
  canonicalPath?: string;
  datePublished?: string | null;
  dateModified?: string | null;
  author?: AuthorInput | null;
  tags?: Array<{ name: string } | string> | null;
  packages?: Array<{
    name: string;
    slug: string;
    country?: { slug?: string; name?: string } | null;
  }> | null;
  breadcrumbs?: BreadcrumbItemInput[];
}

export interface CollectionItemInput {
  name: string;
  url: string;
  description?: string | null;
  image?: string | null;
}

export interface CollectionPageGraphInput {
  name: string;
  description?: string | null;
  canonicalPath: string;
  items?: CollectionItemInput[] | null;
  breadcrumbs?: BreadcrumbItemInput[];
  dateModified?: string | null;
}

export interface StaticPageGraphInput {
  name?: string;
  description?: string;
  canonicalPath?: string;
  breadcrumbs?: BreadcrumbItemInput[];
}

const COUNTRY_NAME_TO_ISO2: Record<string, string> = {
  uganda: 'UG',
  kenya: 'KE',
  tanzania: 'TZ',
  rwanda: 'RW',
  zanzibar: 'TZ',
  burundi: 'BI',
  ethiopia: 'ET',
  'south africa': 'ZA',
  botswana: 'BW',
  namibia: 'NA',
  zimbabwe: 'ZW',
  zambia: 'ZM',
  malawi: 'MW',
  mozambique: 'MZ',
  madagascar: 'MG',
  mauritius: 'MU',
  seychelles: 'SC',
  egypt: 'EG',
  morocco: 'MA',
  'united arab emirates': 'AE',
  dubai: 'AE',
  uae: 'AE',
  qatar: 'QA',
  oman: 'OM',
  jordan: 'JO',
  turkey: 'TR',
  greece: 'GR',
  italy: 'IT',
  france: 'FR',
  spain: 'ES',
  thailand: 'TH',
  indonesia: 'ID',
  maldives: 'MV',
  'sri lanka': 'LK',
  india: 'IN',
  singapore: 'SG',
  malaysia: 'MY',
  'united kingdom': 'GB',
  'united states': 'US',
};

function stripHtml(value?: string | null): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

function cleanObject<T extends JsonLdNode>(obj: T): JsonLdNode {
  const result: JsonLdNode = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      const filtered = value.filter((item) => item !== undefined && item !== null && item !== '');
      if (filtered.length === 0) continue;
      result[key] = filtered;
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function resolveIso2CountryCode(country?: { name?: string; slug?: string; code?: string | null } | null): string | undefined {
  if (!country) return undefined;
  if (country.code && /^[A-Za-z]{2}$/.test(country.code.trim())) {
    return country.code.trim().toUpperCase();
  }
  const byName = country.name ? COUNTRY_NAME_TO_ISO2[country.name.trim().toLowerCase()] : undefined;
  if (byName) return byName;
  const bySlug = country.slug ? COUNTRY_NAME_TO_ISO2[country.slug.trim().toLowerCase().replace(/-/g, ' ')] : undefined;
  if (bySlug) return bySlug;
  return undefined;
}

function normalizeImageField(image?: string | string[] | null): string | string[] | undefined {
  if (!image) return undefined;
  if (Array.isArray(image)) {
    const valid = image.filter(Boolean);
    if (valid.length === 0) return undefined;
    return valid.length === 1 ? valid[0] : valid;
  }
  return image;
}

function buildAggregateRatingNode(rating?: RatingInput | null): JsonLdNode | undefined {
  if (!rating || !rating.ratingValue || !rating.reviewCount || rating.reviewCount <= 0) {
    return undefined;
  }
  return {
    '@type': 'AggregateRating',
    ratingValue: Number(rating.ratingValue.toFixed(1)),
    reviewCount: rating.reviewCount,
    bestRating: rating.bestRating ?? 5,
    worstRating: rating.worstRating ?? 1,
  };
}

function buildReviewNodes(reviews?: ReviewInput[] | null): JsonLdNode[] | undefined {
  if (!reviews || reviews.length === 0) return undefined;
  const nodes = reviews
    .filter((r) => r && r.authorName && r.ratingValue)
    .slice(0, 10)
    .map((r) =>
      cleanObject({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.authorName },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
        name: r.title,
        reviewBody: stripHtml(r.reviewBody),
        datePublished: r.datePublished,
      })
    );
  return nodes.length > 0 ? nodes : undefined;
}

function buildFaqPageNode(faqs?: FaqInput[] | null, pageUrl?: string): JsonLdNode | undefined {
  if (!faqs || faqs.length === 0) return undefined;
  const mainEntity = faqs
    .map((faq) => {
      const q = stripHtml(faq.question);
      const a = stripHtml(faq.answer);
      if (!q || !a) return null;
      return {
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      };
    })
    .filter(Boolean);

  if (mainEntity.length === 0) return undefined;

  return cleanObject({
    '@type': 'FAQPage',
    '@id': pageUrl ? `${pageUrl}#faq` : undefined,
    mainEntity,
  });
}

function collectChartPrices(basePrice?: number | null, priceCharts?: PriceChartInput[] | null): number[] {
  const prices: number[] = [];
  if (typeof basePrice === 'number' && basePrice > 0) {
    prices.push(basePrice);
  }
  if (priceCharts && priceCharts.length > 0) {
    for (const chart of priceCharts) {
      if (chart.is_active === false) continue;
      if (typeof chart.price === 'number' && chart.price > 0) {
        prices.push(chart.price);
      }
      if (chart.night_rates && chart.night_rates.length > 0) {
        for (const nr of chart.night_rates) {
          if (nr.is_active === false) continue;
          if (typeof nr.price === 'number' && nr.price > 0) {
            prices.push(nr.price);
          }
        }
      }
    }
  }
  return prices;
}

function buildAggregateOfferNode(
  url: string,
  basePrice?: number | null,
  priceCharts?: PriceChartInput[] | null,
  currency = 'USD'
): JsonLdNode | undefined {
  const prices = collectChartPrices(basePrice, priceCharts);
  if (prices.length === 0) return undefined;

  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);
  const activeCharts = (priceCharts || []).filter((c) => c.is_active !== false && typeof c.price === 'number' && c.price > 0);

  if (activeCharts.length > 1 || highPrice > lowPrice) {
    return cleanObject({
      '@type': 'AggregateOffer',
      priceCurrency: currency,
      lowPrice,
      highPrice,
      offerCount: Math.max(activeCharts.length, prices.length),
      availability: 'https://schema.org/InStock',
      url,
      offers: activeCharts.slice(0, 12).map((chart) =>
        cleanObject({
          '@type': 'Offer',
          name: chart.title,
          price: chart.price,
          priceCurrency: currency,
          validFrom: chart.start_date || undefined,
          validThrough: chart.end_date || undefined,
          availability: 'https://schema.org/InStock',
          url,
        })
      ),
    });
  }

  return cleanObject({
    '@type': 'Offer',
    priceCurrency: currency,
    price: lowPrice,
    availability: 'https://schema.org/InStock',
    url,
  });
}

export function buildBreadcrumbNode(items: BreadcrumbItemInput[], pageUrl?: string): JsonLdNode {
  const normalizedItems = items.map((item, idx) =>
    cleanObject({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url ? normalizeCanonicalUrl(item.url) : undefined,
    })
  );

  return cleanObject({
    '@type': 'BreadcrumbList',
    '@id': pageUrl ? `${pageUrl}#breadcrumb` : undefined,
    itemListElement: normalizedItems,
  });
}

export function buildOrganizationNode(input?: OrganizationGraphInput): JsonLdNode {
  return cleanObject({
    '@type': 'TravelAgency',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: ORGANIZATION_DESCRIPTION,
    email: ORGANIZATION_EMAIL,
    logo: {
      '@type': 'ImageObject',
      url: ORGANIZATION_LOGO,
      width: 200,
      height: 60,
    },
    image: ORGANIZATION_LOGO,
    areaServed: ORGANIZATION_AREA_SERVED.map((area) => ({ '@type': 'Place', name: area })),
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+256-782-594-008',
        email: ORGANIZATION_EMAIL,
        contactType: 'customer service',
        areaServed: 'UG',
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+254-723-927-458',
        email: ORGANIZATION_EMAIL,
        contactType: 'customer service',
        areaServed: 'KE',
        availableLanguage: ['English'],
      },
    ],
    address: [
      {
        '@type': 'PostalAddress',
        addressLocality: 'Kampala',
        addressCountry: 'UG',
      },
      {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
    ],
    sameAs: ORGANIZATION_SAME_AS,
    aggregateRating: buildAggregateRatingNode(input?.aggregateRating),
  });
}

export function buildWebSiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: ORGANIZATION_DESCRIPTION,
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganizationGraph(input?: OrganizationGraphInput): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(input)],
  };
}

export function buildWebSiteGraph(input?: OrganizationGraphInput): JsonLdGraph {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(input), buildWebSiteNode()],
  };
}

export function buildPackageGraph(input: PackageGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(
    input.canonicalPath ||
      (input.country?.slug ? `/packages/${input.country.slug}/${input.slug}/` : `/packages/${input.slug}/`)
  );

  const itineraryItems = (input.itinerary || []).map((item, idx) =>
    cleanObject({
      '@type': 'ListItem',
      position: item.day_number ?? idx + 1,
      name: item.title || `Day ${item.day_number ?? idx + 1}`,
      description: stripHtml(item.description),
    })
  );

  const itineraryNode =
    itineraryItems.length > 0
      ? {
          '@type': 'ItemList',
          numberOfItems: itineraryItems.length,
          itemListElement: itineraryItems,
        }
      : input.durationDays
        ? {
            '@type': 'ItemList',
            numberOfItems: input.durationDays,
          }
        : undefined;

  const touristTypes = (input.holidayTypes || [])
    .map((ht) => (typeof ht === 'string' ? ht : ht.name))
    .filter(Boolean);

  const tripNode = cleanObject({
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    name: input.name,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    provider: { '@id': ORGANIZATION_ID },
    touristType: touristTypes.length > 0 ? touristTypes : undefined,
    itinerary: itineraryNode,
    offers: buildAggregateOfferNode(url, input.price, input.priceCharts, input.currency || 'USD'),
    aggregateRating: buildAggregateRatingNode(input.aggregateRating),
    review: buildReviewNodes(input.reviews),
    datePublished: input.datePublished || undefined,
    dateModified: input.dateModified || undefined,
    subjectOf: input.country
      ? cleanObject({
          '@type': 'Country',
          name: input.country.name,
          url: input.country.slug ? normalizeCanonicalUrl(`/destinations/${input.country.slug}/`) : undefined,
        })
      : undefined,
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Packages', url: '/packages/' },
      ...(input.country?.slug
        ? [{ name: input.country.name, url: `/destinations/${input.country.slug}/` }]
        : []),
      { name: input.name, url },
    ];

  const graph: JsonLdNode[] = [
    buildOrganizationNode(),
    tripNode,
    buildBreadcrumbNode(breadcrumbs, url),
  ];

  const faqNode = buildFaqPageNode(input.faqs, url);
  if (faqNode) graph.push(faqNode);

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function buildGroupTripGraph(input: GroupTripGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath || `/group-trips/${input.slug}/`);

  const itineraryItems = (input.itinerary || []).map((item, idx) =>
    cleanObject({
      '@type': 'ListItem',
      position: item.day_number ?? idx + 1,
      name: item.title || `Day ${item.day_number ?? idx + 1}`,
      description: stripHtml(item.description),
    })
  );

  const subEvents = (input.departures || [])
    .filter((d) => d && d.is_active !== false && d.start_date)
    .map((dep) =>
      cleanObject({
        '@type': 'Event',
        name: `${input.name} Departure (${dep.start_date})`,
        startDate: dep.start_date,
        endDate: dep.end_date || undefined,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        maximumAttendeeCapacity: input.maxParticipants || undefined,
        remainingAttendeeCapacity: dep.available_slots ?? undefined,
        location: input.country
          ? {
              '@type': 'Place',
              name: input.country.name,
            }
          : undefined,
        organizer: { '@id': ORGANIZATION_ID },
        offers:
          typeof (dep.price ?? input.price) === 'number' && (dep.price ?? input.price)! > 0
            ? {
                '@type': 'Offer',
                price: dep.price ?? input.price,
                priceCurrency: input.currency || 'USD',
                availability:
                  dep.available_slots === 0
                    ? 'https://schema.org/SoldOut'
                    : 'https://schema.org/InStock',
                url,
              }
            : undefined,
      })
    );

  const touristTypes = [
    'Group Travel',
    ...(input.holidayTypes || []).map((ht) => (typeof ht === 'string' ? ht : ht.name)).filter(Boolean),
  ];

  const tripNode = cleanObject({
    '@type': 'TouristTrip',
    '@id': `${url}#group-trip`,
    name: input.name,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    provider: { '@id': ORGANIZATION_ID },
    touristType: Array.from(new Set(touristTypes)),
    itinerary:
      itineraryItems.length > 0
        ? { '@type': 'ItemList', numberOfItems: itineraryItems.length, itemListElement: itineraryItems }
        : input.durationDays
          ? { '@type': 'ItemList', numberOfItems: input.durationDays }
          : undefined,
    offers: buildAggregateOfferNode(url, input.price, input.priceCharts, input.currency || 'USD'),
    subEvent: subEvents.length > 0 ? subEvents : undefined,
    aggregateRating: buildAggregateRatingNode(input.aggregateRating),
    review: buildReviewNodes(input.reviews),
    dateModified: input.dateModified || undefined,
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Group Trips', url: '/group-trips/' },
      ...(input.country?.slug
        ? [{ name: input.country.name, url: `/destinations/${input.country.slug}/` }]
        : []),
      { name: input.name, url },
    ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), tripNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}

export function buildHotelGraph(input: HotelGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath || `/hotels/${input.slug}/`);
  const iso2 = resolveIso2CountryCode(input.country);
  const currency = input.currency || 'USD';

  const makesOffer: JsonLdNode[] = [];
  for (const chart of input.priceCharts || []) {
    if (chart.is_active === false) continue;
    if (chart.night_rates && chart.night_rates.length > 0) {
      for (const nr of chart.night_rates) {
        if (nr.is_active === false || !nr.price || nr.price <= 0) continue;
        makesOffer.push(
          cleanObject({
            '@type': 'Offer',
            name: [chart.title, nr.nights ? `${nr.nights} Nights` : undefined, nr.room_type].filter(Boolean).join(' - '),
            price: nr.price,
            priceCurrency: currency,
            validFrom: chart.start_date || undefined,
            validThrough: chart.end_date || undefined,
            availability: 'https://schema.org/InStock',
            url,
          })
        );
      }
    } else if (typeof chart.price === 'number' && chart.price > 0) {
      makesOffer.push(
        cleanObject({
          '@type': 'Offer',
          name: chart.title || 'Seasonal Stay Rate',
          price: chart.price,
          priceCurrency: currency,
          validFrom: chart.start_date || undefined,
          validThrough: chart.end_date || undefined,
          availability: 'https://schema.org/InStock',
          url,
        })
      );
    }
  }

  const addressNode =
    input.address || input.city || iso2 || input.country?.name
      ? cleanObject({
          '@type': 'PostalAddress',
          streetAddress: input.address || undefined,
          addressLocality: input.city || undefined,
          addressCountry: iso2 || input.country?.name || undefined,
        })
      : undefined;

  const geoNode =
    typeof input.latitude === 'number' && typeof input.longitude === 'number'
      ? {
          '@type': 'GeoCoordinates',
          latitude: input.latitude,
          longitude: input.longitude,
        }
      : undefined;

  const amenityFeatures = (input.amenities || [])
    .slice(0, 20)
    .map((a) => (typeof a === 'string' ? a : a.name))
    .filter(Boolean)
    .map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    }));

  const hotelNode = cleanObject({
    '@type': 'Hotel',
    '@id': `${url}#hotel`,
    name: input.name,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    priceRange: input.priceCategory || undefined,
    starRating: input.stars ? { '@type': 'Rating', ratingValue: input.stars, bestRating: 5 } : undefined,
    address: addressNode,
    geo: geoNode,
    checkinTime: input.checkInTime || undefined,
    checkoutTime: input.checkOutTime || undefined,
    containedInPlace: input.country
      ? cleanObject({
          '@type': 'Country',
          name: input.country.name,
          url: input.country.slug ? normalizeCanonicalUrl(`/destinations/${input.country.slug}/`) : undefined,
        })
      : undefined,
    amenityFeature: amenityFeatures.length > 0 ? amenityFeatures : undefined,
    makesOffer: makesOffer.length > 0 ? makesOffer.slice(0, 20) : undefined,
    aggregateRating: buildAggregateRatingNode(input.aggregateRating),
    review: buildReviewNodes(input.reviews),
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Hotels', url: '/hotels/' },
      ...(input.country?.slug
        ? [{ name: input.country.name, url: `/destinations/${input.country.slug}/` }]
        : []),
      { name: input.name, url },
    ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), hotelNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}

export function buildAttractionGraph(input: AttractionGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath || `/attractions/${input.slug}/`);
  const iso2 = resolveIso2CountryCode(input.country);

  const addressNode =
    input.address || input.city || iso2 || input.country?.name
      ? cleanObject({
          '@type': 'PostalAddress',
          streetAddress: input.address || undefined,
          addressLocality: input.city || undefined,
          addressCountry: iso2 || input.country?.name || undefined,
        })
      : undefined;

  const geoNode =
    typeof input.latitude === 'number' && typeof input.longitude === 'number'
      ? {
          '@type': 'GeoCoordinates',
          latitude: input.latitude,
          longitude: input.longitude,
        }
      : undefined;

  const isFree =
    input.isAccessibleForFree !== undefined
      ? input.isAccessibleForFree
      : input.price === 0
        ? true
        : undefined;

  const offerNode =
    typeof input.price === 'number' && input.price > 0
      ? {
          '@type': 'Offer',
          price: input.price,
          priceCurrency: input.currency || 'USD',
          availability: 'https://schema.org/InStock',
          url,
        }
      : undefined;

  // Note: Schema.org TouristAttraction does NOT allow `provider`; intentionally omitted.
  const attractionNode = cleanObject({
    '@type': 'TouristAttraction',
    '@id': `${url}#attraction`,
    name: input.name,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    touristType: input.touristType && input.touristType.length > 0 ? input.touristType : undefined,
    address: addressNode,
    geo: geoNode,
    openingHours: input.openingHours || undefined,
    isAccessibleForFree: isFree,
    offers: offerNode,
    containedInPlace: input.country
      ? cleanObject({
          '@type': 'Country',
          name: input.country.name,
          url: input.country.slug ? normalizeCanonicalUrl(`/destinations/${input.country.slug}/`) : undefined,
        })
      : undefined,
    aggregateRating: buildAggregateRatingNode(input.aggregateRating),
    review: buildReviewNodes(input.reviews),
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Attractions', url: '/attractions/' },
      ...(input.country?.slug
        ? [{ name: input.country.name, url: `/destinations/${input.country.slug}/` }]
        : []),
      { name: input.name, url },
    ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), attractionNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}

export function buildCountryGraph(input: CountryGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath || `/destinations/${input.slug}/`);

  const includesAttraction = (input.attractions || [])
    .slice(0, 20)
    .map((a) =>
      cleanObject({
        '@type': 'TouristAttraction',
        name: a.name,
        description: stripHtml(a.description),
        url: a.slug ? normalizeCanonicalUrl(`/attractions/${a.slug}/`) : undefined,
      })
    );

  const destinationNode = cleanObject({
    '@type': 'TouristDestination',
    '@id': `${url}#destination`,
    name: input.name,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    containedInPlace: input.region
      ? cleanObject({
          '@type': 'Place',
          name: input.region.name,
          url: input.region.slug ? normalizeCanonicalUrl(`/regions/${input.region.slug}/`) : undefined,
        })
      : undefined,
    includesAttraction: includesAttraction.length > 0 ? includesAttraction : undefined,
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations/' },
      ...(input.region?.slug ? [{ name: input.region.name, url: `/regions/${input.region.slug}/` }] : []),
      { name: input.name, url },
    ];

  const graph: JsonLdNode[] = [
    buildOrganizationNode(),
    destinationNode,
    buildBreadcrumbNode(breadcrumbs, url),
  ];

  const faqNode = buildFaqPageNode(input.faqs, url);
  if (faqNode) graph.push(faqNode);

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function buildBlogPostingGraph(input: BlogPostingGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath || `/blog/${input.slug}/`);

  const plainText = stripHtml(input.content) || '';
  const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : undefined;
  const readMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : undefined;

  const authorName =
    input.author?.name ||
    input.author?.full_name ||
    [input.author?.first_name, input.author?.last_name].filter(Boolean).join(' ').trim() ||
    undefined;

  const authorNode: JsonLdNode = authorName
    ? cleanObject({
        '@type': 'Person',
        name: authorName,
        jobTitle: input.author?.job_title || 'Allbounds Travel Specialist',
        description: stripHtml(input.author?.bio),
        image: input.author?.avatar_url || undefined,
        sameAs: input.author?.same_as && input.author.same_as.length > 0 ? input.author.same_as : undefined,
        url: input.author?.url ? normalizeCanonicalUrl(input.author.url) : undefined,
        worksFor: { '@id': ORGANIZATION_ID },
      })
    : { '@id': ORGANIZATION_ID };

  const keywords = (input.tags || [])
    .map((t) => (typeof t === 'string' ? t : t.name))
    .filter(Boolean);

  const mentions = (input.packages || []).map((pkg) =>
    cleanObject({
      '@type': 'TouristTrip',
      name: pkg.name,
      url: normalizeCanonicalUrl(
        pkg.country?.slug ? `/packages/${pkg.country.slug}/${pkg.slug}/` : `/packages/${pkg.slug}/`
      ),
    })
  );

  const postNode = cleanObject({
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: input.title,
    description: stripHtml(input.description),
    image: normalizeImageField(input.image),
    url,
    datePublished: input.datePublished || undefined,
    dateModified: input.dateModified || input.datePublished || undefined,
    author: authorNode,
    publisher: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    wordCount,
    timeRequired: readMinutes ? `PT${readMinutes}M` : undefined,
    keywords: keywords.length > 0 ? keywords : undefined,
    mentions: mentions.length > 0 ? mentions : undefined,
    inLanguage: 'en',
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog/' },
      { name: input.title, url },
    ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), postNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}

export function buildCollectionPageGraph(input: CollectionPageGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input.canonicalPath);

  const itemListElements = (input.items || []).slice(0, 50).map((item, idx) =>
    cleanObject({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      url: normalizeCanonicalUrl(item.url),
      description: stripHtml(item.description),
      image: item.image || undefined,
    })
  );

  const itemListNode =
    itemListElements.length > 0
      ? {
          '@type': 'ItemList',
          '@id': `${url}#itemlist`,
          numberOfItems: itemListElements.length,
          itemListElement: itemListElements,
        }
      : undefined;

  const pageNode = cleanObject({
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    name: input.name,
    description: stripHtml(input.description),
    url,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntity: itemListNode ? { '@id': `${url}#itemlist` } : undefined,
    dateModified: input.dateModified || undefined,
  });

  const breadcrumbs =
    input.breadcrumbs ||
    [
      { name: 'Home', url: '/' },
      { name: input.name, url },
    ];

  const graph: JsonLdNode[] = [
    buildOrganizationNode(),
    pageNode,
    ...(itemListNode ? [itemListNode] : []),
    buildBreadcrumbNode(breadcrumbs, url),
  ];

  return { '@context': 'https://schema.org', '@graph': graph };
}

export function buildAboutPageGraph(input?: StaticPageGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input?.canonicalPath || '/about-us/');
  const pageNode = cleanObject({
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    name: input?.name || `About ${SITE_NAME}`,
    description:
      input?.description ||
      'Learn about Allbound Vacations, our East African travel specialists in Kampala and Nairobi, and our tailor-made safari and luxury holiday approach.',
    url,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    mainEntity: { '@id': ORGANIZATION_ID },
  });

  const breadcrumbs = input?.breadcrumbs || [
    { name: 'Home', url: '/' },
    { name: 'About Us', url },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), pageNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}

export function buildContactPageGraph(input?: StaticPageGraphInput): JsonLdGraph {
  const url = normalizeCanonicalUrl(input?.canonicalPath || '/contact-us/');
  const pageNode = cleanObject({
    '@type': 'ContactPage',
    '@id': `${url}#webpage`,
    name: input?.name || `Contact ${SITE_NAME}`,
    description:
      input?.description ||
      'Contact Allbound Vacations travel specialists in Kampala, Uganda and Nairobi, Kenya for tailor-made safaris, hotel stays, and group trips.',
    url,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    mainEntity: { '@id': ORGANIZATION_ID },
  });

  const breadcrumbs = input?.breadcrumbs || [
    { name: 'Home', url: '/' },
    { name: 'Contact Us', url },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), pageNode, buildBreadcrumbNode(breadcrumbs, url)],
  };
}
