/**
 * Cloudflare Pages Edge SSR Worker for Allbound Vacations
 *
 * Serves full semantic HTML + unified @graph JSON-LD on the initial HTTP response
 * for non-JS AI crawlers (OAI-SearchBot, ChatGPT-User, GPTBot, PerplexityBot,
 * Claude-SearchBot, ClaudeBot) and search engines, while preserving seamless
 * React SPA hydration for human browsers.
 *
 * Self-contained (zero npm dependencies — runs directly on Cloudflare Workers runtime).
 */

const SITE_URL = 'https://allboundvacations.com';
const SITE_NAME = 'Allbound Vacations';
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const DEFAULT_API_BASE_URL = 'https://api.allboundvacations.com/api/v1';
const CLOUDFLARE_DELIVERY_URL = 'https://imagedelivery.net/4J4CgzUI_LpQRpA_N1TErQ';
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo/og-default.png`;
const DEFAULT_DESCRIPTION =
  'Discover extraordinary destinations with Allbound Vacations. Explore curated safari packages, luxury stays, and unforgettable group trips across Africa and beyond.';

const CONTENT_SIGNAL_HEADER = 'ai-train=yes, search=yes, ai-input=yes';
const PUBLIC_CACHE_CONTROL = 'public, s-maxage=3600, max-age=300';
const NEGOTIATED_CLIENT_CACHE_CONTROL = 'public, max-age=300, must-revalidate';
const API_TIMEOUT_MS = 4000;

const DESTINATION_CATEGORIES = {
  packages: {
    label: 'Tour Packages',
    getDescription: (countryName) =>
      `Discover handpicked travel packages and custom tours across ${countryName}. From wildlife safaris in famous national reserves to cultural expeditions and luxury retreats.`,
  },
  'hotel-packages': {
    label: 'Hotel Packages',
    getDescription: (countryName) =>
      `Discover handpicked hotel packages and luxury safari lodge stays with seasonal rates and night packages in ${countryName}.`,
  },
  'group-trips': {
    label: 'Group Trips',
    getDescription: (countryName) =>
      `Join scheduled small-group departures and expeditions to ${countryName}. Ideal for solo travelers, couples, and friends traveling together.`,
  },
  attractions: {
    label: 'Attractions',
    getDescription: (countryName) =>
      `Explore must-see national parks, wildlife reserves, landmarks, and natural wonders of ${countryName}.`,
  },
  hotels: {
    label: 'Accommodations',
    getDescription: (countryName) =>
      `Find boutique lodges, luxury safari camps, eco-resorts, and city hotels in ${countryName}.`,
  },
  activities: {
    label: 'Activities',
    getDescription: (countryName) =>
      `Browse wildlife trekking, game drives, hot air balloon flights, cultural walks, and signature experiences across ${countryName}.`,
  },
};

const STATIC_PAGES = {
  '/about-us': {
    title: `About Us | ${SITE_NAME}`,
    heading: 'About Allbound Vacations',
    description:
      'Learn about Allbound Vacations — our mission, East African safari expertise, tailor-made itineraries, and dedicated travel specialists in Uganda and Kenya.',
    schemaType: 'AboutPage',
    bodySections: [
      {
        heading: 'Who We Are',
        text: 'Allbound Vacations is a full-service African safari operator and travel agency specializing in tailor-made wildlife safaris, gorilla trekking expeditions, luxury lodge stays, and scheduled group trips across Uganda, Kenya, Tanzania, Rwanda, Zanzibar, and beyond.',
      },
      {
        heading: 'Why Travel With Allbound Vacations',
        items: [
          'Local destination specialists based in East Africa (Uganda & Kenya)',
          'Tailor-made itineraries with transparent seasonal pricing',
          'Handpicked luxury safari lodges, boutique hotels, and tented camps',
          'End-to-end support including domestic flights, park permits, and visa guidance',
        ],
      },
    ],
  },
  '/contact-us': {
    title: `Contact Us | ${SITE_NAME}`,
    heading: 'Contact Our Travel Specialists',
    description:
      'Get in touch with the Allbound Vacations travel team for customized safari itineraries, quotes, group trips, and booking inquiries.',
    schemaType: 'ContactPage',
    bodySections: [
      {
        heading: 'Speak With a Safari Specialist',
        text: 'Reach out to our Uganda or Kenya offices for personalized itinerary planning, gorilla permit availability, hotel rates, and group departure quotes.',
      },
      {
        heading: 'Direct Contact Information',
        items: [
          'Uganda Office Phone: +256 782 594 008',
          'Kenya Office Phone: +254 723 927 458',
          'Email: bookings@allboundvacations.com',
        ],
      },
    ],
  },
  '/visa-application': {
    title: `Visa Application Assistance | ${SITE_NAME}`,
    heading: 'Travel Visa Guidance & Application Assistance',
    description:
      'Information and travel visa guidance for your trip to Uganda, Kenya, Tanzania, Rwanda, and East African destinations with Allbound Vacations.',
    schemaType: 'WebPage',
    bodySections: [
      {
        heading: 'East Africa Visa Support',
        text: 'We guide travelers through e-visa requirements, East Africa Tourist Visas (covering Uganda, Kenya, and Rwanda), passport validity rules, and vaccination documentation before departure.',
      },
    ],
  },
  '/flights': {
    title: `Flight Bookings | ${SITE_NAME}`,
    heading: 'Domestic & Regional Flight Booking',
    description:
      'Book regional, domestic bush flights, and international flights with Allbound Vacations for a seamless African safari experience.',
    schemaType: 'WebPage',
    bodySections: [
      {
        heading: 'Seamless Air Connections',
        text: 'Connect major East African hubs with national park airstrips including Bwindi, Serengeti, Maasai Mara, Entebbe, Nairobi, Kigali, and Zanzibar.',
      },
    ],
  },
  '/payment-plans': {
    title: `Payment Plans & Terms | ${SITE_NAME}`,
    heading: 'Flexible Travel Payment Options',
    description:
      'Flexible payment plans and transparent booking options for your dream safari or holiday with Allbound Vacations.',
    schemaType: 'WebPage',
    bodySections: [
      {
        heading: 'Flexible Safari Payment Plans',
        text: 'Secure your safari with an initial deposit and spread the remaining balance across convenient scheduled installments prior to departure.',
      },
    ],
  },
  '/careers': {
    title: `Careers | ${SITE_NAME}`,
    heading: 'Join Our Team at Allbound Vacations',
    description:
      'Explore career opportunities and join the passionate travel specialists and operations team at Allbound Vacations.',
    schemaType: 'WebPage',
    contentSlug: 'careers',
  },
  '/terms': {
    title: `Terms & Conditions | ${SITE_NAME}`,
    heading: 'Booking Terms & Conditions',
    description:
      'Review booking conditions, deposit schedules, payment policies, and cancellation terms at Allbound Vacations.',
    schemaType: 'WebPage',
    contentSlug: 'terms',
  },
  '/privacy': {
    title: `Privacy Policy | ${SITE_NAME}`,
    heading: 'Privacy Policy',
    description:
      'Learn how Allbound Vacations protects and handles your personal information and travel booking data.',
    schemaType: 'WebPage',
    contentSlug: 'privacy',
  },
};

/* -------------------------------------------------------------------------- */
/*  Utility Helpers                                                           */
/* -------------------------------------------------------------------------- */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function decodeHtmlEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function cleanText(text, maxLength = 160) {
  if (!text) return '';
  const clean = decodeHtmlEntities(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!maxLength || clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 3).trim()}...`;
}

function sanitizeHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<(object|embed|form|input|button|textarea|select)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(object|embed|input|link|meta|base)\b[^>]*\/?>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*["']\s*(?:javascript|data:text\/html)[^"']*["']/gi, '$1="#"');
}

function normalizeTrailingSlash(urlOrPath) {
  if (!urlOrPath || urlOrPath === '/') return '/';
  const [baseAndQuery, hash] = String(urlOrPath).split('#');
  const [base, query] = baseAndQuery.split('?');
  const lastSegment = base.split('/').pop() || '';
  const hasFileExtension = /\.[a-z0-9]+$/i.test(lastSegment);

  let normalizedBase = base;
  if (!hasFileExtension && !normalizedBase.endsWith('/')) {
    normalizedBase = `${normalizedBase}/`;
  }

  let result = normalizedBase;
  if (query !== undefined) result += `?${query}`;
  if (hash !== undefined) result += `#${hash}`;
  return result;
}

function buildAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return `${SITE_URL}/`;
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return normalizeTrailingSlash(pathOrUrl);
  }
  const normalized = normalizeTrailingSlash(pathOrUrl);
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${SITE_URL}${cleanPath}`;
}

function buildInternalHref(path) {
  if (!path || path === '/') return '/';
  const clean = path.startsWith('/') ? path : `/${path}`;
  return normalizeTrailingSlash(clean);
}

function getImageUrl(imageIdOrUrl, variant = 'large') {
  if (!imageIdOrUrl) return DEFAULT_OG_IMAGE;
  const raw = String(imageIdOrUrl).trim();
  if (!raw) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(raw)) return raw;
  const cleanId = raw.replace(/^cloudflare:\/\//i, '');
  return `${CLOUDFLARE_DELIVERY_URL}/${cleanId}/${variant}`;
}

function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) return null;
  const formatted = num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return currency === 'USD' ? `$${formatted}` : `${currency} ${formatted}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const isoPrefix = String(dateStr).match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoPrefix) return isoPrefix[1];
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toISOString().slice(0, 10);
}

function parseListField(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return (item.name || item.title || item.description || '').trim();
        }
        return '';
      })
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    const stripped = cleanText(val, 0);
    if (!stripped) return [];
    return val
      .split(/\r?\n|•|<\/li>|<br\s*\/?>/i)
      .map((s) => cleanText(s, 0))
      .filter(Boolean);
  }
  return [];
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

/* -------------------------------------------------------------------------- */
/*  Agentic Content Negotiation & Markdown Helpers                            */
/* -------------------------------------------------------------------------- */

function prefersMarkdown(request) {
  const accept = request.headers.get('Accept');
  if (!accept) return false;

  let markdownQ = 0;
  let htmlQ = 0;

  for (const part of accept.split(',')) {
    const segments = part.trim().split(';');
    const mediaType = (segments[0] || '').trim().toLowerCase();
    if (!mediaType) continue;

    let q = 1;
    for (let i = 1; i < segments.length; i++) {
      const param = segments[i].trim();
      const qMatch = param.match(/^q\s*=\s*(.+)$/i);
      if (qMatch) {
        const parsed = Number.parseFloat(qMatch[1]);
        q = Number.isFinite(parsed) && parsed > 0 ? Math.min(1, parsed) : 0;
        break;
      }
    }

    if ((mediaType === 'text/markdown' || mediaType === 'text/x-markdown') && q > markdownQ) {
      markdownQ = q;
    } else if (mediaType === 'text/html' && q > htmlQ) {
      htmlQ = q;
    }
  }

  return markdownQ > 0 && markdownQ >= htmlQ;
}

function applyNegotiatedClientCacheHeaders(headers) {
  headers.set('Vary', 'Accept');
  headers.set('Cache-Control', NEGOTIATED_CLIENT_CACHE_CONTROL);
  headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  headers.set('CDN-Cache-Control', 'no-store');
  return headers;
}

function escapeMdLinkText(text) {
  return String(text ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeMdTableCell(text) {
  return String(text ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function mdLink(label, pathOrUrl) {
  const safeLabel = escapeMdLinkText(label || pathOrUrl);
  const href = buildAbsoluteUrl(pathOrUrl);
  return `[${safeLabel}](${href})`;
}

function htmlToMarkdown(html) {
  if (!html) return '';
  let md = sanitizeHtml(html);

  // Convert headings h1..h6
  md = md.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level, inner) => {
    const hashes = '#'.repeat(Math.min(6, Math.max(1, Number(level))));
    const text = cleanText(inner, 0);
    return text ? `\n\n${hashes} ${text}\n\n` : '';
  });

  // Convert links
  md = md.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, inner) => {
    const label = cleanText(inner, 0);
    const trimmedHref = String(href || '').trim();
    if (!label) return '';
    if (!trimmedHref || trimmedHref === '#' || /^javascript:/i.test(trimmedHref)) {
      return label;
    }
    if (/^(mailto:|tel:)/i.test(trimmedHref)) {
      return `[${escapeMdLinkText(label)}](${trimmedHref})`;
    }
    if (/^https?:\/\//i.test(trimmedHref)) {
      return `[${escapeMdLinkText(label)}](${trimmedHref})`;
    }
    if (trimmedHref.startsWith('/')) {
      return mdLink(label, trimmedHref);
    }
    return label;
  });

  // Convert inline formatting
  md = md.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => {
    const text = cleanText(inner, 0);
    return text ? `**${text}**` : '';
  });
  md = md.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, inner) => {
    const text = cleanText(inner, 0);
    return text ? `*${text}*` : '';
  });
  md = md.replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gi, (_m, inner) => {
    const text = decodeHtmlEntities(inner.replace(/<[^>]*>/g, '')).trim();
    return text ? `\`${text}\`` : '';
  });

  // Convert blockquotes
  md = md.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, inner) => {
    const text = cleanText(inner, 0);
    return text ? `\n\n> ${text}\n\n` : '';
  });

  // Convert list items
  md = md.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => {
    const text = decodeHtmlEntities(inner.replace(/<[^>]*>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
    return text ? `\n- ${text}` : '';
  });
  md = md.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n\n');

  // Convert line breaks, horizontal rules, and paragraphs
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
  md = md.replace(/<\/(p|div|section|article|tr)>/gi, '\n\n');
  md = md.replace(/<(p|div|section|article)\b[^>]*>/gi, '\n\n');

  // Strip remaining HTML tags and decode entities
  md = decodeHtmlEntities(md.replace(/<[^>]*>/g, ''));

  // Normalize whitespace per line and collapse blank lines
  return md
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function mdBullets(items) {
  const valid = (items || []).filter(Boolean);
  if (valid.length === 0) return '';
  return valid.map((item) => `- ${item}`).join('\n');
}

function mdFactList(facts) {
  const valid = (facts || []).filter((f) => f && f.value);
  if (valid.length === 0) return '';
  return valid.map((f) => `- **${f.label}:** ${f.value}`).join('\n');
}

function mdTable(headers, rows) {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headerLine = `| ${headers.map(escapeMdTableCell).join(' | ')} |`;
  const sepLine = `| ${headers.map(() => '---').join(' | ')} |`;
  const bodyLines = rows.map(
    (row) => `| ${row.map((cell) => escapeMdTableCell(cell)).join(' | ')} |`
  );
  return [headerLine, sepLine, ...bodyLines].join('\n');
}

function mdFaqs(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';
  const valid = faqs.filter((f) => f && (f.question || f.q) && (f.answer || f.a));
  if (valid.length === 0) return '';
  const blocks = valid.map(
    (f) => `### ${cleanText(f.question || f.q, 0)}\n\n${cleanText(f.answer || f.a, 0)}`
  );
  return `## Frequently Asked Questions\n\n${blocks.join('\n\n')}`;
}

function joinMdSections(sections) {
  return (sections || [])
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

function estimateMarkdownTokens(markdown) {
  return Math.ceil(String(markdown || '').length / 4);
}

/* -------------------------------------------------------------------------- */
/*  API Fetcher with Timeout                                                  */
/* -------------------------------------------------------------------------- */

async function fetchApiJson(apiBaseUrl, endpointPath) {
  const url = `${apiBaseUrl.replace(/\/+$/, '')}/${endpointPath.replace(/^\/+/, '')}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (res.status === 404) {
      return { status: 404, data: null };
    }
    if (!res.ok) {
      return { status: res.status, data: null };
    }
    const data = await res.json();
    return { status: 200, data };
  } catch (_err) {
    return { status: 0, data: null };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* -------------------------------------------------------------------------- */
/*  Unified @graph JSON-LD Builders                                           */
/* -------------------------------------------------------------------------- */

function buildOrganizationNode() {
  return {
    '@type': 'TravelAgency',
    '@id': ORG_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo/main_logo.png`,
    },
    image: DEFAULT_OG_IMAGE,
    description: DEFAULT_DESCRIPTION,
    telephone: '+256-782-594-008',
    email: 'bookings@allboundvacations.com',
    areaServed: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Zanzibar', 'East Africa'],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+256-782-594-008',
        contactType: 'customer service',
        areaServed: 'UG',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        telephone: '+254-723-927-458',
        contactType: 'customer service',
        areaServed: 'KE',
        availableLanguage: 'English',
      },
    ],
  };
}

function buildWebsiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildBreadcrumbNode(canonicalUrl, items) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: buildAbsoluteUrl(item.url),
    })),
  };
}

function buildFaqNode(canonicalUrl, faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  const mainEntity = faqs
    .filter((f) => f && (f.question || f.q) && (f.answer || f.a))
    .map((f) => ({
      '@type': 'Question',
      name: cleanText(f.question || f.q, 0),
      acceptedAnswer: {
        '@type': 'Answer',
        text: cleanText(f.answer || f.a, 0),
      },
    }));
  if (mainEntity.length === 0) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity,
  };
}

function buildGraph(nodes) {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildOrganizationNode(), ...nodes.filter(Boolean)],
  };
}

/* -------------------------------------------------------------------------- */
/*  Semantic HTML Fragment Builders                                           */
/* -------------------------------------------------------------------------- */

function renderSiteNav() {
  return `
    <header>
      <nav aria-label="Primary navigation">
        <a href="/">${escapeHtml(SITE_NAME)}</a>
        <ul>
          <li><a href="/destinations/">Destinations</a></li>
          <li><a href="/packages/">Tour Packages</a></li>
          <li><a href="/group-trips/">Group Trips</a></li>
          <li><a href="/hotels/">Hotels &amp; Lodges</a></li>
          <li><a href="/attractions/">Attractions</a></li>
          <li><a href="/activities/">Activities</a></li>
          <li><a href="/holiday-types/">Holiday Types</a></li>
          <li><a href="/blog/">Travel Blog</a></li>
          <li><a href="/about-us/">About Us</a></li>
          <li><a href="/contact-us/">Contact Us</a></li>
        </ul>
      </nav>
    </header>`;
}

function renderBreadcrumbsHtml(items) {
  if (!items || items.length === 0) return '';
  const lis = items
    .map((item, idx) => {
      const isLast = idx === items.length - 1;
      if (isLast) return `<li aria-current="page">${escapeHtml(item.name)}</li>`;
      return `<li><a href="${escapeHtml(buildInternalHref(item.url))}">${escapeHtml(item.name)}</a></li>`;
    })
    .join('');
  return `<nav aria-label="Breadcrumb"><ol>${lis}</ol></nav>`;
}

function renderFactBox(facts) {
  const valid = facts.filter((f) => f && f.value);
  if (valid.length === 0) return '';
  const rows = valid
    .map(
      (f) =>
        `<dt>${escapeHtml(f.label)}</dt><dd>${f.isHtml ? f.value : escapeHtml(f.value)}</dd>`
    )
    .join('');
  return `<section aria-label="Quick facts"><dl>${rows}</dl></section>`;
}

function renderFaqsHtml(faqs) {
  if (!Array.isArray(faqs) || faqs.length === 0) return '';
  const items = faqs
    .filter((f) => f && (f.question || f.q) && (f.answer || f.a))
    .map(
      (f) =>
        `<details open><summary>${escapeHtml(cleanText(f.question || f.q, 0))}</summary><p>${escapeHtml(cleanText(f.answer || f.a, 0))}</p></details>`
    )
    .join('');
  if (!items) return '';
  return `<section aria-labelledby="faq-heading"><h2 id="faq-heading">Frequently Asked Questions</h2>${items}</section>`;
}

function renderSiteFooter() {
  return `
    <footer>
      <p>${escapeHtml(SITE_NAME)} — Tailor-made African Safaris, Luxury Lodges &amp; Group Expeditions.</p>
      <p>Uganda: <a href="tel:+256782594008">+256 782 594 008</a> | Kenya: <a href="tel:+254723927458">+254 723 927 458</a> | Email: <a href="mailto:bookings@allboundvacations.com">bookings@allboundvacations.com</a></p>
      <nav aria-label="Footer links">
        <a href="/about-us/">About Us</a>
        <a href="/contact-us/">Contact Us</a>
        <a href="/visa-application/">Visa Guidance</a>
        <a href="/flights/">Flights</a>
        <a href="/payment-plans/">Payment Plans</a>
        <a href="/terms/">Terms &amp; Conditions</a>
        <a href="/privacy/">Privacy Policy</a>
      </nav>
    </footer>`;
}

function wrapMainLayout(innerHtml) {
  return `${renderSiteNav()}\n<main>${innerHtml}</main>\n${renderSiteFooter()}`;
}

/* -------------------------------------------------------------------------- */
/*  Route Renderers                                                           */
/* -------------------------------------------------------------------------- */

