import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import { PdfKpiStrip } from './PdfKpiStrip';
import { formatUsd, formatPercent } from '../../utils/formatters';
import type { ProfitabilityReport } from '../../../../../../lib/types/finance';

interface PdfProfitabilitySectionProps {
  data: ProfitabilityReport;
}

export const PdfProfitabilitySection: React.FC<PdfProfitabilitySectionProps> = ({ data }) => {
  return (
    <View>
      {/* Profitability KPI Strip */}
      <PdfKpiStrip
        items={[
          {
            label: 'Total Revenue',
            value: formatUsd(data.total_revenue_usd),
            subtext: `${data.invoices_count || data.items.length} trips analyzed`,
            variant: 'primary',
          },
          {
            label: 'Supplier Direct Cost',
            value: formatUsd(data.total_cost_usd),
            subtext: 'Payables & verified costs',
            variant: 'rose',
          },
          {
            label: 'Gross Profit',
            value: formatUsd(data.total_gross_profit_usd),
            subtext: 'Revenue less direct cost',
            variant: 'emerald',
          },
          {
            label: 'Average Margin',
            value: formatPercent(data.average_margin_percent),
            subtext: `${data.loss_making_count || 0} loss-making trips`,
            variant: data.average_margin_percent >= 20 ? 'emerald' : 'amber',
          },
        ]}
      />

      {/* Destination & Consultant Summaries */}
      {(data.by_destination?.length || data.by_consultant?.length) ? (
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
          {/* Destination Margins */}
          <View style={{ flex: 1 }}>
            <View style={pdfStyles.sectionHeader}>
              <Text style={pdfStyles.sectionTitle}>Margin by Destination</Text>
            </View>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeader}>
                <Text style={[pdfStyles.tableHeaderCell, { width: '40%' }]}>Destination</Text>
                <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Profit (USD)</Text>
                <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Margin %</Text>
              </View>
              {(data.by_destination || []).slice(0, 5).map((row, idx) => (
                <View key={idx} style={[pdfStyles.tableRow, idx % 2 === 1 ? pdfStyles.tableRowEven : {}]}>
                  <Text style={[pdfStyles.tableCellBold, { width: '40%' }]}>{row.label}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%' }]}>{formatUsd(row.gross_profit_usd)}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%', color: row.gross_margin_percent >= 20 ? C.emerald : C.accentDark }]}>
                    {formatPercent(row.gross_margin_percent)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Consultant Margins */}
          <View style={{ flex: 1 }}>
            <View style={pdfStyles.sectionHeader}>
              <Text style={pdfStyles.sectionTitle}>Margin by Consultant</Text>
            </View>
            <View style={pdfStyles.table}>
              <View style={pdfStyles.tableHeader}>
                <Text style={[pdfStyles.tableHeaderCell, { width: '40%' }]}>Consultant</Text>
                <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Profit (USD)</Text>
                <Text style={[pdfStyles.tableHeaderCell, { width: '30%', textAlign: 'right' }]}>Margin %</Text>
              </View>
              {(data.by_consultant || []).slice(0, 5).map((row, idx) => (
                <View key={idx} style={[pdfStyles.tableRow, idx % 2 === 1 ? pdfStyles.tableRowEven : {}]}>
                  <Text style={[pdfStyles.tableCellBold, { width: '40%' }]}>{row.label}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%' }]}>{formatUsd(row.gross_profit_usd)}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '30%', color: row.gross_margin_percent >= 20 ? C.emerald : C.accentDark }]}>
                    {formatPercent(row.gross_margin_percent)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {/* Individual Trip Profitability Breakdown */}
      <View style={pdfStyles.sectionHeader}>
        <Text style={pdfStyles.sectionTitle}>Booking & Trip Profitability Analysis</Text>
        <Text style={pdfStyles.sectionSubtitle}>{data.items.length} records</Text>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '13%' }]}>Invoice #</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '18%' }]}>Client</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '16%' }]}>Destination</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Revenue</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '14%', textAlign: 'right' }]}>Cost</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '14%', textAlign: 'right' }]}>Profit</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>Margin</Text>
        </View>

        {data.items.length > 0 ? (
          data.items.map((item, idx) => {
            const isHighMargin = item.gross_margin_percent >= 25;
            const isLowMargin = item.gross_margin_percent < 10;
            return (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
                wrap={false}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '13%', color: C.primaryDark }]}>
                  {item.invoice_number}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '18%' }]}>
                  {item.client_name}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '16%', color: C.gray600 }]}>
                  {item.destination || 'Unspecified'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '15%' }]}>
                  {formatUsd(item.revenue_usd)}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '14%', color: C.rose }]}>
                  {formatUsd(item.cost_usd)}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '14%', fontFamily: 'Helvetica-Bold', color: item.gross_profit_usd >= 0 ? C.emerald : C.rose }]}>
                  {formatUsd(item.gross_profit_usd)}
                </Text>
                <Text
                  style={[
                    pdfStyles.tableCellNum,
                    {
                      width: '10%',
                      fontFamily: 'Helvetica-Bold',
                      color: isHighMargin ? C.emerald : isLowMargin ? C.rose : C.accentDark,
                    },
                  ]}
                >
                  {formatPercent(item.gross_margin_percent)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
            <Text style={pdfStyles.tableCell}>No profitability records found for this period.</Text>
          </View>
        )}

        {/* Summary Footer */}
        <View style={pdfStyles.tableFooterRow}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '47%' }]}>TOTAL / AVERAGE</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
            {formatUsd(data.total_revenue_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '14%', textAlign: 'right', color: C.rose }]}>
            {formatUsd(data.total_cost_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '14%', textAlign: 'right', color: C.emerald }]}>
            {formatUsd(data.total_gross_profit_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '10%', textAlign: 'right' }]}>
            {formatPercent(data.average_margin_percent)}
          </Text>
        </View>
      </View>
    </View>
  );
};
