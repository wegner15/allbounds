import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const publicDir = resolve(projectRoot, 'public');
const sitemapPath = resolve(publicDir, 'sitemap.xml');
const robotsPath = resolve(publicDir, 'robots.txt');

const SITE_URL = normalizeBaseUrl(
  process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.PUBLIC_SITE_URL ||
    'https://allboundvacations.com'
);

const API_BASE_URL = normalizeBaseUrl(
  process.env.API_BASE_URL ||
    process.env.VITE_PROD_BASE_URL ||
    'https://api.allboundvacations.com/api/v1'
);

const ALLOW_OFFLINE_BUILD = process.env.ALLOW_OFFLINE_BUILD === 'true';
const PAGE_LIMIT = 100;
const MAX_PAGES = 50;

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/destinations/', changefreq: 'weekly', priority: '0.9' },
  { path: '/packages/', changefreq: 'weekly', priority: '0.9' },
  { path: '/hotels/', changefreq: 'weekly', priority: '0.8' },
  { path: '/activities/', changefreq: 'weekly', priority: '0.8' },
  { path: '/attractions/', changefreq: 'weekly', priority: '0.8' },
  { path: '/holiday-types/', changefreq: 'weekly', priority: '0.8' },
  { path: '/group-trips/', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog/', changefreq: 'daily', priority: '0.8' },
  { path: '/about-us/', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact-us/', changefreq: 'monthly', priority: '0.6' },
  { path: '/payment-plans/', changefreq: 'monthly', priority: '0.5' },
  { path: '/visa-application/', changefreq: 'monthly', priority: '0.5' },
  { path: '/flights/', changefreq: 'monthly', priority: '0.5' },
  { path: '/regions/', changefreq: 'monthly', priority: '0.4' },
];

const contentRouteSlugs = new Set(['careers', 'terms', 'privacy']);
const destinationCategoryRoutes = ['packages', 'hotel-packages', 'group-trips', 'attractions', 'hotels', 'activities'];

async function main() {
  await mkdir(publicDir, { recursive: true });

  const [regions, countries, packages, hotels, attractions, activities, groupTrips, holidayTypes, blogs, contentPages] =
    await Promise.all([
      fetchList('/regions/'),
      fetchList('/countries/'),
      fetchList('/packages/'),
      fetchList('/hotels/'),
      fetchList('/attractions/'),
      fetchList('/activities/'),
      fetchList('/group-trips/'),
      fetchList('/holiday-types/'),
      fetchList('/blog/'),
      fetchList('/content/published'),
    ]);

  const urls = [];

  urls.push(...staticRoutes.map((route) => makeUrl(route.path, undefined, route.changefreq, route.priority)));

  for (const region of regions) {
    if (!region?.slug) continue;
    urls.push(makeUrl(`/regions/${region.slug}`, region.updated_at, 'weekly', '0.7'));
  }

  for (const country of countries.filter((item) => item?.slug && item?.is_active !== false)) {
    urls.push(makeUrl(`/destinations/${country.slug}`, country.updated_at, 'weekly', '0.8'));
    for (const category of destinationCategoryRoutes) {
      urls.push(makeUrl(`/destinations/${country.slug}/${category}`, country.updated_at, 'weekly', '0.6'));
    }
  }

  // Canonical package URLs only (no duplicates)
  for (const item of packages) {
    if (item?.slug) {
      const canonicalPath = item.country?.slug
        ? `/packages/${item.country.slug}/${item.slug}`
        : `/packages/${item.slug}`;
      urls.push(makeUrl(canonicalPath, item.updated_at, 'weekly', '0.9'));
    }
  }

  // Canonical hotel URLs only (no duplicates)
  for (const item of hotels) {
    if (item?.slug) {
      urls.push(makeUrl(`/hotels/${item.slug}`, item.updated_at, 'weekly', '0.7'));
    }
  }

  // Canonical attraction URLs only (no duplicates)
  for (const item of attractions) {
    if (item?.slug) {
      urls.push(makeUrl(`/attractions/${item.slug}`, item.updated_at, 'weekly', '0.7'));
    }
  }

  // Canonical activity URLs only (no duplicates)
  for (const item of activities) {
    if (item?.slug) {
      urls.push(makeUrl(`/activities/${item.slug}`, item.updated_at, 'weekly', '0.7'));
    }
  }

  for (const item of groupTrips) {
    if (item?.slug) {
      urls.push(makeUrl(`/group-trips/${item.slug}`, item.updated_at, 'weekly', '0.8'));
    }
  }

  for (const item of holidayTypes) {
    if (item?.slug) {
      urls.push(makeUrl(`/holiday-types/${item.slug}`, item.updated_at, 'weekly', '0.6'));
    }
  }

  for (const item of blogs) {
    if (item?.slug) {
      const lastmod = item.published_at || item.updated_at || item.created_at;
      urls.push(makeUrl(`/blog/${item.slug}`, lastmod, 'daily', '0.7'));
    }
  }

  for (const page of contentPages) {
    if (contentRouteSlugs.has(page?.slug)) {
      urls.push(makeUrl(`/${page.slug}`, page.updated_at, 'monthly', '0.5'));
    }
  }

  const uniqueUrls = dedupeUrls(urls)
    .sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = buildXml(uniqueUrls);
  await writeFile(sitemapPath, xml, 'utf8');
  await writeFile(robotsPath, buildRobotsTxt(), 'utf8');
  console.log(`Generated sitemap with ${uniqueUrls.length} URLs at ${sitemapPath}`);
}

function normalizeBaseUrl(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

async function fetchList(path) {
  const allItems = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * PAGE_LIMIT;
    try {
      const response = await fetch(joinApiUrl(path, { skip, limit: PAGE_LIMIT }), {
        headers: {
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path} (skip=${skip}, limit=${PAGE_LIMIT})`);
      }

      const data = await response.json();
      const pageItems = normalizeList(data);
      allItems.push(...pageItems);

      if (pageItems.length < PAGE_LIMIT) {
        break;
      }

      if (page === MAX_PAGES - 1) {
        console.warn(`Sitemap pagination hit MAX_PAGES (${MAX_PAGES}) cap for ${path}; collected ${allItems.length} items.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (ALLOW_OFFLINE_BUILD) {
        console.warn(`Sitemap fetch failed for ${path} (ALLOW_OFFLINE_BUILD=true, continuing): ${message}`);
        return allItems;
      }
      throw new Error(`Sitemap fetch failed for ${path}: ${message}`);
    }
  }

  return allItems;
}

function joinApiUrl(path, { skip = 0, limit = PAGE_LIMIT } = {}) {
  const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, normalizedBase);
  url.searchParams.set('skip', String(skip));
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

function normalizeList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

function normalizeTrailingSlash(pathname) {
  if (!pathname || pathname === '/') return '/';
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return clean.endsWith('/') ? clean : `${clean}/`;
}

function makeUrl(path, lastmod, changefreq, priority) {
  const normalizedPath = normalizeTrailingSlash(path);
  return {
    loc: new URL(normalizedPath, SITE_URL).toString(),
    lastmod: lastmod ? toIsoDate(lastmod) : undefined,
    changefreq,
    priority,
  };
}

function dedupeUrls(urls) {
  const seen = new Map();

  for (const url of urls) {
    seen.set(url.loc, url);
  }

  return [...seen.values()];
}

function toIsoDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml(urls) {
  const entries = urls
    .map((url) => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(url.loc)}</loc>`,
      ];

      if (url.lastmod) {
        parts.push(`    <lastmod>${escapeXml(url.lastmod)}</lastmod>`);
      }

      if (url.changefreq) {
        parts.push(`    <changefreq>${escapeXml(url.changefreq)}</changefreq>`);
      }

      if (url.priority) {
        parts.push(`    <priority>${escapeXml(url.priority)}</priority>`);
      }

      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${entries}\n` +
    `</urlset>\n`;
}

const ALLOWED_AI_AND_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'PerplexityBot',
  'Perplexity-User',
  'Googlebot',
  'Google-Extended',
  'Bingbot',
  'Applebot',
  'Applebot-Extended',
];

const DISALLOWED_PATHS = [
  '/admin/',
  '/login',
  '/search',
  '/sign/',
  '/verify/',
  '/unauthorized',
  '/form-showcase',
  '/contact',
];

function buildRobotsTxt() {
  const disallowLines = DISALLOWED_PATHS.map((p) => `Disallow: ${p}`);
  const contentSignal = 'Content-Signal: ai-train=yes, search=yes, ai-input=yes';

  return [
    '# AI Search, Citation & Training Crawlers (Explicitly Allowed)',
    ...ALLOWED_AI_AND_SEARCH_BOTS.map((bot) => `User-agent: ${bot}`),
    'Allow: /',
    ...disallowLines,
    contentSignal,
    '',
    'User-agent: *',
    'Allow: /',
    ...disallowLines,
    contentSignal,
    '',
    `Sitemap: ${new URL('/sitemap.xml', SITE_URL).toString()}`,
    '',
  ].join('\n');
}

main().catch((error) => {
  console.error('Failed to generate sitemap:', error);
  process.exit(1);
});
