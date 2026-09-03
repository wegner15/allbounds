import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');
const templatePath = resolve(distDir, 'index.html');

const SITE_URL = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://allboundvacations.com'
).replace(/\/+$/, '');

const API_BASE_URL = (
  process.env.API_BASE_URL ||
  process.env.VITE_PROD_BASE_URL ||
  'https://api.allboundtravel.com/api/v1'
).replace(/\/+$/, '');

const CLOUDFLARE_DELIVERY_URL = 'https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo/og-default.png`;
const SITE_NAME = 'Allbound Vacations';
const TWITTER_HANDLE = '@AllboundVacations';

function getImageUrl(imageId, variant = 'large') {
  if (!imageId) return DEFAULT_OG_IMAGE;
  if (imageId.startsWith('http')) return imageId;
  const cleanId = imageId.replace('cloudflare://', '');
  return `${CLOUDFLARE_DELIVERY_URL}/${cleanId}/${variant}`;
}

function cleanText(text, maxLength = 155) {
  if (!text) return '';
  const clean = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeBreadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

const staticPages = [
  {
    path: '/destinations',
    title: `Destinations | ${SITE_NAME}`,
    heading: 'Explore African Destinations',
    description: 'Explore breathtaking African destinations with Allbound Vacations. From Uganda to Kenya, Tanzania, Rwanda, and Zanzibar.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Destinations',
        description: 'Explore breathtaking African destinations with Allbound Vacations.',
        url: `${SITE_URL}/destinations`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Destinations', url: '/destinations' },
      ]),
    ],
  },
  {
    path: '/packages',
    title: `Tour Packages | ${SITE_NAME}`,
    heading: 'Curated Travel Packages & Tailor-Made Vacations',
    description: 'Discover curated safari packages, wildlife tours, and luxury adventures crafted for unforgettable memories.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Tour Packages',
        description: 'Discover curated safari packages, wildlife tours, and luxury adventures crafted for unforgettable memories.',
        url: `${SITE_URL}/packages`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Packages', url: '/packages' },
      ]),
    ],
  },
  {
    path: '/hotels',
    title: `Hotels & Luxury Lodges | ${SITE_NAME}`,
    heading: 'Luxury Lodges & Safari Stays',
    description: 'Find handpicked luxury safari lodges, boutique hotels, and beachfront resorts across East Africa.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Hotels & Luxury Lodges',
        description: 'Find handpicked luxury safari lodges, boutique hotels, and beachfront resorts across East Africa.',
        url: `${SITE_URL}/hotels`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Hotels', url: '/hotels' },
      ]),
    ],
  },
  {
    path: '/activities',
    title: `Activities & Experiences | ${SITE_NAME}`,
    heading: 'Unforgettable African Activities & Adventures',
    description: 'Explore exciting activities from gorilla trekking and hot air balloon safaris to cultural encounters.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Activities & Experiences',
        description: 'Explore exciting activities from gorilla trekking and hot air balloon safaris to cultural encounters.',
        url: `${SITE_URL}/activities`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Activities', url: '/activities' },
      ]),
    ],
  },
  {
    path: '/attractions',
    title: `Top Attractions | ${SITE_NAME}`,
    heading: 'Top Sights & National Parks',
    description: 'Discover famous national parks, waterfalls, mountains, and wildlife reserves across Africa.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Top Attractions',
        description: 'Discover famous national parks, waterfalls, mountains, and wildlife reserves across Africa.',
        url: `${SITE_URL}/attractions`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Attractions', url: '/attractions' },
      ]),
    ],
  },
  {
    path: '/group-trips',
    title: `Group Trips | ${SITE_NAME}`,
    heading: 'Scheduled Group Trips & Expeditions',
    description: 'Join scheduled group trips and expeditions with fellow travelers to extraordinary destinations.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Group Trips',
        description: 'Join scheduled group trips and expeditions with fellow travelers to extraordinary destinations.',
        url: `${SITE_URL}/group-trips`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Group Trips', url: '/group-trips' },
      ]),
    ],
  },
  {
    path: '/holiday-types',
    title: `Holiday Types | ${SITE_NAME}`,
    heading: 'Travel by Holiday Style',
    description: 'Explore tours by holiday style: Wildlife Safari, Gorilla Trekking, Beach Holidays, Honeymoons, and more.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Holiday Types',
        description: 'Explore tours by holiday style: Wildlife Safari, Gorilla Trekking, Beach Holidays, Honeymoons, and more.',
        url: `${SITE_URL}/holiday-types`,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Holiday Types', url: '/holiday-types' },
      ]),
    ],
  },
  {
    path: '/blog',
    title: `Travel Blog & Guides | ${SITE_NAME}`,
    heading: 'Travel Stories & Insights',
    description: 'Read travel inspiration, safari guides, packing tips, and destination stories from our expert team.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Allbound Vacations Blog',
        description: 'Read travel inspiration, safari guides, packing tips, and destination stories from our expert team.',
        url: `${SITE_URL}/blog`,
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
      ]),
    ],
  },
  {
    path: '/about-us',
    title: `About Us | ${SITE_NAME}`,
    heading: 'About Allbound Vacations',
    description: 'Learn about Allbound Vacations — our mission, passion for authentic African travel, and dedicated team.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Us',
        description: 'Learn about Allbound Vacations — our mission, passion for authentic African travel, and dedicated team.',
        url: `${SITE_URL}/about-us`,
        mainEntity: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'About Us', url: '/about-us' },
      ]),
    ],
  },
  {
    path: '/contact-us',
    title: `Contact Us | ${SITE_NAME}`,
    heading: 'Contact Our Travel Specialists',
    description: 'Get in touch with the Allbound Vacations travel team for customized itineraries, quotes, and inquiries.',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Us',
        description: 'Get in touch with the Allbound Vacations travel team for customized itineraries, quotes, and inquiries.',
        url: `${SITE_URL}/contact-us`,
        mainEntity: {
          '@type': 'TravelAgency',
          name: SITE_NAME,
          url: SITE_URL,
          telephone: '+256-782-594-008',
          email: 'bookings@allboundvacations.com',
        },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Contact Us', url: '/contact-us' },
      ]),
    ],
  },
  {
    path: '/visa-application',
    title: `Visa Application Assistance | ${SITE_NAME}`,
    heading: 'Travel Visa Guidance',
    description: 'Information and travel visa guidance for your trip to East African destinations.',
    type: 'website',
  },
  {
    path: '/flights',
    title: `Flight Bookings | ${SITE_NAME}`,
    heading: 'Domestic & Regional Flight Booking',
    description: 'Book regional and international flights with Allbound Vacations for a seamless travel experience.',
    type: 'website',
  },
  {
    path: '/payment-plans',
    title: `Payment Plans & Terms | ${SITE_NAME}`,
    heading: 'Flexible Travel Payment Options',
    description: 'Flexible payment plans and transparent booking options for your dream holiday with Allbound Vacations.',
    type: 'website',
  },
];

