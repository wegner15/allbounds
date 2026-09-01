import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { PackageDetailResponse, PriceChartDetail } from '../../../lib/types/api';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../../utils/imageUtils';

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  teal: '#0d9488',
  tealLight: '#f0fdfa',
  tealBorder: '#99f6e4',
  tealDark: '#042f2e',
  amber: '#d97706',
  amberLight: '#fef3c7',
  dark: '#111827',
  darkBg: '#0f172a',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  gray200: '#e5e7eb',
  gray100: '#f3f4f6',
  gray50: '#f9fafb',
  white: '#ffffff',
  emeraldBg: '#ecfdf5',
  emeraldBorder: '#a7f3d0',
  emerald: '#059669',
  roseBg: '#fff1f2',
  roseBorder: '#fecdd3',
  rose: '#e11d48',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (s?: string | null) => {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }); }
  catch { return s; }
};

const sanitizeTitle = (title: string, n: number) => {
  if (!title) return `Day ${n} Exploration`;
  return title.replace(/^day\s*\d+\s*[:\-–—]\s*/i, '').trim();
};

const stripHtml = (html: string) =>
  (html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .trim();

const paginateItinerary = (items: any[]): any[][] => {
  const pages: any[][] = [];
  let page: any[] = [];
  let h = 0;
  const MAX = 660;
  items.forEach(item => {
    const len = stripHtml(item.description || '').length;
    const est = 52 + Math.ceil(len / 92) * 13 + 46 + 14; // header+desc+pills+activities+gap
    if (page.length > 0 && h + est > MAX) { pages.push(page); page = [item]; h = est; }
    else { page.push(item); h += est; }
  });
  if (page.length > 0) pages.push(page);
  return pages;
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  /* Cover */
  coverPage:    { backgroundColor: C.dark },
  coverBg:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5 },
  coverBody:    { flex: 1, padding: 38, justifyContent: 'space-between' },
  coverHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandName:    { fontSize: 17, fontFamily: 'Helvetica-Bold', color: C.white, letterSpacing: 2 },
  brandSub:     { fontSize: 7, color: C.amber, letterSpacing: 3, marginTop: 2 },
  badge:        { borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, fontSize: 7, color: '#fef3c7', letterSpacing: 1.5 },
  coverMain:    { flex: 1, justifyContent: 'center', paddingVertical: 28 },
  locBadge:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.teal, alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  locText:      { fontSize: 8, color: C.white, fontFamily: 'Helvetica-Bold' },
  coverTitle:   { fontSize: 28, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.25, marginBottom: 12, maxWidth: 460 },
  coverSummary: { fontSize: 10, color: '#d1d5db', lineHeight: 1.6, marginBottom: 22, maxWidth: 430, fontStyle: 'italic', borderLeftWidth: 2, borderLeftColor: C.amber, paddingLeft: 10 },
  statsRow:     { flexDirection: 'row', backgroundColor: 'rgba(17,24,39,0.88)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', padding: 14 },
  statCell:     { flex: 1, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)', paddingRight: 10, marginRight: 10 },
  statCellLast: { flex: 1 },
  statLabel:    { fontSize: 7, color: C.amber, fontFamily: 'Helvetica-Bold', letterSpacing: 1, marginBottom: 3 },
  statValue:    { fontSize: 12, color: C.white, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  statSub:      { fontSize: 7, color: '#9ca3af' },
  coverFoot:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 14 },
  coverQrBox:   { backgroundColor: C.white, padding: 5, borderRadius: 6 },
  coverQrImg:   { width: 52, height: 52 },
  coverFtLabel: { fontSize: 9, color: C.amber, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  coverFtSub:   { fontSize: 7, color: '#9ca3af', marginBottom: 1 },
  coverTagline: { fontSize: 9, color: C.amber, fontStyle: 'italic' },

  /* Page chrome */
  page:        { backgroundColor: C.white },
  darkPage:    { backgroundColor: C.darkBg },
  pageHead:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 36, paddingTop: 26, paddingBottom: 10, borderBottomWidth: 1.5, borderBottomColor: '#ccfbf1', marginBottom: 14 },
  darkPageHead:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 36, paddingTop: 26, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 14 },
  phLeft:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phDot:       { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.teal },
  phDotAmber:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.amber },
  phTitle:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 1.5 },
  phTitleW:    { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.white, letterSpacing: 1.5 },
  phRight:     { fontSize: 7, color: C.gray400, letterSpacing: 1 },
  phRightA:    { fontSize: 7, color: C.amber, letterSpacing: 1, opacity: 0.85 },
  pageFoot:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 36, paddingBottom: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.gray200, marginTop: 'auto' },
  darkPageFoot:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 36, paddingBottom: 20, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginTop: 'auto' },
  pfText:      { fontSize: 7, color: C.gray400 },
  pfTextA:     { fontSize: 7, color: C.amber, fontStyle: 'italic' },
  body:        { paddingHorizontal: 36, flex: 1 },

  /* Typography */
  secLabel:    { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.teal, letterSpacing: 2, marginBottom: 2 },
  secLabelA:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.amber, letterSpacing: 2, marginBottom: 2 },
  secTitle:    { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.dark, marginBottom: 8 },
  secTitleW:   { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 10 },
  bodyText:    { fontSize: 8.5, color: C.gray600, lineHeight: 1.6, textAlign: 'justify' },

  /* Trip facts */
  factsBox:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray200, borderRadius: 8, padding: 10 },
  factCell:   { width: '31%', backgroundColor: C.white, borderWidth: 1, borderColor: C.gray200, borderRadius: 6, padding: 8 },
  factLabel:  { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, letterSpacing: 0.8, marginBottom: 2 },
  factValue:  { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: C.dark, lineHeight: 1.3 },

  /* Attractions */
  attrGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  attrCard: { width: '47.5%', flexDirection: 'row', alignItems: 'flex-start', gap: 6, padding: 7, backgroundColor: C.tealLight, borderWidth: 1, borderColor: C.tealBorder, borderRadius: 6 },
  attrNum:  { width: 14, height: 14, borderRadius: 7, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' },
  attrNumT: { fontSize: 7, color: C.white, fontFamily: 'Helvetica-Bold' },
  attrName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.dark, lineHeight: 1.3, flex: 1 },
  attrCity: { fontSize: 7, color: C.gray500 },

  /* ── Day cards ───────────────────────────────────────────────────────── */
  dayCard:   { backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray200, borderLeftWidth: 3, borderLeftColor: C.teal, borderRadius: 8, padding: 11, marginBottom: 8 },
  dayHead:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  dayBadge:  { backgroundColor: C.teal, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3 },
  dayBadgeT: { fontSize: 8, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  dayTitle:  { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.dark, flex: 1, lineHeight: 1.3 },
  dayDesc:   { fontSize: 8.5, color: C.gray600, lineHeight: 1.6, marginBottom: 8, textAlign: 'justify' },
  pillsRow:  { flexDirection: 'row', gap: 8, marginBottom: 6 },
  pill:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.white, borderWidth: 1, borderColor: C.gray200, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  pillDot:   { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  pillTxt:   { fontSize: 8, color: C.gray700, fontFamily: 'Helvetica-Bold', flex: 1, lineHeight: 1.3 },
  actsRow:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  actsLbl:   { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.gray400, letterSpacing: 0.5 },
  actTag:    { backgroundColor: C.tealLight, borderWidth: 1, borderColor: C.tealBorder, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  actTagT:   { fontSize: 7, color: C.tealDark, fontFamily: 'Helvetica-Bold' },

  /* Hotels */
  hotelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hotelCard: { width: '47.5%', flexDirection: 'row', gap: 8, backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray200, borderRadius: 8, padding: 8, alignItems: 'center' },
  hotelImg:  { width: 44, height: 44, borderRadius: 6, backgroundColor: C.gray200 },
  hotelPH:   { width: 44, height: 44, borderRadius: 6, backgroundColor: C.tealLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.tealBorder },
  hotelPHT:  { fontSize: 16 },
  starRow:   { flexDirection: 'row', gap: 2, marginBottom: 3 },
  star:      { width: 5, height: 5, borderRadius: 1, backgroundColor: C.amber },
  hotelName: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.dark, lineHeight: 1.3, marginBottom: 1 },
  hotelCity: { fontSize: 7, color: C.gray500 },

  /* Inc/Exc */
  ieRow:     { flexDirection: 'row', gap: 10 },
  incBox:    { flex: 1, backgroundColor: C.emeraldBg, borderWidth: 1, borderColor: C.emeraldBorder, borderRadius: 8, padding: 10 },
  excBox:    { flex: 1, backgroundColor: C.roseBg, borderWidth: 1, borderColor: C.roseBorder, borderRadius: 8, padding: 10 },
  ieTitle:   { fontSize: 8, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 6 },
  ieItem:    { flexDirection: 'row', gap: 4, marginBottom: 4, alignItems: 'flex-start' },
  ieMark:    { fontSize: 8, color: C.emerald, fontFamily: 'Helvetica-Bold', lineHeight: 1.4 },
  exMark:    { fontSize: 8, color: C.rose, fontFamily: 'Helvetica-Bold', lineHeight: 1.4 },
  ieText:    { fontSize: 7.5, color: C.gray700, lineHeight: 1.4, flex: 1 },

  /* Pricing */
  priceTable:  { borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, overflow: 'hidden' },
  priceHead:   { flexDirection: 'row', backgroundColor: C.teal, paddingHorizontal: 12, paddingVertical: 7 },
  priceHeadT:  { fontSize: 7, color: C.white, fontFamily: 'Helvetica-Bold', letterSpacing: 0.8 },
  priceRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  priceCellW:  { fontSize: 9, color: C.white, fontFamily: 'Helvetica-Bold' },
  priceCellG:  { fontSize: 9, color: '#d1d5db' },
  priceAmt:    { fontSize: 10, color: C.amber, fontFamily: 'Helvetica-Bold', textAlign: 'right' },

  /* Booking steps */
  bookBox:   { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12 },
  bookTitle: { fontSize: 8, color: C.amber, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 8 },
  bookSteps: { flexDirection: 'row', gap: 8 },
  bookStep:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: 8 },
  bookStepT: { fontSize: 9, color: C.amber, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  bookStepD: { fontSize: 7.5, color: '#9ca3af', lineHeight: 1.4 },

  /* QR block */
  qrBlock:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(0,0,0,0.35)', borderWidth: 1, borderColor: 'rgba(217,119,6,0.4)', borderRadius: 8, padding: 12 },
  qrLargeW:  { backgroundColor: C.white, padding: 6, borderRadius: 8 },
  qrLargeI:  { width: 80, height: 80 },
  qrLabel:   { fontSize: 8, color: C.amber, fontFamily: 'Helvetica-Bold', letterSpacing: 0.5, marginBottom: 4 },
  qrTitle:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  qrUrl:     { fontSize: 7, color: '#9ca3af' },

  /* Contact */
  contactBox:  { backgroundColor: C.teal, borderWidth: 1, borderColor: 'rgba(217,119,6,0.4)', borderRadius: 8, padding: 14 },
  contactT:    { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.white, marginBottom: 4 },
  contactSub:  { fontSize: 8, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginBottom: 10 },
  contactRow:  { flexDirection: 'row', gap: 16 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  contactDot:  { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.amber },
  contactTxt:  { fontSize: 8, color: C.white, fontFamily: 'Helvetica-Bold' },
});

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  packageData: PackageDetailResponse;
  priceCharts?: PriceChartDetail[];
  qrCodeDataUrl?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const PackageBrochurePdf: React.FC<Props> = ({
  packageData,
  priceCharts = [],
  qrCodeDataUrl,
}) => {
  const activeCharts = (priceCharts.length > 0 ? priceCharts : packageData.price_charts || []).filter(
    (c) => c.is_active !== false
  );
  const heroUrl = packageData.image_id
    ? getImageUrlWithFallback(packageData.image_id, IMAGE_VARIANTS.LARGE)
    : undefined;
  const slug = packageData.country?.slug || 'destinations';
  const tourUrl = `https://allboundvacations.com/packages/${slug}/${packageData.slug}`;
  const startingPrice = packageData.price || (activeCharts[0]?.price ?? null);
  const currentYear = new Date().getFullYear();
  const itinPages = paginateItinerary(packageData.itinerary_items || []);

  return (
    <Document
      title={`${packageData.name} - AllBounds Vacations Brochure`}
      author="AllBounds Vacations"
      subject="Luxury Tour Package Brochure"
      keywords="safari, tour, itinerary, allbounds"
    >
      {/* ── PAGE 1: COVER ─────────────────────────────────────────────── */}
      <Page size="A4" style={S.coverPage}>
        {heroUrl && <Image src={heroUrl} style={S.coverBg} />}
        <View style={S.coverBody}>
          {/* Header */}
          <View style={S.coverHead}>
            <View>
              <Text style={S.brandName}>ALLBOUNDS VACATIONS</Text>
              <Text style={S.brandSub}>EXPEDITIONS & SAFARIS</Text>
            </View>
            <Text style={S.badge}>OFFICIAL TOUR DOSSIER</Text>
          </View>

          {/* Hero content */}
          <View style={S.coverMain}>
            <View style={S.locBadge}>
              <Text style={S.locText}>
                {packageData.country?.name || 'Exclusive Destination'}
                {packageData.holiday_types?.[0]?.name ? `  •  ${packageData.holiday_types[0].name}` : ''}
              </Text>
            </View>
            <Text style={S.coverTitle}>{packageData.name}</Text>
            {packageData.summary && (
              <Text style={S.coverSummary}>"{packageData.summary}"</Text>
            )}
            <View style={S.statsRow}>
              <View style={S.statCell}>
                <Text style={S.statLabel}>DURATION</Text>
                <Text style={S.statValue}>{packageData.duration_days} Days</Text>
                <Text style={S.statSub}>{Math.max(1, packageData.duration_days - 1)} Nights</Text>
              </View>
              <View style={S.statCell}>
                <Text style={S.statLabel}>STARTING RATE</Text>
                <Text style={S.statValue}>{startingPrice ? `$${startingPrice.toLocaleString()}` : 'On Request'}</Text>
                <Text style={S.statSub}>Per Person</Text>
              </View>
              <View style={S.statCell}>
                <Text style={S.statLabel}>TRAVEL STYLE</Text>
                <Text style={S.statValue}>{packageData.holiday_types?.[0]?.name || 'Guided Safari'}</Text>
                <Text style={S.statSub}>All-Inclusive</Text>
              </View>
              <View style={S.statCellLast}>
                <Text style={S.statLabel}>DEPARTURES</Text>
                <Text style={S.statValue}>Year-Round</Text>
                <Text style={S.statSub}>Private & Custom</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={S.coverFoot}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {qrCodeDataUrl && (
                <View style={S.coverQrBox}>
                  <Image src={qrCodeDataUrl} style={S.coverQrImg} />
                </View>
              )}
              <View>
                <Text style={S.coverFtLabel}>Scan for Live Tour Dossier</Text>
                <Text style={S.coverFtSub}>www.allboundvacations.com</Text>
                <Text style={S.coverFtSub}>bookings@allboundvacations.com</Text>
              </View>
            </View>
            <Text style={S.coverTagline}>Bespoke African Journeys</Text>
          </View>
        </View>
      </Page>

      {/* ── PAGE 2: OVERVIEW ──────────────────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.pageHead}>
          <View style={S.phLeft}>
            <View style={S.phDot} />
            <Text style={S.phTitle}>ALLBOUNDS VACATIONS</Text>
          </View>
          <Text style={S.phRight}>TOUR OVERVIEW & FACTS  •  PAGE 02</Text>
        </View>
        <View style={[S.body, { gap: 14 }]}>
          {/* Description */}
          <View>
            <Text style={S.secLabel}>EXECUTIVE ITINERARY OVERVIEW</Text>
            <Text style={S.secTitle}>About This Extraordinary Journey</Text>
            <Text style={S.bodyText}>
              {stripHtml(packageData.description || packageData.summary || 'An immersive adventure crafted for discerning travelers seeking unforgettable memories.')}
            </Text>
          </View>

          {/* Trip facts */}
          <View>
            <Text style={[S.secLabel, { marginBottom: 8 }]}>TRIP FACTS AT A GLANCE</Text>
            <View style={S.factsBox}>
              {[
                { label: 'DESTINATION', value: packageData.country?.name || 'Africa' },
                { label: 'DURATION', value: `${packageData.duration_days} Days / ${Math.max(1, packageData.duration_days - 1)} Nights` },
                { label: 'GROUP TYPE', value: 'Private Tailored Tour' },
                { label: 'PHYSICAL RATING', value: 'Moderate (All Ages)' },
                { label: 'BEST SEASON', value: 'Year-Round Availability' },
                { label: 'TRANSPORT', value: '4x4 Safari Land Cruiser' },
              ].map(({ label, value }) => (
                <View key={label} style={S.factCell}>
                  <Text style={S.factLabel}>{label}</Text>
                  <Text style={S.factValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Attractions */}
          {(packageData.attractions?.length ?? 0) > 0 && (
            <View>
              <Text style={[S.secLabel, { marginBottom: 8 }]}>FEATURED ATTRACTIONS & LANDMARKS</Text>
              <View style={S.attrGrid}>
                {packageData.attractions!.slice(0, 6).map((attr, i) => (
                  <View key={i} style={S.attrCard}>
                    <View style={S.attrNum}><Text style={S.attrNumT}>{i + 1}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={S.attrName}>{attr.name}</Text>
                      {attr.city && <Text style={S.attrCity}>{attr.city}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Banner image */}
          {(packageData.media_assets?.length ?? 0) > 0 && (
            <View style={{ height: 90, borderRadius: 8, overflow: 'hidden' }}>
              <Image
                src={getImageUrlWithFallback(packageData.media_assets![0].image_id, IMAGE_VARIANTS.MEDIUM)}
                style={{ width: '100%', height: 90 }}
              />
            </View>
          )}
        </View>
        <View style={S.pageFoot}>
          <Text style={S.pfText}>AllBounds Vacations  •  Tour Dossier: {packageData.name}</Text>
          <Text style={S.pfText}>Page 02</Text>
        </View>
      </Page>

      {/* ── ITINERARY PAGES ───────────────────────────────────────────── */}
      {itinPages.map((days, pi) => (
        <Page key={pi} size="A4" style={S.page}>
          <View style={S.pageHead}>
            <View style={S.phLeft}>
              <View style={S.phDot} />
              <Text style={S.phTitle}>{packageData.name.toUpperCase()}</Text>
            </View>
            <Text style={S.phRight}>DAILY ITINERARY  •  PAGE {String(pi + 3).padStart(2, '0')}</Text>
          </View>
          <View style={[S.body, { gap: 0 }]}>
            {days.map((item, di) => {
              const dayNum = item.day_number || di + 1;
              const title = sanitizeTitle(item.title, dayNum);
              const meals = item.custom_activities?.some((a: any) => a.is_meal)
                ? item.custom_activities!.filter((a: any) => a.is_meal).map((a: any) => a.meal_type || a.activity_title).join(', ')
                : 'Breakfast, Lunch & Dinner';
              const stay = item.hotels?.length > 0
                ? item.hotels.map((h: any) => h.name).join(' • ')
                : item.accommodation_notes || 'Luxury Safari Lodge';
              const acts: string[] = [
                ...(item.custom_activities?.filter((a: any) => !a.is_meal).map((a: any) => a.activity_title) ?? []),
                ...(item.linked_activities?.map((a: any) => a.name) ?? []),
              ];

              return (
                <View key={item.id || di} style={S.dayCard}>
                  {/* Header row */}
                  <View style={S.dayHead}>
                    <View style={S.dayBadge}>
                      <Text style={S.dayBadgeT}>DAY {dayNum}</Text>
                    </View>
                    <Text style={S.dayTitle}>{title}</Text>
                  </View>

                  {/* Description */}
                  <Text style={S.dayDesc}>
                    {stripHtml(item.description || 'Enjoy a full day of guided excursions and wilderness discovery.')}
                  </Text>

                  {/* Meals + Stay pills */}
                  <View style={S.pillsRow}>
                    <View style={S.pill}>
                      <View style={[S.pillDot, { backgroundColor: C.amber }]} />
                      <Text style={S.pillTxt}>{meals}</Text>
                    </View>
                    <View style={S.pill}>
                      <View style={[S.pillDot, { backgroundColor: C.teal }]} />
                      <Text style={S.pillTxt}>{stay}</Text>
                    </View>
                  </View>

                  {/* Activities */}
                  {acts.length > 0 && (
                    <View style={S.actsRow}>
                      <Text style={S.actsLbl}>ACTIVITIES: </Text>
                      {acts.map((name, ai) => (
                        <View key={ai} style={S.actTag}>
                          <Text style={S.actTagT}>✓ {name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={S.pageFoot}>
            <Text style={S.pfText}>AllBounds Vacations  •  Detailed Daily Itinerary</Text>
            <Text style={S.pfText}>Page {String(pi + 3).padStart(2, '0')}</Text>
          </View>
        </Page>
      ))}

      {/* ── ACCOMMODATIONS & INCLUSIONS ───────────────────────────────── */}
      <Page size="A4" style={S.page}>
        <View style={S.pageHead}>
          <View style={S.phLeft}>
            <View style={S.phDot} />
            <Text style={S.phTitle}>LODGING & TERMS</Text>
          </View>
          <Text style={S.phRight}>ACCOMMODATIONS & INCLUSIONS</Text>
        </View>
        <View style={[S.body, { gap: 14 }]}>
          {(packageData.hotels?.length ?? 0) > 0 && (
            <View>
              <Text style={S.secLabel}>HANDPICKED LODGES & RESORTS</Text>
              <Text style={[S.secTitle, { fontSize: 13, marginBottom: 10 }]}>Where You Will Stay</Text>
              <View style={S.hotelGrid}>
                {packageData.hotels!.slice(0, 4).map((hotel, hi) => (
                  <View key={hi} style={S.hotelCard}>
                    {hotel.image_url || hotel.image_id ? (
                      <Image
                        src={hotel.image_url || getImageUrlWithFallback(hotel.image_id, IMAGE_VARIANTS.THUMBNAIL)}
                        style={S.hotelImg}
                      />
                    ) : (
                      <View style={S.hotelPH}>
                        <Text style={S.hotelPHT}>🏨</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <View style={S.starRow}>
                        {[...Array(Math.min(hotel.stars || 4, 5))].map((_, si) => (
                          <View key={si} style={S.star} />
                        ))}
                      </View>
                      <Text style={S.hotelName}>{hotel.name}</Text>
                      <Text style={S.hotelCity}>{hotel.city || packageData.country?.name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View>
            <Text style={[S.secTitle, { fontSize: 13, marginBottom: 10 }]}>What Is Included In Your Package</Text>
            <View style={S.ieRow}>
              {/* Inclusions */}
              <View style={S.incBox}>
                <Text style={[S.ieTitle, { color: C.emerald }]}>Package Inclusions</Text>
                {(packageData.inclusion_items?.length > 0
                  ? packageData.inclusion_items.map((i: any) => i.name)
                  : ['All national park & conservation reserve fees', 'Private 4x4 safari vehicle with popup roof', 'Expert English-speaking certified safari guide', 'Full-board accommodation as listed', 'All airport & airstrip transfers', 'Complimentary water during game drives', 'Emergency medical evacuation insurance']
                ).map((t: string, i: number) => (
                  <View key={i} style={S.ieItem}>
                    <Text style={S.ieMark}>✓</Text>
                    <Text style={S.ieText}>{t}</Text>
                  </View>
                ))}
              </View>
              {/* Exclusions */}
              <View style={S.excBox}>
                <Text style={[S.ieTitle, { color: C.rose }]}>Package Exclusions</Text>
                {(packageData.exclusion_items?.length > 0
                  ? packageData.exclusion_items.map((i: any) => i.name)
                  : ['International flights & airport taxes', 'Entry visa fees for destination countries', 'Personal travel & health insurance', 'Premium alcoholic beverages & champagne', 'Gratuities & tips for guides and staff', 'Optional activities (e.g. Hot Air Balloon)', 'Laundry and personal spending items']
                ).map((t: string, i: number) => (
                  <View key={i} style={S.ieItem}>
                    <Text style={S.exMark}>✕</Text>
                    <Text style={S.ieText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <View style={S.pageFoot}>
          <Text style={S.pfText}>AllBounds Vacations  •  Accommodations & Terms</Text>
          <Text style={S.pfText}>Official Brochure</Text>
        </View>
      </Page>

      {/* ── BACK COVER: PRICING & CONTACT ─────────────────────────────── */}
      <Page size="A4" style={[S.page, S.darkPage]}>
        <View style={S.darkPageHead}>
          <View style={S.phLeft}>
            <View style={S.phDotAmber} />
            <Text style={S.phTitleW}>ALLBOUNDS VACATIONS</Text>
          </View>
          <Text style={S.phRightA}>PRICING & BOOKING DOSSIER</Text>
        </View>
        <View style={[S.body, { gap: 12 }]}>
          {/* Pricing table */}
          <View>
            <Text style={S.secLabelA}>GUARANTEED DEPARTURES & RATES</Text>
            <Text style={S.secTitleW}>Seasonal Pricing Schedule</Text>
            {activeCharts.length > 0 ? (
              <View style={S.priceTable}>
                <View style={S.priceHead}>
                  <Text style={[S.priceHeadT, { flex: 2 }]}>SEASON / TRAVEL WINDOW</Text>
                  <Text style={[S.priceHeadT, { flex: 2 }]}>DATES</Text>
                  <Text style={[S.priceHeadT, { flex: 1, textAlign: 'right' }]}>PRICE (PER PERSON)</Text>
                </View>
                {activeCharts.map((c, ci) => (
                  <View key={ci} style={S.priceRow}>
                    <Text style={[S.priceCellW, { flex: 2 }]}>{c.title}</Text>
                    <Text style={[S.priceCellG, { flex: 2 }]}>
                      {c.start_date && c.end_date ? `${formatDate(c.start_date)} – ${formatDate(c.end_date)}` : 'Year-Round'}
                    </Text>
                    <Text style={[S.priceAmt, { flex: 1 }]}>
                      ${(c.price || packageData.price || 0).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Text style={{ fontSize: 9, color: '#d1d5db', textAlign: 'center' }}>
                  Standard Rate: ${(packageData.price || 0).toLocaleString()} USD per person. Custom quotes available on request.
                </Text>
              </View>
            )}
          </View>

          {/* Booking steps */}
          <View style={S.bookBox}>
            <Text style={S.bookTitle}>EASY 3-STEP BOOKING & CUSTOMIZATION</Text>
            <View style={S.bookSteps}>
              {[
                { n: '01.', t: 'Request Quote', d: 'Contact our specialists with your preferred travel dates and party size.' },
                { n: '02.', t: 'Tailor Itinerary', d: 'Customize lodges, flights & activities to match your personal vision.' },
                { n: '03.', t: 'Secure & Embark', d: 'Confirm with flexible payment terms and 24/7 in-country support.' },
              ].map(({ n, t, d }) => (
                <View key={n} style={S.bookStep}>
                  <Text style={S.bookStepT}>{n} {t}</Text>
                  <Text style={S.bookStepD}>{d}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* QR code */}
          <View style={S.qrBlock}>
            {qrCodeDataUrl && (
              <View style={S.qrLargeW}>
                <Image src={qrCodeDataUrl} style={S.qrLargeI} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={S.qrLabel}>INSTANT ONLINE TOUR ACCESS</Text>
              <Text style={S.qrTitle}>Scan To View Real-Time Dates & Book Online</Text>
              <Text style={S.qrUrl}>{tourUrl}</Text>
            </View>
          </View>

          {/* Contact */}
          <View style={S.contactBox}>
            <Text style={S.contactT}>Speak With An AllBounds Safari Specialist</Text>
            <Text style={S.contactSub}>
              Have questions or ready to book? Our destination experts are available 7 days a week to assist you.
            </Text>
            <View style={S.contactRow}>
              {['+256 782 594 008', 'bookings@allboundvacations.com', 'www.allboundvacations.com'].map((label) => (
                <View key={label} style={S.contactItem}>
                  <View style={S.contactDot} />
                  <Text style={S.contactTxt}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={S.darkPageFoot}>
          <Text style={S.pfText}>© {currentYear} AllBounds Vacations. All rights reserved.</Text>
          <Text style={S.pfTextA}>Crafting Unforgettable African Journeys</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PackageBrochurePdf;
