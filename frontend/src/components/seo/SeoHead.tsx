import React from 'react';
import { Helmet } from 'react-helmet-async';

type StructuredData = Record<string, unknown>;

export interface SeoHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  noIndex?: boolean;
  keywords?: string[] | string;
  siteName?: string;
  structuredData?: StructuredData | StructuredData[];
  children?: React.ReactNode;
}

const DEFAULT_SITE_NAME = 'Allbound Vacations';
const DEFAULT_DESCRIPTION =
  'Discover extraordinary destinations and create unforgettable travel experiences with Allbound Vacations.';

const buildCanonicalUrl = (canonicalPath?: string, canonicalUrl?: string) => {
  if (canonicalUrl) {
    return canonicalUrl;
  }

  if (canonicalPath) {
    if (/^https?:\/\//i.test(canonicalPath)) {
      return canonicalPath;
    }

    if (typeof window !== 'undefined') {
      return `${window.location.origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    }

    return canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  }

  if (typeof window !== 'undefined') {
    return window.location.href;
  }

  return '/';
};

const normalizeTitle = (title: string, siteName: string) => {
  const cleanedTitle = title.trim();
  if (!cleanedTitle) {
    return siteName;
  }

  if (cleanedTitle.toLowerCase().includes(siteName.toLowerCase())) {
    return cleanedTitle;
  }

  return `${cleanedTitle} | ${siteName}`;
};

const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  canonicalUrl,
  image,
  type = 'website',
  noIndex = false,
  keywords,
  siteName = DEFAULT_SITE_NAME,
  structuredData,
  children,
}) => {
  const fullTitle = normalizeTitle(title, siteName);
  const metaDescription = description?.trim() || DEFAULT_DESCRIPTION;
  const canonical = buildCanonicalUrl(canonicalPath, canonicalUrl);
  const keywordContent = Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords;
  const jsonLdItems = structuredData
    ? (Array.isArray(structuredData) ? structuredData : [structuredData])
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywordContent && <meta name="keywords" content={keywordContent} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
      <link rel="canonical" href={canonical} />
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
