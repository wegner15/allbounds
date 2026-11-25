import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import worker from '../public/_worker.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, '..');

const indexHtml = await readFile(resolve(frontendRoot, 'index.html'), 'utf8');
const notFoundHtml = await readFile(resolve(frontendRoot, 'public/404.html'), 'utf8');

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  assert.equal(matches.length, 1, `Expected exactly 1 JSON-LD script, found ${matches.length}`);
  return JSON.parse(matches[0][1]);
}

function createMockCache() {
  const store = new Map();
  return {
    store,
    async match(req) {
      const key = typeof req === 'string' ? req : req.url;
      const entry = store.get(key);
      return entry ? entry.clone() : undefined;
    },
    async put(req, res) {
      const key = typeof req === 'string' ? req : req.url;
      store.set(key, res.clone());
    },
  };
}

function createMockEnv(extraAssets = {}) {
  const assetCalls = [];
  const assets = {
    '/': new Response(indexHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    '/404.html': new Response(notFoundHtml, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }),
    '/admin/': new Response(indexHtml.replace('<title>Allbound Vacations — Discover Extraordinary Destinations</title>', '<title>Admin Portal | Allbound Vacations</title>'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }),
    '/assets/app.12345.js': new Response('console.log("app");', {
      status: 200,
      headers: { 'Content-Type': 'application/javascript' },
    }),
    '/robots.txt': new Response('User-agent: *\nAllow: /\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    }),
    ...extraAssets,
  };

  return {
    assetCalls,
    env: {
      API_BASE_URL: 'https://api.allboundvacations.com/api/v1',
      ASSETS: {
        async fetch(req) {
          const url = new URL(typeof req === 'string' ? req : req.url);
          assetCalls.push(url.pathname);
          const found = assets[url.pathname];
          if (found) return found.clone();
          return new Response('Not Found', { status: 404 });
        },
      },
    },
  };
}

const MOCK_API_RESPONSES = {
  '/api/v1/countries/?limit=20': {
    status: 200,
    body: [
      { id: 1, name: 'Uganda', slug: 'uganda', description: 'The Pearl of Africa, home to mountain gorillas.' },
      { id: 2, name: 'Kenya', slug: 'kenya', description: 'Iconic savannahs and the Great Migration.' },
    ],
  },
  '/api/v1/packages/featured?limit=8': {
    status: 200,
    body: [
      {
        id: 10,
        name: '5-Day Bwindi Gorilla Trekking Safari',
        slug: 'bwindi-gorilla-safari',
        summary: 'Track mountain gorillas in Bwindi Impenetrable Forest.',
        duration_days: 5,
        price: 2450,
        country: { id: 1, name: 'Uganda', slug: 'uganda' },
      },
    ],
  },
  '/api/v1/group-trips/?limit=6': {
    status: 200,
    body: [
      {
        id: 20,
        name: 'East Africa Migration Group Expedition',
        slug: 'east-africa-migration',
        duration_days: 8,
        price: 3200,
      },
    ],
  },
  '/api/v1/holiday-types/?limit=12': {
    status: 200,
    body: [{ id: 1, name: 'Gorilla Trekking', slug: 'gorilla-trekking' }],
  },
  '/api/v1/blog/?limit=4': {
    status: 200,
    body: [{ id: 5, title: 'Uganda Safari Packing Guide', slug: 'uganda-packing-guide' }],
  },
  '/api/v1/packages/comprehensive/bwindi-gorilla-safari': {
    status: 200,
    body: {
      id: 10,
      name: '5-Day Bwindi Gorilla Trekking Safari',
      slug: 'bwindi-gorilla-safari',
      summary: 'An unforgettable 5-day Uganda primate safari to Bwindi Impenetrable National Park.',
      description: '<p>Experience mountain gorilla trekking in southwestern Uganda with expert local guides.</p>',
      duration_days: 5,
      price: 2450,
      package_type: 'safari',
      image_id: 'abc-123',
      highlights: ['Permitted mountain gorilla trek in Bwindi', 'Scenic drive across the Equator'],
      country: { id: 1, name: 'Uganda', slug: 'uganda' },
      holiday_types: [{ id: 1, name: 'Gorilla Trekking', slug: 'gorilla-trekking' }],
      itinerary_items: [
        {
          id: 1,
          day_number: 1,
          title: 'Arrival in Entebbe',
          location: 'Entebbe',
          description: 'Meet your safari guide and transfer to your lakeside boutique hotel.',
          hotels: [{ id: 1, name: 'Hotel No. 5', slug: 'hotel-no-5' }],
          custom_activities: [{ id: 1, activity_title: 'Airport Transfer & Briefing' }],
          linked_activities: [],
        },
        {
          id: 2,
          day_number: 2,
          title: 'Gorilla Trekking in Bwindi',
          location: 'Bwindi Impenetrable Forest',
          description: 'Guided trek into the ancient rainforest to spend one hour with mountain gorillas.',
          hotels: [{ id: 2, name: 'Clouds Mountain Gorilla Lodge', slug: 'clouds-mountain-gorilla-lodge' }],
          custom_activities: [],
          linked_activities: [{ id: 3, name: 'Gorilla Trekking' }],
        },
      ],
      price_charts: [
        {
          id: 1,
          title: 'Low Season',
          start_date: '2026-03-01T00:00:00',
          end_date: '2026-05-31T00:00:00',
          price: 2450,
          notes: 'Per person sharing',
        },
        {
          id: 2,
          title: 'Peak Season',
          start_date: '2026-06-01T00:00:00',
          end_date: '2026-09-30T00:00:00',
          price: 2950,
          notes: 'Dry season prime trekking',
        },
      ],
      inclusion_items: [{ id: 1, name: 'Uganda Gorilla Trekking Permit ($800)' }, { id: 2, name: '4x4 Safari Land Cruiser' }],
      exclusion_items: [{ id: 1, name: 'International flights' }],
      hotels: [{ id: 2, name: 'Clouds Mountain Gorilla Lodge', slug: 'clouds-mountain-gorilla-lodge', city: 'Nkuringo' }],
      attractions: [{ id: 1, name: 'Bwindi Impenetrable Forest', slug: 'bwindi-impenetrable-forest' }],
      reviews: [
        { id: 1, reviewer_name: 'Sarah M.', rating: 5, content: 'Life-changing gorilla encounter and seamless logistics!' },
      ],
      blog_posts: [{ id: 5, title: 'Uganda Safari Packing Guide', slug: 'uganda-packing-guide' }],
    },
  },
  '/api/v1/packages/slug/bwindi-gorilla-safari': {
    status: 200,
    body: {
      id: 10,
      slug: 'bwindi-gorilla-safari',
      faqs: [
        {
          question: 'How much does a Uganda gorilla trekking permit cost?',
          answer: 'A Uganda gorilla trekking permit costs $800 per person and is included in this package.',
        },
      ],
    },
  },
  '/api/v1/blog/slug/uganda-packing-guide': {
    status: 200,
    body: {
      id: 5,
      title: 'Uganda Safari Packing Guide',
      slug: 'uganda-packing-guide',
      summary: 'Everything you need to pack for gorilla trekking and savannah game drives.',
      content: '<p>Bring waterproof hiking boots.</p><script>alert("xss")</script><a href="javascript:evil()" onclick="steal()">Link</a>',
      published_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-02-20T10:00:00Z',
      tags: [{ id: 1, name: 'Packing Tips', slug: 'packing-tips' }],
      packages: [{ id: 10, name: '5-Day Bwindi Gorilla Trekking Safari', slug: 'bwindi-gorilla-safari', country: { slug: 'uganda' } }],
    },
  },
  '/api/v1/countries/slug/uganda/details': {
    status: 200,
    body: {
      id: 1,
      name: 'Uganda',
      slug: 'uganda',
      description: 'Uganda offers mountain gorillas, chimpanzees, and classic Big Five safaris.',
      region: { id: 1, name: 'East Africa', slug: 'east-africa' },
      highlights: ['Over half the world population of mountain gorillas'],
      faqs: [{ question: 'When is the best time to visit Uganda?', answer: 'June to September and December to February.' }],
      visit_info: { general_notes: 'Dry seasons from June to September are best for trekking.' },
      packages: [{ id: 10, name: '5-Day Bwindi Gorilla Trekking Safari', slug: 'bwindi-gorilla-safari', duration_days: 5, price: 2450 }],
      hotels: [{ id: 2, name: 'Clouds Mountain Gorilla Lodge', slug: 'clouds-mountain-gorilla-lodge' }],
      attractions: [{ id: 1, name: 'Bwindi Impenetrable Forest', slug: 'bwindi-impenetrable-forest' }],
      activities: [{ id: 3, name: 'Gorilla Trekking', slug: 'gorilla-trekking' }],
      group_trips: [],
    },
  },
  '/api/v1/hotels/details/clouds-mountain-gorilla-lodge': {
    status: 200,
    body: {
      id: 2,
      name: 'Clouds Mountain Gorilla Lodge',
      slug: 'clouds-mountain-gorilla-lodge',
      summary: 'Intimate luxury stone cottages overlooking the Virunga volcanoes.',
      stars: 5,
      city: 'Nkuringo',
      country: { id: 1, name: 'Uganda', slug: 'uganda' },
      amenities: [{ id: 1, name: 'Private Butler' }, { id: 2, name: 'Fireplace' }],
      price_charts: [{ id: 1, title: 'High Season', start_date: '2026-06-01', end_date: '2026-09-30', price: 950 }],
    },
  },
  '/api/v1/regions/slug/east-africa/with-countries': {
    status: 200,
    body: {
      id: 1,
      name: 'East Africa',
      slug: 'east-africa',
      description: 'Home to mountain gorillas and the Great Migration.',
      countries: [{ id: 1, name: 'Uganda', slug: 'uganda' }],
    },
  },
  '/api/v1/attractions/slug/bwindi-impenetrable-forest': {
    status: 200,
    body: {
      id: 1,
      name: 'Bwindi Impenetrable Forest',
      slug: 'bwindi-impenetrable-forest',
      summary: 'UNESCO World Heritage rainforest in southwestern Uganda.',
      country: { id: 1, name: 'Uganda', slug: 'uganda' },
    },
  },
  '/api/v1/activities/slug/gorilla-trekking': {
    status: 200,
    body: {
      id: 3,
      name: 'Gorilla Trekking',
      slug: 'gorilla-trekking',
      summary: 'Guided forest trek to observe mountain gorillas.',
      countries: [{ id: 1, name: 'Uganda', slug: 'uganda' }],
    },
  },
  '/api/v1/packages/comprehensive/east-africa-overland': {
    status: 200,
    body: {
      id: 99,
      name: '14-Day East Africa Overland Safari',
      slug: 'east-africa-overland',
      summary: 'Cross-border safari spanning Uganda, Kenya, and Tanzania.',
      duration_days: 14,
      price: 4500,
    },
  },
  '/api/v1/packages/slug/east-africa-overland': {
    status: 200,
    body: { id: 99, slug: 'east-africa-overland', faqs: [] },
  },
  '/api/v1/packages/comprehensive/non-existent-tour': { status: 404, body: { detail: 'Package not found' } },
  '/api/v1/packages/slug/non-existent-tour': { status: 404, body: { detail: 'Package not found' } },
  '/api/v1/hotels/details/missing-hotel': { status: 404, body: { detail: 'Hotel not found' } },
  '/api/v1/countries/slug/atlantis/details': { status: 404, body: { detail: 'Country not found' } },
};

const originalFetch = globalThis.fetch;

function installMockFetch(overrides = {}) {
  globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    const key = `${url.pathname}${url.search}`;
    if (key in overrides) {
      const ov = overrides[key];
      if (ov instanceof Error) throw ov;
      return new Response(JSON.stringify(ov.body), {
        status: ov.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const mock = MOCK_API_RESPONSES[key] || MOCK_API_RESPONSES[url.pathname];
    if (mock) {
      return new Response(JSON.stringify(mock.body), {
        status: mock.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ detail: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  delete globalThis.caches;
});

test('Homepage / returns canonical, TravelAgency + WebSite @graph JSON-LD, semantic body, headers, and caches response', async () => {
  installMockFetch();
  const mockCache = createMockCache();
  globalThis.caches = { default: mockCache };
  const { env } = createMockEnv();
  const waitUntilPromises = [];
  const ctx = { waitUntil: (p) => waitUntilPromises.push(p) };

  const req = new Request('https://allboundvacations.com/');
  const res = await worker.fetch(req, env, ctx);
  await Promise.all(waitUntilPromises);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');
  assert.equal(res.headers.get('Cache-Control'), 'public, s-maxage=3600, max-age=300');
  assert.equal(res.headers.get('X-Allbounds-SSR'), 'rendered');

  const html = await res.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/allboundvacations\.com\/" \/>/);
  assert.match(html, /<h1>Allbound Vacations — Tailor-Made African Safaris/);
  assert.match(html, /href="\/destinations\/uganda\/"/);
  assert.match(html, /href="\/packages\/uganda\/bwindi-gorilla-safari\/"/);

  const jsonLd = extractJsonLd(html);
  assert.equal(jsonLd['@context'], 'https://schema.org');
  const types = jsonLd['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('TravelAgency'));
  assert.ok(types.includes('WebSite'));
  const org = jsonLd['@graph'].find((n) => n['@type'] === 'TravelAgency');
  assert.equal(org['@id'], 'https://allboundvacations.com/#organization');
  assert.equal(org.url, 'https://allboundvacations.com/');

  // Second request should hit cache
  const res2 = await worker.fetch(new Request('https://allboundvacations.com/?utm_source=chatgpt'), env, ctx);
  assert.equal(res2.status, 200);
  assert.equal(res2.headers.get('X-Allbounds-SSR'), 'cache-hit');
});

test('Package detail route renders full itinerary, pricing table, inclusions, FAQs, and unified @graph JSON-LD', async () => {
  installMockFetch();
  globalThis.caches = { default: createMockCache() };
  const { env } = createMockEnv();

  const res = await worker.fetch(
    new Request('https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/'),
    env,
    {}
  );

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');

  const html = await res.text();
  assert.match(html, /<title>5-Day Bwindi Gorilla Trekking Safari \| Allbound Vacations<\/title>/);
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/allboundvacations\.com\/packages\/uganda\/bwindi-gorilla-safari\/" \/>/
  );
  // Semantic body assertions
  assert.match(html, /<dl>[\s\S]*5 Days[\s\S]*\$2,450 per person[\s\S]*<\/dl>/);
  assert.match(html, /<ol>[\s\S]*Day 1: Arrival in Entebbe[\s\S]*Day 2: Gorilla Trekking in Bwindi[\s\S]*<\/ol>/);
  assert.match(html, /<table>[\s\S]*Low Season[\s\S]*\$2,450[\s\S]*Peak Season[\s\S]*\$2,950[\s\S]*<\/table>/);
  assert.match(html, /Uganda Gorilla Trekking Permit \(\$800\)/);
  assert.match(html, /<details open><summary>How much does a Uganda gorilla trekking permit cost\?<\/summary>/);

  // Unified @graph JSON-LD assertions
  const jsonLd = extractJsonLd(html);
  const trip = jsonLd['@graph'].find((n) => n['@type'] === 'TouristTrip');
  const faq = jsonLd['@graph'].find((n) => n['@type'] === 'FAQPage');
  const breadcrumb = jsonLd['@graph'].find((n) => n['@type'] === 'BreadcrumbList');

  assert.ok(trip, 'TouristTrip node missing');
  assert.equal(trip.provider['@id'], 'https://allboundvacations.com/#organization');
  assert.equal(trip.url, 'https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/');
  assert.equal(trip.offers['@type'], 'AggregateOffer');
  assert.equal(trip.offers.lowPrice, 2450);
  assert.equal(trip.offers.highPrice, 2950);
  assert.equal(trip.aggregateRating.ratingValue, 5);
  assert.equal(trip.itinerary.numberOfItems, 2);

  assert.ok(faq, 'FAQPage node missing');
  assert.equal(faq.mainEntity.length, 1);

  assert.ok(breadcrumb, 'BreadcrumbList node missing');
  for (const item of breadcrumb.itemListElement) {
    assert.ok(item.item.endsWith('/'), `Breadcrumb URL must end with trailing slash: ${item.item}`);
  }
});

test('Blog detail sanitizes dangerous HTML and outputs BlogPosting JSON-LD', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  const res = await worker.fetch(
    new Request('https://allboundvacations.com/blog/uganda-packing-guide/'),
    env,
    {}
  );
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /Bring waterproof hiking boots\./);
  assert.doesNotMatch(html, /alert\("xss"\)/);
  assert.doesNotMatch(html, /onclick=/i);
  assert.doesNotMatch(html, /javascript:evil/i);

  const jsonLd = extractJsonLd(html);
  const post = jsonLd['@graph'].find((n) => n['@type'] === 'BlogPosting');
  assert.ok(post, 'BlogPosting node missing');
  assert.equal(post.url, 'https://allboundvacations.com/blog/uganda-packing-guide/');
  assert.equal(post.publisher['@id'], 'https://allboundvacations.com/#organization');
});

test('Country and Hotel details render TouristDestination/FAQPage and Hotel JSON-LD', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  const countryRes = await worker.fetch(
    new Request('https://allboundvacations.com/destinations/uganda/'),
    env,
    {}
  );
  assert.equal(countryRes.status, 200);
  const countryHtml = await countryRes.text();
  const countryLd = extractJsonLd(countryHtml);
  assert.ok(countryLd['@graph'].some((n) => n['@type'] === 'TouristDestination'));
  assert.ok(countryLd['@graph'].some((n) => n['@type'] === 'FAQPage'));
  assert.match(countryHtml, /Best Time to Visit Uganda/);

  const hotelRes = await worker.fetch(
    new Request('https://allboundvacations.com/hotels/clouds-mountain-gorilla-lodge/'),
    env,
    {}
  );
  assert.equal(hotelRes.status, 200);
  const hotelHtml = await hotelRes.text();
  const hotelLd = extractJsonLd(hotelHtml);
  const hotelNode = hotelLd['@graph'].find((n) => n['@type'] === 'Hotel');
  assert.ok(hotelNode);
  assert.equal(hotelNode.starRating.ratingValue, 5);
});

test('Missing slug (API 404) returns true HTTP 404 with 404.html instead of soft-200', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  for (const path of [
    '/packages/non-existent-tour/',
    '/packages/uganda/non-existent-tour/',
    '/hotels/missing-hotel/',
    '/destinations/atlantis/',
  ]) {
    const res = await worker.fetch(new Request(`https://allboundvacations.com${path}`), env, {});
    assert.equal(res.status, 404, `Expected HTTP 404 for ${path}`);
    assert.equal(res.headers.get('X-Robots-Tag'), 'noindex, nofollow');
    const html = await res.text();
    assert.match(html, /Page Not Found/i);
  }
});

test('Non-public routes (/admin/, /assets/..., /robots.txt, /sign/..., /verify/...) pass through cleanly', async () => {
  installMockFetch();
  const { env, assetCalls } = createMockEnv();

  // Admin route serves SPA shell with noindex
  const adminRes = await worker.fetch(new Request('https://allboundvacations.com/admin/dashboard'), env, {});
  assert.equal(adminRes.status, 200);
  assert.equal(adminRes.headers.get('X-Robots-Tag'), 'noindex, nofollow');
  assert.equal(adminRes.headers.get('X-Allbounds-SSR'), null);
  assert.ok(assetCalls.includes('/admin/'));

  // Static JS asset passes straight through
  const assetRes = await worker.fetch(new Request('https://allboundvacations.com/assets/app.12345.js'), env, {});
  assert.equal(assetRes.status, 200);
  assert.equal(await assetRes.text(), 'console.log("app");');

  // robots.txt passes straight through
  const robotsRes = await worker.fetch(new Request('https://allboundvacations.com/robots.txt'), env, {});
  assert.equal(robotsRes.status, 200);
  assert.match(await robotsRes.text(), /User-agent:/);

  // /sign/ and /verify/ serve SPA shell with noindex
  const signRes = await worker.fetch(new Request('https://allboundvacations.com/sign/voucher/tok123'), env, {});
  assert.equal(signRes.status, 200);
  assert.equal(signRes.headers.get('X-Robots-Tag'), 'noindex, nofollow');
});

test('Legacy /stays and /stays/ routes 308-redirect to /hotels/', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  for (const path of ['/stays', '/stays/']) {
    const res = await worker.fetch(new Request(`https://allboundvacations.com${path}`), env, {});
    assert.equal(res.status, 308, `Expected HTTP 308 for ${path}`);
    assert.equal(res.headers.get('Location'), 'https://allboundvacations.com/hotels/');
  }
});

test('Duplicate entity routes 308-redirect to single canonical trailing-slash URLs without looping', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  const redirectCases = [
    ['/countries/uganda', 'https://allboundvacations.com/destinations/uganda/'],
    ['/countries/uganda/', 'https://allboundvacations.com/destinations/uganda/'],
    ['/destinations/countries/uganda', 'https://allboundvacations.com/destinations/uganda/'],
    ['/destinations/countries/uganda/', 'https://allboundvacations.com/destinations/uganda/'],
    ['/destinations/regions/east-africa', 'https://allboundvacations.com/regions/east-africa/'],
    ['/destinations/regions/east-africa/', 'https://allboundvacations.com/regions/east-africa/'],
    ['/hotels/uganda/clouds-mountain-gorilla-lodge', 'https://allboundvacations.com/hotels/clouds-mountain-gorilla-lodge/'],
    ['/hotels/uganda/clouds-mountain-gorilla-lodge/', 'https://allboundvacations.com/hotels/clouds-mountain-gorilla-lodge/'],
    ['/destinations/uganda/hotels/clouds-mountain-gorilla-lodge', 'https://allboundvacations.com/hotels/clouds-mountain-gorilla-lodge/'],
    ['/destinations/uganda/hotels/clouds-mountain-gorilla-lodge/', 'https://allboundvacations.com/hotels/clouds-mountain-gorilla-lodge/'],
    ['/attractions/uganda/bwindi-impenetrable-forest', 'https://allboundvacations.com/attractions/bwindi-impenetrable-forest/'],
    ['/destinations/uganda/attractions/bwindi-impenetrable-forest/', 'https://allboundvacations.com/attractions/bwindi-impenetrable-forest/'],
    ['/activities/uganda/gorilla-trekking', 'https://allboundvacations.com/activities/gorilla-trekking/'],
    ['/destinations/uganda/activities/gorilla-trekking/', 'https://allboundvacations.com/activities/gorilla-trekking/'],
  ];

  for (const [fromPath, expectedLocation] of redirectCases) {
    const res = await worker.fetch(new Request(`https://allboundvacations.com${fromPath}`), env, {});
    assert.equal(res.status, 308, `Expected HTTP 308 for ${fromPath}`);
    assert.equal(res.headers.get('Location'), expectedLocation, `Wrong redirect target for ${fromPath}`);

    // Verify canonical destination returns 200 (no redirect loop)
    const canonicalRes = await worker.fetch(new Request(expectedLocation), env, {});
    assert.equal(canonicalRes.status, 200, `Expected HTTP 200 for canonical ${expectedLocation}`);
  }

  // Verify destination category hubs still return 200 (not caught by nested entity redirects)
  for (const hubPath of [
    '/destinations/uganda/hotels/',
    '/destinations/uganda/attractions/',
    '/destinations/uganda/activities/',
  ]) {
    const res = await worker.fetch(new Request(`https://allboundvacations.com${hubPath}`), env, {});
    assert.equal(res.status, 200, `Expected HTTP 200 for category hub ${hubPath}`);
  }
});

