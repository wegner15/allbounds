import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import { pdfStyles } from './pdfStyles';
import { PdfHeader, PdfRunningFooter } from './sections/PdfHeaderFooter';
import { PdfExecutiveSection } from './sections/PdfExecutiveSection';
import { PdfSalesSection } from './sections/PdfSalesSection';
import { PdfProfitabilitySection } from './sections/PdfProfitabilitySection';
import { PdfAgingSection } from './sections/PdfAgingSection';
import { PdfCashFlowSection } from './sections/PdfCashFlowSection';
import type {
  CompanyFinanceSettings,
  SalesReport,
  ReceivablesAgingReport,
  PayablesAgingReport,
  ProfitabilityReport,
  CashFlowReport,
  ExecutiveSummaryReport,
} from '../../../../../lib/types/finance';

export type ReportTabKey =
  | 'executive'
  | 'sales'
  | 'profitability'
  | 'receivables'
  | 'payables'
  | 'cash_flow';

export interface ReportPdfDocumentProps {
  reportType: ReportTabKey;
  data:
    | ExecutiveSummaryReport
    | SalesReport
    | ReceivablesAgingReport
    | PayablesAgingReport
    | ProfitabilityReport
    | CashFlowReport;
  settings?: CompanyFinanceSettings | null;
  periodText?: string;
  asOfText?: string;
  granularityText?: string;
  generatedBy?: string;
}

export const ReportPdfDocument: React.FC<ReportPdfDocumentProps> = ({
  reportType,
  data,
  settings,
  periodText,
  asOfText,
  granularityText,
  generatedBy,
}) => {
  // Profitability report benefits from Landscape orientation for wide financial tables
  const isLandscape = reportType === 'profitability';

  const getReportTitle = (): string => {
    switch (reportType) {
      case 'executive':
        return 'Executive Financial Statement';
      case 'sales':
        return 'Sales & Revenue Performance';
      case 'profitability':
        return 'Booking & Trip Profitability Analysis';
      case 'receivables':
        return 'Accounts Receivable (Aged Debtors)';
      case 'payables':
        return 'Accounts Payable (Aged Creditors)';
      case 'cash_flow':
        return 'Statement of Cash Flows';
      default:
        return 'Financial Management Report';
    }
  };

  const getReportSubtitle = (): string => {
    switch (reportType) {
      case 'executive':
        return 'Comprehensive Board & Management Briefing';
      case 'sales':
        return 'Invoiced Sales, Collections, and Sales Pipeline';
      case 'profitability':
        return 'Client Revenue vs Direct Vendor Cost & Gross Margin';
      case 'receivables':
        return 'Debtor Aging Matrix & Outstanding Invoice Balances';
      case 'payables':
        return 'Vendor Payables Matrix & Due Liabilities';
      case 'cash_flow':
        return 'Disbursements & Inflows Timeline';
      default:
        return 'Official Company Records';
    }
  };

  return (
    <Document
      title={`${getReportTitle()} - Allbound Vacations`}
      author="Allbound Travel Services Limited"
      subject="Financial Performance Report"
      creator="Allbound Finance Platform"
    >
      <Page
        size="A4"
        orientation={isLandscape ? 'landscape' : 'portrait'}
        style={isLandscape ? pdfStyles.pageLandscape : pdfStyles.page}
      >
        {/* Repeating Header */}
        <PdfHeader
          title={getReportTitle()}
          subtitle={getReportSubtitle()}
          settings={settings}
          periodText={periodText}
          asOfText={asOfText}
          granularityText={granularityText}
          generatedBy={generatedBy}
        />

        {/* Section Content based on Report Tab */}
        {reportType === 'executive' && (
          <PdfExecutiveSection data={data as ExecutiveSummaryReport} />
        )}

        {reportType === 'sales' && (
          <PdfSalesSection data={data as SalesReport} />
        )}

        {reportType === 'profitability' && (
          <PdfProfitabilitySection data={data as ProfitabilityReport} />
        )}

        {reportType === 'receivables' && (
          <PdfAgingSection type="receivables" data={data as ReceivablesAgingReport} />
        )}

        {reportType === 'payables' && (
          <PdfAgingSection type="payables" data={data as PayablesAgingReport} />
        )}

        {reportType === 'cash_flow' && (
          <PdfCashFlowSection data={data as CashFlowReport} />
        )}

        {/* Repeating Running Footer with Page Numbers */}
        <PdfRunningFooter />
      </Page>
    </Document>
  );
};
