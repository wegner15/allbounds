import React from 'react';
import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react';
import { ReportKpiCard } from '../components/ReportKpiCard';
import { PeriodicBarChart } from '../components/ReportSvgChart';
import { formatUsd, formatDateDisplay } from '../utils/formatters';
import type { CashFlowReport } from '../../../../../lib/types/finance';

interface CashFlowViewProps {
  data: CashFlowReport;
}

export const CashFlowView: React.FC<CashFlowViewProps> = ({ data }) => {
  const chartData = data.daily_timeline.map((d) => ({
    label: d.period_label || d.date,
    valueA: d.inflow_usd,
    labelA: 'Cash Inflow',
    valueB: d.outflow_usd,
    labelB: 'Cash Outflow',
  }));

  return (
    <div className="space-y-6">
      {/* Cash Flow KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <ReportKpiCard
          label="Total Inflow"
          value={formatUsd(data.total_inflow_usd)}
          subtext={`${data.receipts_count || 0} client payments received`}
          variant="emerald"
          icon={<ArrowDownRight className="w-4 h-4 text-emerald-600" />}
        />

        <ReportKpiCard
          label="Total Outflow"
          value={formatUsd(data.total_outflow_usd)}
          subtext={`${data.payments_count || 0} vendor payments disbursed`}
          variant="rose"
          icon={<ArrowUpRight className="w-4 h-4 text-rose-600" />}
        />

        <ReportKpiCard
          label="Net Cash Movement"
          value={formatUsd(data.net_cash_flow_usd)}
          subtext={data.net_cash_flow_usd >= 0 ? 'Net positive liquidity' : 'Net cash absorption'}
          variant={data.net_cash_flow_usd >= 0 ? 'teal' : 'rose'}
          icon={<Wallet className="w-4 h-4" />}
        />
      </div>

      {/* Main Timeline Chart */}
      <PeriodicBarChart
        title="Cash Inflows vs Outflows Timeline"
        subtitle={`Cash movements across ${data.daily_timeline.length} reporting intervals`}
        data={chartData}
        colorA="#10b981"
        colorB="#f43f5e"
        height={210}
      />

      {/* Two Column: Channels Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inflows by Channel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="border-b border-gray-100 pb-2.5">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Inflows by Payment Channel
            </h4>
          </div>
          <div className="space-y-2 pt-1">
            {Object.entries(data.inflows_by_method).length > 0 ? (
              Object.entries(data.inflows_by_method).map(([method, amt]) => (
                <div
                  key={method}
                  className="flex justify-between items-center text-xs py-2 border-b border-gray-50"
                >
                  <span className="font-semibold text-gray-700">{method}</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {formatUsd(amt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No inflow channel data.</p>
            )}
          </div>
        </div>

        {/* Outflows by Channel */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
          <div className="border-b border-gray-100 pb-2.5">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Outflows by Disbursement Channel
            </h4>
          </div>
          <div className="space-y-2 pt-1">
            {Object.entries(data.outflows_by_method).length > 0 ? (
              Object.entries(data.outflows_by_method).map(([method, amt]) => (
                <div
                  key={method}
                  className="flex justify-between items-center text-xs py-2 border-b border-gray-50"
                >
                  <span className="font-semibold text-gray-700">{method}</span>
                  <span className="font-bold text-rose-700 tabular-nums">
                    {formatUsd(amt)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No outflow channel data.</p>
            )}
          </div>
        </div>
      </div>

      {/* Cash Flow Timeline Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Periodic Cash Flow Movement
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Net cash flow per reporting interval with running cumulative liquidity
            </p>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            {data.daily_timeline.length} intervals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200/80 text-[11px] font-bold text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Period / Date</th>
                <th className="py-3 px-4 text-right">Inflow (USD)</th>
                <th className="py-3 px-4 text-right">Outflow (USD)</th>
                <th className="py-3 px-4 text-right">Net Flow</th>
                <th className="py-3 px-4 text-right">Cumulative Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.daily_timeline.length > 0 ? (
                data.daily_timeline.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-gray-900">
                      {d.period_label || formatDateDisplay(d.date)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-emerald-700 tabular-nums">
                      {d.inflow_usd > 0 ? `+${formatUsd(d.inflow_usd)}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-rose-600 tabular-nums">
                      {d.outflow_usd > 0 ? `-${formatUsd(d.outflow_usd)}` : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold tabular-nums">
                      <span className={d.net_usd >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                        {d.net_usd >= 0 ? `+${formatUsd(d.net_usd)}` : formatUsd(d.net_usd)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 tabular-nums">
                      {d.cumulative_net_usd !== undefined
                        ? (d.cumulative_net_usd >= 0 ? `+${formatUsd(d.cumulative_net_usd)}` : formatUsd(d.cumulative_net_usd))
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No cash movements recorded during this period.
                  </td>
                </tr>
              )}
            </tbody>
            {data.daily_timeline.length > 0 && (
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-xs">
                <tr>
                  <td className="py-3 px-4 text-gray-900 uppercase">Total</td>
                  <td className="py-3 px-4 text-right text-emerald-700 tabular-nums">
                    +{formatUsd(data.total_inflow_usd)}
                  </td>
                  <td className="py-3 px-4 text-right text-rose-700 tabular-nums">
                    -{formatUsd(data.total_outflow_usd)}
                  </td>
                  <td className="py-3 px-4 text-right font-black tabular-nums">
                    <span className={data.net_cash_flow_usd >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                      {data.net_cash_flow_usd >= 0
                        ? `+${formatUsd(data.net_cash_flow_usd)}`
                        : formatUsd(data.net_cash_flow_usd)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-gray-900 tabular-nums">
                    {data.net_cash_flow_usd >= 0
                      ? `+${formatUsd(data.net_cash_flow_usd)}`
                      : formatUsd(data.net_cash_flow_usd)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