async function fetchList(path) {
  try {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}/${path.replace(/^\/+/, '')}${sep}limit=200`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    return [];
  }
}

function renderHtml(template, { title, heading, description, canonicalUrl, image, type = 'website', jsonLd }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImg = escapeHtml(image || DEFAULT_OG_IMAGE);
  const safeUrl = escapeHtml(canonicalUrl);
  const h1Text = escapeHtml(heading || title.replace(/\s*\|\s*Allbound Vacations.*$/i, '').trim() || title);

  let html = template;

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/s, `<title>${safeTitle}</title>`);

  // Replace primary meta description
  html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${safeDesc}" />`);

  // Replace canonical link or inject one
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${safeUrl}" />`);
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${safeUrl}" />\n  </head>`);
  }

  // Ensure theme-color and SVG favicon are present
  if (!html.includes('name="theme-color"')) {
    html = html.replace('</head>', '    <meta name="theme-color" content="#2D3748" />\n  </head>');
  }
  if (!html.includes('type="image/svg+xml"')) {
    html = html.replace('</head>', '    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />\n  </head>');
  }

  // Replace Open Graph meta tags
  html = html.replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="${type}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${safeUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${safeImg}" />`);
  html = html.replace(/<meta property="og:image:secure_url" content=".*?" \/>/, `<meta property="og:image:secure_url" content="${safeImg}" />`);
  html = html.replace(/<meta property="og:image:width" content=".*?" \/>/, `<meta property="og:image:width" content="1200" />`);
  html = html.replace(/<meta property="og:image:height" content=".*?" \/>/, `<meta property="og:image:height" content="630" />`);
  html = html.replace(/<meta property="og:image:alt" content=".*?" \/>/, `<meta property="og:image:alt" content="${safeTitle}" />`);

  // Replace Twitter meta tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${safeDesc}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${safeImg}" />`);
  html = html.replace(/<meta name="twitter:image:alt" content=".*?" \/>/, `<meta name="twitter:image:alt" content="${safeTitle}" />`);

  // Inject JSON-LD if provided
  if (jsonLd) {
    const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const jsonLdTags = items
      .map((item) => `    <script type="application/ld+json">\n${JSON.stringify(item, null, 2)}\n    </script>`)
      .join('\n');
    html = html.replace('</head>', `${jsonLdTags}\n  </head>`);
  }

  // Inject semantic H1 header inside #root for crawlers/SEO validators before React mounts
  const ssrShell = `    <div id="root">\n      <header class="sr-only">\n        <h1>${h1Text}</h1>\n        <p>${safeDesc}</p>\n      </header>\n    </div>`;
  html = html.replace(/<div id="root">.*?<\/div>/s, ssrShell);

  return html;
}