async function renderHomepage(apiBaseUrl) {
  const [countriesRes, packagesRes, groupTripsRes, holidayTypesRes, blogRes] =
    await Promise.all([
      fetchApiJson(apiBaseUrl, '/countries/?limit=20'),
      fetchApiJson(apiBaseUrl, '/packages/featured?limit=8'),
      fetchApiJson(apiBaseUrl, '/group-trips/?limit=6'),
      fetchApiJson(apiBaseUrl, '/holiday-types/?limit=12'),
      fetchApiJson(apiBaseUrl, '/blog/?limit=4'),
    ]);

  const countries = extractList(countriesRes.data);
  let packages = extractList(packagesRes.data);
  if (packages.length === 0) {
    const fallbackPkgRes = await fetchApiJson(apiBaseUrl, '/packages/?limit=8');
    packages = extractList(fallbackPkgRes.data);
  }
  const groupTrips = extractList(groupTripsRes.data);
  const holidayTypes = extractList(holidayTypesRes.data);
  const blogs = extractList(blogRes.data);

  const canonicalUrl = `${SITE_URL}/`;
  const title = `${SITE_NAME} — Discover Extraordinary Destinations`;
  const description = DEFAULT_DESCRIPTION;

  const destinationLinks = countries
    .filter((c) => c && c.slug)
    .slice(0, 12)
    .map(
      (c) =>
        `<li><a href="/destinations/${escapeHtml(c.slug)}/">${escapeHtml(c.name)}</a>${c.description ? ` — ${escapeHtml(cleanText(c.description, 120))}` : ''}</li>`
    )
    .join('');

  const packageLinks = packages
    .filter((p) => p && p.slug)
    .slice(0, 8)
    .map((p) => {
      const href = p.country?.slug
        ? `/packages/${escapeHtml(p.country.slug)}/${escapeHtml(p.slug)}/`
        : `/packages/${escapeHtml(p.slug)}/`;
      const meta = [
        p.duration_days ? `${p.duration_days} Days` : null,
        formatCurrency(p.price) ? `From ${formatCurrency(p.price)}` : null,
        p.country?.name || null,
      ]
        .filter(Boolean)
        .join(' · ');
      return `<li><a href="${href}">${escapeHtml(p.name)}</a>${meta ? ` (${escapeHtml(meta)})` : ''}${p.summary ? `<p>${escapeHtml(cleanText(p.summary, 140))}</p>` : ''}</li>`;
    })
    .join('');

  const holidayTypeLinks = holidayTypes
    .filter((h) => h && h.slug)
    .slice(0, 12)
    .map((h) => `<li><a href="/holiday-types/${escapeHtml(h.slug)}/">${escapeHtml(h.name)}</a></li>`)
    .join('');

  const groupTripLinks = groupTrips
    .filter((g) => g && g.slug)
    .slice(0, 6)
    .map((g) => {
      const meta = [
        g.duration_days ? `${g.duration_days} Days` : null,
        formatCurrency(g.price) ? `From ${formatCurrency(g.price)}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      return `<li><a href="/group-trips/${escapeHtml(g.slug)}/">${escapeHtml(g.name)}</a>${meta ? ` (${escapeHtml(meta)})` : ''}</li>`;
    })
    .join('');

  const blogLinks = blogs
    .filter((b) => b && b.slug)
    .slice(0, 4)
    .map((b) => `<li><a href="/blog/${escapeHtml(b.slug)}/">${escapeHtml(b.title)}</a></li>`)
    .join('');

  const bodyHtml = wrapMainLayout(`
    <article>
      <h1>${escapeHtml(SITE_NAME)} — Tailor-Made African Safaris &amp; Luxury Vacations</h1>
      <p>${escapeHtml(description)}</p>
      ${destinationLinks ? `<section><h2>Featured African Destinations</h2><ul>${destinationLinks}</ul></section>` : ''}
      ${packageLinks ? `<section><h2>Featured Safari &amp; Tour Packages</h2><ul>${packageLinks}</ul></section>` : ''}
      ${groupTripLinks ? `<section><h2>Scheduled Group Trips</h2><ul>${groupTripLinks}</ul></section>` : ''}
      ${holidayTypeLinks ? `<section><h2>Explore by Holiday Style</h2><ul>${holidayTypeLinks}</ul></section>` : ''}
      ${blogLinks ? `<section><h2>Latest Safari Guides &amp; Travel Stories</h2><ul>${blogLinks}</ul></section>` : ''}
    </article>
  `);

  const itemListElements = packages
    .filter((p) => p && p.slug)
    .slice(0, 8)
    .map((p, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: p.name,
      url: buildAbsoluteUrl(
        p.country?.slug ? `/packages/${p.country.slug}/${p.slug}/` : `/packages/${p.slug}/`
      ),
    }));

  const graph = buildGraph([
    buildWebsiteNode(),
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
    },
    itemListElements.length > 0
      ? {
          '@type': 'ItemList',
          name: 'Featured Safari Packages',
          itemListElement: itemListElements,
        }
      : null,
  ]);

  const mdDestinations = countries
    .filter((c) => c && c.slug)
    .slice(0, 12)
    .map(
      (c) =>
        `${mdLink(c.name, `/destinations/${c.slug}/`)}${c.description ? ` — ${cleanText(c.description, 120)}` : ''}`
    );
  const mdPackages = packages
    .filter((p) => p && p.slug)
    .slice(0, 8)
    .map((p) => {
      const path = p.country?.slug ? `/packages/${p.country.slug}/${p.slug}/` : `/packages/${p.slug}/`;
      const meta = [
        p.duration_days ? `${p.duration_days} Days` : null,
        formatCurrency(p.price) ? `From ${formatCurrency(p.price)}` : null,
        p.country?.name || null,
      ]
        .filter(Boolean)
        .join(' · ');
      return `${mdLink(p.name, path)}${meta ? ` (${meta})` : ''}${p.summary ? ` — ${cleanText(p.summary, 140)}` : ''}`;
    });
  const mdGroupTrips = groupTrips
    .filter((g) => g && g.slug)
    .slice(0, 6)
    .map((g) => {
      const meta = [
        g.duration_days ? `${g.duration_days} Days` : null,
        formatCurrency(g.price) ? `From ${formatCurrency(g.price)}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      return `${mdLink(g.name, `/group-trips/${g.slug}/`)}${meta ? ` (${meta})` : ''}`;
    });
  const mdHolidayTypes = holidayTypes
    .filter((h) => h && h.slug)
    .slice(0, 12)
    .map((h) => mdLink(h.name, `/holiday-types/${h.slug}/`));
  const mdBlogs = blogs
    .filter((b) => b && b.slug)
    .slice(0, 4)
    .map((b) => mdLink(b.title, `/blog/${b.slug}/`));

  const markdown = joinMdSections([
    `# ${SITE_NAME} — Tailor-Made African Safaris & Luxury Vacations`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdDestinations.length > 0 ? `## Featured African Destinations\n\n${mdBullets(mdDestinations)}` : '',
    mdPackages.length > 0 ? `## Featured Safari & Tour Packages\n\n${mdBullets(mdPackages)}` : '',
    mdGroupTrips.length > 0 ? `## Scheduled Group Trips\n\n${mdBullets(mdGroupTrips)}` : '',
    mdHolidayTypes.length > 0 ? `## Explore by Holiday Style\n\n${mdBullets(mdHolidayTypes)}` : '',
    mdBlogs.length > 0 ? `## Latest Safari Guides & Travel Stories\n\n${mdBullets(mdBlogs)}` : '',
    `## Contact & Resources\n\n${mdBullets([
      `${mdLink('All Destinations', '/destinations/')}`,
      `${mdLink('All Tour Packages', '/packages/')}`,
      `${mdLink('About Us', '/about-us/')}`,
      `${mdLink('Contact Us', '/contact-us/')}`,
      'Uganda Office: +256 782 594 008 | Kenya Office: +254 723 927 458 | Email: bookings@allboundvacations.com',
    ])}`,
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image: DEFAULT_OG_IMAGE,
    ogType: 'website',
    jsonLd: graph,
    bodyHtml,
    markdown,
  };
}

async function renderPackageDetail(apiBaseUrl, slug, { redirectIfCountry = false } = {}) {
  const compRes = await fetchApiJson(
    apiBaseUrl,
    `/packages/comprehensive/${encodeURIComponent(slug)}`
  );

  if (compRes.status === 404) return { status: 404 };
  if (redirectIfCountry && compRes.data?.country?.slug) {
    return {
      status: 308,
      redirectTo: `/packages/${compRes.data.country.slug}/${compRes.data.slug || slug}/`,
    };
  }

  const basicRes = await fetchApiJson(apiBaseUrl, `/packages/slug/${encodeURIComponent(slug)}`);

  const pkg = compRes.data || basicRes.data;
  if (!pkg) {
    if (basicRes.status === 404) return { status: 404 };
    return { status: 503 };
  }
  if (redirectIfCountry && pkg.country?.slug) {
    return {
      status: 308,
      redirectTo: `/packages/${pkg.country.slug}/${pkg.slug || slug}/`,
    };
  }

  // Merge faqs/conversion_triggers from basicRes if comprehensive schema omits them
  const faqs = Array.isArray(pkg.faqs) && pkg.faqs.length > 0
    ? pkg.faqs
    : Array.isArray(basicRes.data?.faqs)
      ? basicRes.data.faqs
      : [];

  const countrySlug = pkg.country?.slug;
  const canonicalPath = countrySlug
    ? `/packages/${countrySlug}/${pkg.slug}/`
    : `/packages/${pkg.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const title = `${pkg.name} | ${SITE_NAME}`;
  const description =
    cleanText(pkg.summary || pkg.description, 160) ||
    `Explore ${pkg.name} with ${SITE_NAME}. View full day-by-day itinerary, seasonal pricing, inclusions, and accommodations.`;
  const image = getImageUrl(pkg.image_id || pkg.cover_image);

  const priceCharts = Array.isArray(pkg.price_charts) ? pkg.price_charts : [];
  const allPrices = [
    ...priceCharts.map((pc) => Number(pc.price)).filter((n) => Number.isFinite(n) && n > 0),
    ...(Number(pkg.price) > 0 ? [Number(pkg.price)] : []),
  ];
  const lowPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;
  const highPrice = allPrices.length > 0 ? Math.max(...allPrices) : null;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Tour Packages', url: '/packages/' },
    ...(pkg.country ? [{ name: pkg.country.name, url: `/destinations/${pkg.country.slug}/` }] : []),
    { name: pkg.name, url: canonicalPath },
  ];

  // Fact box
  const factBox = renderFactBox([
    pkg.country
      ? {
          label: 'Destination',
          value: `<a href="/destinations/${escapeHtml(pkg.country.slug)}/">${escapeHtml(pkg.country.name)}</a>`,
          isHtml: true,
        }
      : null,
    pkg.duration_days ? { label: 'Duration', value: `${pkg.duration_days} Days` } : null,
    lowPrice ? { label: 'Starting Price', value: `${formatCurrency(lowPrice)} per person` } : null,
    pkg.package_type ? { label: 'Tour Style', value: pkg.package_type } : null,
    Array.isArray(pkg.holiday_types) && pkg.holiday_types.length > 0
      ? {
          label: 'Holiday Types',
          value: pkg.holiday_types
            .map(
              (ht) =>
                `<a href="/holiday-types/${escapeHtml(ht.slug)}/">${escapeHtml(ht.name)}</a>`
            )
            .join(', '),
          isHtml: true,
        }
      : null,
  ]);

  // Highlights
  const highlights = parseListField(pkg.highlights);
  const highlightsHtml =
    highlights.length > 0
      ? `<section><h2>Tour Highlights</h2><ul>${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></section>`
      : '';

  // Day-by-day itinerary
  const itineraryItems = Array.isArray(pkg.itinerary_items) ? pkg.itinerary_items : [];
  let itineraryHtml = '';
  if (itineraryItems.length > 0) {
    const daysHtml = itineraryItems
      .map((day) => {
        const activities = [
          ...(Array.isArray(day.custom_activities)
            ? day.custom_activities.map((a) => a.activity_title)
            : []),
          ...(Array.isArray(day.linked_activities)
            ? day.linked_activities.map((a) => a.name)
            : []),
        ].filter(Boolean);
        const hotels = Array.isArray(day.hotels)
          ? day.hotels
              .filter((h) => h && h.slug)
              .map((h) => `<a href="/hotels/${escapeHtml(h.slug)}/">${escapeHtml(h.name)}</a>`)
              .join(', ')
          : '';
        return `<li>
          <h3>Day ${escapeHtml(day.day_number)}: ${escapeHtml(day.title)}</h3>
          ${day.location ? `<p><strong>Location:</strong> ${escapeHtml(day.location)}</p>` : ''}
          ${day.description ? `<p>${escapeHtml(cleanText(day.description, 0))}</p>` : ''}
          ${activities.length > 0 ? `<p><strong>Activities:</strong> ${escapeHtml(activities.join(', '))}</p>` : ''}
          ${hotels ? `<p><strong>Accommodation:</strong> ${hotels}</p>` : ''}
        </li>`;
      })
      .join('');
    itineraryHtml = `<section aria-labelledby="itinerary-heading"><h2 id="itinerary-heading">Day-by-Day Itinerary</h2><ol>${daysHtml}</ol></section>`;
  } else if (pkg.itinerary) {
    itineraryHtml = `<section aria-labelledby="itinerary-heading"><h2 id="itinerary-heading">Itinerary</h2><div>${sanitizeHtml(pkg.itinerary)}</div></section>`;
  }

  // Seasonal pricing table
  let pricingHtml = '';
  if (priceCharts.length > 0) {
    const rows = priceCharts
      .map((pc) => {
        const dateRange =
          pc.start_date && pc.end_date
            ? `${formatDate(pc.start_date)} to ${formatDate(pc.end_date)}`
            : formatDate(pc.start_date) || 'Seasonal';
        return `<tr>
          <td>${escapeHtml(pc.title || 'Standard Season')}</td>
          <td>${escapeHtml(dateRange)}</td>
          <td>${escapeHtml(formatCurrency(pc.price) || 'On request')}</td>
          <td>${escapeHtml(cleanText(pc.notes || '', 120))}</td>
        </tr>`;
      })
      .join('');
    pricingHtml = `<section aria-labelledby="pricing-heading"><h2 id="pricing-heading">Seasonal Pricing</h2><table><thead><tr><th>Season</th><th>Valid Dates</th><th>Price (USD)</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  } else if (lowPrice) {
    pricingHtml = `<section aria-labelledby="pricing-heading"><h2 id="pricing-heading">Pricing</h2><p>Starting from <strong>${escapeHtml(formatCurrency(lowPrice))}</strong> per person.</p></section>`;
  }

  // Inclusions & Exclusions
  const inclusions = parseListField(
    pkg.inclusion_items?.length ? pkg.inclusion_items : pkg.inclusions
  );
  const exclusions = parseListField(
    pkg.exclusion_items?.length ? pkg.exclusion_items : pkg.exclusions
  );
  const inclusionsHtml =
    inclusions.length > 0
      ? `<section><h2>What Is Included</h2><ul>${inclusions.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>`
      : '';
  const exclusionsHtml =
    exclusions.length > 0
      ? `<section><h2>What Is Excluded</h2><ul>${exclusions.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul></section>`
      : '';

  // Hotels & Attractions
  const hotelsHtml =
    Array.isArray(pkg.hotels) && pkg.hotels.length > 0
      ? `<section><h2>Featured Lodges &amp; Hotels</h2><ul>${pkg.hotels
          .filter((h) => h && h.slug)
          .map(
            (h) =>
              `<li><a href="/hotels/${escapeHtml(h.slug)}/">${escapeHtml(h.name)}</a>${h.city ? ` (${escapeHtml(h.city)})` : ''}</li>`
          )
          .join('')}</ul></section>`
      : '';

  const attractionsHtml =
    Array.isArray(pkg.attractions) && pkg.attractions.length > 0
      ? `<section><h2>Key Attractions Visited</h2><ul>${pkg.attractions
          .filter((a) => a && a.slug)
          .map(
            (a) =>
              `<li><a href="/attractions/${escapeHtml(a.slug)}/">${escapeHtml(a.name)}</a></li>`
          )
          .join('')}</ul></section>`
      : '';

  // Reviews
  const reviews = Array.isArray(pkg.reviews) ? pkg.reviews : [];
  const reviewsHtml =
    reviews.length > 0
      ? `<section><h2>Traveler Reviews</h2><ul>${reviews
          .map(
            (r) =>
              `<li><strong>${escapeHtml(r.reviewer_name || 'Verified Traveler')}</strong> (${escapeHtml(r.rating)}/5): ${escapeHtml(cleanText(r.content, 300))}</li>`
          )
          .join('')}</ul></section>`
      : '';

  // Related Blogs
  const blogsHtml =
    Array.isArray(pkg.blog_posts) && pkg.blog_posts.length > 0
      ? `<section><h2>Related Travel Guides</h2><ul>${pkg.blog_posts
          .filter((b) => b && b.slug)
          .map(
            (b) => `<li><a href="/blog/${escapeHtml(b.slug)}/">${escapeHtml(b.title)}</a></li>`
          )
          .join('')}</ul></section>`
      : '';

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(pkg.name)}</h1>
      <p>${escapeHtml(description)}</p>
      ${factBox}
      ${highlightsHtml}
      ${pkg.description ? `<section><h2>Overview</h2><div>${sanitizeHtml(pkg.description)}</div></section>` : ''}
      ${itineraryHtml}
      ${pricingHtml}
      ${inclusionsHtml}
      ${exclusionsHtml}
      ${hotelsHtml}
      ${attractionsHtml}
      ${reviewsHtml}
      ${renderFaqsHtml(faqs)}
      ${blogsHtml}
    </article>
  `);

  // JSON-LD TouristTrip node
  const tripNode = {
    '@type': 'TouristTrip',
    '@id': `${canonicalUrl}#trip`,
    name: pkg.name,
    description,
    image,
    url: canonicalUrl,
    provider: { '@id': ORG_ID },
  };

  if (Array.isArray(pkg.holiday_types) && pkg.holiday_types.length > 0) {
    tripNode.touristType = pkg.holiday_types.map((ht) => ht.name);
  }

  if (itineraryItems.length > 0) {
    tripNode.itinerary = {
      '@type': 'ItemList',
      numberOfItems: itineraryItems.length,
      itemListElement: itineraryItems.map((day, idx) => ({
        '@type': 'ListItem',
        position: day.day_number || idx + 1,
        name: `Day ${day.day_number || idx + 1}: ${day.title}`,
        description: cleanText(day.description || day.location || '', 250),
      })),
    };
  }

  if (lowPrice) {
    tripNode.offers =
      highPrice && highPrice > lowPrice
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice,
            highPrice,
            offerCount: Math.max(priceCharts.length, 1),
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
          }
        : {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: lowPrice,
            availability: 'https://schema.org/InStock',
            url: canonicalUrl,
          };
  }

  if (reviews.length > 0) {
    const avg =
      reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length;
    tripNode.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(avg.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    tripNode.review = reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.reviewer_name || 'Verified Traveler' },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: Number(r.rating) || 5,
        bestRating: 5,
      },
      reviewBody: cleanText(r.content, 300),
    }));
  }

  const graph = buildGraph([
    tripNode,
    buildFaqNode(canonicalUrl, faqs),
    buildBreadcrumbNode(canonicalUrl, breadcrumbs),
  ]);

  const mdFacts = mdFactList([
    pkg.country
      ? { label: 'Destination', value: mdLink(pkg.country.name, `/destinations/${pkg.country.slug}/`) }
      : null,
    pkg.duration_days ? { label: 'Duration', value: `${pkg.duration_days} Days` } : null,
    lowPrice ? { label: 'Starting Price', value: `${formatCurrency(lowPrice)} per person` } : null,
    pkg.package_type ? { label: 'Tour Style', value: pkg.package_type } : null,
    Array.isArray(pkg.holiday_types) && pkg.holiday_types.length > 0
      ? {
          label: 'Holiday Types',
          value: pkg.holiday_types
            .map((ht) => mdLink(ht.name, `/holiday-types/${ht.slug}/`))
            .join(', '),
        }
      : null,
  ]);

  let mdItinerary = '';
  if (itineraryItems.length > 0) {
    const dayBlocks = itineraryItems.map((day, idx) => {
      const dayNum = day.day_number || idx + 1;
      const activities = [
        ...(Array.isArray(day.custom_activities)
          ? day.custom_activities.map((a) => a.activity_title)
          : []),
        ...(Array.isArray(day.linked_activities)
          ? day.linked_activities.map((a) => a.name)
          : []),
      ].filter(Boolean);
      const dayHotels = Array.isArray(day.hotels)
        ? day.hotels
            .filter((h) => h && h.slug)
            .map((h) => mdLink(h.name, `/hotels/${h.slug}/`))
            .join(', ')
        : '';
      const lines = [`## Day ${dayNum}: ${day.title}`];
      if (day.location) lines.push(`- **Location:** ${day.location}`);
      if (day.description) lines.push('', cleanText(day.description, 0));
      if (activities.length > 0) lines.push(`- **Activities:** ${activities.join(', ')}`);
      if (dayHotels) lines.push(`- **Accommodation:** ${dayHotels}`);
      return lines.join('\n');
    });
    mdItinerary = dayBlocks.join('\n\n');
  } else if (pkg.itinerary) {
    const converted = htmlToMarkdown(pkg.itinerary);
    if (converted) mdItinerary = `## Itinerary\n\n${converted}`;
  }

  let mdPricing = '';
  if (priceCharts.length > 0) {
    const tableRows = priceCharts.map((pc) => {
      const dateRange =
        pc.start_date && pc.end_date
          ? `${formatDate(pc.start_date)} to ${formatDate(pc.end_date)}`
          : formatDate(pc.start_date) || 'Seasonal';
      return [
        pc.title || 'Standard Season',
        formatCurrency(pc.price) || 'On request',
        dateRange,
        cleanText(pc.notes || '', 120) || '-',
      ];
    });
    mdPricing = `## Seasonal Pricing\n\n${mdTable(['Season', 'Price', 'Valid Dates', 'Notes'], tableRows)}`;
  } else if (lowPrice) {
    mdPricing = `## Pricing\n\nStarting from **${formatCurrency(lowPrice)}** per person.`;
  }

  const mdHotels =
    Array.isArray(pkg.hotels) && pkg.hotels.length > 0
      ? `## Featured Lodges & Hotels\n\n${mdBullets(
          pkg.hotels
            .filter((h) => h && h.slug)
            .map((h) => `${mdLink(h.name, `/hotels/${h.slug}/`)}${h.city ? ` (${h.city})` : ''}`)
        )}`
      : '';

  const mdAttractions =
    Array.isArray(pkg.attractions) && pkg.attractions.length > 0
      ? `## Key Attractions Visited\n\n${mdBullets(
          pkg.attractions
            .filter((a) => a && a.slug)
            .map((a) => mdLink(a.name, `/attractions/${a.slug}/`))
        )}`
      : '';

  const mdReviews =
    reviews.length > 0
      ? `## Traveler Reviews\n\n${mdBullets(
          reviews.map(
            (r) =>
              `**${r.reviewer_name || 'Verified Traveler'}** (${r.rating}/5): ${cleanText(r.content, 300)}`
          )
        )}`
      : '';

  const mdRelatedBlogs =
    Array.isArray(pkg.blog_posts) && pkg.blog_posts.length > 0
      ? `## Related Travel Guides\n\n${mdBullets(
          pkg.blog_posts
            .filter((b) => b && b.slug)
            .map((b) => mdLink(b.title, `/blog/${b.slug}/`))
        )}`
      : '';

  const markdown = joinMdSections([
    `# ${pkg.name}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    highlights.length > 0 ? `## Tour Highlights\n\n${mdBullets(highlights)}` : '',
    pkg.description ? `## Overview\n\n${htmlToMarkdown(pkg.description)}` : '',
    mdItinerary,
    mdPricing,
    inclusions.length > 0 ? `## What Is Included\n\n${mdBullets(inclusions)}` : '',
    exclusions.length > 0 ? `## What Is Excluded\n\n${mdBullets(exclusions)}` : '',
    mdHotels,
    mdAttractions,
    mdReviews,
    mdFaqs(faqs),
    mdRelatedBlogs,
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: graph,
    bodyHtml,
    markdown,
  };
}