test('Short /packages/:slug 308-redirects when country exists and renders 200 with canonical when country is absent', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  // Package with country -> 308 redirect to /packages/:country/:slug/
  for (const path of ['/packages/bwindi-gorilla-safari', '/packages/bwindi-gorilla-safari/']) {
    const res = await worker.fetch(new Request(`https://allboundvacations.com${path}`), env, {});
    assert.equal(res.status, 308, `Expected HTTP 308 for ${path}`);
    assert.equal(
      res.headers.get('Location'),
      'https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/'
    );
  }

  // Canonical /packages/:country/:slug/ still returns 200 without looping
  const canonicalPkgRes = await worker.fetch(
    new Request('https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/'),
    env,
    {}
  );
  assert.equal(canonicalPkgRes.status, 200);

  // Country-less package -> renders 200 with self canonical
  const noCountryRes = await worker.fetch(
    new Request('https://allboundvacations.com/packages/east-africa-overland/'),
    env,
    {}
  );
  assert.equal(noCountryRes.status, 200);
  const html = await noCountryRes.text();
  assert.match(
    html,
    /<link rel="canonical" href="https:\/\/allboundvacations\.com\/packages\/east-africa-overland\/" \/>/
  );
});

test('Graceful fallback when API is unreachable returns 200 SPA shell with Content-Signal', async () => {
  installMockFetch({
    '/api/v1/packages/comprehensive/bwindi-gorilla-safari': new Error('Network timeout'),
    '/api/v1/packages/slug/bwindi-gorilla-safari': new Error('Network timeout'),
  });
  const { env } = createMockEnv();

  const res = await worker.fetch(
    new Request('https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/'),
    env,
    {}
  );
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');
  assert.equal(res.headers.get('X-Allbounds-SSR'), 'spa-fallback');
  assert.equal(res.headers.get('Vary'), 'Accept');
});

