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
      className="relative w-full h-[calc(100vh-64px)] max-h-[800px] min-h-[480px] overflow-hidden flex flex-col"
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
              className="w-full h-full"
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
              className="w-full h-full"
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

      {/* Very subtle overall tone — keeps image crisp */}
      <div className="absolute inset-0 bg-black/10 z-[1]" />

      {/* Bottom gradient to anchor text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/55 via-black/20 to-transparent z-[1]" />

      {/* ── BOTTOM ROW: text-block left + CTA centred ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-6 sm:pb-8 md:pb-10">
        {/* Text block — bottom-left */}
        <div className="fluid-container">
          <div className="inline-block max-w-sm sm:max-w-md mb-4 sm:mb-5">
            <div className="bg-black/30 backdrop-blur-sm px-5 py-4 sm:px-7 sm:py-5 rounded-xl sm:rounded-2xl border border-white/10 shadow-xl">

              {/* Location Badge */}
              <div className="inline-flex items-center gap-1.5 text-white/85 text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-1.5">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>{country.name}</span>
              </div>

              {/* Script prefix */}
              <div className="-mb-1 sm:-mb-1.5">
                <span className="font-script text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-butter drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] tracking-wide select-none inline-block -rotate-1">
                  {scriptPrefix}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white tracking-tight leading-[1.05] drop-shadow-[0_3px_10px_rgba(0,0,0,0.85)]">
                {targetTitle}
              </h1>

              {/* Highlights */}
              {activeHighlights.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-1.5 sm:gap-x-2 gap-y-1 text-white/90 text-xs sm:text-sm font-medium mt-2 sm:mt-2.5">
                  {activeHighlights.map((highlight, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && (
                        <span className="text-butter text-xs font-bold select-none" aria-hidden="true">•</span>
                      )}
                      <span>{highlight}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Button — centred at bottom */}
        <div className="flex justify-center px-4">
          <Link
            to={bookingLink}
            className="group inline-flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <span className="p-1 rounded-md bg-white/20 group-hover:bg-white/30 transition-colors">
              <Calendar className="w-4 h-4 text-white" />
            </span>
            <span>{ctaText}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
});

DestinationHeroSection.displayName = 'DestinationHeroSection';

export default DestinationHeroSection;

