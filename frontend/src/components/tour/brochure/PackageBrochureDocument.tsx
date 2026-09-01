import React from 'react';
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Star,
  Compass,
  ShieldCheck,
  Phone,
  Mail,
  Globe,
  Utensils,
  Hotel as HotelIcon,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { PackageDetailResponse, PriceChartDetail } from '../../../lib/types/api';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

interface PackageBrochureDocumentProps {
  packageData: PackageDetailResponse;
  priceCharts?: PriceChartDetail[];
  id?: string;
}

// Format ISO date strings to readable format
const formatDate = (isoStr?: string | null): string => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return isoStr;
  }
};

// Strip "Day X:" style prefixes from itinerary day titles
const sanitizeDayTitle = (title: string, dayNum: number): string => {
  if (!title) return `Day ${dayNum} Exploration`;
  return title.replace(/^day\s*\d+\s*[:\-–—]\s*/i, '').trim();
};

// Page wrapper — auto height, consistent padding
const Page: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <div
    className={`brochure-page relative flex flex-col ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    style={{ width: '794px', minHeight: '1123px', pageBreakAfter: 'always', boxSizing: 'border-box' }}
  >
    {children}
  </div>
);

// Standard light page header
const PageHeader: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <div className="flex items-center justify-between pb-3 border-b-2 border-teal/20 px-10 pt-8">
    <div className="flex items-center gap-2 text-teal">
      <Compass className="w-5 h-5" />
      <span className="text-sm font-bold uppercase tracking-wider font-playfair">{left}</span>
    </div>
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{right}</span>
  </div>
);

// Standard dark page header
const DarkPageHeader: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <div className="flex items-center justify-between pb-3 border-b border-white/15 px-10 pt-8">
    <div className="flex items-center gap-2">
      <Compass className="w-5 h-5 text-amber-400" />
      <span className="text-sm font-bold uppercase tracking-wider font-playfair text-white">{left}</span>
    </div>
    <span className="text-[11px] font-semibold text-amber-300/80 uppercase tracking-widest">{right}</span>
  </div>
);

// Standard page footer
const PageFooter: React.FC<{ left: string; right: string; dark?: boolean }> = ({ left, right, dark }) => (
  <div
    className={`flex items-center justify-between px-10 pb-8 pt-3 mt-auto border-t text-[10px] ${
      dark ? 'border-white/15 text-gray-400' : 'border-gray-200 text-gray-400'
    }`}
  >
    <span>{left}</span>
    <span className={dark ? 'text-amber-400/90 font-serif italic' : ''}>{right}</span>
  </div>
);

export const PackageBrochureDocument: React.FC<PackageBrochureDocumentProps> = ({
  packageData,
  priceCharts = [],
  id = 'package-brochure-document',
}) => {
  const activeCharts = (priceCharts.length > 0 ? priceCharts : packageData.price_charts || []).filter(
    (c) => c.is_active !== false
  );

  const heroImageUrl = packageData.image_id
    ? getImageUrlWithFallback(packageData.image_id, IMAGE_VARIANTS.LARGE)
    : 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80';

  const destinationSlug = packageData.country?.slug || 'destinations';
  const tourUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/packages/${destinationSlug}/${packageData.slug}`
      : `https://allbounds.com/packages/${destinationSlug}/${packageData.slug}`;

  // Content-weighted itinerary pagination
  const itineraryItems = packageData.itinerary_items || [];
  const itineraryPages: typeof itineraryItems[] = [];
  let currentPage: typeof itineraryItems = [];
  let currentHeight = 0;
  const MAX_PAGE_HEIGHT = 870;

  itineraryItems.forEach((item) => {
    const textLen = (item.description || '').replace(/<[^>]*>/g, '').length;
    const hasActivities =
      (item.custom_activities && item.custom_activities.some((a) => !a.is_meal)) ||
      (item.linked_activities && item.linked_activities.length > 0);
    const descLines = Math.ceil(textLen / 88);
    const estimatedHeight = 44 + descLines * 17 + 52 + (hasActivities ? 28 : 0) + 16;

    if (currentPage.length > 0 && currentHeight + estimatedHeight > MAX_PAGE_HEIGHT) {
      itineraryPages.push(currentPage);
      currentPage = [item];
      currentHeight = estimatedHeight;
    } else {
      currentPage.push(item);
      currentHeight += estimatedHeight;
    }
  });
  if (currentPage.length > 0) itineraryPages.push(currentPage);

  const startingPrice = packageData.price || (activeCharts.length > 0 ? activeCharts[0].price : null);
  const currentYear = new Date().getFullYear();

  return (
    <div
      id={id}
      className="brochure-root bg-white text-gray-900 font-sans select-none"
      style={{ width: '794px', margin: '0 auto' }}
    >
      {/* PAGE 1: LUXURY COVER */}
      <div
        className="brochure-page relative flex flex-col overflow-hidden bg-gray-950 text-white"
        style={{ width: '794px', height: '1123px', pageBreakAfter: 'always', boxSizing: 'border-box' }}
      >
        <div className="absolute inset-0 z-0">
          <img src={heroImageUrl} alt={packageData.name} className="w-full h-full object-cover opacity-85 scale-105" crossOrigin="anonymous" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/50" />
        </div>
        <div className="absolute inset-5 border border-amber-400/30 rounded-2xl pointer-events-none z-10" />

        <header className="relative z-20 pt-10 px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/90 border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-widest uppercase font-playfair text-white block">AllBounds</span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-amber-300 font-medium block">Expeditions &amp; Safaris</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold tracking-wider uppercase text-amber-200">
            Official Tour Dossier
          </div>
        </header>

        <main className="relative z-20 px-10 flex-1 flex flex-col justify-center py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/80 border border-teal/40 text-xs font-bold text-white mb-5 shadow-md self-start">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{packageData.country?.name || 'Exclusive Destination'}</span>
            {packageData.holiday_types && packageData.holiday_types.length > 0 && (
              <><span className="text-white/40">•</span><span>{packageData.holiday_types[0].name}</span></>
            )}
          </div>
          <h1 className="text-4xl font-bold font-playfair leading-tight text-white mb-4 text-shadow-lg max-w-[650px]">
            {packageData.name}
          </h1>
          {packageData.summary && (
            <p className="text-sm text-gray-200 leading-relaxed font-light mb-8 max-w-[600px] italic border-l-2 border-amber-400/80 pl-3 py-1">
              &ldquo;{packageData.summary}&rdquo;
            </p>
          )}
          <div className="grid grid-cols-4 gap-3 bg-gray-900/85 backdrop-blur-md p-4 rounded-xl border border-white/15 shadow-2xl">
            <div className="border-r border-white/10 pr-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Duration</span>
              <span className="text-base font-bold text-white block mt-0.5">{packageData.duration_days} Days</span>
              <span className="text-[10px] text-gray-300">{Math.max(1, packageData.duration_days - 1)} Nights</span>
            </div>
            <div className="border-r border-white/10 pr-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Starting Rate</span>
              <span className="text-base font-bold text-white block mt-0.5">{startingPrice ? `$${startingPrice.toLocaleString()}` : 'On Request'}</span>
              <span className="text-[10px] text-gray-300">Per Person</span>
            </div>
            <div className="border-r border-white/10 pr-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Travel Style</span>
              <span className="text-base font-bold text-white block mt-0.5 leading-snug">{packageData.holiday_types?.[0]?.name || 'Guided Safari'}</span>
              <span className="text-[10px] text-gray-300">All-Inclusive</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Departures</span>
              <span className="text-base font-bold text-white block mt-0.5">Year-Round</span>
              <span className="text-[10px] text-gray-300">Private &amp; Custom</span>
            </div>
          </div>
        </main>

        <footer className="relative z-20 pb-8 px-10 flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-lg shadow-md flex-shrink-0">
              <QRCodeSVG value={tourUrl} size={64} level="M" />
            </div>
            <div>
              <span className="text-[11px] text-amber-300 font-bold block leading-none mb-1">Scan for Live Tour Dossier</span>
              <span className="font-medium text-gray-300 tracking-wide text-[10px] block">www.allboundvacations.com</span>
              <span className="font-medium text-gray-300 tracking-wide text-[10px] block">bookings@allboundvacations.com</span>
            </div>
          </div>
          <span className="text-amber-300/80 font-serif italic text-sm">Bespoke African Journeys</span>
        </footer>
      </div>

      {/* PAGE 2: TOUR OVERVIEW & TRIP FACTS */}
      <Page>
        <PageHeader left="AllBounds Expeditions" right="Tour Overview & Facts • Page 02" />
        <div className="px-10 pt-6 pb-2 space-y-5 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal block mb-0.5">Executive Itinerary Overview</span>
            <h2 className="text-xl font-bold font-playfair text-gray-900 mb-2">About This Extraordinary Journey</h2>
            <div className="text-xs text-gray-600 leading-relaxed space-y-1.5 text-justify" dangerouslySetInnerHTML={{ __html: packageData.description || packageData.summary || 'An immersive adventure crafted for discerning travelers seeking unforgettable memories.' }} />
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal" /><span>Trip Facts At A Glance</span>
            </h3>
            <div className="grid grid-cols-3 gap-2.5 bg-gray-50 border border-gray-200/80 rounded-xl p-3.5">
              {[
                { label: 'Destination', value: packageData.country?.name || 'Africa' },
                { label: 'Duration', value: `${packageData.duration_days} Days / ${Math.max(1, packageData.duration_days - 1)} Nights` },
                { label: 'Group Type', value: 'Private Tailored Tour' },
                { label: 'Physical Rating', value: 'Moderate (All Ages)' },
                { label: 'Best Travel Season', value: 'Year-Round Availability' },
                { label: 'Transport Vehicle', value: '4×4 Safari Land Cruiser' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2.5 bg-white rounded-lg border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block mb-0.5">{label}</span>
                  <span className="font-bold text-gray-900 text-xs block leading-snug">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {packageData.attractions && packageData.attractions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /><span>Featured Attractions &amp; Landmarks</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {packageData.attractions.slice(0, 6).map((attr, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-teal-50/50 rounded-lg border border-teal-100/70">
                    <span className="w-4 h-4 rounded-full bg-teal text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block leading-snug">{attr.name}</span>
                      {attr.city && <span className="text-[9px] text-gray-500 block">{attr.city}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {packageData.media_assets && packageData.media_assets.length > 0 && (
            <div className="rounded-xl overflow-hidden h-36 border border-gray-200 shadow-xs relative">
              <img src={getImageUrlWithFallback(packageData.media_assets[0].image_id, IMAGE_VARIANTS.MEDIUM)} alt="Safari Landmark" className="w-full h-full object-cover" crossOrigin="anonymous" />
              <div className="absolute bottom-2 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">Experience authentic wilderness encounters</div>
            </div>
          )}
        </div>
        <PageFooter left={`AllBounds Vacations • Tour Dossier: ${packageData.name}`} right="Page 02" />
      </Page>

      {/* PAGES 3+: DAY-BY-DAY ITINERARY */}
      {itineraryPages.map((pageDays, pageIndex) => (
        <Page key={pageIndex}>
          <PageHeader left={packageData.name} right={`Daily Itinerary • Page ${String(pageIndex + 3).padStart(2, '0')}`} />
          <div className="px-10 pt-5 pb-2 space-y-3 flex-1">
            {pageDays.map((item, dIdx) => {
              const dayNumber = item.day_number || dIdx + 1;
              const cleanTitle = sanitizeDayTitle(item.title, dayNumber);
              const mealText =
                item.custom_activities && item.custom_activities.some((a) => a.is_meal)
                  ? item.custom_activities.filter((a) => a.is_meal).map((a) => a.meal_type || a.activity_title).join(', ')
                  : 'Breakfast, Lunch & Dinner';
              const stayText =
                item.hotels && item.hotels.length > 0
                  ? item.hotels.map((h) => h.name).join(' • ')
                  : item.accommodation_notes || 'Luxury Safari Lodge';
              const nonMealActivities = [
                ...(item.custom_activities?.filter((a) => !a.is_meal).map((a) => a.activity_title) || []),
                ...(item.linked_activities?.map((a) => a.name) || []),
              ];

              return (
                <div
                  key={item.id || dIdx}
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderLeft: '4px solid #0d9488',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '0', // handled by space-y on parent
                  }}
                >
                  {/* ── Day Header ── */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      paddingBottom: '10px',
                      marginBottom: '10px',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#0d9488',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        lineHeight: '1.4',
                      }}
                    >
                      DAY {dayNumber}
                    </span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#111827',
                        lineHeight: '1.3',
                        fontFamily: 'Playfair Display, Georgia, serif',
                      }}
                    >
                      {cleanTitle}
                    </h3>
                  </div>

                  {/* ── Description ── */}
                  <div
                    className="text-justify"
                    style={{ fontSize: '11px', color: '#4b5563', lineHeight: '1.65', marginBottom: '12px' }}
                    dangerouslySetInnerHTML={{
                      __html: item.description || 'Enjoy a full day of guided excursions and wilderness discovery.',
                    }}
                  />

                  {/* ── Meal & Stay Pills ── */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      marginBottom: nonMealActivities.length > 0 ? '10px' : '0',
                    }}
                  >
                    {/* Meals pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 10px',
                      }}
                    >
                      <svg
                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, display: 'block' }}
                      >
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                      </svg>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: '#374151',
                          lineHeight: '1.3',
                        }}
                      >
                        {mealText}
                      </span>
                    </div>

                    {/* Stay pill */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 10px',
                      }}
                    >
                      <svg
                        width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ flexShrink: 0, display: 'block' }}
                      >
                        <path d="M3 22V9l9-7 9 7v13" />
                        <path d="M9 22V12h6v10" />
                      </svg>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: '#374151',
                          lineHeight: '1.3',
                        }}
                      >
                        {stayText}
                      </span>
                    </div>
                  </div>

                  {/* ── Activities ── */}
                  {nonMealActivities.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: '#9ca3af',
                          marginRight: '4px',
                        }}
                      >
                        Activities:
                      </span>
                      {nonMealActivities.map((name, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '9px',
                            background: '#f0fdfa',
                            color: '#115e59',
                            border: '1px solid #99f6e4',
                            padding: '2px 6px',
                            borderRadius: '5px',
                            fontWeight: '500',
                            lineHeight: '1.4',
                            display: 'inline-block',
                          }}
                        >
                          ✓ {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );

            })}
          </div>
          <PageFooter left="AllBounds Vacations • Detailed Daily Itinerary" right={`Page ${String(pageIndex + 3).padStart(2, '0')}`} />
        </Page>
      ))}

      {/* PAGE: ACCOMMODATIONS & INCLUSIONS */}
      <Page>
        <PageHeader left="Lodging & Terms" right="Accommodations & Inclusions" />
        <div className="px-10 pt-6 pb-2 space-y-5 flex-1">
          {packageData.hotels && packageData.hotels.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal block mb-0.5">Handpicked Lodges &amp; Resorts</span>
              <h2 className="text-lg font-bold font-playfair text-gray-900 mb-2.5">Where You Will Stay</h2>
              <div className="grid grid-cols-2 gap-2.5">
                {packageData.hotels.slice(0, 4).map((hotel, hIdx) => (
                  <div key={hIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex gap-3 items-center">
                    {hotel.image_url || hotel.image_id ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        <img src={hotel.image_url || getImageUrlWithFallback(hotel.image_id, IMAGE_VARIANTS.THUMBNAIL)} alt={hotel.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <HotelIcon className="w-6 h-6 text-teal" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
                        {[...Array(hotel.stars || 4)].map((_, i) => (<Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />))}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 leading-snug">{hotel.name}</h4>
                      <p className="text-[9px] text-gray-500">{hotel.city || packageData.country?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold font-playfair text-gray-900 mb-2.5">What Is Included In Your Package</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /><span>Package Inclusions</span>
                </h3>
                <ul className="space-y-1.5">
                  {(packageData.inclusion_items && packageData.inclusion_items.length > 0
                    ? packageData.inclusion_items.map((inc) => inc.name)
                    : ['All national park & conservation reserve fees','Private 4x4 safari vehicle with popup viewing roof','Expert English-speaking certified safari guide','Full-board accommodation as listed in itinerary','All airport & airstrip arrival/departure transfers','Complimentary bottled mineral water during game drives','Emergency medical evacuation insurance cover']
                  ).map((text, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-gray-700 text-[10px] leading-snug">
                      <span className="text-emerald-600 font-bold flex-shrink-0">✓</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" /><span>Package Exclusions</span>
                </h3>
                <ul className="space-y-1.5">
                  {(packageData.exclusion_items && packageData.exclusion_items.length > 0
                    ? packageData.exclusion_items.map((exc) => exc.name)
                    : ['International flights & applicable airport taxes','Entry visa fees for destination countries','Personal travel & comprehensive health insurance','Premium alcoholic beverages & champagne','Gratuities & tips for driver-guides and camp staff','Optional activities (e.g. Hot Air Balloon Safaris)','Laundry and personal spending items']
                  ).map((text, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-gray-700 text-[10px] leading-snug">
                      <span className="text-rose-500 font-bold flex-shrink-0">✕</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <PageFooter left="AllBounds Vacations • Accommodations & Terms" right="Official Brochure" />
      </Page>

      {/* FINAL PAGE: PRICING & BOOKING (BACK COVER) */}
      <Page dark>
        <DarkPageHeader left="AllBounds Expeditions" right="Pricing & Booking Dossier" />
        <div className="px-10 pt-6 pb-2 space-y-5 flex-1">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">Guaranteed Departures &amp; Rates</span>
            <h2 className="text-xl font-bold font-playfair text-white mb-3">Seasonal Pricing Schedule</h2>
            {activeCharts.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-white/20 bg-gray-950/60 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal/80 text-white uppercase text-[9px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-2.5 px-4 font-bold">Season / Travel Window</th>
                      <th className="py-2.5 px-4 font-bold">Dates</th>
                      <th className="py-2.5 px-4 font-bold text-right">Price (Per Person)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-gray-200">
                    {activeCharts.map((chart, cIdx) => (
                      <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <span className="text-[11px]">{chart.title}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-gray-300 text-[11px]">
                          {chart.start_date && chart.end_date
                            ? `${formatDate(chart.start_date)} – ${formatDate(chart.end_date)}`
                            : 'Year-Round'}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold text-amber-300 text-xs">
                          ${(chart.price || packageData.price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-xs text-gray-300">Standard Starting Rate: <strong className="text-amber-400 text-sm">${(packageData.price || 0).toLocaleString()} USD</strong> per person sharing.</p>
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /><span>Easy 3-Step Booking &amp; Customization</span>
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
              {[
                { step: '01.', title: 'Request Quote', desc: 'Contact our safari specialists with your preferred travel dates and party size.' },
                { step: '02.', title: 'Tailor Itinerary', desc: 'Customize lodges, flights, and activities to match your personal travel vision.' },
                { step: '03.', title: 'Secure & Embark', desc: 'Confirm your reservation with flexible payment terms and 24/7 in-country support.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="p-2.5 bg-gray-950/50 rounded-lg border border-white/10">
                  <span className="text-amber-400 font-bold text-xs block mb-1">{step} {title}</span>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code — large and prominent */}
          <div className="flex items-center gap-6 bg-gray-950/80 p-4 rounded-xl border border-amber-400/30 shadow-lg">
            <div className="bg-white p-2.5 rounded-xl shadow-md flex-shrink-0">
              <QRCodeSVG value={tourUrl} size={90} level="M" fgColor="#042f2e" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Instant Online Tour Access</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Scan To View Real-Time Dates &amp; Book Online</h4>
              <p className="text-[10px] text-gray-400 font-mono break-all">{tourUrl}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal/90 to-teal-950/90 border border-amber-400/40 rounded-xl p-4 shadow-xl">
            <h3 className="text-sm font-bold font-playfair text-white mb-1">Speak With An AllBounds Safari Specialist</h3>
            <p className="text-[11px] text-gray-200 mb-3 leading-relaxed">Have questions or ready to book? Our destination experts are available 7 days a week to assist you.</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-300" /><span className="font-semibold text-white text-[11px]">+256 782 594 008</span></div>
              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-300" /><span className="font-semibold text-white text-[11px]">bookings@allboundvacations.com</span></div>
              <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-amber-300" /><span className="font-semibold text-white text-[11px]">www.allboundvacations.com</span></div>
            </div>
          </div>
        </div>
        <PageFooter dark left={`© ${currentYear} AllBounds Vacations. All rights reserved.`} right="Crafting Unforgettable African Journeys" />
      </Page>
    </div>
  );
};

export default PackageBrochureDocument;
