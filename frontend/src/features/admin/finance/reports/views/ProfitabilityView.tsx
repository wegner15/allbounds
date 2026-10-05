import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { ReportDataTable, type Column } from '../components/ReportDataTable';
import { BreakdownProgressList } from '../components/ReportSvgChart';
import { formatUsd, formatPercent, formatDateDisplay } from '../utils/formatters';
import type { ProfitabilityReport, ProfitabilityItem } from '../../../../../lib/types/finance';

interface ProfitabilityViewProps {
  data: ProfitabilityReport;
}

export const ProfitabilityView: React.FC<ProfitabilityViewProps> = ({ data }) => {
  const destItems = (data.by_destination || []).map((d) => ({
    label: d.label,
    count: d.invoices_count,
    amount: d.gross_profit_usd,
    percentage: d.gross_margin_percent,
  }));

  const consultantItems = (data.by_consultant || []).map((c) => ({
    label: c.label,
    count: c.invoices_count,
    amount: c.gross_profit_usd,
    percentage: c.gross_margin_percent,
  }));

  const columns: Column<ProfitabilityItem>[] = [
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
      header: 'Client',
      sortable: true,
      sortValue: (item) => item.client_name,
      render: (item) => (
        <div>
          <p className="font-semibold text-gray-900">{item.client_name}</p>
          {item.invoice_date && (
            <span className="text-[11px] text-gray-400">
              {formatDateDisplay(item.invoice_date)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'destination',
      header: 'Destination',
      sortable: true,
      sortValue: (item) => item.destination || '',
      render: (item) => (
        <span className="text-gray-700 font-medium">
          {item.destination || 'Unspecified'}
        </span>
      ),
    },
    {
      key: 'service_description',
      header: 'Trip Summary',
      render: (item) => (
        <div className="max-w-xs truncate text-gray-500">
          {item.service_description}
        </div>
      ),
    },
    {
      key: 'revenue_usd',
      header: 'Revenue (USD)',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.revenue_usd,
      render: (item) => (
        <span className="font-medium text-gray-900 tabular-nums">
          {formatUsd(item.revenue_usd)}
        </span>
      ),
    },
    {
      key: 'cost_usd',
      header: 'Direct Cost (USD)',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.cost_usd,
      render: (item) => (
        <span className="font-medium text-rose-600 tabular-nums">
          {formatUsd(item.cost_usd)}
        </span>
      ),
    },
    {
      key: 'gross_profit_usd',
      header: 'Gross Profit',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.gross_profit_usd,
      render: (item) => (
        <span
          className={`font-black tabular-nums ${
            item.gross_profit_usd >= 0 ? 'text-emerald-700' : 'text-rose-700'
          }`}
        >
          {formatUsd(item.gross_profit_usd)}
        </span>
      ),
    },
    {
      key: 'gross_margin_percent',
      header: 'Margin %',
      align: 'right',
      sortable: true,
      sortValue: (item) => item.gross_margin_percent,
      render: (item) => {
        const isHigh = item.gross_margin_percent >= 25;
        const isLow = item.gross_margin_percent < 10;
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums border ${
              isHigh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isLow
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {formatPercent(item.gross_margin_percent)}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profitability KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <ReportKpiCard
          label="Total Revenue"
          value={formatUsd(data.total_revenue_usd)}
          subtext={`${data.invoices_count || data.items.length} trips analyzed`}
          variant="teal"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Supplier Direct Cost"
          value={formatUsd(data.total_cost_usd)}
          subtext="Verified vendor payables & costs"
          variant="rose"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Gross Profit"
          value={formatUsd(data.total_gross_profit_usd)}
          subtext="Revenue less direct vendor cost"
          variant="emerald"
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Average Margin"
          value={formatPercent(data.average_margin_percent)}
          subtext={`${data.loss_making_count || 0} loss-making trips`}
          variant={data.average_margin_percent >= 20 ? 'emerald' : 'amber'}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </div>

      {/* Two Columns: Margins by Destination & Consultant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownProgressList
          title="Profit Margin by Destination"
          subtitle="Top destination routes ranked by gross profit contribution"
          items={destItems}
          color="#059669"
        />

        <BreakdownProgressList
          title="Profit Margin by Consultant"
          subtitle="Sales consultant contribution to overall gross margin"
          items={consultantItems}
          color="#0d9488"
        />
      </div>

      {/* Detailed Trip Profitability Table */}
      <ReportDataTable<ProfitabilityItem>
        title="Trip & Invoice Profitability Analysis"
        subtitle="Full margin breakdown of invoiced bookings vs direct supplier costs"
        data={data.items}
        columns={columns}
        pageSize={15}
        searchPlaceholder="Filter by invoice, client, destination..."
        searchFilter={(item, q) =>
          item.invoice_number.toLowerCase().includes(q) ||
          item.client_name.toLowerCase().includes(q) ||
          (item.destination || '').toLowerCase().includes(q) ||
          item.service_description.toLowerCase().includes(q)
        }
      />
    </div>
  );
};
