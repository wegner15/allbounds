import { StyleSheet } from '@react-pdf/renderer';

export const C = {
  primary: '#0d544c',       // Allbound deep emerald/teal
  primaryDark: '#08332e',
  primaryLight: '#f0fdfa',
  primaryBorder: '#99f6e4',
  accent: '#c59b27',        // Safari gold
  accentLight: '#fef3c7',
  accentDark: '#92400e',
  dark: '#0f172a',          // Slate 900
  gray800: '#1e293b',
  gray700: '#334155',
  gray600: '#475569',
  gray500: '#64748b',
  gray400: '#94a3b8',
  gray300: '#cbd5e1',
  gray200: '#e2e8f0',
  gray100: '#f1f5f9',
  gray50: '#f8fafc',
  white: '#ffffff',
  emerald: '#059669',
  emeraldLight: '#ecfdf5',
  emeraldBorder: '#a7f3d0',
  rose: '#e11d48',
  roseLight: '#fff1f2',
  roseBorder: '#fecdd3',
  amber: '#d97706',
  amberDark: '#b45309',
  amberLight: '#fffbeb',
  amberBorder: '#fde68a',
  blue: '#2563eb',
  blueLight: '#eff6ff',
};

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 42,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: C.gray800,
    backgroundColor: C.white,
  },
  pageLandscape: {
    paddingTop: 32,
    paddingBottom: 38,
    paddingHorizontal: 32,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: C.gray800,
    backgroundColor: C.white,
  },

  // Document Header
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: C.primary,
    paddingBottom: 14,
    marginBottom: 14,
  },
  headerLeft: {
    width: '58%',
  },
  logoContainer: {
    marginBottom: 6,
  },
  logo: {
    height: 38,
    width: 140,
    objectFit: 'contain',
  },
  legalName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tradingName: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Oblique',
    color: C.accentDark,
    marginTop: 1,
  },
  tagline: {
    fontSize: 7,
    fontFamily: 'Helvetica-Oblique',
    color: C.accent,
    marginTop: 2,
  },
  companyMeta: {
    fontSize: 6.5,
    color: C.gray500,
    marginTop: 4,
    lineHeight: 1.3,
  },
  headerRight: {
    width: '40%',
    alignItems: 'flex-end',
  },
  confidentialBadge: {
    backgroundColor: C.primaryLight,
    borderWidth: 0.75,
    borderColor: C.primaryBorder,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 5,
  },
  confidentialText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.primaryDark,
    letterSpacing: 0.6,
  },
  reportTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    textAlign: 'right',
    marginBottom: 3,
  },
  reportSubtitle: {
    fontSize: 7.5,
    color: C.gray500,
    textAlign: 'right',
    marginBottom: 6,
  },
  paramPill: {
    backgroundColor: C.gray100,
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: C.gray200,
  },
  paramPillText: {
    fontSize: 7,
    color: C.gray700,
    textAlign: 'right',
  },
  paramPillBold: {
    fontFamily: 'Helvetica-Bold',
    color: C.primaryDark,
  },

  // Running Footer
  footerContainer: {
    position: 'absolute',
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: C.gray300,
    paddingTop: 6,
  },
  footerLeft: {
    fontSize: 6.5,
    color: C.gray400,
    fontFamily: 'Helvetica',
  },
  footerCenter: {
    fontSize: 6.5,
    color: C.gray500,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.4,
  },
  footerRight: {
    fontSize: 6.5,
    color: C.gray500,
    fontFamily: 'Helvetica',
  },

  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: C.gray200,
    paddingBottom: 3,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: C.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 7,
    color: C.gray500,
  },

  // KPI Tiles Strip
  kpiRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.gray50,
    borderWidth: 0.75,
    borderColor: C.gray200,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    borderRadius: 4,
    padding: 7,
  },
  kpiLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 12.5,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
    marginBottom: 2,
  },
  kpiSubtext: {
    fontSize: 6.5,
    color: C.gray500,
  },

  // Tables
  table: {
    width: '100%',
    borderWidth: 0.75,
    borderColor: C.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: C.primaryBorder,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableHeaderCell: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: C.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.gray200,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    backgroundColor: C.white,
  },
  tableRowEven: {
    backgroundColor: C.gray50,
  },
  tableCell: {
    fontSize: 7,
    color: C.gray700,
  },
  tableCellBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.dark,
  },
  tableCellNum: {
    fontSize: 7,
    textAlign: 'right',
  },
  tableFooterRow: {
    flexDirection: 'row',
    backgroundColor: C.primaryLight,
    borderTopWidth: 1,
    borderTopColor: C.primaryBorder,
    paddingVertical: 5,
    paddingHorizontal: 6,
  },

  // Pills / Badges
  pillEmerald: {
    backgroundColor: C.emeraldLight,
    borderWidth: 0.5,
    borderColor: C.emeraldBorder,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pillEmeraldText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.emerald,
  },
  pillRose: {
    backgroundColor: C.roseLight,
    borderWidth: 0.5,
    borderColor: C.roseBorder,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pillRoseText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.rose,
  },
  pillAmber: {
    backgroundColor: C.amberLight,
    borderWidth: 0.5,
    borderColor: C.amberBorder,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pillAmberText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: C.amberDark,
  },
});
