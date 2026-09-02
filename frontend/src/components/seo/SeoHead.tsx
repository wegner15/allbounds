import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  SITE_URL,
  SITE_NAME,
  SITE_TWITTER_HANDLE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_LOCALE,
  DEFAULT_DESCRIPTION,
  buildAbsoluteUrl,
} from '../../lib/seo-config';

type StructuredData = Record<string, unknown>;

export interface SeoHeadProps {
  title: string;
  description?: string;
  /** Relative path (e.g. "/packages/my-tour") — used to build canonical + og:url */
  canonicalPath?: string;
  /** Full absolute URL — overrides canonicalPath if provided */
  canonicalUrl?: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  keywords?: string[] | string;
  siteName?: string;
  /** ISO 8601 date string for article:published_time */
  publishedTime?: string;
  /** ISO 8601 date string for article:modified_time */
  modifiedTime?: string;
  /** Author name for article:author */
  author?: string;
  /** Theme color for mobile browser toolbars (default: #2D3748) */
  themeColor?: string;
  structuredData?: StructuredData | StructuredData[];
  children?: React.ReactNode;
}

const normalizeTitle = (title: string, siteName: string) => {
  const cleanedTitle = title.trim();
  if (!cleanedTitle) return siteName;
  if (cleanedTitle.toLowerCase().includes(siteName.toLowerCase())) return cleanedTitle;
  return `${cleanedTitle} | ${siteName}`;
};

const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  type = 'website',
  noIndex = false,
  keywords,
  siteName = SITE_NAME,
  publishedTime,
  modifiedTime,
  author,
  themeColor,
  structuredData,
  children,
}) => {
  const fullTitle = normalizeTitle(title, siteName);
  const metaDescription = description?.trim() || DEFAULT_DESCRIPTION;

  // Always produce an absolute canonical URL
  const canonical = canonicalUrl
    ? canonicalUrl
    : canonicalPath
      ? buildAbsoluteUrl(canonicalPath)
      : (typeof window !== 'undefined' ? window.location.href : SITE_URL);

  const ogImage = image || DEFAULT_OG_IMAGE;
  const ogImageWidth = imageWidth ?? (image ? undefined : DEFAULT_OG_IMAGE_WIDTH);
  const ogImageHeight = imageHeight ?? (image ? undefined : DEFAULT_OG_IMAGE_HEIGHT);
  const ogImageAlt = imageAlt ?? fullTitle;

  const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords;
  const jsonLdItems = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  const isArticle = type === 'article';

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color" content={themeColor || '#2D3748'} />
      <link rel="canonical" href={canonical} />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {/* Open Graph — core */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={DEFAULT_LOCALE} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />

      {/* Open Graph — image */}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      {ogImageWidth && <meta property="og:image:width" content={String(ogImageWidth)} />}
      {ogImageHeight && <meta property="og:image:height" content={String(ogImageHeight)} />}
      <meta property="og:image:alt" content={ogImageAlt} />

      {/* Open Graph — article-specific */}
      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {isArticle && author && (
        <meta property="article:author" content={author} />
      )}
      {isArticle && (
        <meta property="article:publisher" content={`${SITE_URL}`} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:creator" content={SITE_TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

      {/* JSON-LD Structured Data */}
      {jsonLdItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
      {children}
    </Helmet>
  );
};

export default SeoHead;
