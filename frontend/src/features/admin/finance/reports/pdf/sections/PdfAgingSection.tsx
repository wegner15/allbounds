import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { pdfStyles, C } from '../pdfStyles';
import { PdfKpiStrip } from './PdfKpiStrip';
import { formatUsd, formatDateDisplay } from '../../utils/formatters';
import type {
  ReceivablesAgingReport,
  PayablesAgingReport,
} from '../../../../../../lib/types/finance';

interface PdfAgingSectionProps {
  type: 'receivables' | 'payables';
  data: ReceivablesAgingReport | PayablesAgingReport;
}

export const PdfAgingSection: React.FC<PdfAgingSectionProps> = ({ type, data }) => {
  const isAR = type === 'receivables';
  const arData = isAR ? (data as ReceivablesAgingReport) : null;
  const apData = !isAR ? (data as PayablesAgingReport) : null;

  const totalAmount = isAR ? arData!.total_receivable_usd : apData!.total_payable_usd;
  const overdueAmount = data.total_overdue_usd || 0;
  const overduePct = data.overdue_percent || 0;

  return (
    <View>
      {/* KPI Strip */}
      <PdfKpiStrip
        items={[
          {
            label: isAR ? 'Total Receivables' : 'Total Payables',
            value: formatUsd(totalAmount),
            subtext: `${data.documents_count || (isAR ? arData!.overdue_invoices.length : apData!.pending_bills.length)} items`,
            variant: 'primary',
          },
          {
            label: 'Total Overdue',
            value: formatUsd(overdueAmount),
            subtext: `${overduePct.toFixed(1)}% of balance is overdue`,
            variant: overdueAmount > 0 ? 'rose' : 'emerald',
          },
          {
            label: 'Current / Not Due',
            value: formatUsd(data.buckets[0]?.total_amount_usd || 0),
            subtext: `${data.buckets[0]?.percentage || 0}% within terms`,
            variant: 'emerald',
          },
          {
            label: 'Weighted Overdue',
            value: `${data.weighted_avg_days_overdue || 0} Days`,
            subtext: 'Average aging delay',
            variant: (data.weighted_avg_days_overdue || 0) > 30 ? 'rose' : 'amber',
          },
        ]}
      />

      {/* Bucket Distribution Strip */}
      <View style={{ flexDirection: 'row', gap: 5, marginBottom: 12 }}>
        {data.buckets.map((b, idx) => (
          <View
            key={idx}
            style={[
              pdfStyles.kpiCard,
              {
                flex: 1,
                borderLeftColor: idx === 0 ? C.emerald : idx === 1 ? C.amber : C.rose,
                backgroundColor: C.gray50,
                padding: 6,
              },
            ]}
          >
            <Text style={[pdfStyles.kpiLabel, { fontSize: 6 }]}>{b.bucket_label}</Text>
            <Text style={[pdfStyles.kpiValue, { fontSize: 10 }]}>{formatUsd(b.total_amount_usd)}</Text>
            <Text style={pdfStyles.kpiSubtext}>
              {b.count} docs ({b.percentage}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Party Aging Matrix Table (Aged Debtors / Creditors) */}
      {data.by_party && data.by_party.length > 0 && (
        <View style={{ marginBottom: 12 }}>
          <View style={pdfStyles.sectionHeader}>
            <Text style={pdfStyles.sectionTitle}>
              {isAR ? 'Aged Debtors Matrix (By Client)' : 'Aged Creditors Matrix (By Supplier)'}
            </Text>
            <Text style={pdfStyles.sectionSubtitle}>{data.by_party.length} parties</Text>
          </View>

          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={[pdfStyles.tableHeaderCell, { width: '28%' }]}>
                {isAR ? 'Client Name' : 'Supplier Name'}
              </Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '8%', textAlign: 'center' }]}>Docs</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>Current</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>1-30d</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>31-60d</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '12%', textAlign: 'right' }]}>61-90d</Text>
              <Text style={[pdfStyles.tableHeaderCell, { width: '16%', textAlign: 'right' }]}>Total (USD)</Text>
            </View>

            {data.by_party.slice(0, 15).map((row, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
                wrap={false}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '28%' }]}>{row.party_name}</Text>
                <Text style={[pdfStyles.tableCell, { width: '8%', textAlign: 'center' }]}>
                  {row.documents_count}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '12%', color: C.emerald }]}>
                  {row.current_usd > 0 ? formatUsd(row.current_usd) : '—'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '12%', color: row.d1_30_usd > 0 ? C.accentDark : C.gray400 }]}>
                  {row.d1_30_usd > 0 ? formatUsd(row.d1_30_usd) : '—'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '12%', color: row.d31_60_usd > 0 ? C.rose : C.gray400 }]}>
                  {row.d31_60_usd > 0 ? formatUsd(row.d31_60_usd) : '—'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '12%', color: row.d61_90_usd + row.d90_plus_usd > 0 ? C.rose : C.gray400 }]}>
                  {row.d61_90_usd + row.d90_plus_usd > 0 ? formatUsd(row.d61_90_usd + row.d90_plus_usd) : '—'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '16%', fontFamily: 'Helvetica-Bold' }]}>
                  {formatUsd(row.total_usd)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Detailed Document Listing */}
      <View style={pdfStyles.sectionHeader}>
        <Text style={pdfStyles.sectionTitle}>
          {isAR ? 'Outstanding Invoices Detail' : 'Pending Vendor Liabilities Detail'}
        </Text>
        <Text style={pdfStyles.sectionSubtitle}>
          {isAR ? arData!.overdue_invoices.length : apData!.pending_bills.length} records
        </Text>
      </View>

      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.tableHeaderCell, { width: '15%' }]}>
            {isAR ? 'Invoice #' : 'Bill #'}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '25%' }]}>
            {isAR ? 'Client Name' : 'Supplier'}
          </Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '14%' }]}>Due Date</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '16%' }]}>Aging Status</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Total</Text>
          <Text style={[pdfStyles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>Balance (USD)</Text>
        </View>

        {isAR ? (
          arData!.overdue_invoices.length > 0 ? (
            arData!.overdue_invoices.map((inv, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
                wrap={false}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '15%', color: C.primaryDark }]}>
                  {inv.invoice_number}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '25%' }]}>{inv.client_name}</Text>
                <Text style={[pdfStyles.tableCell, { width: '14%', color: C.gray600 }]}>
                  {formatDateDisplay(inv.due_date)}
                </Text>
                <Text
                  style={[
                    pdfStyles.tableCell,
                    {
                      width: '16%',
                      fontFamily: 'Helvetica-Bold',
                      color: inv.days_overdue > 0 ? C.rose : C.emerald,
                    },
                  ]}
                >
                  {inv.days_overdue > 0 ? `${inv.days_overdue}d overdue` : 'Current'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '15%' }]}>
                  {inv.currency} {inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '15%', fontFamily: 'Helvetica-Bold', color: C.rose }]}>
                  {formatUsd(inv.balance_due_usd)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
              <Text style={pdfStyles.tableCell}>No outstanding receivables recorded.</Text>
            </View>
          )
        ) : (
          apData!.pending_bills.length > 0 ? (
            apData!.pending_bills.map((bill, idx) => (
              <View
                key={idx}
                style={[
                  pdfStyles.tableRow,
                  idx % 2 === 1 ? pdfStyles.tableRowEven : {},
                ]}
                wrap={false}
              >
                <Text style={[pdfStyles.tableCellBold, { width: '15%', color: C.primaryDark }]}>
                  {bill.bill_number}
                </Text>
                <Text style={[pdfStyles.tableCell, { width: '25%' }]}>{bill.supplier_name}</Text>
                <Text style={[pdfStyles.tableCell, { width: '14%', color: C.gray600 }]}>
                  {formatDateDisplay(bill.due_date)}
                </Text>
                <Text
                  style={[
                    pdfStyles.tableCell,
                    {
                      width: '16%',
                      fontFamily: 'Helvetica-Bold',
                      color: bill.days_overdue > 0 ? C.rose : C.blue,
                    },
                  ]}
                >
                  {bill.days_overdue > 0 ? `${bill.days_overdue}d overdue` : 'Due Soon'}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '15%' }]}>
                  {bill.currency} {bill.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
                <Text style={[pdfStyles.tableCellNum, { width: '15%', fontFamily: 'Helvetica-Bold', color: C.rose }]}>
                  {formatUsd(bill.balance_payable_usd)}
                </Text>
              </View>
            ))
          ) : (
            <View style={[pdfStyles.tableRow, { justifyContent: 'center' }]}>
              <Text style={pdfStyles.tableCell}>No pending liabilities recorded.</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
};
