/**
 * Lightweight, zero-dependency AI search & assistant referral tracking.
 *
 * Detects inbound visits from known AI search engines and assistants via
 * `document.referrer` or `utm_source` query parameters, and fires a single
 * GA4 `ai_referral_landing` event per browser session when `window.gtag` is present.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface AiReferralDetection {
  ai_source: string;
  referrer_host: string;
  utm_source: string;
}

interface AiSourceRule {
  source: string;
  domains: readonly string[];
  utmTokens: readonly string[];
}

const AI_SOURCE_RULES: readonly AiSourceRule[] = [
  { source: 'chatgpt', domains: ['chatgpt.com'], utmTokens: ['chatgpt.com', 'chatgpt'] },
  { source: 'openai', domains: ['openai.com'], utmTokens: ['openai.com', 'openai'] },
  { source: 'perplexity', domains: ['perplexity.ai'], utmTokens: ['perplexity.ai', 'perplexity'] },
  { source: 'claude', domains: ['claude.ai'], utmTokens: ['claude.ai', 'claude'] },
  {
    source: 'copilot',
    domains: ['copilot.microsoft.com'],
    utmTokens: ['copilot.microsoft.com', 'copilot'],
  },
  {
    source: 'gemini',
    domains: ['gemini.google.com'],
    utmTokens: ['gemini.google.com', 'gemini'],
  },
  { source: 'grok', domains: ['grok.x.ai'], utmTokens: ['grok.x.ai', 'grok'] },
  { source: 'you', domains: ['you.com'], utmTokens: ['you.com'] },
  { source: 'phind', domains: ['phind.com'], utmTokens: ['phind.com', 'phind'] },
  { source: 'meta_ai', domains: ['meta.ai'], utmTokens: ['meta.ai', 'meta_ai', 'meta-ai'] },
];

const SESSION_STORAGE_KEY = 'abv_ai_referral_tracked';

function extractHostname(referrer: string): string {
  if (!referrer) return '';
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function hostMatchesDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/**
 * Detect whether a visit originated from a known AI search engine or assistant.
 * Checks both the HTTP referrer hostname and the `utm_source` query parameter.
 *
 * Returns `null` when no AI source matches.
 */
export function detectAiReferrer(
  referrer: string = typeof document !== 'undefined' ? document.referrer : '',
  search: string = typeof window !== 'undefined' ? window.location.search : '',
): AiReferralDetection | null {
  const referrerHost = extractHostname(referrer);
  const params = new URLSearchParams(search);
  const rawUtmSource = (params.get('utm_source') || '').trim();
  const normalizedUtm = rawUtmSource.toLowerCase();

  if (referrerHost) {
    for (const rule of AI_SOURCE_RULES) {
      if (rule.domains.some((domain) => hostMatchesDomain(referrerHost, domain))) {
        return {
          ai_source: rule.source,
          referrer_host: referrerHost,
          utm_source: rawUtmSource,
        };
      }
    }
  }

  if (normalizedUtm) {
    for (const rule of AI_SOURCE_RULES) {
      if (
        rule.utmTokens.some((token) => normalizedUtm === token) ||
        rule.domains.some((domain) => hostMatchesDomain(normalizedUtm, domain))
      ) {
        return {
          ai_source: rule.source,
          referrer_host: referrerHost,
          utm_source: rawUtmSource,
        };
      }
    }
  }

  return null;
}

/**
 * Fires a single GA4 `ai_referral_landing` event per browser session if the
 * current landing originated from a recognized AI search/assistant source.
 *
 * Safe no-op in non-browser environments, when no AI source is detected, or
 * when `window.gtag` is unavailable.
 */
export function trackAiReferralOnce(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    if (window.sessionStorage.getItem(SESSION_STORAGE_KEY) === '1') {
      return;
    }
  } catch {
    // Ignore storage access errors in strict privacy modes
  }

  const detection = detectAiReferrer(document.referrer, window.location.search);
  if (!detection) {
    return;
  }

  if (typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', 'ai_referral_landing', {
    ai_source: detection.ai_source,
    landing_path: window.location.pathname,
    referrer_host: detection.referrer_host,
    utm_source: detection.utm_source,
  });

  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
  } catch {
    // Ignore storage access errors in strict privacy modes
  }
}
