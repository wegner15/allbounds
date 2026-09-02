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
  process.env.VITE_API_BASE_URL ||
  'http://localhost:8005/api/v1'
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

function cleanText(text, maxLength = 160) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const staticPages = [
  {
    path: '/destinations',
    title: `Destinations | ${SITE_NAME}`,
    description: 'Explore breathtaking African destinations with Allbound Vacations. From Uganda to Kenya, Tanzania, Rwanda, and Zanzibar.',
    type: 'website',
  },
  {
    path: '/packages',
    title: `Tour Packages | ${SITE_NAME}`,
    description: 'Discover curated safari packages, wildlife tours, and luxury adventures crafted for unforgettable memories.',
    type: 'website',
  },
  {
    path: '/hotels',
    title: `Hotels & Luxury Lodges | ${SITE_NAME}`,
    description: 'Find handpicked luxury safari lodges, boutique hotels, and beachfront resorts across East Africa.',
    type: 'website',
  },
  {
    path: '/activities',
    title: `Activities & Experiences | ${SITE_NAME}`,
    description: 'Explore exciting activities from gorilla trekking and hot air balloon safaris to cultural encounters.',
    type: 'website',
  },
  {
    path: '/attractions',
    title: `Top Attractions | ${SITE_NAME}`,
    description: 'Discover famous national parks, waterfalls, mountains, and wildlife reserves across Africa.',
    type: 'website',
  },
  {
    path: '/group-trips',
    title: `Group Trips | ${SITE_NAME}`,
    description: 'Join scheduled group trips and expeditions with fellow travelers to extraordinary destinations.',
    type: 'website',
  },
  {
    path: '/holiday-types',
    title: `Holiday Types | ${SITE_NAME}`,
    description: 'Explore tours by holiday style: Wildlife Safari, Gorilla Trekking, Beach Holidays, Honeymoons, and more.',
    type: 'website',
  },
  {
    path: '/blog',
    title: `Travel Blog & Guides | ${SITE_NAME}`,
    description: 'Read travel inspiration, safari guides, packing tips, and destination stories from our expert team.',
    type: 'website',
  },
  {
    path: '/about-us',
    title: `About Us | ${SITE_NAME}`,
    description: 'Learn about Allbound Vacations — our mission, passion for authentic African travel, and dedicated team.',
    type: 'website',
  },
  {
    path: '/contact-us',
    title: `Contact Us | ${SITE_NAME}`,
    description: 'Get in touch with the Allbound Vacations travel team for customized itineraries, quotes, and inquiries.',
    type: 'website',
  },
  {
    path: '/visa-application',
    title: `Visa Application Assistance | ${SITE_NAME}`,
    description: 'Information and travel visa guidance for your trip to East African destinations.',
    type: 'website',
  },
  {
    path: '/flights',
    title: `Flight Bookings | ${SITE_NAME}`,
    description: 'Book regional and international flights with Allbound Vacations for a seamless travel experience.',
    type: 'website',
  },
  {
    path: '/payment-plans',
    title: `Payment Plans & Terms | ${SITE_NAME}`,
    description: 'Flexible payment plans and transparent booking options for your dream holiday with Allbound Vacations.',
    type: 'website',
  },
];

