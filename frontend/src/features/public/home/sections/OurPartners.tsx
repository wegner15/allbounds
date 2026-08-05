import React, { useState, useMemo } from 'react';
import { usePartners } from '../../../../lib/hooks/usePartners';
import CloudflareImage from '../../../../components/ui/CloudflareImage';
import type { Partner } from '../../../../lib/types/api';

/** Renders a single backend partner logo tile inside the marquee */
const MarqueePartnerCard: React.FC<{ partner: Partner }> = ({ partner }) => {
  const content = (
    <div className="h-16 md:h-20 w-48 md:w-56 bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-4 py-2.5 flex items-center justify-center shrink-0 transition-all duration-300 hover:shadow-lg hover:border-amber-400/50 hover:scale-[1.04] cursor-pointer group">
      {partner.logo_image_id ? (
        <CloudflareImage
          imageId={partner.logo_image_id}
          variant="medium"
          alt={partner.name}
          className="max-h-10 md:max-h-12 max-w-[88%] w-auto h-auto object-contain transition-all duration-300 group-hover:scale-105"
          objectFit="contain"
        />
      ) : (
        <span className="text-xs font-bold text-slate-800 tracking-wider uppercase text-center leading-snug font-sans group-hover:text-amber-600 transition-colors">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.website_url) {
    return (
      <a 
        href={partner.website_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block shrink-0 focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
};

/** Skeleton loading card */
const SkeletonCard: React.FC = () => (
  <div className="h-16 md:h-20 w-44 md:w-52 bg-white/70 rounded-2xl border border-slate-200/50 animate-pulse shrink-0" />
);

// Category display labels helper
const getCategoryLabel = (categoryKey: string): string => {
  switch (categoryKey.toLowerCase()) {
    case 'hotel':
      return 'Hotels & Villas';
    case 'airline':
      return 'Airlines';
    case 'affiliation':
    case 'ground':
      return 'Ground & Travel';
    default:
      return categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
  }
};

const getCategoryIcon = (categoryKey: string): string => {
  switch (categoryKey.toLowerCase()) {
    case 'hotel':
      return '🏨 ';
    case 'airline':
      return '✈ ';
    case 'affiliation':
    case 'ground':
      return '🤝 ';
    default:
      return '';
  }
};

const OurPartners: React.FC = () => {
  const { data: partners, isLoading } = usePartners();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter only active partners returned from the API
  const activePartners = useMemo(() => {
    if (!partners) return [];
    return partners.filter(p => p.is_active !== false);
  }, [partners]);

  // Extract unique categories available from real backend partners
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    activePartners.forEach(p => {
      if (p.category) cats.add(p.category.toLowerCase());
    });
    return Array.from(cats);
  }, [activePartners]);

  // Filter partners based on active category selection
  const filteredPartners = useMemo(() => {
    if (activeCategory === 'all') return activePartners;
    return activePartners.filter(p => (p.category || '').toLowerCase() === activeCategory.toLowerCase());
  }, [activePartners, activeCategory]);

  // Distribute filtered partners evenly across 5 sliding marquee rows
  const marqueeRows = useMemo(() => {
    if (filteredPartners.length === 0) return [[], [], [], [], []];

    // Duplicate list if necessary so marquee tracks scroll infinitely without empty gaps
    let extendedList = [...filteredPartners];
    while (extendedList.length < 25) {
      extendedList = [...extendedList, ...filteredPartners];
    }

    const r0: Partner[] = [];
    const r1: Partner[] = [];
    const r2: Partner[] = [];
    const r3: Partner[] = [];
    const r4: Partner[] = [];

    extendedList.forEach((item, index) => {
      const rowIdx = index % 5;
      if (rowIdx === 0) r0.push(item);
      else if (rowIdx === 1) r1.push(item);
      else if (rowIdx === 2) r2.push(item);
      else if (rowIdx === 3) r3.push(item);
      else r4.push(item);
    });

    return [r0, r1, r2, r3, r4];
  }, [filteredPartners]);

  // Don't render section if not loading and zero partners exist in backend database
  if (!isLoading && activePartners.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16 md:py-24 bg-[#ebf1f5] overflow-hidden relative select-none" 
      aria-label="Allbound Partners & Network"
    >
      <div className="container mx-auto px-4 md:px-8 mb-12 md:mb-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          
          {/* Left Title Area */}
          <div className="max-w-2xl">
            {/* Tagline line */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-slate-400 uppercase font-sans mb-3">
              <span className="w-6 h-[2px] bg-slate-300 rounded-full inline-block" />
              ALLBOUND PARTNERS &amp; NETWORK
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 font-semibold tracking-tight leading-[1.15]">
              The trusted names behind your <br className="hidden sm:inline" />
              <span className="italic font-serif font-normal text-[#c59b27]">perfected</span> journey.
            </h2>
          </div>

          {/* Right Counter & Interactive Category Filters */}
          <div className="flex flex-col items-start lg:items-end gap-3 pt-2 lg:pt-0">
            {/* Dynamic Counter & Category Subtitle */}
            <div className="flex items-center gap-3">
              <span className="text-3xl md:text-4xl font-serif italic font-semibold text-[#c59b27] transition-all duration-300">
                {isLoading ? '...' : `${filteredPartners.length}+`}
              </span>
              <div className="text-[10px] md:text-[11px] font-bold text-slate-400 tracking-[0.18em] uppercase font-sans leading-tight">
                {activeCategory === 'all'
                  ? 'OUR TRUSTED GLOBAL PARTNERS'
                  : getCategoryLabel(activeCategory).toUpperCase()}
              </div>
            </div>

            {/* Interactive Category Filter Pills */}
            {availableCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-sm">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
                    activeCategory === 'all'
                      ? 'bg-[#c59b27] text-white shadow-sm scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  ALL ({activePartners.length})
                </button>
                {availableCategories.map((catKey) => {
                  const isActive = activeCategory === catKey;
                  const catCount = activePartners.filter(p => (p.category || '').toLowerCase() === catKey).length;
                  return (
                    <button
                      key={catKey}
                      onClick={() => setActiveCategory(catKey)}
                      className={`px-3.5 py-1.5 rounded-xl text-[10px] md:text-[11px] font-bold tracking-wider uppercase transition-all duration-300 ${
                        isActive
                          ? 'bg-[#c59b27] text-white shadow-sm scale-105'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      {getCategoryIcon(catKey)}
                      {getCategoryLabel(catKey).toUpperCase()} ({catCount})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Marquee Multi-Row Container with Perspective Slant */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Top & Bottom Soft Fade Gradients */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#ebf1f5] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#ebf1f5] to-transparent z-10 pointer-events-none" />

        {/* Left & Right Edge Soft Fade Gradients */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#ebf1f5] via-[#ebf1f5]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#ebf1f5] via-[#ebf1f5]/80 to-transparent z-10 pointer-events-none" />

        {/* Slanted 3D Track Container */}
        <div className="space-y-4 md:space-y-5 transform -rotate-1 scale-[1.01] transition-all duration-500">
          {isLoading ? (
            /* Loading skeletons */
            [...Array(3)].map((_, rIdx) => (
              <div key={rIdx} className="flex gap-4 md:gap-5 overflow-hidden">
                {[...Array(8)].map((_, cIdx) => (
                  <SkeletonCard key={cIdx} />
                ))}
              </div>
            ))
          ) : (
            marqueeRows.map((row, rowIndex) => {
              if (row.length === 0) return null;

              // Alternate scroll direction and speeds per row
              const isReverse = rowIndex % 2 !== 0;
              const animationClass = isReverse
                ? rowIndex === 1
                  ? 'animate-marquee-right'
                  : 'animate-marquee-right-slow'
                : rowIndex === 0
                  ? 'animate-marquee-left'
                  : rowIndex === 2
                    ? 'animate-marquee-left-fast'
                    : 'animate-marquee-left-slow';

              // Duplicate array twice to ensure seamless infinite looping marquee
              const fullRowItems = [...row, ...row, ...row];

              return (
                <div key={`${activeCategory}-${rowIndex}`} className="flex overflow-hidden group">
                  <div className={`flex gap-4 md:gap-5 shrink-0 pause-on-hover ${animationClass}`}>
                    {fullRowItems.map((item, itemIdx) => (
                      <MarqueePartnerCard key={`${item.id}-${itemIdx}`} partner={item} />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default OurPartners;
