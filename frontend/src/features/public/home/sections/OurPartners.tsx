import React from 'react';
import { usePartners } from '../../../../lib/hooks/usePartners';
import CloudflareImage from '../../../../components/ui/CloudflareImage';
import type { Partner } from '../../../../lib/types/api';

// Brand logo definition for predefined / curated partners
interface CuratedPartner {
  id: string | number;
  name: string;
  category: 'airline' | 'hotel' | 'affiliation';
  logoSvg?: React.ReactNode;
  logoTextStyle?: {
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
    letterSpacing?: string;
    fontSize?: string;
  };
  accentColor?: string;
  subtext?: string;
  website_url?: string;
  logo_image_id?: string;
}

// SVG Logos for curated luxury travel & airline partners
const BRAND_LOGOS: Record<string, React.ReactNode> = {
  bvlgari: (
    <div className="flex flex-col items-center">
      <span className="font-serif tracking-[0.35em] text-sm font-semibold text-neutral-800 uppercase">
        BVLGARI
      </span>
    </div>
  ),
  airarabia: (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
        ✈
      </div>
      <div className="flex flex-col text-left leading-tight">
        <span className="text-red-600 font-extrabold text-sm tracking-tight">AirArabia</span>
        <span className="text-[9px] text-red-500 font-arabic tracking-tighter">العربية للطيران</span>
      </div>
    </div>
  ),
  aircanada: (
    <div className="flex items-center gap-1.5">
      <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L9.5 9H2l6 4.5L5.5 21 12 16.5 18.5 21 16 13.5l6-4.5h-7.5z"/>
      </svg>
      <span className="font-bold text-xs tracking-wider text-neutral-900 uppercase">AIR CANADA</span>
    </div>
  ),
  sofitel: (
    <div className="flex flex-col items-center text-center">
      <div className="w-4 h-3 border-t border-b border-neutral-700 mb-0.5" />
      <span className="font-serif tracking-[0.25em] text-xs font-bold text-neutral-800 uppercase">SOFITEL</span>
      <span className="text-[7px] tracking-[0.3em] text-neutral-500 uppercase">LUXURY HOTELS</span>
    </div>
  ),
  cathay: (
    <div className="flex items-center gap-2">
      <svg className="w-6 h-4 text-emerald-800 fill-current" viewBox="0 0 32 20">
        <path d="M0 10 Q 16 0 32 10 Q 16 20 0 10 Z" />
      </svg>
      <span className="font-serif text-xs font-semibold text-emerald-950 tracking-wider">CATHAY PACIFIC</span>
    </div>
  ),
  amadeus: (
    <div className="flex items-center">
      <span className="font-sans font-extrabold text-sm tracking-widest text-blue-900 lowercase">
        a<span className="uppercase text-sky-600">mADeUS</span>
      </span>
    </div>
  ),
  accor: (
    <div className="flex flex-col items-center">
      <svg className="w-5 h-4 text-amber-600 fill-current mb-0.5" viewBox="0 0 24 24">
        <path d="M12 2L2 22h4l6-12 6 12h4L12 2z"/>
      </svg>
      <span className="font-serif font-bold text-xs tracking-[0.3em] text-neutral-800 uppercase">ACCOR</span>
    </div>
  ),
  emirates: (
    <div className="flex flex-col items-center">
      <div className="bg-red-600 text-white px-2 py-0.5 rounded-sm flex items-center gap-1">
        <span className="font-serif font-bold text-xs tracking-wider">Emirates</span>
      </div>
    </div>
  ),
  qatar: (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 rounded-full bg-amber-900/10 flex items-center justify-center">
        <span className="text-amber-900 font-bold text-xs">🇶🇦</span>
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif font-bold text-xs text-amber-950 tracking-wide">QATAR</span>
        <span className="text-[8px] tracking-widest text-amber-900 uppercase">AIRWAYS القطرية</span>
      </div>
    </div>
  ),
  ritzcarlton: (
    <div className="flex flex-col items-center">
      <svg className="w-5 h-5 text-neutral-800 fill-current mb-0.5" viewBox="0 0 24 24">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3l5 3.1v6.8l-5 3.1-5-3.1V8.1L12 5z"/>
      </svg>
      <span className="font-serif font-semibold text-[10px] tracking-[0.2em] text-neutral-900 uppercase">THE RITZ-CARLTON</span>
    </div>
  ),
  flydubai: (
    <div className="flex items-center gap-1">
      <span className="font-bold text-sm text-sky-500">fly</span>
      <span className="font-bold text-sm text-blue-900">dubai</span>
      <span className="w-2 h-2 rounded-full bg-orange-500" />
    </div>
  ),
  delta: (
    <div className="flex items-center gap-2">
      <svg className="w-4 h-4 text-red-600 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L2 22h20L12 2zm0 5l6 12H6l6-12z"/>
      </svg>
      <span className="font-sans font-extrabold text-xs tracking-widest text-blue-950 uppercase">DELTA</span>
    </div>
  ),
  fairmont: (
    <div className="flex flex-col items-center">
      <span className="font-serif italic font-bold text-base text-neutral-800">Fairmont</span>
      <span className="text-[7px] tracking-[0.25em] text-neutral-500 uppercase -mt-1">HOTELS & RESORTS</span>
    </div>
  ),
  singaporeair: (
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 text-amber-500 fill-current" viewBox="0 0 24 24">
        <path d="M2.5 19h19L12 3 2.5 19zM12 7l4.5 8h-9L12 7z"/>
      </svg>
      <div className="flex flex-col text-left">
        <span className="font-sans font-bold text-[10px] text-blue-950 tracking-wider uppercase">SINGAPORE</span>
        <span className="font-sans text-[8px] text-amber-600 tracking-widest uppercase">AIRLINES</span>
      </div>
    </div>
  ),
  swiss: (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">
        +
      </div>
      <span className="font-sans font-black text-xs tracking-widest text-neutral-900 uppercase">SWISS</span>
    </div>
  ),
  parkhyatt: (
    <div className="flex flex-col items-center">
      <span className="font-serif text-xs tracking-[0.3em] font-medium text-neutral-900 uppercase">PARK HYATT™</span>
    </div>
  ),
  expedia: (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-blue-950 text-[9px] font-bold">
        ✈
      </div>
      <span className="font-sans font-bold text-xs text-blue-950 tracking-tight">Expedia</span>
    </div>
  ),
  fourseasons: (
    <div className="flex flex-col items-center">
      <svg className="w-4 h-4 text-neutral-700 fill-current mb-0.5" viewBox="0 0 24 24">
        <path d="M12 2L8 8h8l-4-6zm-6 8l-4 6h8l-4-6zm12 0l-4 6h8l-4-6z"/>
      </svg>
      <span className="font-serif text-[9px] tracking-[0.2em] font-semibold text-neutral-800 uppercase">FOUR SEASONS</span>
      <span className="text-[6px] tracking-[0.2em] text-neutral-500 uppercase">HOTELS AND RESORTS</span>
    </div>
  ),
  kenyaairways: (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold">
        K
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold text-[10px] text-red-600 leading-none">Kenya Airways</span>
        <span className="text-[7px] text-neutral-500 italic leading-tight">The Pride of Africa</span>
      </div>
    </div>
  ),
  ethiopian: (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-yellow-300 text-[9px] font-bold">
        🇪🇹
      </div>
      <span className="font-sans font-bold text-xs text-emerald-800 tracking-tight">Ethiopian</span>
    </div>
  ),
  lufthansa: (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full border-2 border-blue-900 flex items-center justify-center text-blue-900 text-[10px] font-bold">
        🕊
      </div>
      <span className="font-sans font-bold text-xs tracking-wider text-blue-950 uppercase">Lufthansa</span>
    </div>
  ),
  britishairways: (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-2 bg-gradient-to-r from-blue-800 via-red-600 to-blue-800 transform -skew-x-12" />
      <span className="font-serif font-bold text-xs tracking-wider text-blue-950">BRITISH AIRWAYS</span>
    </div>
  ),
  raffles: (
    <div className="flex flex-col items-center">
      <span className="font-serif font-bold text-xs tracking-[0.25em] text-neutral-900 uppercase">RAFFLES</span>
      <span className="text-[7px] tracking-[0.2em] text-neutral-500 uppercase">HOTELS & RESORTS</span>
    </div>
  ),
  fijiairways: (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 bg-neutral-900 text-white flex items-center justify-center text-[10px] font-bold rounded-sm">
        ❖
      </div>
      <span className="font-serif font-bold text-xs tracking-widest text-neutral-900 uppercase">FIJI AIRWAYS</span>
    </div>
  ),
  aerolink: (
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-neutral-900 text-[9px] font-bold">
        ✈
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold text-xs text-neutral-900 leading-none">AeroLink</span>
        <span className="text-[7px] text-amber-700 font-semibold italic">The safari airline</span>
      </div>
    </div>
  ),
  jal: (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-red-600" />
      </div>
      <span className="font-sans font-bold text-xs text-neutral-900 tracking-widest">JAL</span>
    </div>
  ),
  belmond: (
    <div className="flex flex-col items-center">
      <span className="font-serif font-bold text-xs tracking-[0.3em] text-neutral-900 uppercase">BELMOND</span>
    </div>
  ),
  prioritypass: (
    <div className="flex items-center gap-1.5">
      <span className="font-serif font-extrabold text-sm text-neutral-800">P</span>
      <span className="font-serif text-[10px] font-semibold text-neutral-600 tracking-widest uppercase">PRIORITY PASS™</span>
    </div>
  ),
  sixsenses: (
    <div className="flex flex-col items-center">
      <div className="flex gap-1 mb-0.5">
        <span className="w-1 h-1 rounded-full bg-purple-900" />
        <span className="w-1 h-1 rounded-full bg-purple-900" />
        <span className="w-1 h-1 rounded-full bg-purple-900" />
      </div>
      <span className="font-serif text-[10px] font-semibold tracking-[0.2em] text-purple-950 uppercase">SIX SENSES</span>
      <span className="text-[6px] tracking-[0.15em] text-neutral-500 uppercase">HOTELS RESORTS SPAS</span>
    </div>
  ),
  scoot: (
    <div className="flex items-center">
      <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black italic text-xs tracking-tighter">
        scoot
      </div>
    </div>
  ),
  andaz: (
    <div className="flex items-center">
      <span className="font-serif text-sm tracking-[0.3em] font-light text-teal-800 uppercase">A<span className="text-red-500">N</span>d<span className="text-green-600">A</span>Z</span>
    </div>
  ),
  indigo: (
    <div className="flex items-center gap-1">
      <span className="font-bold text-sm text-indigo-900">IndiGo</span>
      <svg className="w-3 h-3 text-indigo-500 fill-current" viewBox="0 0 24 24">
        <path d="M2.5 19h19L12 3 2.5 19z"/>
      </svg>
    </div>
  ),
  baraviation: (
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 bg-blue-900 rounded-sm text-white flex items-center justify-center text-[10px] font-extrabold">
        BAR
      </div>
      <span className="font-sans font-bold text-[10px] text-blue-950 tracking-wider uppercase">AVIATION</span>
    </div>
  ),
  pegasus: (
    <div className="flex flex-col items-center">
      <span className="font-sans font-extrabold text-xs text-red-600 tracking-tighter uppercase italic">PEGASUS</span>
      <span className="text-[7px] text-neutral-600 font-bold tracking-widest uppercase">AIRLINES</span>
    </div>
  ),
  mandarinoriental: (
    <div className="flex flex-col items-center">
      <div className="w-4 h-3 border-b-2 border-amber-600 mb-0.5" />
      <span className="font-serif text-[9px] font-semibold tracking-[0.2em] text-neutral-900 uppercase">MANDARIN ORIENTAL</span>
      <span className="text-[6px] tracking-[0.15em] text-amber-700 uppercase">THE HOTEL GROUP</span>
    </div>
  ),
  goldstar: (
    <div className="flex items-center gap-1">
      <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-[9px]">G</div>
      <span className="font-bold text-[10px] text-blue-900 leading-tight">GoldStar Insurance</span>
    </div>
  )
};

