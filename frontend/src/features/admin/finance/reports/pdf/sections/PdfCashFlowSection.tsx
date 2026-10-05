import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import { PdfKpiStrip } from './PdfKpiStrip';
import { formatUsd, formatDateDisplay } from '../../utils/formatters';
import type { CashFlowReport } from '../../../../../../lib/types/finance';

interface PdfCashFlowSectionProps {
  data: CashFlowReport;
}

export const PdfCashFlowSection: React.FC<PdfCashFlowSectionProps> = ({ data }) => {
  return (
    <View>
      {/* Cash Flow KPI Strip */}
      <PdfKpiStrip
        items={[
          {
            label: 'Total Cash Inflow',
            value: formatUsd(data.total_inflow_usd),
            subtext: `${data.receipts_count || 0} client payments received`,
            variant: 'emerald',
          },
          {
            label: 'Total Cash Outflow',
            value: formatUsd(data.total_outflow_usd),
            subtext: `${data.payments_count || 0} vendor payments disbursed`,
            variant: 'rose',
          },
          {
            label: 'Net Cash Movement',
            value: formatUsd(data.net_cash_flow_usd),
            subtext: data.net_cash_flow_usd >= 0 ? 'Net positive liquidity' : 'Net cash absorption',
            variant: data.net_cash_flow_usd >= 0 ? 'emerald' : 'rose',
          },
        ]}
      />

      {/* Two-Column: Inflow Channels vs Outflow Channels */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
        {/* Inflows by Payment Channel */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Inflows by Payment Method</Text>
          </View>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '60%' }]}>Method</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '40%', textAlign: 'right' }]}>Amount</Text>
            </View>
            {Object.entries(data.inflows_by_method).length > 0 ? (
              Object.entries(data.inflows_by_method).map(([method, amt], idx) => (
                <View key={idx} style={[pdfStyles.tableRow, idx % 2 === 1 ? pdfStyles.tableRowEven : {}]}>
                  <Text style={[pdfStyles.tableCellBold, { width: '60%' }]}>{method}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '40%', color: C.emerald }]}>
                    {formatUsd(amt)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
                <Text style={pdfStyles.tableCell}>No inflow transactions.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Outflows by Payment Channel */}
        <View style={{ flex: 1 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>Outflows by Disbursement Channel</Text>
          </View>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '60%' }]}>Method</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '40%', textAlign: 'right' }]}>Amount</Text>
            </View>
            {Object.entries(data.outflows_by_method).length > 0 ? (
              Object.entries(data.outflows_by_method).map(([method, amt], idx) => (
                <View key={idx} style={[pdfStyles.tableRow, idx % 2 === 1 ? pdfStyles.tableRowEven : {}]}>
                  <Text style={[pdfStyles.tableCellBold, { width: '60%' }]}>{method}</Text>
                  <Text style={[pdfStyles.tableCellNum, { width: '40%', color: C.rose }]}>
                    {formatUsd(amt)}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
                <Text style={pdfStyles.tableCell}>No outflow disbursements.</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Cash Flow Timeline Table */}
      <View style={pdfStyles.sectionHeader}>
        <Text style={pdfStyles.sectionTitle}>Periodic Cash Movement & Cumulative Balance</Text>
        <Text style={pdfStyles.sectionSubtitle}>{data.daily_timeline.length} periods</Text>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%' }]}>Period / Date</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Cash Inflow</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Cash Outflow</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>Net Flow</Text>
        </View>

        {data.daily_timeline.length > 0 ? (
          data.daily_timeline.map((item, idx) => (
            <View
              key={idx}
              style={[
                pdfStyles.tableRow,
                idx % 2 === 1 ? pdfStyles.tableRowEven : {},
              ]}
              wrap={false}
            >
              <Text style={[pdfStyles.tableCellBold, { width: '25%' }]}>
                {item.period_label || formatDateDisplay(item.date)}
              </Text>
              <Text style={[pdfStyles.tableCellNum, { width: '25%', color: item.inflow_usd > 0 ? C.emerald : C.gray500 }]}>
                {item.inflow_usd > 0 ? `+${formatUsd(item.inflow_usd)}` : '—'}
              </Text>
              <Text style={[pdfStyles.tableCellNum, { width: '25%', color: item.outflow_usd > 0 ? C.rose : C.gray500 }]}>
                {item.outflow_usd > 0 ? `-${formatUsd(item.outflow_usd)}` : '—'}
              </Text>
              <Text
                style={[
                  pdfStyles.tableCellNum,
                  {
                    width: '25%',
                    fontFamily: 'Helvetica-Bold',
                    color: item.net_usd >= 0 ? C.emerald : C.rose,
                  },
                ]}
              >
                {item.net_usd >= 0 ? `+${formatUsd(item.net_usd)}` : formatUsd(item.net_usd)}
              </Text>
            </View>
          ))
        ) : (
          <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
            <Text style={pdfStyles.tableCell}>No cash movements recorded during this period.</Text>
          </View>
        )}

        {/* Total Summary */}
        <View style={pdfStyles.tableFooterRow}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%' }]}>TOTAL</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right', color: C.emerald }]}>
            +{formatUsd(data.total_inflow_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right', color: C.rose }]}>
            -{formatUsd(data.total_outflow_usd)}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>
            {data.net_cash_flow_usd >= 0 ? `+${formatUsd(data.net_cash_flow_usd)}` : formatUsd(data.net_cash_flow_usd)}
          </Text>
        </View>
      </View>
    </View>
  );
};
