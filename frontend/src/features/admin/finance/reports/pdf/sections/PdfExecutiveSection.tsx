import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import { PdfKpiStrip } from './PdfKpiStrip';
import { formatUsd, formatPercent } from '../../utils/formatters';
import type { ExecutiveSummaryReport } from '../../../../../../lib/types/finance';

interface PdfExecutiveSectionProps {
  data: ExecutiveSummaryReport;
}

export const PdfExecutiveSection: React.FC<PdfExecutiveSectionProps> = ({ data }) => {
  return (
    <View>
      {/* KPI Strip */}
      <PdfKpiStrip
        items={[
          {
            label: 'Total Invoiced',
            value: formatUsd(data.invoiced_usd),
            subtext: `${data.invoices_count} invoices ${
              data.invoiced_change_percent !== null && data.invoiced_change_percent !== undefined
                ? `(${data.invoiced_change_percent >= 0 ? '+' : ''}${data.invoiced_change_percent}% vs prior)`
                : ''
            }`,
            variant: 'primary',
          },
          {
            label: 'Gross Profit',
            value: formatUsd(data.gross_profit_usd),
            subtext: `${formatPercent(data.gross_margin_percent)} gross margin`,
            variant: 'emerald',
          },
          {
            label: 'Net Cash Flow',
            value: formatUsd(data.net_cash_usd),
            subtext: `In: ${formatUsd(data.cash_in_usd, false)} | Out: ${formatUsd(data.cash_out_usd, false)}`,
            variant: data.net_cash_usd >= 0 ? 'emerald' : 'rose',
          },
          {
            label: 'Outstanding AR',
            value: formatUsd(data.receivables_usd),
            subtext: `Overdue: ${formatUsd(data.receivables_overdue_usd)}`,
            variant: data.receivables_overdue_usd > 0 ? 'amber' : 'primary',
          },
          {
            label: 'Net Working Pos.',
            value: formatUsd(data.net_working_position_usd),
            subtext: `AP: ${formatUsd(data.payables_usd, false)}`,
            variant: data.net_working_position_usd >= 0 ? 'emerald' : 'rose',
          },
        ]}
      />

      {/* Two-Column Section: Period Trend & Working Capital */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {/* Left Column: Sales & Margin Trend */}
        <View style={{ flex: 1.1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Performance Trend</Text>
            <Text style={pdfStyles.sectionSubtitle}>{data.trend.length} periods</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '30%' }]}>Period</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '15%', textAlign: 'center' }]}>Inv</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '28%', textAlign: 'right' }]}>Invoiced</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '27%', textAlign: 'right' }]}>Collected</Text>
            </View>

            {data.trend.slice(0, 8).map((row, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '30%' }]}>
                  {row.period_label || row.period}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '15%', textAlign: 'center' }]}>
                  {row.invoices_count}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '28%' }]}>
                  {formatUsd(row.net_revenue_usd)}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '27%', color: C.emerald }]}>
                  {formatUsd(row.collected_usd)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Right Column: Receivables & Payables Aging Position */}
        <View style={{ flex: 0.9 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Aging Exposure (As of Today)</Text>
            <Text style={pdfStyles.sectionSubtitle}>AR vs AP</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '34%' }]}>Bucket</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '33%', textAlign: 'right' }]}>Debtors (AR)</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '33%', textAlign: 'right' }]}>Creditors (AP)</Text>
            </View>

            {data.receivable_buckets.map((b, idx) => {
              const apBucket = data.payable_buckets[idx];
              return (
                <View
                  key={idx}
                  style={[
                    pdfStyles.tableRow,
                    idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                  ]}
                >
                  <Text style={[pdfStyles.tableCellBold, { width: '34%' }]}>
                    {b.bucket_label}
                  </Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '33%', color: idx > 0 ? C.rose : C.gray800 }]}>
                    {formatUsd(b.total_amount_usd)}
                  </Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '33%', color: C.gray700 }]}>
                    {formatUsd(apBucket?.total_amount_usd || 0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Second Two-Column Section: Top Destinations & Top Debtors */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {/* Top Destinations */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Top Safari Destinations</Text>
            <Text style={pdfStyles.sectionSubtitle}>Revenue Share</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '50%' }]}>Destination</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '20%', textAlign: 'center' }]}>Trips</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Revenue</Text>
            </View>

            {data.top_destinations.length > 0 ? (
              data.top_destinations.map((d, idx) => (
                <View
                  key={idx}
                  style={[
                    pdfStyles.tableRow,
                    idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                  ]}
                >
                  <Text style={[pdfStyles.tableCellBold, { width: '50%' }]}>{d.destination}</Text>
                  <Text style={[pdfStyles.tableCell, { width: '20%', textAlign: 'center' }]}>
                    {d.bookings_count}
                  </Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%' }]}>
                    {formatUsd(d.total_sales_usd)} ({formatPercent(d.percentage_of_total)})
                  </Text>
                </View>
              ))
            ) : (
              <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
                <Text style={pdfStyles.tableCell}>No destination data recorded.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Debtors */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Largest Outstanding Debtors</Text>
            <Text style={pdfStyles.sectionSubtitle}>Accounts Receivable</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '50%' }]}>Client</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '20%', textAlign: 'center' }]}>Invoices</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Balance Due</Text>
            </View>

            {data.top_debtors.length > 0 ? (
              data.top_debtors.map((p, idx) => (
                <View
                  key={idx}
                  style={[
                    pdfStyles.tableRow,
                    idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                  ]}
                >
                  <Text style={[pdfStyles.tableCellBold, { width: '50%' }]}>{p.party_name}</Text>
                  <Text style={[pdfStyles.tableCell, { width: '20%', textAlign: 'center' }]}>
                    {p.documents_count}
                  </Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%', color: p.d1_30_usd + p.d31_60_usd + p.d61_90_usd + p.d90_plus_usd > 0 ? C.rose : C.gray800 }]}>
                    {formatUsd(p.total_usd)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
                <Text style={pdfStyles.tableCell}>No outstanding balances.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