test('Accept: text/markdown on / and /packages/uganda/gorilla-trek/ returns structured Markdown with required headers', async () => {
  const gorillaTrekPkg = {
    ...MOCK_API_RESPONSES['/api/v1/packages/comprehensive/bwindi-gorilla-safari'].body,
    slug: 'gorilla-trek',
    name: '5-Day Uganda Gorilla Trek',
  };
  installMockFetch({
    '/api/v1/packages/comprehensive/gorilla-trek': { status: 200, body: gorillaTrekPkg },
    '/api/v1/packages/slug/gorilla-trek': {
      status: 200,
      body: {
        id: 10,
        slug: 'gorilla-trek',
        faqs: [
          {
            question: 'How much does a Uganda gorilla trekking permit cost?',
            answer: 'A Uganda gorilla trekking permit costs $800 per person and is included in this package.',
          },
        ],
      },
    },
  });
  const mockCache = createMockCache();
  globalThis.caches = { default: mockCache };
  const { env } = createMockEnv();
  const waitUntilPromises = [];
  const ctx = { waitUntil: (p) => waitUntilPromises.push(p) };

  // 1. Homepage as Markdown
  const homeRes = await worker.fetch(
    new Request('https://allboundvacations.com/', {
      headers: { Accept: 'text/markdown' },
    }),
    env,
    ctx
  );
  await Promise.all(waitUntilPromises);

  assert.equal(homeRes.status, 200);
  assert.equal(homeRes.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(homeRes.headers.get('Vary'), 'Accept');
  assert.equal(homeRes.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');
  assert.equal(homeRes.headers.get('Cache-Control'), 'public, s-maxage=3600, max-age=300');

  const homeMd = await homeRes.text();
  assert.equal(homeRes.headers.get('x-markdown-tokens'), String(Math.ceil(homeMd.length / 4)));
  assert.match(homeMd, /^# Allbound Vacations/m);
  assert.match(homeMd, /Canonical URL: https:\/\/allboundvacations\.com\//);
  assert.match(homeMd, /\[Uganda\]\(https:\/\/allboundvacations\.com\/destinations\/uganda\/\)/);
  assert.match(
    homeMd,
    /\[5-Day Bwindi Gorilla Trekking Safari\]\(https:\/\/allboundvacations\.com\/packages\/uganda\/bwindi-gorilla-safari\/\)/
  );

  // 2. Package detail as Markdown (/packages/uganda/gorilla-trek/)
  const pkgRes = await worker.fetch(
    new Request('https://allboundvacations.com/packages/uganda/gorilla-trek/', {
      headers: { Accept: 'text/markdown, text/html;q=0.9' },
    }),
    env,
    ctx
  );
  await Promise.all(waitUntilPromises);

  assert.equal(pkgRes.status, 200);
  assert.equal(pkgRes.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(pkgRes.headers.get('Vary'), 'Accept');
  assert.equal(pkgRes.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');
  assert.equal(pkgRes.headers.get('Cache-Control'), 'public, s-maxage=3600, max-age=300');

  const pkgMd = await pkgRes.text();
  assert.equal(pkgRes.headers.get('x-markdown-tokens'), String(Math.ceil(pkgMd.length / 4)));
  assert.match(pkgMd, /^# 5-Day Uganda Gorilla Trek$/m);
  assert.match(pkgMd, /Canonical URL: https:\/\/allboundvacations\.com\/packages\/uganda\/gorilla-trek\//);
  assert.match(pkgMd, /- \*\*Duration:\*\* 5 Days/);
  assert.match(pkgMd, /- \*\*Starting Price:\*\* \$2,450 per person/);
  assert.match(pkgMd, /^## Day 1: Arrival in Entebbe$/m);
  assert.match(pkgMd, /^## Day 2: Gorilla Trekking in Bwindi$/m);
  assert.match(pkgMd, /\| Season \| Price \| Valid Dates \| Notes \|/);
  assert.match(pkgMd, /\| Low Season \| \$2,450 \| 2026-03-01 to 2026-05-31 \| Per person sharing \|/);
  assert.match(pkgMd, /## What Is Included[\s\S]*- Uganda Gorilla Trekking Permit \(\$800\)/);
  assert.match(pkgMd, /## What Is Excluded[\s\S]*- International flights/);
  assert.match(pkgMd, /### How much does a Uganda gorilla trekking permit cost\?/);
  assert.match(pkgMd, /costs \$800 per person/);
  assert.match(
    pkgMd,
    /\[Clouds Mountain Gorilla Lodge\]\(https:\/\/allboundvacations\.com\/hotels\/clouds-mountain-gorilla-lodge\/\)/
  );
});

test('Cache separates Markdown and HTML variants on the same route with Vary: Accept', async () => {
  installMockFetch();
  const mockCache = createMockCache();
  globalThis.caches = { default: mockCache };
  const { env } = createMockEnv();
  const waitUntilPromises = [];
  const ctx = { waitUntil: (p) => waitUntilPromises.push(p) };

  const routeUrl = 'https://allboundvacations.com/packages/uganda/bwindi-gorilla-safari/';

  // First request: Markdown (populates md cache entry)
  const mdRes1 = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: 'text/markdown' } }),
    env,
    ctx
  );
  await Promise.all(waitUntilPromises);
  assert.equal(mdRes1.status, 200);
  assert.equal(mdRes1.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(mdRes1.headers.get('Vary'), 'Accept');
  assert.equal(mdRes1.headers.get('X-Allbounds-SSR'), 'rendered');

  // Second request: HTML on the exact same route must NOT get cached Markdown
  const htmlRes1 = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' } }),
    env,
    ctx
  );
  await Promise.all(waitUntilPromises);
  assert.equal(htmlRes1.status, 200);
  assert.equal(htmlRes1.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(htmlRes1.headers.get('Vary'), 'Accept');
  assert.equal(htmlRes1.headers.get('X-Allbounds-SSR'), 'rendered');
  const htmlBody = await htmlRes1.text();
  assert.match(htmlBody, /<!doctype html>/i);

  // Third request: Markdown hits md cache; fourth request: HTML hits html cache
  const mdRes2 = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: 'text/markdown' } }),
    env,
    ctx
  );
  assert.equal(mdRes2.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(mdRes2.headers.get('X-Allbounds-SSR'), 'cache-hit');

  const htmlRes2 = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: 'text/html' } }),
    env,
    ctx
  );
  assert.equal(htmlRes2.headers.get('Content-Type'), 'text/html; charset=utf-8');
  assert.equal(htmlRes2.headers.get('X-Allbounds-SSR'), 'cache-hit');

  // Quality preference: text/html preferred over lower-q text/markdown -> HTML
  const lowerQRes = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: 'text/html, text/markdown;q=0.5' } }),
    env,
    ctx
  );
  assert.equal(lowerQRes.headers.get('Content-Type'), 'text/html; charset=utf-8');

  // Wildcard browser default */* -> HTML
  const wildcardRes = await worker.fetch(
    new Request(routeUrl, { headers: { Accept: '*/*' } }),
    env,
    ctx
  );
  assert.equal(wildcardRes.headers.get('Content-Type'), 'text/html; charset=utf-8');
});

