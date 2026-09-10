import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import OptimizedImage from '../../../components/ui/OptimizedImage';
import { getResponsiveImageSizes } from '../../../utils/imageUtils';
import type { CountryWithDetails } from '../../../lib/types/api';

interface DestinationHeroSectionProps {
  country: CountryWithDetails;
  category?: string;
  scriptPrefix?: string;
  title?: string;
  highlights?: string[];
  ctaText?: string;
  ctaLink?: string;
}

/**
 * Fallback destination highlights when specific highlight tags are not provided
 */
const getDefaultHighlights = (countryName: string, regionName?: string): string[] => {
  const name = countryName.toLowerCase();
  const region = (regionName || '').toLowerCase();

  if (
    name.includes('seychelles') ||
    name.includes('mauritius') ||
    name.includes('maldives') ||
    name.includes('zanzibar') ||
    name.includes('madagascar')
  ) {
    return ['Pristine Beaches', 'Turquoise Waters', 'Unforgettable Moments'];
  }
  if (
    name.includes('kenya') ||
    name.includes('tanzania') ||
    name.includes('south africa') ||
    name.includes('botswana') ||
    name.includes('rwanda') ||
    name.includes('uganda') ||
    name.includes('namibia') ||
    name.includes('zimbabwe') ||
    name.includes('zambia') ||
    region.includes('africa')
  ) {
    return ['Big Five Safari', 'Untamed Wilderness', 'Unforgettable Moments'];
  }
  if (name.includes('egypt') || name.includes('morocco') || name.includes('jordan') || name.includes('dubai') || name.includes('uae')) {
    return ['Ancient Wonders', 'Vibrant Heritage', 'Unforgettable Moments'];
  }
  if (name.includes('thailand') || name.includes('bali') || name.includes('indonesia') || name.includes('vietnam') || region.includes('asia')) {
    return ['Tropical Paradises', 'Vibrant Culture', 'Unforgettable Moments'];
  }
  return ['Extraordinary Journeys', 'Breathtaking Landscapes', 'Unforgettable Moments'];
};

/**
 * Helper to clean HTML tags and entities from raw summary text
 */
const cleanSummaryText = (text: string): string => {
  return text
    .replace(/<[^>]*>?/gm, '')
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&hellip;/gi, '...')
    .replace(/There is no question too small\.?\s*/gi, '')
    .trim();
};

const DestinationHeroSection: React.FC<DestinationHeroSectionProps> = React.memo(({
  country,
  category,
  scriptPrefix = 'Discover',
  title,
  highlights: customHighlights,
  ctaText = 'BOOK A TRIP REQUEST',
  ctaLink,
}) => {
  // Extract and clean summary
  const displaySummary = useMemo(() => {
    if (country.summary) {
      const cleaned = cleanSummaryText(country.summary);
      if (cleaned) return cleaned;
    }
    if (country.description) {
      const cleaned = cleanSummaryText(country.description);
      return cleaned.length > 220 ? `${cleaned.slice(0, 220).trim()}...` : cleaned;
    }
    return `Escape to an extraordinary paradise where nature and culture paint the perfect picture. Discover world-class experiences, stunning landscapes, and unforgettable memories in ${country.name}.`;
  }, [country.summary, country.description, country.name]);

  // Extract highlights list
  const activeHighlights = useMemo(() => {
    if (customHighlights && customHighlights.length > 0) {
      return customHighlights;
    }
    if (country.highlights && country.highlights.length > 0) {
      return country.highlights
        .slice(0, 3)
        .map((h) => (typeof h === 'string' ? h : h.title || h.desc))
        .filter(Boolean);
    }
    return getDefaultHighlights(country.name, country.region?.name);
  }, [customHighlights, country.highlights, country.name, country.region?.name]);

  const targetTitle = title || country.name;
  const bookingLink = ctaLink || `/destinations/${country.slug}/book`;

  return (
    <section
      className="relative w-full min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] flex items-center overflow-hidden"
      aria-label={`${country.name} destination hero`}
    >
      {/* Background Image with Fallback */}
      {country.image_id ? (
        <div className="absolute inset-0 z-0">
          {/* Desktop Image - Large variant */}
          <div className="hidden md:block w-full h-full">
            <OptimizedImage
              imageId={country.image_id}
              alt={`Scenic view of ${country.name}`}
              variant="large"
              className="w-full h-full scale-105 transition-transform duration-1000 ease-out"
              objectFit="cover"
              loading="eager"
              priority={true}
              showSkeleton={false}
              sizes={getResponsiveImageSizes('hero')}
            />
          </div>
          {/* Mobile Image - Medium variant */}
          <div className="block md:hidden w-full h-full">
            <OptimizedImage
              imageId={country.image_id}
              alt={`Scenic view of ${country.name}`}
              variant="medium"
              className="w-full h-full scale-105 transition-transform duration-1000 ease-out"
              objectFit="cover"
              loading="eager"
              priority={true}
              showSkeleton={false}
              sizes={getResponsiveImageSizes('hero')}
            />
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-teal to-primary-dark z-0" />
      )}

      {/* Subtle gentle overall backdrop tone (no harsh split line) */}
      <div className="absolute inset-0 bg-black/15 z-[1]" />

      {/* Hero Content Area - Blur and shading traces the writing */}
      <div className="fluid-container relative z-10 py-10 sm:py-14 md:py-16">
        <div className="max-w-2xl text-left bg-black/40 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl border border-white/15 shadow-2xl">
          
          {/* Top Location Badge */}
          <div className="inline-flex items-center gap-2 text-white/90 text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase drop-shadow-md mb-2 sm:mb-3">
            <MapPin className="w-4 h-4 text-white/90 shrink-0" />
            <span>{country.name}</span>
          </div>

          {/* Cursive / Script Pre-heading */}
          <div className="relative z-10 -mb-1 sm:-mb-2">
            <span className="font-script text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-butter drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] tracking-wide select-none inline-block transform -rotate-1">
              {scriptPrefix}
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-playfair font-bold text-white tracking-tight leading-[1.05] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mb-3 sm:mb-4">
            {targetTitle}
          </h1>

          {/* Key Highlights / Tagline with Bullets */}
          {activeHighlights.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1.5 text-white/95 text-sm sm:text-base md:text-lg font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-4 sm:mb-5">
              {activeHighlights.map((highlight, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <span className="text-butter text-xs sm:text-sm font-bold select-none" aria-hidden="true">
                      •
                    </span>
                  )}
                  <span className="tracking-wide">{highlight}</span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Summary / Descriptive Narrative */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-light drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] mb-6 sm:mb-8 line-clamp-4 md:line-clamp-none">
            {displaySummary}
          </p>

          {/* Call to Action Button */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to={bookingLink}
              className="group inline-flex items-center gap-3 px-6 sm:px-7 py-3.5 sm:py-4 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span className="p-1 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
                <Calendar className="w-4 h-4 text-white" />
              </span>
              <span className="tracking-wider">{ctaText}</span>
              <ArrowRight className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

DestinationHeroSection.displayName = 'DestinationHeroSection';

export default DestinationHeroSection;

