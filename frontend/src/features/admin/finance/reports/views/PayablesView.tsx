import React from 'react';
import { DollarSign, Clock, AlertCircle, Calendar } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportPartyMatrixTable } from '../components/ReportPartyMatrixTable';
import { ReportDataTable, type Column } from '../components/ReportDataTable';
import { formatUsd, formatDateDisplay } from '../utils/formatters';
import type { PayablesAgingReport } from '../../../../../lib/types/finance';

interface PayablesViewProps {
  data: PayablesAgingReport;
}

type PendingBill = PayablesAgingReport['pending_bills'][number];

export const PayablesView: React.FC<PayablesViewProps> = ({ data }) => {
  const overdueTotal = data.total_overdue_usd || 0;
  const overduePct = data.overdue_percent || 0;

  const columns: Column<PendingBill>[] = [
    {
      key: 'bill_number',
      header: 'Bill #',
      sortable: true,
      sortValue: (item) => item.bill_number,
      render: (item) => (
        <span className="font-mono font-bold text-teal-800">
          {item.bill_number}
        </span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier Name',
      sortable: true,
      sortValue: (item) => item.supplier_name,
      render: (item) => <span className="font-semibold text-gray-900">{item.supplier_name}</span>,
    },
    {
      key: 'bill_date',
      header: 'Bill Date',
      render: (item) => <span className="text-gray-500">{formatDateDisplay(item.bill_date)}</span>,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Due Soon
          </span>
        ),
    },
    {
      key: 'amount_billed',
      header: 'Billed Amount',
      align: 'right',
      render: (item) => (
        <span className="text-gray-700 font-medium tabular-nums">
          {item.currency} {item.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'amount_paid',
      header: 'Paid Amount',
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
      key: 'balance_payable_usd',
      header: 'Balance Payable (USD)',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.balance_payable_usd,
      render: (item) => (
        <span className="font-black text-rose-700 tabular-nums">
          {formatUsd(item.balance_payable_usd)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Payables KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <ReportKpiCard
          label="Total Payables"
          value={formatUsd(data.total_payable_usd)}
          subtext={`${data.documents_count || data.pending_bills.length} vendor bills`}
          variant="teal"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Total Overdue"
          value={formatUsd(overdueTotal)}
          subtext={`${overduePct.toFixed(1)}% of supplier liabilities are overdue`}
          variant={overdueTotal > 0 ? 'rose' : 'emerald'}
          icon={<AlertCircle className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Due Next 7 Days"
          value={formatUsd(data.due_next_7_days_usd || 0)}
          subtext="Immediate cash disbursement demand"
          variant="amber"
          icon={<Calendar className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Due Next 30 Days"
          value={formatUsd(data.due_next_30_days_usd || 0)}
          subtext="30-day supplier cash requirements"
          variant="blue"
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
                ? 'border-l-4 border-l-blue-600'
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
              <span>{b.count} bills</span>
              <span>{b.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Aged Creditors Matrix Table (by Supplier) */}
      {data.by_party && data.by_party.length > 0 && (
        <ReportPartyMatrixTable partyType="supplier" parties={data.by_party} />
      )}

      {/* Detailed Pending Bills Table */}
      <ReportDataTable<PendingBill>
        title="Pending & Overdue Vendor Liabilities"
        subtitle="Individual supplier bills requiring disbursement"
        data={data.pending_bills}
        columns={columns}
        pageSize={15}
        searchPlaceholder="Filter by bill # or supplier name..."
        searchFilter={(item, q) =>
          item.bill_number.toLowerCase().includes(q) ||
          item.supplier_name.toLowerCase().includes(q)
        }
      />
    </div>
  );
};
