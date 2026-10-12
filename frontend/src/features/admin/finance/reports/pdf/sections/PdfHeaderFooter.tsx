import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import type { CompanyFinanceSettings } from '../../../../../../lib/types/finance';

interface PdfHeaderProps {
  title: string;
  subtitle?: string;
  settings?: CompanyFinanceSettings | null;
  periodText?: string;
  asOfText?: string;
  granularityText?: string;
  generatedBy?: string;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
  title,
  subtitle = 'INTERNAL MANAGEMENT REPORT',
  settings,
  periodText,
  asOfText,
  granularityText,
  generatedBy = 'Finance Department',
}) => {
  const legalName = settings?.legal_company_name || 'ALLBOUND TRAVEL SERVICES LIMITED';
  const companyName = settings?.company_name || 'Allbound Vacations';
  const tagline = settings?.tagline || 'Your Dream Holiday. Designed. Booked. Perfected.';
  const address = settings?.physical_address || 'Plot 335, Block 13 Najjanankumbi, Entebbe Road, Kampala Uganda';
  const phone = settings?.phone || '+256 782 594 008';
  const email = settings?.email || 'bookings@allboundvacations.com';
  const tin = settings?.tin_number || '1054173942';

  const logoUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/logo/brand_mark.png`
      : '/logo/brand_mark.png';

  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={pdfStyles.headerContainer} fixed>
      {/* Brand & Legal Info */}
      <View style={pdfStyles.headerLeft}>
        <View style={headerBrandStyles.brandRow}>
          <Image src={logoUrl} style={headerBrandStyles.logoImage} />
          <View style={{ marginLeft: 8 }}>
            <Text style={pdfStyles.legalName}>{legalName}</Text>
            <Text style={pdfStyles.tradingName}>Trading as: {companyName}</Text>
          </View>
        </View>

        <Text style={pdfStyles.tagline}>{tagline.replace(/^["']|["']$/g, '')}</Text>

        <Text style={pdfStyles.companyMeta}>
          {address} • Tel: {phone} • Email: {email} • TIN: {tin}
        </Text>
      </View>

      {/* Report Info */}
      <View style={pdfStyles.headerRight}>
        <View style={pdfStyles.confidentialBadge}>
          <Text style={pdfStyles.confidentialText}>INTERNAL & CONFIDENTIAL</Text>
        </View>

        <Text style={pdfStyles.reportTitle}>{title}</Text>
        <Text style={pdfStyles.reportSubtitle}>{subtitle}</Text>

        <View style={pdfStyles.paramPill}>
          {periodText && (
            <Text style={pdfStyles.paramPillText}>
              Period: <Text style={pdfStyles.paramPillBold}>{periodText}</Text>
            </Text>
          )}
          {asOfText && (
            <Text style={pdfStyles.paramPillText}>
              As of: <Text style={pdfStyles.paramPillBold}>{asOfText}</Text>
            </Text>
          )}
          {granularityText && (
            <Text style={[pdfStyles.paramPillText, { marginTop: 1 }]}>
              Granularity: <Text style={pdfStyles.paramPillBold}>{granularityText}</Text>
            </Text>
          )}
          <Text style={[pdfStyles.paramPillText, { marginTop: 1, fontSize: 6, color: C.gray500 }]}>
            Prepared: {todayStr} • By: {generatedBy}
          </Text>
        </View>
      </View>
    </View>
  );
};

const headerBrandStyles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  logoImage: {
    width: 26,
    height: 26,
    objectFit: 'contain',
  },
});

export const PdfRunningFooter: React.FC = () => {
  return (
    <View style={pdfStyles.footerContainer} fixed>
      <Text style={pdfStyles.footerLeft}>
        Allbound Travel Services Limited • Financial Systems
      </Text>
      <Text style={pdfStyles.footerCenter}>
        STRICTLY CONFIDENTIAL • FOR DIRECTORS & MANAGEMENT USE ONLY
      </Text>
      <Text
        style={pdfStyles.footerRight}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
};
