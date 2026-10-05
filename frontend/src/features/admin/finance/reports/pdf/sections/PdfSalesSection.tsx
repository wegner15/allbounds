import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import { PdfKpiStrip } from './PdfKpiStrip';
import { formatUsd, formatPercent } from '../../utils/formatters';
import type { SalesReport } from '../../../../../../lib/types/finance';

interface PdfSalesSectionProps {
  data: SalesReport;
}

export const PdfSalesSection: React.FC<PdfSalesSectionProps> = ({ data }) => {
  return (
    <View>
      {/* Sales KPI Strip */}
      <PdfKpiStrip
        items={[
          {
            label: 'Total Invoiced',
            value: formatUsd(data.total_invoiced_usd),
            subtext: `${data.invoices_count} invoices`,
            variant: 'primary',
          },
          {
            label: 'Total Collected',
            value: formatUsd(data.total_collected_usd),
            subtext: `${formatPercent(data.collection_rate_percent)} collection rate`,
            variant: 'emerald',
          },
          {
            label: 'Outstanding AR',
            value: formatUsd(data.total_outstanding_usd),
            subtext: 'Pending collections',
            variant: data.total_outstanding_usd > 0 ? 'amber' : 'primary',
          },
          {
            label: 'Avg Booking Value',
            value: formatUsd(data.average_order_value_usd),
            subtext: 'Per invoice',
            variant: 'blue',
          },
        ]}
      />

      {/* Periodic Breakdown Table */}
      <View style={pdfStyles.sectionHeader}>
        <Text style={pdfStyles.sectionTitle}>Period Revenue Breakdown</Text>
        <Text style={pdfStyles.sectionSubtitle}>
          {data.period_breakdown.length} reporting periods
        </Text>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '22%' }]}>Period</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>Invoices</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>Gross Sales</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>Net Revenue</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>Collected</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>Outstanding</Text>
        </View>

        {data.period_breakdown.map((row, idx) => (
          <View
            key={idx}
            style={[
              pdfStyles.tableRow,
              idx % 2 === 1 ? pdfStyles.tableRowEven : {},
            ]}
          >
            <Text style={[pdfStyles.tableCellBold, { width: '22%' }]}>
              {row.period_label || row.period}
            </Text>
            <Text style={[pdfStyles.tableCell, { width: '10%', textAlign: 'center' }]}>
              {row.invoices_count}
            </Text>
            <Text style={[pdfStyles.tableCellNum, { width: '17%' }]}>
              {formatUsd(row.gross_revenue_usd)}
            </Text>
            <Text style={[pdfStyles.tableCellNum, { width: '17%', fontFamily: 'Helvetica-Bold' }]}>
              {formatUsd(row.net_revenue_usd)}
            </Text>
            <Text style={[pdfStyles.tableCellNum, { width: '17%', color: C.emerald }]}>
              {formatUsd(row.collected_usd)}
            </Text>
            <Text style={[pdfStyles.tableCellNum, { width: '17%', color: row.outstanding_usd > 0 ? C.accentDark : C.gray600 }]}>
              {formatUsd(row.outstanding_usd)}
            </Text>
          </View>
        ))}

        {/* Total Summary Row */}
        <View style={pdfStyles.tableFooterRow}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '22%' }]}>TOTAL</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '10%', textAlign: 'center' }]}>
            {data.invoices_count}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>
            {formatUsd(data.total_gross_usd || data.total_invoiced_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>
            {formatUsd(data.total_invoiced_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right', color: C.emerald }]}>
            {formatUsd(data.total_collected_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '17%', textAlign: 'right' }]}>
            {formatUsd(data.total_outstanding_usd)}
          </Text>
        </View>
      </View>

      {/* Two-Column: Destination & Consultant Breakdowns */}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
        {/* Destinations */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Sales by Destination</Text>
            <Text style={pdfStyles.sectionSubtitle}>{data.destination_breakdown.length} destinations</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '52%' }]}>Destination</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '18%', textAlign: 'center' }]}>Count</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Total (USD)</Text>
            </View>

            {data.destination_breakdown.map((d, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '52%' }]}>{d.destination}</Text>
                <Text style={[pdfStyles.tableCell, { width: '18%', textAlign: 'center' }]}>
                  {d.bookings_count}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '30%' }]}>
                  {formatUsd(d.total_sales_usd)} ({formatPercent(d.percentage_of_total)})
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Consultants */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Sales by Consultant</Text>
            <Text style={pdfStyles.sectionSubtitle}>{data.consultant_breakdown.length} consultants</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '52%' }]}>Consultant</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '18%', textAlign: 'center' }]}>Invoices</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Total (USD)</Text>
            </View>

            {data.consultant_breakdown.map((c, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '52%' }]}>{c.consultant_name}</Text>
                <Text style={[pdfStyles.tableCell, { width: '18%', textAlign: 'center' }]}>
                  {c.invoices_count}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '30%' }]}>
                  {formatUsd(c.total_sales_usd)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};