test('Accept: text/markdown converts blog HTML safely and returns 404 Markdown on missing slug', async () => {
  installMockFetch();
  const { env } = createMockEnv();

  // Blog detail HTML-to-Markdown conversion (XSS stripped)
  const blogRes = await worker.fetch(
    new Request('https://allboundvacations.com/blog/uganda-packing-guide/', {
      headers: { Accept: 'text/markdown' },
    }),
    env,
    {}
  );
  assert.equal(blogRes.status, 200);
  assert.equal(blogRes.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(blogRes.headers.get('Vary'), 'Accept');
  const blogMd = await blogRes.text();
  assert.match(blogMd, /^# Uganda Safari Packing Guide$/m);
  assert.match(blogMd, /Bring waterproof hiking boots\./);
  assert.doesNotMatch(blogMd, /alert\("xss"\)/);
  assert.doesNotMatch(blogMd, /javascript:evil/i);
  assert.match(
    blogMd,
    /\[5-Day Bwindi Gorilla Trekking Safari\]\(https:\/\/allboundvacations\.com\/packages\/uganda\/bwindi-gorilla-safari\/\)/
  );

  // Missing detail entity returns HTTP 404 in text/markdown
  const notFoundRes = await worker.fetch(
    new Request('https://allboundvacations.com/packages/uganda/non-existent-tour/', {
      headers: { Accept: 'text/markdown' },
    }),
    env,
    {}
  );
  assert.equal(notFoundRes.status, 404);
  assert.equal(notFoundRes.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
  assert.equal(notFoundRes.headers.get('Vary'), 'Accept');
  assert.match(await notFoundRes.text(), /^# 404 Not Found/m);
});

test('GET and HEAD /llms.txt return llmstxt.org structured directory (live API + cached + offline fallback)', async () => {
  installMockFetch();
  const mockCache = createMockCache();
  globalThis.caches = { default: mockCache };
  const { env } = createMockEnv();
  const waitUntilPromises = [];
  const ctx = { waitUntil: (p) => waitUntilPromises.push(p) };

  // Live API-populated /llms.txt
  const res = await worker.fetch(new Request('https://allboundvacations.com/llms.txt'), env, ctx);
  await Promise.all(waitUntilPromises);

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'text/plain; charset=utf-8');
  assert.equal(res.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');
  assert.equal(res.headers.get('Cache-Control'), 'public, s-maxage=3600, max-age=300');
  assert.equal(res.headers.get('X-Allbounds-SSR'), 'rendered');

  const body = await res.text();
  assert.match(body, /^# Allbound Vacations$/m);
  assert.match(body, /^> Allbound Vacations is a full-service African safari operator/m);
  assert.match(body, /^## Destinations$/m);
  assert.match(body, /^## Featured Safari & Holiday Packages$/m);
  assert.match(body, /^## Group Trips$/m);
  assert.match(body, /^## Holiday Types$/m);
  assert.match(body, /^## Travel Guides & Blog$/m);
  assert.match(body, /^## About & Contact$/m);
  assert.match(body, /\[Uganda\]\(https:\/\/allboundvacations\.com\/destinations\/uganda\/\)/);
  assert.match(
    body,
    /\[5-Day Bwindi Gorilla Trekking Safari\]\(https:\/\/allboundvacations\.com\/packages\/uganda\/bwindi-gorilla-safari\/\)/
  );
  assert.match(
    body,
    /\[East Africa Migration Group Expedition\]\(https:\/\/allboundvacations\.com\/group-trips\/east-africa-migration\/\)/
  );
  assert.match(
    body,
    /\[Gorilla Trekking\]\(https:\/\/allboundvacations\.com\/holiday-types\/gorilla-trekking\/\)/
  );
  assert.match(
    body,
    /\[Uganda Safari Packing Guide\]\(https:\/\/allboundvacations\.com\/blog\/uganda-packing-guide\/\)/
  );

  // Second GET /llms.txt hits Cloudflare Cache API
  const cachedRes = await worker.fetch(new Request('https://allboundvacations.com/llms.txt'), env, ctx);
  assert.equal(cachedRes.status, 200);
  assert.equal(cachedRes.headers.get('X-Allbounds-SSR'), 'cache-hit');

  // HEAD /llms.txt returns 200 with empty body and proper headers
  const headRes = await worker.fetch(
    new Request('https://allboundvacations.com/llms.txt', { method: 'HEAD' }),
    env,
    ctx
  );
  assert.equal(headRes.status, 200);
  assert.equal(headRes.headers.get('Content-Type'), 'text/plain; charset=utf-8');
  assert.equal(await headRes.text(), '');

  // API-offline fallback (fresh cache) still returns 200 with core static hub links
  globalThis.caches = { default: createMockCache() };
  installMockFetch({
    '/api/v1/countries/?limit=20': new Error('API offline'),
    '/api/v1/packages/featured?limit=8': new Error('API offline'),
    '/api/v1/packages/?limit=8': new Error('API offline'),
    '/api/v1/group-trips/?limit=6': new Error('API offline'),
    '/api/v1/holiday-types/?limit=12': new Error('API offline'),
    '/api/v1/blog/?limit=4': new Error('API offline'),
  });

  const offlineRes = await worker.fetch(new Request('https://allboundvacations.com/llms.txt'), env, ctx);
  assert.equal(offlineRes.status, 200);
  assert.equal(offlineRes.headers.get('Content-Type'), 'text/plain; charset=utf-8');
  assert.equal(offlineRes.headers.get('Content-Signal'), 'ai-train=yes, search=yes, ai-input=yes');

  const offlineBody = await offlineRes.text();
  assert.match(offlineBody, /^# Allbound Vacations$/m);
  assert.match(offlineBody, /\[Explore All Destinations\]\(https:\/\/allboundvacations\.com\/destinations\/\)/);
  assert.match(offlineBody, /\[All Safari & Tour Packages\]\(https:\/\/allboundvacations\.com\/packages\/\)/);
  assert.match(offlineBody, /\[Scheduled Group Trips\]\(https:\/\/allboundvacations\.com\/group-trips\/\)/);
  assert.match(offlineBody, /\[Explore Holiday Types\]\(https:\/\/allboundvacations\.com\/holiday-types\/\)/);
  assert.match(offlineBody, /\[Travel Blog & Safari Guides\]\(https:\/\/allboundvacations\.com\/blog\/\)/);
  assert.match(offlineBody, /\[About Allbound Vacations\]\(https:\/\/allboundvacations\.com\/about-us\/\)/);
});