async function fetchList(path) {
  try {
    const url = `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    return [];
  }
}

function renderHtml(template, { title, description, canonicalUrl, image, type = 'website', jsonLd }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeImg = escapeHtml(image || DEFAULT_OG_IMAGE);
  const safeUrl = escapeHtml(canonicalUrl);

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

  // Replace Open Graph meta tags
  html = html.replace(/<meta property="og:type" content=".*?" \/>/, `<meta property="og:type" content="${type}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${safeUrl}" />`);
  html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${safeTitle}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${safeDesc}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${safeImg}" />`);
  html = html.replace(/<meta property="og:image:secure_url" content=".*?" \/>/, `<meta property="og:image:secure_url" content="${safeImg}" />`);
  html = html.replace(/<meta property="og:image:alt" content=".*?" \/>/, `<meta property="og:image:alt" content="${safeTitle}" />`);

  // Replace Twitter meta tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/, `<meta name="twitter:title" content="${safeTitle}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/, `<meta name="twitter:description" content="${safeDesc}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${safeImg}" />`);
  html = html.replace(/<meta name="twitter:image:alt" content=".*?" \/>/, `<meta name="twitter:image:alt" content="${safeTitle}" />`);

  // Inject JSON-LD if provided
  if (jsonLd) {
    const jsonLdTag = `    <script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>\n  </head>`;
    html = html.replace('</head>', jsonLdTag);
  }

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

  console.log('[prerender-seo] Generating pre-rendered SEO pages...');
  let count = 0;

  // 1. Static pages
  for (const page of staticPages) {
    const canonicalUrl = `${SITE_URL}${page.path}`;
    const html = renderHtml(template, {
      title: page.title,
      description: page.description,
      canonicalUrl,
      image: DEFAULT_OG_IMAGE,
      type: page.type,
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
    const title = `${pkg.name} | ${SITE_NAME}`;
    const description = cleanText(pkg.summary || pkg.description) || `Explore ${pkg.name} with ${SITE_NAME}.`;
    const image = getImageUrl(pkg.image_id || pkg.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: pkg.name,
      description,
      image,
      url: canonicalUrl,
      provider: { '@type': 'TravelAgency', name: SITE_NAME, url: SITE_URL },
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Blog Posts
  for (const blog of blogs) {
    if (!blog?.slug) continue;
    const path = `/blog/${blog.slug}`;
    const title = `${blog.title} | ${SITE_NAME}`;
    const description = cleanText(blog.summary || blog.content) || `Read ${blog.title} on ${SITE_NAME}.`;
    const image = getImageUrl(blog.cover_image_id || blog.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.title,
      description,
      image,
      url: canonicalUrl,
      datePublished: blog.published_at || blog.created_at,
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
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
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: country.name,
      description,
      image,
      url: canonicalUrl,
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Hotels
  for (const hotel of hotels) {
    if (!hotel?.slug) continue;
    const path = `/hotels/${hotel.slug}`;
    const title = `${hotel.name} | ${SITE_NAME}`;
    const description = cleanText(hotel.summary || hotel.description) || `Book your stay at ${hotel.name}.`;
    const image = getImageUrl(hotel.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'LodgingBusiness',
      name: hotel.name,
      description,
      image,
      url: canonicalUrl,
      starRating: hotel.stars ? { '@type': 'Rating', ratingValue: hotel.stars } : undefined,
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Activities
  for (const act of activities) {
    if (!act?.slug) continue;
    const path = `/activities/${act.slug}`;
    const title = `${act.name} | ${SITE_NAME}`;
    const description = cleanText(act.summary || act.description) || `Experience ${act.name} with ${SITE_NAME}.`;
    const image = getImageUrl(act.cover_image_id || act.image_id || act.cover_image?.file_path);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: act.name,
      description,
      image,
      url: canonicalUrl,
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
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
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: att.name,
      description,
      image,
      url: canonicalUrl,
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  // Group Trips
  for (const trip of groupTrips) {
    if (!trip?.slug) continue;
    const path = `/group-trips/${trip.slug}`;
    const title = `${trip.name} | ${SITE_NAME}`;
    const description = cleanText(trip.description) || `Join the ${trip.name} group expedition.`;
    const image = getImageUrl(trip.cover_image);
    const canonicalUrl = `${SITE_URL}${path}`;
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TouristTrip',
      name: trip.name,
      description,
      image,
      url: canonicalUrl,
    };
    const html = renderHtml(template, { title, description, canonicalUrl, image, type: 'article', jsonLd });
    await writePage(path, html);
    count++;
  }

  console.log(`[prerender-seo] Successfully pre-rendered ${count} SEO pages!`);
}

main().catch((err) => {
  console.error('[prerender-seo] Error during prerendering:', err);
  // Don't fail the build if prerender encounters an issue
  process.exit(0);
});
