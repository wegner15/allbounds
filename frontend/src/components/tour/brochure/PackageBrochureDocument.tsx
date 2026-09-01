import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Compass, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Utensils, 
  Hotel as HotelIcon,
  Sparkles,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { PackageDetailResponse, PriceChartDetail } from '../../../lib/types/api';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

interface PackageBrochureDocumentProps {
  packageData: PackageDetailResponse;
  priceCharts?: PriceChartDetail[];
  id?: string;
}

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
  const tourUrl = typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/packages/${destinationSlug}/${packageData.slug}`
    : `https://allbounds.com/packages/${destinationSlug}/${packageData.slug}`;

  // Helper to sanitize title and remove redundant "Day X:" prefixes
  const sanitizeDayTitle = (title: string, dayNum: number) => {
    if (!title) return `Day ${dayNum} Exploration`;
    return title.replace(/^day\s*\d+\s*[:\-–—]\s*/i, '').trim();
  };

  // Dynamically group itinerary items into pages based on content weight so cards never overflow or get cut off
  const itineraryItems = packageData.itinerary_items || [];
  const itineraryPages: typeof itineraryItems[] = [];
  
  let currentPage: typeof itineraryItems = [];
  let currentHeight = 0;
  // Standard A4 usable vertical space (1123px - 140px header/footer/padding)
  const MAX_PAGE_CONTENT_HEIGHT = 800;

  itineraryItems.forEach((item, index) => {
    const textLen = (item.description || '').replace(/<[^>]*>/g, '').length;
    const hasActivities =
      (item.custom_activities && item.custom_activities.some((a) => !a.is_meal)) ||
      (item.linked_activities && item.linked_activities.length > 0);
    // Base card height ~110px + ~18px per 80 chars of text + 24px for activities
    const estimatedHeight = 110 + Math.ceil(textLen / 80) * 18 + (hasActivities ? 24 : 0);

    if (currentPage.length > 0 && currentHeight + estimatedHeight > MAX_PAGE_CONTENT_HEIGHT) {
      itineraryPages.push(currentPage);
      currentPage = [item];
      currentHeight = estimatedHeight;
    } else {
      currentPage.push(item);
      currentHeight += estimatedHeight;
    }
  });

  if (currentPage.length > 0) {
    itineraryPages.push(currentPage);
  }

  // Calculate starting price
  const startingPrice = packageData.price || (activeCharts.length > 0 ? activeCharts[0].price : null);

  // Current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <div
      id={id}
      className="brochure-root bg-white text-gray-900 font-sans select-none"
      style={{ width: '794px', margin: '0 auto' }}
    >
      {/* ========================================================================= */}
      {/* PAGE 1: LUXURY EDITORIAL COVER PAGE                                      */}
      {/* ========================================================================= */}
      <div
        className="brochure-page relative flex flex-col justify-between overflow-hidden bg-gray-950 text-white"
        style={{ width: '794px', height: '1123px', maxHeight: '1123px', pageBreakAfter: 'always' }}
      >
        {/* Background Cover Image with Luxury Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImageUrl}
            alt={packageData.name}
            className="w-full h-full object-cover opacity-85 scale-105"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-gray-950/50" />
        </div>

        {/* Decorative Gold Inner Frame */}
        <div className="absolute inset-5 border border-amber-400/30 rounded-2xl pointer-events-none z-10" />

        {/* Cover Header */}
        <header className="relative z-20 pt-10 px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/90 border border-amber-400/40 flex items-center justify-center shadow-lg">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-widest uppercase font-playfair text-white block">
                AllBounds
              </span>
              <span className="text-[9px] tracking-[0.25em] uppercase text-amber-300 font-medium block">
                Expeditions & Safaris
              </span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold tracking-wider uppercase text-amber-200">
            Official Tour Dossier
          </div>
        </header>

        {/* Cover Main Hero Content */}
        <main className="relative z-20 px-10 py-6 my-auto">
          {/* Destination Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal/80 border border-teal/40 text-xs font-bold text-white mb-4 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>{packageData.country?.name || 'Exclusive Destination'}</span>
            {packageData.holiday_types && packageData.holiday_types.length > 0 && (
              <>
                <span className="text-white/40">•</span>
                <span>{packageData.holiday_types[0].name}</span>
              </>
            )}
          </div>

          {/* Tour Title */}
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair leading-tight text-white mb-3 text-shadow-lg max-w-[650px]">
            {packageData.name}
          </h1>

          {/* Summary Quote */}
          {packageData.summary && (
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light mb-6 max-w-[600px] line-clamp-3 italic border-l-2 border-amber-400/80 pl-3 py-1">
              &ldquo;{packageData.summary}&rdquo;
            </p>
          )}

          {/* Key Metric Highlight Cards */}
          <div className="grid grid-cols-4 gap-2.5 bg-gray-900/85 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shadow-2xl">
            <div className="border-r border-white/10 pr-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Duration
              </span>
              <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                {packageData.duration_days} Days
              </span>
              <span className="text-[10px] text-gray-300">
                {Math.max(1, packageData.duration_days - 1)} Nights
              </span>
            </div>

            <div className="border-r border-white/10 pr-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Starting Rate
              </span>
              <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                {startingPrice ? `$${startingPrice.toLocaleString()}` : 'On Request'}
              </span>
              <span className="text-[10px] text-gray-300">Per Person</span>
            </div>

            <div className="border-r border-white/10 pr-2">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Travel Style
              </span>
              <span className="text-sm sm:text-base font-bold text-white block mt-0.5 truncate">
                {packageData.holiday_types?.[0]?.name || 'Guided Safari'}
              </span>
              <span className="text-[10px] text-gray-300">All-Inclusive</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Departures
              </span>
              <span className="text-sm sm:text-base font-bold text-white block mt-0.5">
                Year-Round
              </span>
              <span className="text-[10px] text-gray-300">Private & Custom</span>
            </div>
          </div>
        </main>

        {/* Cover Footer */}
        <footer className="relative z-20 pb-8 px-10 flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-md shadow-xs flex-shrink-0">
              <QRCodeSVG value={tourUrl} size={36} level="M" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 font-bold block leading-none mb-0.5">
                Scan for Live Tour Dossier
              </span>
              <span className="font-medium text-gray-300 tracking-wide text-[10px] block">
                www.allbounds.com • Inquiries: info@allbounds.com
              </span>
            </div>
          </div>
          <span className="text-amber-300/80 font-serif italic text-xs">
            Bespoke African Journeys
          </span>
        </footer>
      </div>

      {/* ========================================================================= */}
      {/* PAGE 2: TOUR OVERVIEW, TRIP MATRIX & HIGHLIGHTS                           */}
      {/* ========================================================================= */}
      <div
        className="brochure-page relative flex flex-col justify-between p-8 bg-white"
        style={{ width: '794px', height: '1123px', maxHeight: '1123px', pageBreakAfter: 'always' }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-teal/20">
          <div className="flex items-center gap-2 text-teal">
            <Compass className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider font-playfair">AllBounds Expeditions</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            Tour Overview & Facts • Page 02
          </span>
        </div>

        {/* Main Body - Space Optimized */}
        <div className="space-y-4 pt-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal block mb-0.5">
              Executive Itinerary Overview
            </span>
            <h2 className="text-xl font-bold font-playfair text-gray-900 mb-2">
              About This Extraordinary Journey
            </h2>
            <div
              className="text-xs text-gray-600 leading-relaxed space-y-1.5 text-justify"
              dangerouslySetInnerHTML={{
                __html: packageData.description || packageData.summary || 'An immersive adventure crafted for discerning travelers seeking unforgettable memories.',
              }}
            />
          </div>

          {/* Quick Tour Matrix (6-cell grid) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal" />
              <span>Trip Facts At A Glance</span>
            </h3>
            <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-200/80 rounded-xl p-3 text-xs">
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Destination</span>
                <span className="font-bold text-gray-900 mt-0.5 block truncate">{packageData.country?.name || 'Africa'}</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Duration</span>
                <span className="font-bold text-gray-900 mt-0.5 block">{packageData.duration_days} Days / {Math.max(1, packageData.duration_days - 1)} Nights</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Group Type</span>
                <span className="font-bold text-gray-900 mt-0.5 block truncate">Private Tailored Tour</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Physical Rating</span>
                <span className="font-bold text-gray-900 mt-0.5 block">Moderate (All Ages)</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Best Travel Season</span>
                <span className="font-bold text-gray-900 mt-0.5 block">Year-Round Availability</span>
              </div>
              <div className="p-2 bg-white rounded-lg border border-gray-150">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Transport Vehicle</span>
                <span className="font-bold text-gray-900 mt-0.5 block truncate">4x4 Safari Land Cruiser</span>
              </div>
            </div>
          </div>

          {/* Key Expedition Highlights */}
          {packageData.attractions && packageData.attractions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Featured Attractions & Landmarks</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {packageData.attractions.slice(0, 6).map((attr, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-teal-50/50 rounded-lg border border-teal-100/70">
                    <span className="w-4 h-4 rounded-full bg-teal text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-gray-900 block truncate">{attr.name}</span>
                      {attr.city && <span className="text-[9px] text-gray-500 truncate block">{attr.city}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured Image Banner */}
          {packageData.media_assets && packageData.media_assets.length > 0 && (
            <div className="rounded-xl overflow-hidden h-32 border border-gray-200 shadow-xs relative">
              <img
                src={getImageUrlWithFallback(packageData.media_assets[0].image_id, IMAGE_VARIANTS.MEDIUM)}
                alt="Safari Landmark"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-2 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">
                Experience authentic wilderness encounters
              </div>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200 text-[10px] text-gray-400">
          <span>AllBounds Travel Ltd • Tour Dossier: {packageData.name}</span>
          <span>Page 02</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAGES 3+: DAY-BY-DAY ITINERARY PAGES                                     */}
      {/* ========================================================================= */}
      {itineraryPages.map((pageDays, pageIndex) => (
        <div
          key={pageIndex}
          className="brochure-page relative flex flex-col justify-between p-8 bg-white"
          style={{ width: '794px', height: '1123px', maxHeight: '1123px', pageBreakAfter: 'always' }}
        >
          {/* Page Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-teal/20">
            <div className="flex items-center gap-2 text-teal">
              <Compass className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider font-playfair">{packageData.name}</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              Daily Itinerary • Page {String(pageIndex + 3).padStart(2, '0')}
            </span>
          </div>

          {/* Day-by-Day Timeline Items - Space Optimized & No Cutoffs */}
          <div className="space-y-3 pt-2">
            {pageDays.map((item, dIdx) => {
              const dayNumber = item.day_number || (dIdx + 1);
              const cleanTitle = sanitizeDayTitle(item.title, dayNumber);
              const mealText =
                item.custom_activities && item.custom_activities.some((a) => a.is_meal)
                  ? item.custom_activities.filter((a) => a.is_meal).map((a) => a.meal_type || a.activity_title).join(', ')
                  : 'Breakfast, Lunch & Dinner';
              const stayText =
                item.hotels && item.hotels.length > 0
                  ? item.hotels.map((h) => h.name).join(', ')
                  : item.accommodation_notes || 'Luxury Safari Lodge';

              return (
                <div
                  key={item.id || dIdx}
                  className="bg-gray-50/90 border border-gray-200/90 border-l-4 border-l-teal rounded-xl p-3.5 relative shadow-2xs"
                >
                  {/* Day Header Badge & Clean Title */}
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-200/70">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-teal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md tracking-wider shadow-2xs flex-shrink-0">
                        DAY {dayNumber}
                      </span>
                      <h3 className="text-sm font-bold font-playfair text-gray-900 leading-snug">
                        {cleanTitle}
                      </h3>
                    </div>
                  </div>

                  {/* Day Narrative Description */}
                  <div
                    className="text-[11px] text-gray-600 leading-relaxed mb-2.5 text-justify"
                    dangerouslySetInnerHTML={{
                      __html: item.description || 'Enjoy a full day of guided excursions and wilderness discovery.',
                    }}
                  />

                  {/* Day Inclusions & Details Badges - Unclipped & Roomy */}
                  <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-gray-200/60">
                    {/* Meals */}
                    <div className="flex items-center gap-2 text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-150 shadow-2xs min-h-[32px]">
                      <Utensils className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span className="text-[10px] font-semibold truncate leading-tight">
                        Meals: {mealText}
                      </span>
                    </div>

                    {/* Accommodation */}
                    <div className="flex items-center gap-2 text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-gray-150 shadow-2xs min-h-[32px]">
                      <HotelIcon className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                      <span className="text-[10px] font-semibold truncate leading-tight">
                        Stay: {stayText}
                      </span>
                    </div>
                  </div>

                  {/* Activities included on this day */}
                  {((item.custom_activities && item.custom_activities.some((a) => !a.is_meal)) ||
                    (item.linked_activities && item.linked_activities.length > 0)) && (
                    <div className="mt-2 flex flex-wrap gap-1 items-center">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mr-1">
                        Activities:
                      </span>
                      {item.custom_activities
                        ?.filter((a) => !a.is_meal)
                        .map((act, aIdx) => (
                          <span
                            key={`custom-${aIdx}`}
                            className="text-[9px] bg-teal-50 text-teal-800 border border-teal-200/70 px-1.5 py-0.5 rounded-md font-medium"
                          >
                            ✓ {act.activity_title}
                          </span>
                        ))}
                      {item.linked_activities?.map((act, aIdx) => (
                        <span
                          key={`linked-${aIdx}`}
                          className="text-[9px] bg-teal-50 text-teal-800 border border-teal-200/70 px-1.5 py-0.5 rounded-md font-medium"
                        >
                          ✓ {act.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Page Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200 text-[10px] text-gray-400">
            <span>AllBounds Travel Ltd • Detailed Daily Itinerary</span>
            <span>Page {String(pageIndex + 3).padStart(2, '0')}</span>
          </div>
        </div>
      ))}

      {/* ========================================================================= */}
      {/* PAGE: ACCOMMODATIONS & INCLUSIONS / EXCLUSIONS                            */}
      {/* ========================================================================= */}
      <div
        className="brochure-page relative flex flex-col justify-between p-8 bg-white"
        style={{
          width: '794px',
          height: '1123px',
          maxHeight: '1123px',
          pageBreakAfter: 'always',
        }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-teal/20">
          <div className="flex items-center gap-2 text-teal">
            <Compass className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-wider font-playfair">Lodging & Terms</span>
          </div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            Accommodations & Inclusions
          </span>
        </div>

        {/* Main Body - Space Optimized */}
        <div className="space-y-4 pt-2">
          {/* Featured Accommodations */}
          {packageData.hotels && packageData.hotels.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal block mb-0.5">
                Handpicked Lodges & Resorts
              </span>
              <h2 className="text-lg font-bold font-playfair text-gray-900 mb-2">
                Where You Will Stay
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                {packageData.hotels.slice(0, 4).map((hotel, hIdx) => (
                  <div key={hIdx} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex gap-2.5 items-center">
                    {hotel.image_url || hotel.image_id ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                        <img
                          src={hotel.image_url || getImageUrlWithFallback(hotel.image_id, IMAGE_VARIANTS.THUMBNAIL)}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-teal/10 flex items-center justify-center flex-shrink-0">
                        <HotelIcon className="w-5 h-5 text-teal" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-0.5 text-amber-500 mb-0.5">
                        {[...Array(hotel.stars || 4)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 truncate">{hotel.name}</h4>
                      <p className="text-[9px] text-gray-500 truncate">{hotel.city || packageData.country?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions vs Exclusions Two-Column Comparison */}
          <div>
            <h2 className="text-lg font-bold font-playfair text-gray-900 mb-2">
              What Is Included In Your Package
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Inclusions */}
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Package Inclusions</span>
                </h3>
                <ul className="space-y-1.5">
                  {(packageData.inclusion_items && packageData.inclusion_items.length > 0
                    ? packageData.inclusion_items.map((inc) => inc.name)
                    : [
                        'All national park & conservation reserve fees',
                        'Private 4x4 safari vehicle with popup viewing roof',
                        'Expert English-speaking certified safari guide',
                        'Full-board accommodation as listed in itinerary',
                        'All airport & airstrip arrival/departure transfers',
                        'Complimentary bottled mineral water during game drives',
                        'Emergency medical evacuation insurance cover',
                      ]
                  ).map((text, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-gray-700 text-[10px] leading-tight">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exclusions */}
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Package Exclusions</span>
                </h3>
                <ul className="space-y-1.5">
                  {(packageData.exclusion_items && packageData.exclusion_items.length > 0
                    ? packageData.exclusion_items.map((exc) => exc.name)
                    : [
                        'International flights & applicable airport taxes',
                        'Entry visa fees for destination countries',
                        'Personal travel & comprehensive health insurance',
                        'Premium alcoholic beverages & champagne',
                        'Gratuities & tips for driver-guides and camp staff',
                        'Optional activities (e.g. Hot Air Balloon Safaris)',
                        'Laundry and personal spending items',
                      ]
                  ).map((text, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-gray-700 text-[10px] leading-tight">
                      <span className="text-rose-500 font-bold">✕</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-200 text-[10px] text-gray-400">
          <span>AllBounds Travel Ltd • Accommodations & Terms</span>
          <span>Official Brochure</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FINAL PAGE: SEASONAL RATES & BOOKING DOSSIER (BACK COVER)                */}
      {/* ========================================================================= */}
      <div
        className="brochure-page relative flex flex-col justify-between p-8 bg-gray-900 text-white"
        style={{ width: '794px', height: '1123px', maxHeight: '1123px', pageBreakAfter: 'avoid' }}
      >
        {/* Page Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold uppercase tracking-wider font-playfair text-white">AllBounds Expeditions</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-300/80 uppercase tracking-widest">
            Pricing & Booking Dossier
          </span>
        </div>

        {/* Main Body - Space Optimized */}
        <div className="space-y-4 pt-2">
          {/* Seasonal Pricing Schedule */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
              Guaranteed Departures & Rates
            </span>
            <h2 className="text-xl font-bold font-playfair text-white mb-2">
              Seasonal Pricing Schedule
            </h2>

            {activeCharts.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-white/20 bg-gray-950/60 shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-teal/80 text-white uppercase text-[9px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-2 px-3 font-bold">Season / Travel Window</th>
                      <th className="py-2 px-3 font-bold">Dates</th>
                      <th className="py-2 px-3 font-bold text-right">Price (Per Person)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-gray-200">
                    {activeCharts.map((chart, cIdx) => (
                      <tr key={cIdx} className="hover:bg-white/5 transition-colors">
                        <td className="py-2 px-3 font-bold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-[11px]">{chart.title}</span>
                        </td>
                        <td className="py-2 px-3 text-gray-300 text-[11px]">
                          {chart.start_date && chart.end_date
                            ? `${chart.start_date} – ${chart.end_date}`
                            : 'Year-Round'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-amber-300 text-xs">
                          ${(chart.price || packageData.price || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <p className="text-xs text-gray-300">
                  Standard Starting Rate: <strong className="text-amber-400 text-sm">${(packageData.price || 0).toLocaleString()} USD</strong> per person sharing. Custom quotes tailored upon request.
                </p>
              </div>
            )}
          </div>

          {/* How to Book in 3 Steps */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Easy 3-Step Booking & Customization</span>
            </h3>
            <div className="grid grid-cols-3 gap-2.5 text-xs text-gray-300">
              <div className="p-2 bg-gray-950/50 rounded-lg border border-white/10">
                <span className="text-amber-400 font-bold text-xs block mb-0.5">01. Request Quote</span>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Contact our safari specialists with your preferred travel dates and party size.
                </p>
              </div>
              <div className="p-2 bg-gray-950/50 rounded-lg border border-white/10">
                <span className="text-amber-400 font-bold text-xs block mb-0.5">02. Tailor Itinerary</span>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Customize lodges, flights, and activities to match your personal travel vision.
                </p>
              </div>
              <div className="p-2 bg-gray-950/50 rounded-lg border border-white/10">
                <span className="text-amber-400 font-bold text-xs block mb-0.5">03. Secure & Embark</span>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Confirm your reservation with flexible payment terms and 24/7 in-country support.
                </p>
              </div>
            </div>
          </div>

          {/* Instant QR Code Direct Link Card */}
          <div className="flex items-center justify-between gap-4 bg-gray-950/80 p-3 rounded-xl border border-amber-400/30 shadow-lg">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  Instant Online Tour Access
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">
                Scan To View Real-Time Dates & Book Online
              </h4>
              <p className="text-[9px] text-gray-400 truncate font-mono">
                {tourUrl}
              </p>
            </div>
            <div className="bg-white p-1.5 rounded-lg shadow-sm flex-shrink-0">
              <QRCodeSVG value={tourUrl} size={54} level="M" fgColor="#042f2e" />
            </div>
          </div>

          {/* Official Contact Box */}
          <div className="bg-gradient-to-r from-teal/90 to-teal-950/90 border border-amber-400/40 rounded-xl p-4 shadow-xl">
            <h3 className="text-xs font-bold font-playfair text-white mb-1 text-shadow-sm">
              Speak With An AllBounds Safari Specialist
            </h3>
            <p className="text-[11px] text-gray-200 mb-3 leading-relaxed">
              Have questions or ready to book this itinerary? Our destination experts are available 7 days a week to assist you.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-white text-[11px]">+1 (800) 555-BOUNDS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-white text-[11px]">info@allbounds.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-semibold text-white text-[11px]">www.allbounds.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Cover Footer */}
        <footer className="mt-auto pt-3 border-t border-white/15 flex items-center justify-between text-[10px] text-gray-400">
          <span>© {currentYear} AllBounds Travel & Expeditions Ltd. All rights reserved.</span>
          <span className="text-amber-400/90 font-serif italic">Crafting Unforgettable African Journeys</span>
        </footer>
      </div>
    </div>
  );
};

export default PackageBrochureDocument;
