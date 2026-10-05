import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Clock, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportPartyMatrixTable } from '../components/ReportPartyMatrixTable';
import { ReportDataTable, type Column } from '../components/ReportDataTable';
import { formatUsd, formatDateDisplay } from '../utils/formatters';
import type { ReceivablesAgingReport } from '../../../../../lib/types/finance';

interface ReceivablesViewProps {
  data: ReceivablesAgingReport;
}

type OverdueInvoice = ReceivablesAgingReport['overdue_invoices'][number];

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({ data }) => {
  const overdueTotal = data.total_overdue_usd || 0;
  const overduePct = data.overdue_percent || 0;

  const columns: Column<OverdueInvoice>[] = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      sortable: true,
      sortValue: (item) => item.invoice_number,
      render: (item) => (
        <Link
          to={`/admin/finance/invoices/${item.invoice_id}`}
          className="font-mono font-bold text-teal-800 hover:text-teal-950 hover:underline inline-flex items-center gap-1"
        >
          {item.invoice_number}
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </Link>
      ),
    },
    {
      key: 'client_name',
      header: 'Client Name',
      sortable: true,
      sortValue: (item) => item.client_name,
      render: (item) => <span className="font-semibold text-gray-900">{item.client_name}</span>,
    },
    {
      key: 'invoice_date',
      header: 'Invoice Date',
      render: (item) => <span className="text-gray-500">{formatDateDisplay(item.invoice_date)}</span>,
    },
    {
      key: 'due_date',
      header: 'Due Date',
      sortable: true,
      sortValue: (item) => item.due_date,
      render: (item) => <span className="text-gray-500">{formatDateDisplay(item.due_date)}</span>,
    },
    {
      key: 'days_overdue',
      header: 'Aging Status',
      sortable: true,
      sortValue: (item) => item.days_overdue,
      render: (item) =>
        item.days_overdue > 0 ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3 h-3" /> {item.days_overdue} days overdue
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Current
          </span>
        ),
    },
    {
      key: 'total_amount',
      header: 'Invoiced Amount',
      align: 'right',
      render: (item) => (
        <span className="text-gray-700 font-medium tabular-nums">
          {item.currency} {item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'amount_paid',
      header: 'Amount Paid',
      align: 'right',
      render: (item) => (
        <span className="text-emerald-700 font-medium tabular-nums">
          {item.amount_paid > 0
            ? `${item.currency} ${item.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'balance_due_usd',
      header: 'Balance Due (USD)',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.balance_due_usd,
      render: (item) => (
        <span className="font-black text-rose-700 tabular-nums">
          {formatUsd(item.balance_due_usd)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Receivables KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <ReportKpiCard
          label="Total Receivables"
          value={formatUsd(data.total_receivable_usd)}
          subtext={`${data.documents_count || data.overdue_invoices.length} outstanding invoices`}
          variant="teal"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Total Overdue"
          value={formatUsd(overdueTotal)}
          subtext={`${overduePct.toFixed(1)}% of AR balance is overdue`}
          variant={overdueTotal > 0 ? 'rose' : 'emerald'}
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Current (Within Terms)"
          value={formatUsd(data.buckets[0]?.total_amount_usd || 0)}
          subtext={`${data.buckets[0]?.percentage || 0}% of debt not yet due`}
          variant="emerald"
          icon={<CheckCircle className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Weighted Delay"
          value={`${data.weighted_avg_days_overdue || 0} Days`}
          subtext="Average overdue collection lag"
          variant={(data.weighted_avg_days_overdue || 0) > 30 ? 'rose' : 'amber'}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Bucket Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {data.buckets.map((b, idx) => (
          <div
            key={idx}
            className={`p-3.5 bg-white rounded-xl border border-gray-200/80 shadow-xs flex flex-col justify-between ${
              idx === 0
                ? 'border-l-4 border-l-emerald-600'
                : idx === 1
                ? 'border-l-4 border-l-amber-600'
                : 'border-l-4 border-l-rose-600'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              {b.bucket_label}
            </p>
            <p className="text-lg font-black text-gray-900 mt-1 tabular-nums">
              {formatUsd(b.total_amount_usd)}
            </p>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1 font-medium">
              <span>{b.count} invoices</span>
              <span>{b.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Aged Debtors Matrix Table (by Client) */}
      {data.by_party && data.by_party.length > 0 && (
        <ReportPartyMatrixTable partyType="client" parties={data.by_party} />
      )}

      {/* Detailed Unpaid Invoices Table */}
      <ReportDataTable<OverdueInvoice>
        title="Unpaid & Overdue Invoices"
        subtitle="Individual customer invoice ledger items"
        data={data.overdue_invoices}
        columns={columns}
        pageSize={15}
        searchPlaceholder="Filter by invoice # or client name..."
        searchFilter={(item, q) =>
          item.invoice_number.toLowerCase().includes(q) ||
          item.client_name.toLowerCase().includes(q)
        }
      />
    </div>
  );
};
