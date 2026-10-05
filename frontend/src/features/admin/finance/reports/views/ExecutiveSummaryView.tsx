import React from 'react';
import { DollarSign, TrendingUp, Clock, Wallet, CheckCircle, ArrowRight } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { PeriodicBarChart, BreakdownProgressList } from '../components/ReportSvgChart';
import { formatUsd, formatPercent } from '../utils/formatters';
import type { ExecutiveSummaryReport } from '../../../../../lib/types/finance';

interface ExecutiveSummaryViewProps {
  data: ExecutiveSummaryReport;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  data,
  onNavigateTab,
}) => {
  const chartData = data.trend.map((t) => ({
    label: t.period_label || t.period,
    valueA: t.net_revenue_usd,
    labelA: 'Invoiced',
    valueB: t.collected_usd,
    labelB: 'Collected',
  }));

  const destItems = data.top_destinations.map((d) => ({
    label: d.destination,
    count: d.bookings_count,
    amount: d.total_sales_usd,
    percentage: d.percentage_of_total,
  }));

  return (
    <div className="space-y-6">
      {/* Top Headline KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <ReportKpiCard
          label="Total Invoiced"
          value={formatUsd(data.invoiced_usd)}
          subtext={`${data.invoices_count} invoices issued`}
          deltaPercent={data.invoiced_change_percent}
          deltaLabel="vs prior"
          variant="teal"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Gross Profit"
          value={formatUsd(data.gross_profit_usd)}
          subtext={`${formatPercent(data.gross_margin_percent)} average margin`}
          variant="emerald"
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Net Cash Movement"
          value={formatUsd(data.net_cash_usd)}
          subtext={`In: ${formatUsd(data.cash_in_usd, false)} | Out: ${formatUsd(data.cash_out_usd, false)}`}
          variant={data.net_cash_usd >= 0 ? 'emerald' : 'rose'}
          icon={<Wallet className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Receivables (AR)"
          value={formatUsd(data.receivables_usd)}
          subtext={`Overdue: ${formatUsd(data.receivables_overdue_usd)}`}
          variant={data.receivables_overdue_usd > 0 ? 'amber' : 'teal'}
          icon={<Clock className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Working Capital"
          value={formatUsd(data.net_working_position_usd)}
          subtext={`AP: ${formatUsd(data.payables_usd, false)}`}
          variant={data.net_working_position_usd >= 0 ? 'emerald' : 'rose'}
          icon={<CheckCircle className="w-4 h-4" />}
        />
      </div>

      {/* Main Chart: Sales & Collections Trend */}
      <PeriodicBarChart
        title="Revenue & Collections Trend"
        subtitle={`Periodic comparison across ${data.trend.length} reporting intervals`}
        data={chartData}
        colorA="#0d9488"
        colorB="#10b981"
        height={210}
      />

      {/* Two Column Grid: Top Destinations & Aged Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <BreakdownProgressList
          title="Top Safari Destinations"
          subtitle="Revenue distribution by primary safari route"
          items={destItems}
          color="#0d9488"
        />

        {/* Debtors vs Creditors Aging Quick Matrix */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Aging Exposure Summary
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Debtors (AR) vs Vendor Liabilities (AP) as of today
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('receivables')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Full Matrix <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50/80 text-[10.5px] font-bold text-gray-700 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Bucket</th>
                  <th className="py-2.5 px-3 text-right">Debtors (AR)</th>
                  <th className="py-2.5 px-3 text-right">Creditors (AP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.receivable_buckets.map((b, idx) => {
                  const apBucket = data.payable_buckets[idx];
                  const isOverdue = idx > 0;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-800">
                        {b.bucket_label}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium tabular-nums ${
                          isOverdue && b.total_amount_usd > 0 ? 'text-rose-600 font-bold' : 'text-gray-800'
                        }`}
                      >
                        {formatUsd(b.total_amount_usd)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium tabular-nums text-gray-700">
                        {formatUsd(apBucket?.total_amount_usd || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 font-bold bg-gray-50/50">
                <tr>
                  <td className="py-2.5 px-3 uppercase text-gray-900">Total</td>
                  <td className="py-2.5 px-3 text-right text-gray-900 tabular-nums">
                    {formatUsd(data.receivables_usd)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-900 tabular-nums">
                    {formatUsd(data.payables_usd)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