// 5 rows of curated high-end partners matching the visual layout in screenshot
const CURATED_ROWS: CuratedPartner[][] = [
  // Row 1
  [
    { id: 'c1', name: 'BVLGARI', category: 'hotel', logoSvg: BRAND_LOGOS.bvlgari },
    { id: 'c2', name: 'AirArabia', category: 'airline', logoSvg: BRAND_LOGOS.airarabia },
    { id: 'c3', name: 'Air Canada', category: 'airline', logoSvg: BRAND_LOGOS.aircanada },
    { id: 'c4', name: 'Sofitel Luxury Hotels', category: 'hotel', logoSvg: BRAND_LOGOS.sofitel },
    { id: 'c5', name: 'Cathay Pacific', category: 'airline', logoSvg: BRAND_LOGOS.cathay },
    { id: 'c6', name: 'Amadeus', category: 'affiliation', logoSvg: BRAND_LOGOS.amadeus },
    { id: 'c7', name: 'Accor', category: 'hotel', logoSvg: BRAND_LOGOS.accor },
    { id: 'c8', name: 'Priority Pass', category: 'affiliation', logoSvg: BRAND_LOGOS.prioritypass },
    { id: 'c9', name: 'Six Senses', category: 'hotel', logoSvg: BRAND_LOGOS.sixsenses },
    { id: 'c10', name: 'Scoot', category: 'airline', logoSvg: BRAND_LOGOS.scoot },
  ],
  // Row 2
  [
    { id: 'c11', name: 'Royal Air Maroc', category: 'airline' },
    { id: 'c12', name: 'flydubai', category: 'airline', logoSvg: BRAND_LOGOS.flydubai },
    { id: 'c13', name: 'Delta Air Lines', category: 'airline', logoSvg: BRAND_LOGOS.delta },
    { id: 'c14', name: 'Fairmont', category: 'hotel', logoSvg: BRAND_LOGOS.fairmont },
    { id: 'c15', name: 'Singapore Airlines', category: 'airline', logoSvg: BRAND_LOGOS.singaporeair },
    { id: 'c16', name: 'BAR Aviation', category: 'airline', logoSvg: BRAND_LOGOS.baraviation },
    { id: 'c17', name: 'Raffles Hotels', category: 'hotel', logoSvg: BRAND_LOGOS.raffles },
    { id: 'c18', name: 'Korean Air', category: 'airline' },
    { id: 'c19', name: 'Andaz', category: 'hotel', logoSvg: BRAND_LOGOS.andaz },
    { id: 'c20', name: 'Ethiopian Airlines', category: 'airline', logoSvg: BRAND_LOGOS.ethiopian },
  ],
  // Row 3
  [
    { id: 'c21', name: 'Emirates', category: 'airline', logoSvg: BRAND_LOGOS.emirates },
    { id: 'c22', name: 'Qatar Airways', category: 'airline', logoSvg: BRAND_LOGOS.qatar },
    { id: 'c23', name: 'The Ritz-Carlton', category: 'hotel', logoSvg: BRAND_LOGOS.ritzcarlton },
    { id: 'c24', name: 'Fiji Airways', category: 'airline', logoSvg: BRAND_LOGOS.fijiairways },
    { id: 'c25', name: 'dnata', category: 'affiliation' },
    { id: 'c26', name: 'IndiGo', category: 'airline', logoSvg: BRAND_LOGOS.indigo },
    { id: 'c27', name: 'British Airways', category: 'airline', logoSvg: BRAND_LOGOS.britishairways },
    { id: 'c28', name: 'Four Seasons', category: 'hotel', logoSvg: BRAND_LOGOS.fourseasons },
    { id: 'c29', name: 'Kenya Airways', category: 'airline', logoSvg: BRAND_LOGOS.kenyaairways },
  ],
  // Row 4
  [
    { id: 'c30', name: 'SWISS', category: 'airline', logoSvg: BRAND_LOGOS.swiss },
    { id: 'c31', name: 'Park Hyatt', category: 'hotel', logoSvg: BRAND_LOGOS.parkhyatt },
    { id: 'c32', name: 'Pegasus Airlines', category: 'airline', logoSvg: BRAND_LOGOS.pegasus },
    { id: 'c33', name: 'AeroLink', category: 'airline', logoSvg: BRAND_LOGOS.aerolink },
    { id: 'c34', name: 'Lufthansa', category: 'airline', logoSvg: BRAND_LOGOS.lufthansa },
    { id: 'c35', name: 'Mandarin Oriental', category: 'hotel', logoSvg: BRAND_LOGOS.mandarinoriental },
    { id: 'c36', name: 'Japan Airlines', category: 'airline', logoSvg: BRAND_LOGOS.jal },
    { id: 'c37', name: 'Expedia', category: 'affiliation', logoSvg: BRAND_LOGOS.expedia },
  ],
  // Row 5
  [
    { id: 'c38', name: 'Belmond', category: 'hotel', logoSvg: BRAND_LOGOS.belmond },
    { id: 'c39', name: 'GoldStar Insurance', category: 'affiliation', logoSvg: BRAND_LOGOS.goldstar },
    { id: 'c40', name: 'BVLGARI', category: 'hotel', logoSvg: BRAND_LOGOS.bvlgari },
    { id: 'c41', name: 'Air Canada', category: 'airline', logoSvg: BRAND_LOGOS.aircanada },
    { id: 'c42', name: 'Accor', category: 'hotel', logoSvg: BRAND_LOGOS.accor },
    { id: 'c43', name: 'Singapore Airlines', category: 'airline', logoSvg: BRAND_LOGOS.singaporeair },
    { id: 'c44', name: 'SWISS', category: 'airline', logoSvg: BRAND_LOGOS.swiss },
    { id: 'c45', name: 'Emirates', category: 'airline', logoSvg: BRAND_LOGOS.emirates },
  ]
];