async function renderGroupTripDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/group-trips/details/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const trip = res.data;
  if (!trip) return { status: 503 };

  const canonicalPath = `/group-trips/${trip.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const title = `${trip.name} | ${SITE_NAME}`;
  const description =
    cleanText(trip.summary || trip.description, 160) ||
    `Join ${trip.name} — a scheduled group expedition with ${SITE_NAME}.`;
  const image = getImageUrl(trip.cover_image || trip.image_id);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Group Trips', url: '/group-trips/' },
    ...(trip.country ? [{ name: trip.country.name, url: `/destinations/${trip.country.slug}/` }] : []),
    { name: trip.name, url: canonicalPath },
  ];

  const factBox = renderFactBox([
    trip.country
      ? {
          label: 'Destination',
          value: `<a href="/destinations/${escapeHtml(trip.country.slug)}/">${escapeHtml(trip.country.name)}</a>`,
          isHtml: true,
        }
      : null,
    trip.duration_days ? { label: 'Duration', value: `${trip.duration_days} Days` } : null,
    formatCurrency(trip.price)
      ? { label: 'Starting Price', value: `${formatCurrency(trip.price)} per person` }
      : null,
    trip.max_participants
      ? {
          label: 'Group Size',
          value: trip.min_participants
            ? `${trip.min_participants}–${trip.max_participants} travelers`
            : `Up to ${trip.max_participants} travelers`,
        }
      : null,
  ]);

  const departures = Array.isArray(trip.departures) ? trip.departures : [];
  const departuresHtml =
    departures.length > 0
      ? `<section><h2>Scheduled Departure Dates</h2><table><thead><tr><th>Start Date</th><th>End Date</th><th>Available Slots</th></tr></thead><tbody>${departures
          .map(
            (d) =>
              `<tr><td>${escapeHtml(formatDate(d.start_date))}</td><td>${escapeHtml(formatDate(d.end_date))}</td><td>${escapeHtml(Math.max(0, (d.available_slots || 0) - (d.booked_slots || 0)))}</td></tr>`
          )
          .join('')}</tbody></table></section>`
      : '';

  const inclusions = parseListField(trip.inclusions);
  const exclusions = parseListField(trip.exclusions);

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(trip.name)}</h1>
      <p>${escapeHtml(description)}</p>
      ${factBox}
      ${trip.description ? `<section><h2>Overview</h2><div>${sanitizeHtml(trip.description)}</div></section>` : ''}
      ${departuresHtml}
      ${trip.itinerary ? `<section><h2>Itinerary</h2><div>${sanitizeHtml(trip.itinerary)}</div></section>` : ''}
      ${inclusions.length > 0 ? `<section><h2>Inclusions</h2><ul>${inclusions.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>` : ''}
      ${exclusions.length > 0 ? `<section><h2>Exclusions</h2><ul>${exclusions.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul></section>` : ''}
    </article>
  `);

  const tripNode = {
    '@type': 'TouristTrip',
    '@id': `${canonicalUrl}#group-trip`,
    name: trip.name,
    description,
    image,
    url: canonicalUrl,
    provider: { '@id': ORG_ID },
  };
  if (Number(trip.price) > 0) {
    tripNode.offers = {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: Number(trip.price),
      availability: 'https://schema.org/InStock',
      url: canonicalUrl,
    };
  }

  const mdFacts = mdFactList([
    trip.country
      ? { label: 'Destination', value: mdLink(trip.country.name, `/destinations/${trip.country.slug}/`) }
      : null,
    trip.duration_days ? { label: 'Duration', value: `${trip.duration_days} Days` } : null,
    formatCurrency(trip.price)
      ? { label: 'Starting Price', value: `${formatCurrency(trip.price)} per person` }
      : null,
    trip.max_participants
      ? {
          label: 'Group Size',
          value: trip.min_participants
            ? `${trip.min_participants}–${trip.max_participants} travelers`
            : `Up to ${trip.max_participants} travelers`,
        }
      : null,
  ]);

  const mdDepartures =
    departures.length > 0
      ? `## Scheduled Departure Dates\n\n${mdTable(
          ['Start Date', 'End Date', 'Available Slots'],
          departures.map((d) => [
            formatDate(d.start_date),
            formatDate(d.end_date),
            String(Math.max(0, (d.available_slots || 0) - (d.booked_slots || 0))),
          ])
        )}`
      : '';

  const markdown = joinMdSections([
    `# ${trip.name}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    trip.description ? `## Overview\n\n${htmlToMarkdown(trip.description)}` : '',
    mdDepartures,
    trip.itinerary ? `## Itinerary\n\n${htmlToMarkdown(trip.itinerary)}` : '',
    inclusions.length > 0 ? `## Inclusions\n\n${mdBullets(inclusions)}` : '',
    exclusions.length > 0 ? `## Exclusions\n\n${mdBullets(exclusions)}` : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([tripNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderHotelDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/hotels/details/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const hotel = res.data;
  if (!hotel) return { status: 503 };

  const canonicalPath = `/hotels/${hotel.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const name = String(hotel.name || '').trim();
  const title = `${name} | ${SITE_NAME}`;
  const description =
    cleanText(hotel.summary || hotel.description, 160) ||
    `Book your luxury stay at ${name} with ${SITE_NAME}.`;
  const image = getImageUrl(hotel.cover_image || hotel.image_url || hotel.image_id);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Hotels & Lodges', url: '/hotels/' },
    ...(hotel.country
      ? [{ name: hotel.country.name, url: `/destinations/${hotel.country.slug}/` }]
      : []),
    { name, url: canonicalPath },
  ];

  const factBox = renderFactBox([
    hotel.country
      ? {
          label: 'Country',
          value: `<a href="/destinations/${escapeHtml(hotel.country.slug)}/">${escapeHtml(hotel.country.name)}</a>`,
          isHtml: true,
        }
      : null,
    hotel.city ? { label: 'Location', value: hotel.city } : null,
    hotel.address ? { label: 'Address', value: hotel.address } : null,
    hotel.stars ? { label: 'Star Rating', value: `${hotel.stars} Stars` } : null,
    hotel.price_category ? { label: 'Category', value: hotel.price_category } : null,
    hotel.check_in_time ? { label: 'Check-in', value: hotel.check_in_time } : null,
    hotel.check_out_time ? { label: 'Check-out', value: hotel.check_out_time } : null,
  ]);

  const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
  const amenitiesHtml =
    amenities.length > 0
      ? `<section><h2>Amenities &amp; Facilities</h2><ul>${amenities
          .map((a) => `<li>${escapeHtml(a.name)}</li>`)
          .join('')}</ul></section>`
      : '';

  const priceCharts = Array.isArray(hotel.price_charts) ? hotel.price_charts : [];
  const pricingHtml =
    priceCharts.length > 0
      ? `<section><h2>Seasonal Rates</h2><table><thead><tr><th>Season</th><th>Dates</th><th>Rate (USD)</th><th>Notes</th></tr></thead><tbody>${priceCharts
          .map(
            (pc) =>
              `<tr><td>${escapeHtml(pc.title || 'Seasonal Rate')}</td><td>${escapeHtml(
                pc.start_date && pc.end_date
                  ? `${formatDate(pc.start_date)} to ${formatDate(pc.end_date)}`
                  : 'Seasonal'
              )}</td><td>${escapeHtml(formatCurrency(pc.price) || 'On request')}</td><td>${escapeHtml(cleanText(pc.notes || '', 100))}</td></tr>`
          )
          .join('')}</tbody></table></section>`
      : '';

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(name)}</h1>
      <p>${escapeHtml(description)}</p>
      ${factBox}
      ${hotel.description ? `<section><h2>About ${escapeHtml(name)}</h2><div>${sanitizeHtml(hotel.description)}</div></section>` : ''}
      ${amenitiesHtml}
      ${pricingHtml}
    </article>
  `);

  const hotelNode = {
    '@type': 'Hotel',
    '@id': `${canonicalUrl}#hotel`,
    name,
    description,
    image,
    url: canonicalUrl,
  };
  if (hotel.stars) {
    hotelNode.starRating = { '@type': 'Rating', ratingValue: hotel.stars, bestRating: 5 };
  }
  if (hotel.price_category) hotelNode.priceRange = hotel.price_category;
  if (hotel.check_in_time) hotelNode.checkinTime = hotel.check_in_time;
  if (hotel.check_out_time) hotelNode.checkoutTime = hotel.check_out_time;
  if (hotel.address || hotel.city || hotel.country) {
    hotelNode.address = {
      '@type': 'PostalAddress',
      streetAddress: hotel.address || undefined,
      addressLocality: hotel.city || undefined,
      addressCountry: hotel.country?.name || undefined,
    };
  }
  if (hotel.latitude && hotel.longitude) {
    hotelNode.geo = {
      '@type': 'GeoCoordinates',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
    };
  }
  if (amenities.length > 0) {
    hotelNode.amenityFeature = amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a.name,
      value: true,
    }));
  }

  const mdFacts = mdFactList([
    hotel.country
      ? { label: 'Country', value: mdLink(hotel.country.name, `/destinations/${hotel.country.slug}/`) }
      : null,
    hotel.city ? { label: 'Location', value: hotel.city } : null,
    hotel.address ? { label: 'Address', value: hotel.address } : null,
    hotel.stars ? { label: 'Star Rating', value: `${hotel.stars} Stars` } : null,
    hotel.price_category ? { label: 'Category', value: hotel.price_category } : null,
    hotel.check_in_time ? { label: 'Check-in', value: hotel.check_in_time } : null,
    hotel.check_out_time ? { label: 'Check-out', value: hotel.check_out_time } : null,
  ]);

  const mdPricing =
    priceCharts.length > 0
      ? `## Seasonal Rates\n\n${mdTable(
          ['Season', 'Price', 'Valid Dates', 'Notes'],
          priceCharts.map((pc) => [
            pc.title || 'Seasonal Rate',
            formatCurrency(pc.price) || 'On request',
            pc.start_date && pc.end_date
              ? `${formatDate(pc.start_date)} to ${formatDate(pc.end_date)}`
              : 'Seasonal',
            cleanText(pc.notes || '', 100) || '-',
          ])
        )}`
      : '';

  const markdown = joinMdSections([
    `# ${name}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    hotel.description ? `## About ${name}\n\n${htmlToMarkdown(hotel.description)}` : '',
    amenities.length > 0
      ? `## Amenities & Facilities\n\n${mdBullets(amenities.map((a) => a.name))}`
      : '',
    mdPricing,
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([hotelNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderCountryDetail(apiBaseUrl, slug, category = null) {
  const res = await fetchApiJson(
    apiBaseUrl,
    `/countries/slug/${encodeURIComponent(slug)}/details`
  );
  if (res.status === 404) return { status: 404 };
  const country = res.data;
  if (!country) return { status: 503 };

  const countryPath = `/destinations/${country.slug}/`;
  const image = getImageUrl(country.image_id || country.cover_image);

  // Country Category Hub (/destinations/:slug/:category)
  if (category) {
    const catConfig = DESTINATION_CATEGORIES[category];
    if (!catConfig) return { status: 404 };

    const catPath = `/destinations/${country.slug}/${category}/`;
    const canonicalUrl = buildAbsoluteUrl(catPath);
    const customIntro = country.category_intros?.[category];
    const heading = customIntro?.title?.trim() || `${catConfig.label} in ${country.name}`;
    const title = `${heading} | ${SITE_NAME}`;
    const description =
      cleanText(customIntro?.description, 160) ||
      cleanText(catConfig.getDescription(country.name), 160);

    let items = [];
    if (category === 'packages') {
      items = (country.packages || []).map((p) => ({
        name: p.name,
        url: `/packages/${country.slug}/${p.slug}/`,
        summary: p.description,
      }));
    } else if (category === 'group-trips') {
      items = (country.group_trips || []).map((g) => ({
        name: g.name,
        url: `/group-trips/${g.slug}/`,
        summary: g.description,
      }));
    } else if (category === 'hotels' || category === 'hotel-packages') {
      items = (country.hotels || []).map((h) => ({
        name: h.name,
        url: `/hotels/${h.slug}/`,
        summary: h.summary || h.description,
      }));
    } else if (category === 'attractions') {
      items = (country.attractions || []).map((a) => ({
        name: a.name,
        url: `/attractions/${a.slug}/`,
        summary: a.summary || a.description,
      }));
    } else if (category === 'activities') {
      items = (country.activities || []).map((a) => ({
        name: a.name,
        url: `/activities/${a.slug}/`,
        summary: a.summary || a.description,
      }));
    }

    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations/' },
      { name: country.name, url: countryPath },
      { name: catConfig.label, url: catPath },
    ];

    const listHtml =
      items.length > 0
        ? `<ul>${items
            .map(
              (item) =>
                `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a>${item.summary ? `<p>${escapeHtml(cleanText(item.summary, 150))}</p>` : ''}</li>`
            )
            .join('')}</ul>`
        : `<p>Contact our specialists for custom ${escapeHtml(catConfig.label.toLowerCase())} in ${escapeHtml(country.name)}.</p>`;

    const bodyHtml = wrapMainLayout(`
      ${renderBreadcrumbsHtml(breadcrumbs)}
      <article>
        <h1>${escapeHtml(heading)}</h1>
        <p>${escapeHtml(description)}</p>
        <section><h2>Available ${escapeHtml(catConfig.label)}</h2>${listHtml}</section>
        <p><a href="${escapeHtml(countryPath)}">Explore full ${escapeHtml(country.name)} travel guide</a></p>
      </article>
    `);

    const graph = buildGraph([
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: heading,
        description,
        image,
        url: canonicalUrl,
        provider: { '@id': ORG_ID },
      },
      items.length > 0
        ? {
            '@type': 'ItemList',
            itemListElement: items.slice(0, 30).map((item, idx) => ({
              '@type': 'ListItem',
              position: idx + 1,
              name: item.name,
              url: buildAbsoluteUrl(item.url),
            })),
          }
        : null,
      buildBreadcrumbNode(canonicalUrl, breadcrumbs),
    ]);

    const mdList =
      items.length > 0
        ? mdBullets(
            items.map(
              (item) =>
                `${mdLink(item.name, item.url)}${item.summary ? ` — ${cleanText(item.summary, 150)}` : ''}`
            )
          )
        : `Contact our specialists for custom ${catConfig.label.toLowerCase()} in ${country.name}.`;

    const markdown = joinMdSections([
      `# ${heading}`,
      `Canonical URL: ${canonicalUrl}`,
      description,
      `## Available ${catConfig.label}\n\n${mdList}`,
      mdLink(`Explore full ${country.name} travel guide`, countryPath),
    ]);

    return {
      status: 200,
      title,
      description,
      canonicalUrl,
      image,
      ogType: 'website',
      jsonLd: graph,
      bodyHtml,
      markdown,
    };
  }

  // Country Main Detail Page
  const canonicalUrl = buildAbsoluteUrl(countryPath);
  const title = `${country.name} Tours & Travel Guide | ${SITE_NAME}`;
  const description =
    cleanText(country.description, 160) ||
    `Discover travel experiences, safari packages, luxury lodges, and top attractions in ${country.name} with ${SITE_NAME}.`;

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Destinations', url: '/destinations/' },
    ...(country.region
      ? [{ name: country.region.name, url: `/regions/${country.region.slug}/` }]
      : []),
    { name: country.name, url: countryPath },
  ];

  const packages = Array.isArray(country.packages) ? country.packages : [];
  const groupTrips = Array.isArray(country.group_trips) ? country.group_trips : [];
  const hotels = Array.isArray(country.hotels) ? country.hotels : [];
  const attractions = Array.isArray(country.attractions) ? country.attractions : [];
  const activities = Array.isArray(country.activities) ? country.activities : [];
  const highlights = parseListField(country.highlights);
  const faqs = Array.isArray(country.faqs) ? country.faqs : [];

  const factBox = renderFactBox([
    country.region
      ? {
          label: 'Region',
          value: `<a href="/regions/${escapeHtml(country.region.slug)}/">${escapeHtml(country.region.name)}</a>`,
          isHtml: true,
        }
      : null,
    packages.length > 0 ? { label: 'Tour Packages', value: `${packages.length} curated itineraries` } : null,
    hotels.length > 0 ? { label: 'Hotels & Lodges', value: `${hotels.length} handpicked stays` } : null,
    attractions.length > 0 ? { label: 'Attractions', value: `${attractions.length} parks & landmarks` } : null,
    activities.length > 0 ? { label: 'Activities', value: `${activities.length} experiences` } : null,
  ]);

  const visitNotesHtml = country.visit_info?.general_notes
    ? `<section><h2>Best Time to Visit ${escapeHtml(country.name)}</h2><p>${escapeHtml(cleanText(country.visit_info.general_notes, 0))}</p></section>`
    : '';

  const categoryNavHtml = `<section><h2>Explore ${escapeHtml(country.name)}</h2><ul>${Object.entries(
    DESTINATION_CATEGORIES
  )
    .map(
      ([catSlug, cfg]) =>
        `<li><a href="/destinations/${escapeHtml(country.slug)}/${escapeHtml(catSlug)}/">${escapeHtml(cfg.label)} in ${escapeHtml(country.name)}</a></li>`
    )
    .join('')}</ul></section>`;

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(country.name)} Travel &amp; Safari Guide</h1>
      <p>${escapeHtml(description)}</p>
      ${factBox}
      ${highlights.length > 0 ? `<section><h2>Destination Highlights</h2><ul>${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></section>` : ''}
      ${country.description ? `<section><h2>About ${escapeHtml(country.name)}</h2><div>${sanitizeHtml(country.description)}</div></section>` : ''}
      ${visitNotesHtml}
      ${packages.length > 0 ? `<section><h2>Top ${escapeHtml(country.name)} Tour Packages</h2><ul>${packages.slice(0, 12).map((p) => `<li><a href="/packages/${escapeHtml(country.slug)}/${escapeHtml(p.slug)}/">${escapeHtml(p.name)}</a>${p.duration_days ? ` (${p.duration_days} Days)` : ''}${formatCurrency(p.price) ? ` — From ${escapeHtml(formatCurrency(p.price))}` : ''}</li>`).join('')}</ul></section>` : ''}
      ${groupTrips.length > 0 ? `<section><h2>${escapeHtml(country.name)} Group Trips</h2><ul>${groupTrips.slice(0, 8).map((g) => `<li><a href="/group-trips/${escapeHtml(g.slug)}/">${escapeHtml(g.name)}</a></li>`).join('')}</ul></section>` : ''}
      ${attractions.length > 0 ? `<section><h2>Top Attractions in ${escapeHtml(country.name)}</h2><ul>${attractions.slice(0, 12).map((a) => `<li><a href="/attractions/${escapeHtml(a.slug)}/">${escapeHtml(a.name)}</a></li>`).join('')}</ul></section>` : ''}
      ${hotels.length > 0 ? `<section><h2>Luxury Lodges &amp; Hotels in ${escapeHtml(country.name)}</h2><ul>${hotels.slice(0, 12).map((h) => `<li><a href="/hotels/${escapeHtml(h.slug)}/">${escapeHtml(h.name)}</a></li>`).join('')}</ul></section>` : ''}
      ${activities.length > 0 ? `<section><h2>Activities in ${escapeHtml(country.name)}</h2><ul>${activities.slice(0, 12).map((a) => `<li><a href="/activities/${escapeHtml(a.slug)}/">${escapeHtml(a.name)}</a></li>`).join('')}</ul></section>` : ''}
      ${categoryNavHtml}
      ${renderFaqsHtml(faqs)}
    </article>
  `);

  const destNode = {
    '@type': 'TouristDestination',
    '@id': `${canonicalUrl}#destination`,
    name: country.name,
    description,
    image,
    url: canonicalUrl,
  };
  if (country.region) {
    destNode.containedInPlace = {
      '@type': 'AdministrativeArea',
      name: country.region.name,
      url: buildAbsoluteUrl(`/regions/${country.region.slug}/`),
    };
  }
  if (attractions.length > 0) {
    destNode.includesAttraction = attractions.slice(0, 15).map((a) => ({
      '@type': 'TouristAttraction',
      name: a.name,
      url: buildAbsoluteUrl(`/attractions/${a.slug}/`),
    }));
  }

  const mdFacts = mdFactList([
    country.region
      ? { label: 'Region', value: mdLink(country.region.name, `/regions/${country.region.slug}/`) }
      : null,
    packages.length > 0 ? { label: 'Tour Packages', value: `${packages.length} curated itineraries` } : null,
    hotels.length > 0 ? { label: 'Hotels & Lodges', value: `${hotels.length} handpicked stays` } : null,
    attractions.length > 0 ? { label: 'Attractions', value: `${attractions.length} parks & landmarks` } : null,
    activities.length > 0 ? { label: 'Activities', value: `${activities.length} experiences` } : null,
  ]);

  const markdown = joinMdSections([
    `# ${country.name} Travel & Safari Guide`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    highlights.length > 0 ? `## Destination Highlights\n\n${mdBullets(highlights)}` : '',
    country.description ? `## About ${country.name}\n\n${htmlToMarkdown(country.description)}` : '',
    country.visit_info?.general_notes
      ? `## Best Time to Visit ${country.name}\n\n${cleanText(country.visit_info.general_notes, 0)}`
      : '',
    packages.length > 0
      ? `## Top ${country.name} Tour Packages\n\n${mdBullets(
          packages.slice(0, 12).map(
            (p) =>
              `${mdLink(p.name, `/packages/${country.slug}/${p.slug}/`)}${p.duration_days ? ` (${p.duration_days} Days)` : ''}${formatCurrency(p.price) ? ` — From ${formatCurrency(p.price)}` : ''}`
          )
        )}`
      : '',
    groupTrips.length > 0
      ? `## ${country.name} Group Trips\n\n${mdBullets(
          groupTrips.slice(0, 8).map((g) => mdLink(g.name, `/group-trips/${g.slug}/`))
        )}`
      : '',
    attractions.length > 0
      ? `## Top Attractions in ${country.name}\n\n${mdBullets(
          attractions.slice(0, 12).map((a) => mdLink(a.name, `/attractions/${a.slug}/`))
        )}`
      : '',
    hotels.length > 0
      ? `## Luxury Lodges & Hotels in ${country.name}\n\n${mdBullets(
          hotels.slice(0, 12).map((h) => mdLink(h.name, `/hotels/${h.slug}/`))
        )}`
      : '',
    activities.length > 0
      ? `## Activities in ${country.name}\n\n${mdBullets(
          activities.slice(0, 12).map((a) => mdLink(a.name, `/activities/${a.slug}/`))
        )}`
      : '',
    `## Explore ${country.name}\n\n${mdBullets(
      Object.entries(DESTINATION_CATEGORIES).map(([catSlug, cfg]) =>
        mdLink(`${cfg.label} in ${country.name}`, `/destinations/${country.slug}/${catSlug}/`)
      )
    )}`,
    mdFaqs(faqs),
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([
      destNode,
      buildFaqNode(canonicalUrl, faqs),
      buildBreadcrumbNode(canonicalUrl, breadcrumbs),
    ]),
    bodyHtml,
    markdown,
  };
}

async function renderAttractionDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/attractions/slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const attr = res.data;
  if (!attr) return { status: 503 };

  const canonicalPath = `/attractions/${attr.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const name = String(attr.name || '').trim();
  const title = `${name} | ${SITE_NAME}`;
  const description =
    cleanText(attr.summary || attr.description, 160) ||
    `Discover ${name} and plan your visit with ${SITE_NAME}.`;
  const image = getImageUrl(attr.cover_image || attr.image_id);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Attractions', url: '/attractions/' },
    ...(attr.country
      ? [{ name: attr.country.name, url: `/destinations/${attr.country.slug}/` }]
      : []),
    { name, url: canonicalPath },
  ];

  const factBox = renderFactBox([
    attr.country
      ? {
          label: 'Country',
          value: `<a href="/destinations/${escapeHtml(attr.country.slug)}/">${escapeHtml(attr.country.name)}</a>`,
          isHtml: true,
        }
      : null,
    attr.city ? { label: 'Location', value: attr.city } : null,
    attr.opening_hours ? { label: 'Opening Hours', value: attr.opening_hours } : null,
    attr.duration_minutes ? { label: 'Typical Visit', value: `${attr.duration_minutes} minutes` } : null,
    formatCurrency(attr.price) ? { label: 'Admission', value: formatCurrency(attr.price) } : null,
  ]);

  const activitiesHtml =
    Array.isArray(attr.activities) && attr.activities.length > 0
      ? `<section><h2>Activities at ${escapeHtml(name)}</h2><ul>${attr.activities
          .filter((a) => a && a.slug)
          .map(
            (a) => `<li><a href="/activities/${escapeHtml(a.slug)}/">${escapeHtml(a.name)}</a></li>`
          )
          .join('')}</ul></section>`
      : '';

  const hotelsHtml =
    Array.isArray(attr.hotels) && attr.hotels.length > 0
      ? `<section><h2>Nearby Lodges &amp; Hotels</h2><ul>${attr.hotels
          .filter((h) => h && h.slug)
          .map((h) => `<li><a href="/hotels/${escapeHtml(h.slug)}/">${escapeHtml(h.name)}</a></li>`)
          .join('')}</ul></section>`
      : '';

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(name)}</h1>
      <p>${escapeHtml(description)}</p>
      ${factBox}
      ${attr.description ? `<section><h2>About ${escapeHtml(name)}</h2><div>${sanitizeHtml(attr.description)}</div></section>` : ''}
      ${activitiesHtml}
      ${hotelsHtml}
    </article>
  `);

  const attrNode = {
    '@type': 'TouristAttraction',
    '@id': `${canonicalUrl}#attraction`,
    name,
    description,
    image,
    url: canonicalUrl,
  };
  if (attr.opening_hours) attrNode.openingHours = attr.opening_hours;
  if (attr.city || attr.address || attr.country) {
    attrNode.address = {
      '@type': 'PostalAddress',
      streetAddress: attr.address || undefined,
      addressLocality: attr.city || undefined,
      addressCountry: attr.country?.name || undefined,
    };
  }
  if (attr.latitude && attr.longitude) {
    attrNode.geo = {
      '@type': 'GeoCoordinates',
      latitude: attr.latitude,
      longitude: attr.longitude,
    };
  }

  const mdFacts = mdFactList([
    attr.country
      ? { label: 'Country', value: mdLink(attr.country.name, `/destinations/${attr.country.slug}/`) }
      : null,
    attr.city ? { label: 'Location', value: attr.city } : null,
    attr.opening_hours ? { label: 'Opening Hours', value: attr.opening_hours } : null,
    attr.duration_minutes ? { label: 'Typical Visit', value: `${attr.duration_minutes} minutes` } : null,
    formatCurrency(attr.price) ? { label: 'Admission', value: formatCurrency(attr.price) } : null,
  ]);

  const markdown = joinMdSections([
    `# ${name}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    attr.description ? `## About ${name}\n\n${htmlToMarkdown(attr.description)}` : '',
    Array.isArray(attr.activities) && attr.activities.length > 0
      ? `## Activities at ${name}\n\n${mdBullets(
          attr.activities
            .filter((a) => a && a.slug)
            .map((a) => mdLink(a.name, `/activities/${a.slug}/`))
        )}`
      : '',
    Array.isArray(attr.hotels) && attr.hotels.length > 0
      ? `## Nearby Lodges & Hotels\n\n${mdBullets(
          attr.hotels
            .filter((h) => h && h.slug)
            .map((h) => mdLink(h.name, `/hotels/${h.slug}/`))
        )}`
      : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([attrNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderActivityDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/activities/slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const act = res.data;
  if (!act) return { status: 503 };

  const canonicalPath = `/activities/${act.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const name = String(act.name || '').trim();
  const title = `${name} | ${SITE_NAME}`;
  const description =
    cleanText(act.summary || act.description, 160) ||
    `Experience ${name} across East Africa with ${SITE_NAME}.`;
  const image = getImageUrl(
    act.cover_image?.file_path || act.cover_image?.storage_key || act.image_id
  );

  const countries = Array.isArray(act.countries) ? act.countries : [];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Activities', url: '/activities/' },
    { name, url: canonicalPath },
  ];

  const highlights = parseListField(act.highlights);
  const inclusions = parseListField(act.inclusions);
  const exclusions = parseListField(act.exclusions);

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(name)}</h1>
      <p>${escapeHtml(description)}</p>
      ${countries.length > 0 ? renderFactBox([{ label: 'Available In', value: countries.map((c) => `<a href="/destinations/${escapeHtml(c.slug)}/">${escapeHtml(c.name)}</a>`).join(', '), isHtml: true }]) : ''}
      ${act.description ? `<section><h2>Experience Overview</h2><div>${sanitizeHtml(act.description)}</div></section>` : ''}
      ${highlights.length > 0 ? `<section><h2>Highlights</h2><ul>${highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul></section>` : ''}
      ${inclusions.length > 0 ? `<section><h2>Inclusions</h2><ul>${inclusions.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul></section>` : ''}
      ${exclusions.length > 0 ? `<section><h2>Exclusions</h2><ul>${exclusions.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul></section>` : ''}
    </article>
  `);

  const actNode = {
    '@type': 'TouristAttraction',
    '@id': `${canonicalUrl}#activity`,
    name,
    description,
    image,
    url: canonicalUrl,
  };

  const mdFacts =
    countries.length > 0
      ? mdFactList([
          {
            label: 'Available In',
            value: countries.map((c) => mdLink(c.name, `/destinations/${c.slug}/`)).join(', '),
          },
        ])
      : '';

  const markdown = joinMdSections([
    `# ${name}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    mdFacts ? `## Key Facts\n\n${mdFacts}` : '',
    act.description ? `## Experience Overview\n\n${htmlToMarkdown(act.description)}` : '',
    highlights.length > 0 ? `## Highlights\n\n${mdBullets(highlights)}` : '',
    inclusions.length > 0 ? `## Inclusions\n\n${mdBullets(inclusions)}` : '',
    exclusions.length > 0 ? `## Exclusions\n\n${mdBullets(exclusions)}` : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([actNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderBlogDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/blog/slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const blog = res.data;
  if (!blog) return { status: 503 };

  const canonicalPath = `/blog/${blog.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const title = `${blog.title} | ${SITE_NAME}`;
  const description =
    cleanText(blog.summary || blog.content, 160) ||
    `Read ${blog.title} on the ${SITE_NAME} travel blog.`;
  const image = getImageUrl(blog.cover_image_url || blog.cover_image_id || blog.cover_image);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Travel Blog', url: '/blog/' },
    { name: blog.title, url: canonicalPath },
  ];

  const publishedDate = blog.published_at || blog.created_at;
  const modifiedDate = blog.updated_at || publishedDate;
  const tags = Array.isArray(blog.tags)
    ? blog.tags.map((t) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
    : [];
  const relatedPackages = Array.isArray(blog.packages) ? blog.packages : [];

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(blog.title)}</h1>
      ${publishedDate ? `<p><time datetime="${escapeHtml(publishedDate)}">Published ${escapeHtml(formatDate(publishedDate))}</time></p>` : ''}
      ${blog.summary ? `<p><strong>${escapeHtml(cleanText(blog.summary, 0))}</strong></p>` : ''}
      <section>${sanitizeHtml(blog.content || '')}</section>
      ${tags.length > 0 ? `<section><h2>Topics</h2><ul>${tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul></section>` : ''}
      ${relatedPackages.length > 0 ? `<section><h2>Related Tour Packages</h2><ul>${relatedPackages.filter((p) => p && p.slug).map((p) => `<li><a href="${p.country?.slug ? `/packages/${escapeHtml(p.country.slug)}/${escapeHtml(p.slug)}/` : `/packages/${escapeHtml(p.slug)}/`}">${escapeHtml(p.name)}</a></li>`).join('')}</ul></section>` : ''}
    </article>
  `);

  const blogNode = {
    '@type': 'BlogPosting',
    '@id': `${canonicalUrl}#article`,
    headline: blog.title,
    description,
    image,
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished: publishedDate || undefined,
    dateModified: modifiedDate || undefined,
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    keywords: tags.length > 0 ? tags.join(', ') : undefined,
  };

  const mdFacts = mdFactList([
    publishedDate ? { label: 'Published', value: formatDate(publishedDate) } : null,
    modifiedDate && modifiedDate !== publishedDate
      ? { label: 'Updated', value: formatDate(modifiedDate) }
      : null,
    tags.length > 0 ? { label: 'Topics', value: tags.join(', ') } : null,
  ]);

  const markdown = joinMdSections([
    `# ${blog.title}`,
    `Canonical URL: ${canonicalUrl}`,
    mdFacts ? mdFacts : '',
    blog.summary ? cleanText(blog.summary, 0) : description,
    blog.content ? htmlToMarkdown(blog.content) : '',
    relatedPackages.length > 0
      ? `## Related Tour Packages\n\n${mdBullets(
          relatedPackages
            .filter((p) => p && p.slug)
            .map((p) =>
              mdLink(
                p.name,
                p.country?.slug ? `/packages/${p.country.slug}/${p.slug}/` : `/packages/${p.slug}/`
              )
            )
        )}`
      : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([blogNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderRegionDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(
    apiBaseUrl,
    `/regions/slug/${encodeURIComponent(slug)}/with-countries`
  );
  if (res.status === 404) return { status: 404 };
  const region = res.data;
  if (!region) return { status: 503 };

  const canonicalPath = `/regions/${region.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const title = `${region.name} Safari & Travel Guide | ${SITE_NAME}`;
  const description =
    cleanText(region.description, 160) ||
    `Explore countries, safaris, and travel experiences in ${region.name} with ${SITE_NAME}.`;
  const image = getImageUrl(region.image_id || region.cover_image);

  const countries = Array.isArray(region.countries) ? region.countries : [];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Destinations', url: '/destinations/' },
    { name: 'Regions', url: '/regions/' },
    { name: region.name, url: canonicalPath },
  ];

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(region.name)} Destinations &amp; Safaris</h1>
      <p>${escapeHtml(description)}</p>
      ${countries.length > 0 ? `<section><h2>Countries in ${escapeHtml(region.name)}</h2><ul>${countries.filter((c) => c && c.slug).map((c) => `<li><a href="/destinations/${escapeHtml(c.slug)}/">${escapeHtml(c.name)}</a>${c.description ? ` — ${escapeHtml(cleanText(c.description, 140))}` : ''}</li>`).join('')}</ul></section>` : ''}
    </article>
  `);

  const regionNode = {
    '@type': 'TouristDestination',
    '@id': `${canonicalUrl}#region`,
    name: region.name,
    description,
    image,
    url: canonicalUrl,
    containsPlace: countries
      .filter((c) => c && c.slug)
      .map((c) => ({
        '@type': 'Country',
        name: c.name,
        url: buildAbsoluteUrl(`/destinations/${c.slug}/`),
      })),
  };

  const markdown = joinMdSections([
    `# ${region.name} Destinations & Safaris`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    countries.length > 0
      ? `## Countries in ${region.name}\n\n${mdBullets(
          countries
            .filter((c) => c && c.slug)
            .map(
              (c) =>
                `${mdLink(c.name, `/destinations/${c.slug}/`)}${c.description ? ` — ${cleanText(c.description, 140)}` : ''}`
            )
        )}`
      : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'article',
    jsonLd: buildGraph([regionNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderHolidayTypeDetail(apiBaseUrl, slug) {
  const res = await fetchApiJson(apiBaseUrl, `/holiday-types/slug/${encodeURIComponent(slug)}`);
  if (res.status === 404) return { status: 404 };
  const ht = res.data;
  if (!ht) return { status: 503 };

  const canonicalPath = `/holiday-types/${ht.slug}/`;
  const canonicalUrl = buildAbsoluteUrl(canonicalPath);
  const title = `${ht.name} Safaris & Holidays | ${SITE_NAME}`;
  const description =
    cleanText(ht.description, 160) ||
    `Explore curated ${ht.name} packages, group trips, and experiences across Africa with ${SITE_NAME}.`;
  const image = getImageUrl(ht.image_id || ht.cover_image);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Holiday Types', url: '/holiday-types/' },
    { name: ht.name, url: canonicalPath },
  ];

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(ht.name)} Tours &amp; Safaris</h1>
      <p>${escapeHtml(description)}</p>
      ${ht.description ? `<section><div>${sanitizeHtml(ht.description)}</div></section>` : ''}
      <p><a href="/packages/">Browse all tour packages</a> | <a href="/holiday-types/">All holiday types</a></p>
    </article>
  `);

  const node = {
    '@type': 'CollectionPage',
    '@id': `${canonicalUrl}#collection`,
    name: ht.name,
    description,
    image,
    url: canonicalUrl,
    provider: { '@id': ORG_ID },
  };

  const markdown = joinMdSections([
    `# ${ht.name} Tours & Safaris`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    ht.description ? htmlToMarkdown(ht.description) : '',
    mdBullets([
      mdLink('Browse all tour packages', '/packages/'),
      mdLink('All holiday types', '/holiday-types/'),
    ]),
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image,
    ogType: 'website',
    jsonLd: buildGraph([node, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

async function renderCollectionHub(apiBaseUrl, config) {
  const res = await fetchApiJson(apiBaseUrl, config.apiEndpoint);
  const items = extractList(res.data);

  const canonicalUrl = buildAbsoluteUrl(config.path);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: config.breadcrumbLabel, url: config.path },
  ];

  const listItems = items
    .filter((item) => item && item.slug)
    .slice(0, 50)
    .map((item) => {
      const href = config.getItemHref(item);
      const name = item.name || item.title || item.slug;
      const summary = cleanText(item.summary || item.description || '', 140);
      return { name, href, summary };
    });

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(config.heading)}</h1>
      <p>${escapeHtml(config.description)}</p>
      ${listItems.length > 0 ? `<section><ul>${listItems.map((i) => `<li><a href="${escapeHtml(i.href)}">${escapeHtml(i.name)}</a>${i.summary ? `<p>${escapeHtml(i.summary)}</p>` : ''}</li>`).join('')}</ul></section>` : ''}
    </article>
  `);

  const graph = buildGraph([
    {
      '@type': config.schemaType || 'CollectionPage',
      '@id': `${canonicalUrl}#collection`,
      name: config.heading,
      description: config.description,
      url: canonicalUrl,
      provider: { '@id': ORG_ID },
    },
    listItems.length > 0
      ? {
          '@type': 'ItemList',
          itemListElement: listItems.slice(0, 30).map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            url: buildAbsoluteUrl(item.href),
          })),
        }
      : null,
    buildBreadcrumbNode(canonicalUrl, breadcrumbs),
  ]);

  const markdown = joinMdSections([
    `# ${config.heading}`,
    `Canonical URL: ${canonicalUrl}`,
    config.description,
    listItems.length > 0
      ? mdBullets(
          listItems.map(
            (i) => `${mdLink(i.name, i.href)}${i.summary ? ` — ${i.summary}` : ''}`
          )
        )
      : '',
  ]);

  return {
    status: 200,
    title: config.title,
    description: config.description,
    canonicalUrl,
    image: DEFAULT_OG_IMAGE,
    ogType: 'website',
    jsonLd: graph,
    bodyHtml,
    markdown,
  };
}

async function renderStaticPage(apiBaseUrl, path) {
  const page = STATIC_PAGES[path];
  if (!page) return null;

  let dynamicContentHtml = '';
  let title = page.title;
  let description = page.description;

  if (page.contentSlug) {
    const res = await fetchApiJson(
      apiBaseUrl,
      `/content/slug/${encodeURIComponent(page.contentSlug)}`
    );
    if (res.status === 200 && res.data) {
      if (res.data.meta_title) title = res.data.meta_title;
      if (res.data.meta_description) description = cleanText(res.data.meta_description, 160);
      if (res.data.content) dynamicContentHtml = `<section>${sanitizeHtml(res.data.content)}</section>`;
    }
  }

  const canonicalUrl = buildAbsoluteUrl(`${path}/`);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: page.heading, url: `${path}/` },
  ];

  const staticSectionsHtml = (page.bodySections || [])
    .map(
      (sec) =>
        `<section><h2>${escapeHtml(sec.heading)}</h2>${sec.text ? `<p>${escapeHtml(sec.text)}</p>` : ''}${sec.items ? `<ul>${sec.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : ''}</section>`
    )
    .join('');

  const bodyHtml = wrapMainLayout(`
    ${renderBreadcrumbsHtml(breadcrumbs)}
    <article>
      <h1>${escapeHtml(page.heading)}</h1>
      <p>${escapeHtml(description)}</p>
      ${staticSectionsHtml}
      ${dynamicContentHtml}
    </article>
  `);

  const pageNode = {
    '@type': page.schemaType || 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    name: page.heading,
    description,
    url: canonicalUrl,
    mainEntity: page.schemaType === 'AboutPage' || page.schemaType === 'ContactPage' ? { '@id': ORG_ID } : undefined,
  };

  const staticSectionsMd = (page.bodySections || []).map((sec) => {
    const parts = [`## ${sec.heading}`];
    if (sec.text) parts.push(sec.text);
    if (sec.items) parts.push(mdBullets(sec.items));
    return parts.join('\n\n');
  });

  const markdown = joinMdSections([
    `# ${page.heading}`,
    `Canonical URL: ${canonicalUrl}`,
    description,
    ...staticSectionsMd,
    dynamicContentHtml ? htmlToMarkdown(dynamicContentHtml) : '',
  ]);

  return {
    status: 200,
    title,
    description,
    canonicalUrl,
    image: DEFAULT_OG_IMAGE,
    ogType: 'website',
    jsonLd: buildGraph([pageNode, buildBreadcrumbNode(canonicalUrl, breadcrumbs)]),
    bodyHtml,
    markdown,
  };
}

/* -------------------------------------------------------------------------- */
/*  Collection Hub Configs                                                    */
/* -------------------------------------------------------------------------- */

const COLLECTION_HUBS = {
  '/destinations': {
    path: '/destinations/',
    title: `Destinations | ${SITE_NAME}`,
    heading: 'Explore African Destinations',
    breadcrumbLabel: 'Destinations',
    description:
      'Explore breathtaking African destinations with Allbound Vacations. From Uganda and Kenya to Tanzania, Rwanda, and Zanzibar.',
    apiEndpoint: '/countries/?limit=50',
    getItemHref: (c) => `/destinations/${c.slug}/`,
  },
  '/packages': {
    path: '/packages/',
    title: `Tour Packages | ${SITE_NAME}`,
    heading: 'Curated Travel Packages & Tailor-Made Safaris',
    breadcrumbLabel: 'Tour Packages',
    description:
      'Discover curated safari packages, wildlife tours, and luxury adventures crafted for unforgettable memories.',
    apiEndpoint: '/packages/?limit=50',
    getItemHref: (p) =>
      p.country?.slug ? `/packages/${p.country.slug}/${p.slug}/` : `/packages/${p.slug}/`,
  },
  '/hotels': {
    path: '/hotels/',
    title: `Hotels & Luxury Lodges | ${SITE_NAME}`,
    heading: 'Luxury Lodges & Safari Stays',
    breadcrumbLabel: 'Hotels & Lodges',
    description:
      'Find handpicked luxury safari lodges, boutique hotels, and beachfront resorts across East Africa.',
    apiEndpoint: '/hotels/?limit=50',
    getItemHref: (h) => `/hotels/${h.slug}/`,
  },
  '/activities': {
    path: '/activities/',
    title: `Activities & Experiences | ${SITE_NAME}`,
    heading: 'Unforgettable African Activities & Adventures',
    breadcrumbLabel: 'Activities',
    description:
      'Explore exciting activities from gorilla trekking and hot air balloon safaris to cultural encounters.',
    apiEndpoint: '/activities/?limit=50',
    getItemHref: (a) => `/activities/${a.slug}/`,
  },
  '/attractions': {
    path: '/attractions/',
    title: `Top Attractions | ${SITE_NAME}`,
    heading: 'Top Sights & National Parks',
    breadcrumbLabel: 'Attractions',
    description:
      'Discover famous national parks, waterfalls, mountains, and wildlife reserves across Africa.',
    apiEndpoint: '/attractions/?limit=50',
    getItemHref: (a) => `/attractions/${a.slug}/`,
  },
  '/group-trips': {
    path: '/group-trips/',
    title: `Group Trips | ${SITE_NAME}`,
    heading: 'Scheduled Group Trips & Expeditions',
    breadcrumbLabel: 'Group Trips',
    description:
      'Join scheduled group trips and expeditions with fellow travelers to extraordinary destinations.',
    apiEndpoint: '/group-trips/?limit=50',
    getItemHref: (g) => `/group-trips/${g.slug}/`,
  },
  '/holiday-types': {
    path: '/holiday-types/',
    title: `Holiday Types | ${SITE_NAME}`,
    heading: 'Travel by Holiday Style',
    breadcrumbLabel: 'Holiday Types',
    description:
      'Explore tours by holiday style: Wildlife Safari, Gorilla Trekking, Beach Holidays, Honeymoons, and more.',
    apiEndpoint: '/holiday-types/?limit=50',
    getItemHref: (h) => `/holiday-types/${h.slug}/`,
  },
  '/blog': {
    path: '/blog/',
    title: `Travel Blog & Guides | ${SITE_NAME}`,
    heading: 'Travel Stories, Safari Guides & Insights',
    breadcrumbLabel: 'Travel Blog',
    description:
      'Read travel inspiration, safari guides, packing tips, and destination stories from our expert team.',
    apiEndpoint: '/blog/?limit=50',
    schemaType: 'Blog',
    getItemHref: (b) => `/blog/${b.slug}/`,
  },
  '/regions': {
    path: '/regions/',
    title: `Regions | ${SITE_NAME}`,
    heading: 'Explore African Regions',
    breadcrumbLabel: 'Regions',
    description:
      'Explore our diverse regions across Africa, from the savannas of East Africa to coastal islands.',
    apiEndpoint: '/regions/with-countries',
    getItemHref: (r) => `/regions/${r.slug}/`,
  },
};

/* -------------------------------------------------------------------------- */
/*  HTML Shell Injection                                                      */
/* -------------------------------------------------------------------------- */

function replaceOrInject(html, pattern, tag) {
  if (pattern.test(html)) {
    return html.replace(pattern, () => tag);
  }
  return html.replace('</head>', () => `    ${tag}\n  </head>`);
}

function injectSsrIntoShell(templateHtml, pageData) {
  const safeTitle = escapeHtml(pageData.title || `${SITE_NAME}`);
  const safeDesc = escapeHtml(pageData.description || DEFAULT_DESCRIPTION);
  const safeCanonical = escapeHtml(buildAbsoluteUrl(pageData.canonicalUrl || '/'));
  const safeImage = escapeHtml(pageData.image || DEFAULT_OG_IMAGE);
  const safeOgType = escapeHtml(pageData.ogType || 'website');

  let html = templateHtml;

  // Strip any existing JSON-LD scripts from the template to avoid duplicates
  html = html.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '');

  // Head metadata
  html = replaceOrInject(html, /<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);
  html = replaceOrInject(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="robots" content="index, follow" />`
  );
  html = replaceOrInject(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeCanonical}" />`
  );

  // Open Graph tags
  html = replaceOrInject(
    html,
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="${safeOgType}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeImage}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${safeImage}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:alt" content="${safeTitle}" />`
  );

  // Twitter tags
  html = replaceOrInject(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeImage}" />`
  );
  html = replaceOrInject(
    html,
    /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image:alt" content="${safeTitle}" />`
  );

  // Inject unified @graph JSON-LD
  if (pageData.jsonLd) {
    const serialized = JSON.stringify(pageData.jsonLd).replace(/<\/script/gi, '<\\/script');
    const scriptTag = `    <script type="application/ld+json">${serialized}</script>`;
    html = html.replace('</head>', () => `${scriptTag}\n  </head>`);
  }

  // Inject semantic HTML inside <div id="root">...</div> (React createRoot replaces it on hydration)
  if (pageData.bodyHtml) {
    const rootReplacement = `<div id="root">\n${pageData.bodyHtml}\n    </div>`;
    if (/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i.test(html)) {
      html = html.replace(/<div\s+id="root"[^>]*>[\s\S]*?<\/div>/i, () => rootReplacement);
    } else {
      html = html.replace('</body>', () => `${rootReplacement}\n  </body>`);
    }
  }

  return html;
}

/* -------------------------------------------------------------------------- */
/*  Route Dispatcher                                                          */
/* -------------------------------------------------------------------------- */

async function resolvePublicRoute(path, apiBaseUrl) {
  // Homepage
  if (path === '/') {
    return renderHomepage(apiBaseUrl);
  }

  // Collection hubs
  if (COLLECTION_HUBS[path]) {
    return renderCollectionHub(apiBaseUrl, COLLECTION_HUBS[path]);
  }

  // Static / Content pages
  if (STATIC_PAGES[path]) {
    return renderStaticPage(apiBaseUrl, path);
  }

  let match;

  // Packages: /packages/:destination/:slug (canonical) or /packages/:slug (308-redirect if country exists)
  if ((match = path.match(/^\/packages\/[^/]+\/([^/]+)$/))) {
    return renderPackageDetail(apiBaseUrl, match[1]);
  }
  if ((match = path.match(/^\/packages\/([^/]+)$/))) {
    return renderPackageDetail(apiBaseUrl, match[1], { redirectIfCountry: true });
  }

  // Group Trips: /group-trips/:slug
  if ((match = path.match(/^\/group-trips\/([^/]+)$/))) {
    return renderGroupTripDetail(apiBaseUrl, match[1]);
  }

  // Hotels: /hotels/:slug (duplicate nested routes 308-redirect in fetch)
  if ((match = path.match(/^\/hotels\/([^/]+)$/))) {
    return renderHotelDetail(apiBaseUrl, match[1]);
  }

  // Attractions: /attractions/:slug (duplicate nested routes 308-redirect in fetch)
  if ((match = path.match(/^\/attractions\/([^/]+)$/))) {
    return renderAttractionDetail(apiBaseUrl, match[1]);
  }

  // Activities: /activities/:slug (duplicate nested routes 308-redirect in fetch)
  if ((match = path.match(/^\/activities\/([^/]+)$/))) {
    return renderActivityDetail(apiBaseUrl, match[1]);
  }

  // Blog: /blog/:slug
  if ((match = path.match(/^\/blog\/([^/]+)$/))) {
    return renderBlogDetail(apiBaseUrl, match[1]);
  }

  // Regions: /regions/:slug (/destinations/regions/:slug 308-redirects in fetch)
  if ((match = path.match(/^\/regions\/([^/]+)$/))) {
    return renderRegionDetail(apiBaseUrl, match[1]);
  }

  // Holiday Types: /holiday-types/:slug
  if ((match = path.match(/^\/holiday-types\/([^/]+)$/))) {
    return renderHolidayTypeDetail(apiBaseUrl, match[1]);
  }

  // Destinations / Countries:
  // /destinations/:slug/:category
  if (
    (match = path.match(
      /^\/destinations\/([^/]+)\/(packages|hotel-packages|group-trips|attractions|hotels|activities)$/
    ))
  ) {
    return renderCountryDetail(apiBaseUrl, match[1], match[2]);
  }

  // /destinations/:slug (/countries/:slug & /destinations/countries/:slug 308-redirect in fetch)
  if ((match = path.match(/^\/destinations\/([^/]+)$/))) {
    return renderCountryDetail(apiBaseUrl, match[1], null);
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Dynamic /llms.txt Generator (llmstxt.org)                                 */
/* -------------------------------------------------------------------------- */

async function renderLlmsTxt(apiBaseUrl) {
  const [countriesRes, packagesRes, groupTripsRes, holidayTypesRes, blogRes] =
    await Promise.all([
      fetchApiJson(apiBaseUrl, '/countries/?limit=20'),
      fetchApiJson(apiBaseUrl, '/packages/featured?limit=8'),
      fetchApiJson(apiBaseUrl, '/group-trips/?limit=6'),
      fetchApiJson(apiBaseUrl, '/holiday-types/?limit=12'),
      fetchApiJson(apiBaseUrl, '/blog/?limit=4'),
    ]);

  const countries = extractList(countriesRes.data).filter((c) => c && c.slug);
  let packages = extractList(packagesRes.data).filter((p) => p && p.slug);
  if (packages.length === 0) {
    const fallbackPkgRes = await fetchApiJson(apiBaseUrl, '/packages/?limit=8');
    packages = extractList(fallbackPkgRes.data).filter((p) => p && p.slug);
  }
  const groupTrips = extractList(groupTripsRes.data).filter((g) => g && g.slug);
  const holidayTypes = extractList(holidayTypesRes.data).filter((h) => h && h.slug);
  const blogs = extractList(blogRes.data).filter((b) => b && b.slug);

  const destinationLines =
    countries.length > 0
      ? countries.slice(0, 15).map(
          (c) =>
            `- ${mdLink(c.name, `/destinations/${c.slug}/`)}${c.description ? `: ${cleanText(c.description, 120)}` : ''}`
        )
      : [
          `- ${mdLink('Explore All Destinations', '/destinations/')}: Curated African safari and beach holiday destinations.`,
          `- ${mdLink('African Regions', '/regions/')}: Browse destinations by region across East Africa and beyond.`,
        ];

  const packageLines =
    packages.length > 0
      ? packages.slice(0, 10).map((p) => {
          const href = p.country?.slug
            ? `/packages/${p.country.slug}/${p.slug}/`
            : `/packages/${p.slug}/`;
          const meta = [
            p.duration_days ? `${p.duration_days} Days` : null,
            formatCurrency(p.price) ? `From ${formatCurrency(p.price)}` : null,
            p.country?.name || null,
          ]
            .filter(Boolean)
            .join(' · ');
          const summary = p.summary ? cleanText(p.summary, 120) : '';
          const suffix = [meta, summary].filter(Boolean).join(' — ');
          return `- ${mdLink(p.name, href)}${suffix ? `: ${suffix}` : ''}`;
        })
      : [
          `- ${mdLink('All Safari & Tour Packages', '/packages/')}: Tailor-made wildlife safaris, gorilla trekking, and luxury vacations.`,
          `- ${mdLink('Hotels & Luxury Lodges', '/hotels/')}: Handpicked safari camps, eco-lodges, and boutique hotels.`,
        ];

  const groupTripLines =
    groupTrips.length > 0
      ? groupTrips.slice(0, 8).map((g) => {
          const meta = [
            g.duration_days ? `${g.duration_days} Days` : null,
            formatCurrency(g.price) ? `From ${formatCurrency(g.price)}` : null,
          ]
            .filter(Boolean)
            .join(' · ');
          return `- ${mdLink(g.name, `/group-trips/${g.slug}/`)}${meta ? `: ${meta}` : ''}`;
        })
      : [
          `- ${mdLink('Scheduled Group Trips', '/group-trips/')}: Small-group departures and overland expeditions across East Africa.`,
        ];

  const holidayTypeLines =
    holidayTypes.length > 0
      ? holidayTypes.slice(0, 12).map((h) => `- ${mdLink(h.name, `/holiday-types/${h.slug}/`)}`)
      : [
          `- ${mdLink('Explore Holiday Types', '/holiday-types/')}: Wildlife safaris, gorilla trekking, honeymoons, family trips, and beach holidays.`,
          `- ${mdLink('Top Attractions', '/attractions/')}: National parks, reserves, and natural landmarks.`,
          `- ${mdLink('Signature Activities', '/activities/')}: Gorilla trekking, game drives, balloon safaris, and cultural tours.`,
        ];

  const blogLines =
    blogs.length > 0
      ? blogs.slice(0, 8).map((b) => `- ${mdLink(b.title, `/blog/${b.slug}/`)}`)
      : [
          `- ${mdLink('Travel Blog & Safari Guides', '/blog/')}: Packing tips, seasonal wildlife calendars, and destination advice.`,
        ];

  const aboutLines = [
    `- ${mdLink('About Allbound Vacations', '/about-us/')}: East African safari specialists with offices in Uganda and Kenya.`,
    `- ${mdLink('Contact Us', '/contact-us/')}: Uganda +256 782 594 008 | Kenya +254 723 927 458 | bookings@allboundvacations.com`,
    `- ${mdLink('Visa Guidance', '/visa-application/')}: East Africa Tourist Visa and e-visa preparation.`,
    `- ${mdLink('Domestic & Regional Flights', '/flights/')}: Bush flights and regional air connections.`,
    `- ${mdLink('Flexible Payment Plans', '/payment-plans/')}: Deposit and installment booking options.`,
  ];

  return joinMdSections([
    `# ${SITE_NAME}`,
    `> ${SITE_NAME} is a full-service African safari operator and travel agency based in Uganda and Kenya, offering tailor-made wildlife safaris, mountain gorilla trekking, luxury lodges, and scheduled group expeditions. Request any public page with \`Accept: text/markdown\` for clean structured Markdown.`,
    `## Destinations\n\n${destinationLines.join('\n')}`,
    `## Featured Safari & Holiday Packages\n\n${packageLines.join('\n')}`,
    `## Group Trips\n\n${groupTripLines.join('\n')}`,
    `## Holiday Types\n\n${holidayTypeLines.join('\n')}`,
    `## Travel Guides & Blog\n\n${blogLines.join('\n')}`,
    `## About & Contact\n\n${aboutLines.join('\n')}`,
  ]);
}

async function handleLlmsTxt(request, env, ctx, url) {
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(new URL('/llms.txt', url.origin).toString(), { method: 'GET' });

  if (cache && request.method === 'GET') {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const hitHeaders = new Headers(cached.headers);
        hitHeaders.set('X-Allbounds-SSR', 'cache-hit');
        return new Response(cached.body, {
          status: cached.status,
          headers: hitHeaders,
        });
      }
    } catch (_err) {
      // Proceed without cache on cache API error
    }
  }

  const apiBaseUrl = env?.API_BASE_URL || DEFAULT_API_BASE_URL;
  const body = await renderLlmsTxt(apiBaseUrl);

  const headers = new Headers({
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': PUBLIC_CACHE_CONTROL,
    'Content-Signal': CONTENT_SIGNAL_HEADER,
    'X-Allbounds-SSR': 'rendered',
  });

  const response = new Response(request.method === 'HEAD' ? null : body, {
    status: 200,
    headers,
  });

  if (cache && request.method === 'GET') {
    const putPromise = cache.put(cacheKey, response.clone()).catch(() => {});
    if (ctx && typeof ctx.waitUntil === 'function') {
      ctx.waitUntil(putPromise);
    } else {
      await putPromise;
    }
  }

  return response;
}

/* -------------------------------------------------------------------------- */
/*  404 & Helper Responses                                                    */
/* -------------------------------------------------------------------------- */

async function serveNotFoundResponse(request, env, { wantsMarkdown = false } = {}) {
  if (wantsMarkdown) {
    const mdBody = joinMdSections([
      '# 404 Not Found',
      'The requested page does not exist or has been moved.',
      mdBullets([
        mdLink(`${SITE_NAME} Home`, '/'),
        mdLink('Explore Destinations', '/destinations/'),
        mdLink('Browse Tour Packages', '/packages/'),
      ]),
    ]);
    const mdHeaders = new Headers({
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'Cache-Control': 'public, max-age=60',
      'Cloudflare-CDN-Cache-Control': 'no-store',
      'CDN-Cache-Control': 'no-store',
      'Content-Signal': CONTENT_SIGNAL_HEADER,
      'x-markdown-tokens': String(estimateMarkdownTokens(mdBody)),
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Allbounds-SSR': '404',
    });
    return new Response(request.method === 'HEAD' ? null : mdBody, {
      status: 404,
      headers: mdHeaders,
    });
  }

  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    Vary: 'Accept',
    'Cache-Control': 'public, max-age=60',
    'Cloudflare-CDN-Cache-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Allbounds-SSR': '404',
  });

  try {
    const notFoundAsset = await env.ASSETS.fetch(
      new Request(new URL('/404.html', request.url), { method: 'GET' })
    );
    if (notFoundAsset && notFoundAsset.ok) {
      return new Response(request.method === 'HEAD' ? null : notFoundAsset.body, {
        status: 404,
        headers,
      });
    }
  } catch (_err) {
    // Fall through to inline 404 HTML
  }

  const fallbackHtml = `<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>Page Not Found | ${SITE_NAME}</title><meta name="robots" content="noindex, nofollow" /></head><body><main><h1>Page Not Found</h1><p>The page you are looking for does not exist or has been moved.</p><p><a href="/">Return Home</a></p></main></body></html>`;
  return new Response(request.method === 'HEAD' ? null : fallbackHtml, {
    status: 404,
    headers,
  });
}

function isNonPublicSpaRoute(path) {
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/login' ||
    path.startsWith('/sign/') ||
    path.startsWith('/verify/') ||
    path === '/start-planning' ||
    path === '/book-destination' ||
    path === '/unauthorized' ||
    path === '/form-showcase' ||
    path === '/search' ||
    path === '/contact'
  );
}

/* -------------------------------------------------------------------------- */
/*  Cloudflare Pages Worker Entrypoint                                        */
/* -------------------------------------------------------------------------- */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const rawPath = url.pathname;
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

    // 0. Dynamic /llms.txt endpoint (llmstxt.org) — handled before static file pass-through
    if ((request.method === 'GET' || request.method === 'HEAD') && path === '/llms.txt') {
      return handleLlmsTxt(request, env, ctx, url);
    }

    // 1. Pass through non-GET/HEAD requests, /api/*, and static files with extensions
    const lastSegment = path.split('/').pop() || '';
    const hasFileExtension = /\.[a-z0-9]+$/i.test(lastSegment);
    if (
      (request.method !== 'GET' && request.method !== 'HEAD') ||
      path === '/api' ||
      path.startsWith('/api/') ||
      hasFileExtension
    ) {
      return env.ASSETS.fetch(request);
    }

    // 2. Preserve legacy redirects (matching public/_redirects & App.tsx)
    if (path === '/stays') {
      return Response.redirect(new URL('/hotels/', url.origin).toString(), 308);
    }
    if (/^\/destinations\/[^/]+\/book$/.test(path)) {
      return Response.redirect(new URL('/book-destination/', url.origin).toString(), 308);
    }
    if (path.startsWith('/destinations-old/')) {
      return Response.redirect(new URL('/destinations/', url.origin).toString(), 308);
    }
    if (path.startsWith('/packages-old/')) {
      return Response.redirect(new URL('/packages/', url.origin).toString(), 308);
    }
    if (path === '/countries') {
      return Response.redirect(new URL('/destinations/', url.origin).toString(), 308);
    }

    // 2b. Duplicate entity route canonical 308 redirects (matching public/_redirects)
    let redirectMatch;
    if (
      (redirectMatch = path.match(/^\/countries\/([^/]+)$/)) ||
      (redirectMatch = path.match(/^\/destinations\/countries\/([^/]+)$/))
    ) {
      return Response.redirect(
        new URL(`/destinations/${redirectMatch[1]}/`, url.origin).toString(),
        308
      );
    }
    if ((redirectMatch = path.match(/^\/destinations\/regions\/([^/]+)$/))) {
      return Response.redirect(
        new URL(`/regions/${redirectMatch[1]}/`, url.origin).toString(),
        308
      );
    }
    if (
      (redirectMatch = path.match(/^\/hotels\/[^/]+\/([^/]+)$/)) ||
      (redirectMatch = path.match(/^\/destinations\/[^/]+\/hotels\/([^/]+)$/))
    ) {
      return Response.redirect(
        new URL(`/hotels/${redirectMatch[1]}/`, url.origin).toString(),
        308
      );
    }
    if (
      (redirectMatch = path.match(/^\/attractions\/[^/]+\/([^/]+)$/)) ||
      (redirectMatch = path.match(/^\/destinations\/[^/]+\/attractions\/([^/]+)$/))
    ) {
      return Response.redirect(
        new URL(`/attractions/${redirectMatch[1]}/`, url.origin).toString(),
        308
      );
    }
    if (
      (redirectMatch = path.match(/^\/activities\/[^/]+\/([^/]+)$/)) ||
      (redirectMatch = path.match(/^\/destinations\/[^/]+\/activities\/([^/]+)$/))
    ) {
      return Response.redirect(
        new URL(`/activities/${redirectMatch[1]}/`, url.origin).toString(),
        308
      );
    }

    // 3. Non-public SPA / admin / auth / verification routes: serve SPA shell directly
    if (isNonPublicSpaRoute(path)) {
      const isAdmin = path === '/admin' || path.startsWith('/admin/');
      const isLogin = path === '/login';
      const targetPath = isAdmin ? '/admin/' : isLogin ? '/login/' : '/';
      const shellRequest = new Request(new URL(targetPath, request.url), {
        method: 'GET',
        headers: request.headers,
      });
      let shellResponse = await env.ASSETS.fetch(shellRequest);
      if (shellResponse.status === 404 && targetPath !== '/') {
        shellResponse = await env.ASSETS.fetch(
          new Request(new URL('/', request.url), { method: 'GET', headers: request.headers })
        );
      }

      const headers = new Headers(shellResponse.headers);
      headers.set('X-Robots-Tag', 'noindex, nofollow');
      return new Response(request.method === 'HEAD' ? null : shellResponse.body, {
        status: 200,
        headers,
      });
    }

    // 4. Cloudflare Cache API lookup for public GET pages (separate html vs md cache keys)
    const wantsMarkdown = prefersMarkdown(request);
    const cache = typeof caches !== 'undefined' ? caches.default : null;
    const normalizedCachePath = path === '/' ? '/' : `${path}/`;
    const cacheUrl = new URL(normalizedCachePath, url.origin);
    cacheUrl.searchParams.set('__variant', wantsMarkdown ? 'md' : 'html');
    const cacheKey = new Request(cacheUrl.toString(), {
      method: 'GET',
    });

    if (cache && request.method === 'GET') {
      try {
        const cached = await cache.match(cacheKey);
        if (cached) {
          const hitHeaders = new Headers(cached.headers);
          applyNegotiatedClientCacheHeaders(hitHeaders);
          hitHeaders.set('X-Allbounds-SSR', 'cache-hit');
          return new Response(cached.body, {
            status: cached.status,
            headers: hitHeaders,
          });
        }
      } catch (_err) {
        // Proceed without cache on cache API error
      }
    }

    // 5. Resolve public route via FastAPI Edge SSR
    const apiBaseUrl = env?.API_BASE_URL || DEFAULT_API_BASE_URL;
    const routeResult = await resolvePublicRoute(path, apiBaseUrl);

    // Unknown public route -> try static asset, otherwise return true HTTP 404
    if (routeResult === null) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status === 404) {
        return serveNotFoundResponse(request, env, { wantsMarkdown });
      }
      return assetResponse;
    }

    // FastAPI explicitly returned 404 for this entity slug -> true HTTP 404 (no soft-200!)
    if (routeResult.status === 404) {
      return serveNotFoundResponse(request, env, { wantsMarkdown });
    }

    // Dynamic canonical redirect (e.g. /packages/:slug -> /packages/:country/:slug/)
    if (routeResult.status === 308 && routeResult.redirectTo) {
      return Response.redirect(new URL(routeResult.redirectTo, url.origin).toString(), 308);
    }

    // Graceful fallback if FastAPI is temporarily unreachable / timed out (status 503)
    if (routeResult.status !== 200) {
      if (wantsMarkdown) {
        const fallbackMd = joinMdSections([
          `# ${SITE_NAME}`,
          'Live trip details are temporarily unavailable. Please try again shortly or visit our website directly.',
          mdBullets([
            mdLink(`${SITE_NAME} Home`, '/'),
            mdLink('Destinations', '/destinations/'),
            mdLink('Tour Packages', '/packages/'),
            mdLink('Contact Us', '/contact-us/'),
          ]),
        ]);
        const headers = new Headers({
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept',
          'Cache-Control': 'no-store',
          'Cloudflare-CDN-Cache-Control': 'no-store',
          'CDN-Cache-Control': 'no-store',
          'Content-Signal': CONTENT_SIGNAL_HEADER,
          'x-markdown-tokens': String(estimateMarkdownTokens(fallbackMd)),
          'X-Allbounds-SSR': 'md-fallback',
        });
        return new Response(request.method === 'HEAD' ? null : fallbackMd, {
          status: 503,
          headers,
        });
      }

      const staticAsset = await env.ASSETS.fetch(request);
      if (staticAsset && staticAsset.ok) {
        const headers = new Headers(staticAsset.headers);
        headers.set('Vary', 'Accept');
        headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
        headers.set('CDN-Cache-Control', 'no-store');
        headers.set('Content-Signal', CONTENT_SIGNAL_HEADER);
        headers.set('X-Allbounds-SSR', 'static-fallback');
        return new Response(request.method === 'HEAD' ? null : staticAsset.body, {
          status: 200,
          headers,
        });
      }
      const shellFallback = await env.ASSETS.fetch(
        new Request(new URL('/', request.url), { method: 'GET', headers: { Accept: 'text/html' } })
      );
      const headers = new Headers(shellFallback.headers);
      headers.set('Content-Type', 'text/html; charset=utf-8');
      headers.set('Vary', 'Accept');
      headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
      headers.set('CDN-Cache-Control', 'no-store');
      headers.set('Content-Signal', CONTENT_SIGNAL_HEADER);
      headers.set('X-Allbounds-SSR', 'spa-fallback');
      return new Response(request.method === 'HEAD' ? null : shellFallback.body, {
        status: 200,
        headers,
      });
    }

    // 6. Serve negotiated Markdown or SSR HTML response
    //    Store 1-hour variant in Workers caches.default (PUBLIC_CACHE_CONTROL),
    //    but instruct Cloudflare's outer CDN never to cache across Accept variants.
    let responseBody;
    let cacheHeaders;
    if (wantsMarkdown) {
      responseBody =
        routeResult.markdown ||
        joinMdSections([
          `# ${routeResult.title || SITE_NAME}`,
          `Canonical URL: ${buildAbsoluteUrl(routeResult.canonicalUrl || path)}`,
          routeResult.description || DEFAULT_DESCRIPTION,
        ]);
      cacheHeaders = new Headers({
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
        'Cache-Control': PUBLIC_CACHE_CONTROL,
        'Content-Signal': CONTENT_SIGNAL_HEADER,
        'x-markdown-tokens': String(estimateMarkdownTokens(responseBody)),
        'X-Allbounds-SSR': 'rendered',
      });
    } else {
      const shellRes = await env.ASSETS.fetch(
        new Request(new URL('/', request.url), {
          method: 'GET',
          headers: { Accept: 'text/html' },
        })
      );
      const templateHtml = await shellRes.text();
      responseBody = injectSsrIntoShell(templateHtml, routeResult);

      cacheHeaders = new Headers({
        'Content-Type': 'text/html; charset=utf-8',
        Vary: 'Accept',
        'Cache-Control': PUBLIC_CACHE_CONTROL,
        'Content-Signal': CONTENT_SIGNAL_HEADER,
        'X-Allbounds-SSR': 'rendered',
      });
    }

    // Store in Cloudflare Cache API (1-hour edge TTL via s-maxage=3600, separate __variant key)
    if (cache && request.method === 'GET') {
      const cacheResponse = new Response(responseBody, {
        status: 200,
        headers: cacheHeaders,
      });
      const putPromise = cache.put(cacheKey, cacheResponse).catch(() => {});
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(putPromise);
      } else {
        await putPromise;
      }
    }

    const clientHeaders = applyNegotiatedClientCacheHeaders(new Headers(cacheHeaders));
    return new Response(request.method === 'HEAD' ? null : responseBody, {
      status: 200,
      headers: clientHeaders,
    });
  },
};
