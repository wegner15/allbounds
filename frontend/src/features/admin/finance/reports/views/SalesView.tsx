import React from 'react';
import { DollarSign, CheckCircle, Clock, Percent, FileText } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { PeriodicBarChart, BreakdownProgressList } from '../components/ReportSvgChart';
import { formatUsd, formatPercent } from '../utils/formatters';
import type { SalesReport } from '../../../../../lib/types/finance';

interface SalesViewProps {
  data: SalesReport;
}

export const SalesView: React.FC<SalesViewProps> = ({ data }) => {
  const chartData = data.period_breakdown.map((p) => ({
    label: p.period_label || p.period,
    valueA: p.net_revenue_usd,
    labelA: 'Net Revenue',
    valueB: p.collected_usd,
    labelB: 'Collected',
  }));

  const destItems = data.destination_breakdown.map((d) => ({
    label: d.destination,
    count: d.bookings_count,
    amount: d.total_sales_usd,
    percentage: d.percentage_of_total,
  }));

  const consultantItems = data.consultant_breakdown.map((c) => ({
    label: c.consultant_name,
    count: c.invoices_count,
    amount: c.total_sales_usd,
    percentage: c.percentage_of_total || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Sales KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <ReportKpiCard
          label="Total Invoiced"
          value={formatUsd(data.total_invoiced_usd)}
          subtext={`${data.invoices_count} total invoices`}
          deltaPercent={data.comparison?.invoiced_change_percent}
          deltaLabel="vs prior"
          variant="teal"
          icon={<DollarSign className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Total Collected"
          value={formatUsd(data.total_collected_usd)}
          subtext={`${formatPercent(data.collection_rate_percent)} collection rate`}
          deltaPercent={data.comparison?.collected_change_percent}
          deltaLabel="vs prior"
          variant="emerald"
          icon={<CheckCircle className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Outstanding AR"
          value={formatUsd(data.total_outstanding_usd)}
          subtext="Accounts receivable balance"
          variant={data.total_outstanding_usd > 0 ? 'amber' : 'teal'}
          icon={<Clock className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Avg Booking Value"
          value={formatUsd(data.average_order_value_usd)}
          subtext="Average per invoice"
          variant="blue"
          icon={<Percent className="w-4 h-4" />}
        />

        <ReportKpiCard
          label="Invoices Count"
          value={String(data.invoices_count)}
          subtext={data.include_drafts ? 'Includes draft invoices' : 'Excludes drafts'}
          deltaPercent={data.comparison?.invoices_count_change_percent}
          deltaLabel="vs prior"
          variant="purple"
          icon={<FileText className="w-4 h-4" />}
        />
      </div>

      {/* Main Chart */}
      <PeriodicBarChart
        title="Periodic Sales & Cash Collections"
        subtitle={`Invoiced vs Collected across ${data.period_breakdown.length} intervals`}
        data={chartData}
        colorA="#0d9488"
        colorB="#10b981"
        height={200}
      />

      {/* Periodic Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Periodic Revenue Breakdown
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Detailed billing, discounts and collections by time interval
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {data.period_breakdown.length} periods
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-3 text-center">Invoices</th>
                <th className="py-3 px-3 text-right">Gross Sales</th>
                <th className="py-3 px-3 text-right">Discounts</th>
                <th className="py-3 px-3 text-right">Net Revenue</th>
                <th className="py-3 px-3 text-right">Collected</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.period_breakdown.length > 0 ? (
                data.period_breakdown.map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {p.period_label || p.period}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-gray-500">
                      {p.invoices_count}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-gray-600">
                      {formatUsd(p.gross_revenue_usd)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-gray-500">
                      {p.discount_usd > 0 ? `-${formatUsd(p.discount_usd)}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums text-teal-900">
                      {formatUsd(p.net_revenue_usd)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold tabular-nums text-emerald-700">
                      {formatUsd(p.collected_usd)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums text-amber-700">
                      {formatUsd(p.outstanding_usd)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No sales data for this period.
                  </td>
                </tr>
              )}
            </tbody>
            {data.period_breakdown.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-xs">
                <tr>
                  <td className="py-3 px-4 text-gray-900 uppercase">Total</td>
                  <td className="py-3 px-3 text-center font-mono">{data.invoices_count}</td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatUsd(data.total_gross_usd || data.total_invoiced_usd)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-gray-500">
                    {data.total_discount_usd ? `-${formatUsd(data.total_discount_usd)}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-teal-900 tabular-nums">
                    {formatUsd(data.total_invoiced_usd)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-700 tabular-nums">
                    {formatUsd(data.total_collected_usd)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-amber-700 tabular-nums">
                    {formatUsd(data.total_outstanding_usd)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Two Columns: Destination & Consultant Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BreakdownProgressList
          title="Revenue by Safari Destination"
          subtitle="Tour destination revenue ranking"
          items={destItems}
          color="#0d9488"
        />

        <BreakdownProgressList
          title="Sales by Travel Consultant"
          subtitle="Sales consultant conversion ranking"
          items={consultantItems}
          color="#2563eb"
        />
      </div>
    </div>
  );
};