/** Renders a single partner logo tile inside the marquee */
const MarqueePartnerCard: React.FC<{ partner: CuratedPartner }> = ({ partner }) => {
  const content = (
    <div className="h-16 md:h-20 w-44 md:w-52 bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_10px_rgba(0,0,0,0.03)] px-5 py-3 flex items-center justify-center shrink-0 transition-all duration-300 hover:shadow-lg hover:border-amber-400/50 hover:scale-[1.04] cursor-pointer group">
      {partner.logo_image_id ? (
        <CloudflareImage
          imageId={partner.logo_image_id}
          variant="thumbnail"
          alt={partner.name}
          className="h-10 w-auto object-contain transition-all duration-300 group-hover:scale-105"
          objectFit="contain"
        />
      ) : partner.logoSvg ? (
        <div className="w-full flex justify-center items-center">
          {partner.logoSvg}
        </div>
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

const OurPartners: React.FC = () => {
  const { data: apiPartners } = usePartners();

  // If backend dynamic partners exist, inject them into our marquee rows
  const mergedRows = React.useMemo(() => {
    if (!apiPartners || apiPartners.length === 0) return CURATED_ROWS;

    // Convert API partners to CuratedPartner structure
    const convertedApiPartners: CuratedPartner[] = apiPartners.map(p => ({
      id: p.id,
      name: p.name,
      category: (p.category as any) || 'affiliation',
      logo_image_id: p.logo_image_id,
      website_url: p.website_url,
    }));

    // Distribute API partners evenly across the 5 rows
    const rows = CURATED_ROWS.map((row, idx) => {
      const extra = convertedApiPartners.filter((_, i) => i % 5 === idx);
      return [...extra, ...row];
    });

    return rows;
  }, [apiPartners]);

  return (
    <section 
      className="py-16 md:py-24 bg-[#ebf1f5] overflow-hidden relative select-none" 
      aria-label="Our Partners & Affiliations"
    >
      <div className="container mx-auto px-4 md:px-8 mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left Title Area */}
          <div className="max-w-2xl">
            {/* Tagline line */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-slate-400 uppercase font-sans mb-3">
              <span className="w-6 h-[2px] bg-slate-300 rounded-full inline-block" />
              WE'RE PARTNERED WITH
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-slate-900 font-semibold tracking-tight leading-[1.15]">
              The names behind <br className="hidden sm:inline" />
              a <span className="italic font-serif font-normal text-[#c59b27]">seamless</span> journey.
            </h2>
          </div>

          {/* Right Counter Badge */}
          <div className="flex items-center gap-3 pt-2 md:pt-0">
            <span className="text-3xl md:text-4xl font-serif italic font-semibold text-[#c59b27]">
              160+
            </span>
            <div className="text-[10px] md:text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase font-sans leading-tight max-w-[220px]">
              AIRLINES · HOTELS · VILLAS · GROUND &amp; TRAVEL PARTNERS
            </div>
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
        <div className="space-y-4 md:space-y-5 transform -rotate-1 scale-[1.01]">
          {mergedRows.map((row, rowIndex) => {
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
              <div key={rowIndex} className="flex overflow-hidden group">
                <div className={`flex gap-4 md:gap-5 shrink-0 pause-on-hover ${animationClass}`}>
                  {fullRowItems.map((item, itemIdx) => (
                    <MarqueePartnerCard key={`${item.id}-${itemIdx}`} partner={item} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurPartners;