async function writePage(routePath, html) {
  const cleanPath = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
  const outDir = cleanPath ? join(distDir, cleanPath) : distDir;
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, 'index.html'), html, 'utf8');
}

async function main() {
  let template;
  try {
    template = await readFile(templatePath, 'utf8');
  } catch (err) {
    console.warn('[prerender-seo] dist/index.html not found, skipping prerender.');
    return;
  }

  console.log('[prerender-seo] Generating pre-rendered SEO pages with H1 headings and JSON-LD...');
  let count = 0;

  // 1. Static pages
  for (const page of staticPages) {
    const canonicalUrl = `${SITE_URL}${page.path}`;
    const html = renderHtml(template, {
      title: page.title,
      heading: page.heading,
      description: page.description,
      canonicalUrl,
      image: DEFAULT_OG_IMAGE,
      type: page.type,
      jsonLd: page.jsonLd,
    });
    await writePage(page.path, html);
    count++;
  }

  // 2. Fetch dynamic entities from backend API
  const [packages, blogs, countries, hotels, activities, attractions, groupTrips] = await Promise.all([
    fetchList('/packages/'),
    fetchList('/blog/'),
    fetchList('/countries/'),
    fetchList('/hotels/'),
    fetchList('/activities/'),
    fetchList('/attractions/'),
    fetchList('/group-trips/'),
  ]);

  // Packages
  for (const pkg of packages) {
    if (!pkg?.slug) continue;
    const path = `/packages/${pkg.slug}`;
    const countrySlug = pkg.country?.slug;
    const canonicalPath = countrySlug ? `/packages/${countrySlug}/${pkg.slug}` : path;
    const title = `${pkg.name} | ${SITE_NAME}`;
    const description = cleanText(pkg.summary || pkg.description) || `Explore ${pkg.name} with ${SITE_NAME}.`;
    const image = getImageUrl(pkg.image_id || pkg.cover_image);
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: pkg.name,
        description,
        image,
        url: canonicalUrl,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Packages', url: '/packages' },
        ...(pkg.country ? [{ name: pkg.country.name, url: `/destinations/${pkg.country.slug}` }] : []),
        { name: pkg.name, url: canonicalPath },
      ]),
    ];
    const html = renderHtml(template, { title, heading: pkg.name, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;

    if (countrySlug) {
      await writePage(canonicalPath, html);
      count++;
    }
  }

  // Blog Posts
  for (const blog of blogs) {
    if (!blog?.slug) continue;
    const path = `/blog/${blog.slug}`;
    const title = `${blog.title} | ${SITE_NAME}`;
    const description = cleanText(blog.summary || blog.content) || `Read ${blog.title} on ${SITE_NAME}.`;
    const image = getImageUrl(blog.cover_image_id || blog.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: blog.title,
        description,
        image,
        url: canonicalUrl,
        datePublished: blog.published_at || blog.created_at,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: blog.title, url: path },
      ]),
    ];
    const html = renderHtml(template, { title, heading: blog.title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Countries / Destinations
  for (const country of countries) {
    if (!country?.slug) continue;
    const path = `/destinations/${country.slug}`;
    const title = `${country.name} Tours & Travel Guide | ${SITE_NAME}`;
    const description = cleanText(country.description) || `Discover travel experiences, safari packages, and hotels in ${country.name}.`;
    const image = getImageUrl(country.image_id || country.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristDestination',
        name: country.name,
        description,
        image,
        url: canonicalUrl,
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Destinations', url: '/destinations' },
        { name: country.name, url: path },
      ]),
    ];
    const html = renderHtml(template, { title, heading: `${country.name} Travel & Safari Guide`, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Hotels
  for (const hotel of hotels) {
    if (!hotel?.slug) continue;
    const path = `/hotels/${hotel.slug}`;
    const countrySlug = hotel.country?.slug || (typeof hotel.country === 'string' ? hotel.country.toLowerCase() : undefined);
    const canonicalPath = countrySlug ? `/hotels/${countrySlug}/${hotel.slug}` : path;
    const title = `${hotel.name} | ${SITE_NAME}`;
    const description = cleanText(hotel.summary || hotel.description) || `Book your luxury stay at ${hotel.name} with ${SITE_NAME}.`;
    const image = getImageUrl(hotel.cover_image || hotel.image_id || hotel.media_assets?.[0]?.file_path);
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: hotel.name,
        description,
        image,
        url: canonicalUrl,
        starRating: hotel.stars ? { '@type': 'Rating', ratingValue: hotel.stars } : undefined,
        address: hotel.country ? {
          '@type': 'PostalAddress',
          addressCountry: hotel.country.name || hotel.country,
        } : undefined,
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Hotels', url: '/hotels' },
        ...(countrySlug ? [{ name: hotel.country?.name || countrySlug, url: `/destinations/${countrySlug}` }] : []),
        { name: hotel.name, url: canonicalPath },
      ]),
    ];
    const html = renderHtml(template, { title, heading: hotel.name, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;

    if (countrySlug) {
      await writePage(canonicalPath, html);
      count++;
      await writePage(`/destinations/${countrySlug}/hotels/${hotel.slug}`, html);
      count++;
    }
  }

  // Activities
  for (const act of activities) {
    if (!act?.slug) continue;
    const path = `/activities/${act.slug}`;
    const title = `${act.name} | ${SITE_NAME}`;
    const description = cleanText(act.summary || act.description) || `Experience ${act.name} with ${SITE_NAME}.`;
    const image = getImageUrl(act.cover_image_id || act.image_id || act.cover_image?.file_path);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: act.name,
        description,
        image,
        url: canonicalUrl,
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Activities', url: '/activities' },
        { name: act.name, url: path },
      ]),
    ];
    const html = renderHtml(template, { title, heading: act.name, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Attractions
  for (const att of attractions) {
    if (!att?.slug) continue;
    const path = `/attractions/${att.slug}`;
    const title = `${att.name} | ${SITE_NAME}`;
    const description = cleanText(att.description) || `Visit ${att.name} with ${SITE_NAME}.`;
    const image = getImageUrl(att.image_id || att.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristAttraction',
        name: att.name,
        description,
        image,
        url: canonicalUrl,
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Attractions', url: '/attractions' },
        { name: att.name, url: path },
      ]),
    ];
    const html = renderHtml(template, { title, heading: att.name, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Group Trips
  for (const trip of groupTrips) {
    if (!trip?.slug) continue;
    const path = `/group-trips/${trip.slug}`;
    const title = `${trip.name} | ${SITE_NAME}`;
    const description = cleanText(trip.summary || trip.description) || `Join the ${trip.name} group expedition with ${SITE_NAME}.`;
    const image = getImageUrl(trip.cover_image || trip.image_id || trip.media_assets?.[0]?.file_path);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'TouristTrip',
        name: trip.name,
        description,
        image,
        url: canonicalUrl,
        provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
        touristType: ['Group Travel', 'Expedition'],
        itinerary: trip.duration_days ? { '@type': 'ItemList', numberOfItems: trip.duration_days } : undefined,
      },
      makeBreadcrumbs([
        { name: 'Home', url: '/' },
        { name: 'Group Trips', url: '/group-trips' },
        ...(trip.country ? [{ name: trip.country.name, url: `/destinations/${trip.country.slug}` }] : []),
        { name: trip.name, url: path },
      ]),
    ];
    const html = renderHtml(template, { title, heading: trip.name, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  console.log(`[prerender-seo] Successfully pre-rendered ${count} SEO pages!`);
}

main().catch((err) => {
  console.error('[prerender-seo] Error during prerendering:', err);
  process.exit(0);
});
