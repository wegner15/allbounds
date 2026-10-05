import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import type { ReportGranularity } from '../../../../../lib/types/finance';
import { type DatePresetKey, getDatePresets } from '../utils/datePresets';

interface ReportFilterBarProps {
  activeTab: string;
  selectedPreset: DatePresetKey;
  onSelectPreset: (preset: DatePresetKey) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (val: string) => void;
  onEndDateChange: (val: string) => void;
  granularity: ReportGranularity;
  onGranularityChange: (val: ReportGranularity) => void;
  includeDrafts: boolean;
  onIncludeDraftsChange: (val: boolean) => void;
  asOfDate?: string;
  onAsOfDateChange?: (val: string) => void;
  onReset: () => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  activeTab,
  selectedPreset,
  onSelectPreset,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  granularity,
  onGranularityChange,
  includeDrafts,
  onIncludeDraftsChange,
  asOfDate,
  onAsOfDateChange,
  onReset,
}) => {
  const presets = getDatePresets();
  const isAgingTab = activeTab === 'receivables' || activeTab === 'payables';
  const showGranularity = activeTab === 'executive' || activeTab === 'sales' || activeTab === 'cash_flow';
  const showDraftsToggle = activeTab === 'executive' || activeTab === 'sales' || activeTab === 'profitability';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-4 sm:p-5 space-y-4 print:hidden">
      {/* Top Row: Quick Presets */}
      {!isAgingTab ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Preset:
            </span>
            {(['ytd', 'this_month', 'last_month', 'this_quarter', 'last_30d', 'last_12m', 'all_time'] as DatePresetKey[]).map(
              (key) => {
                const p = presets[key];
                const isActive = selectedPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectPreset(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200/70 text-gray-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              }
            )}
          </div>

          {(startDate || endDate || includeDrafts) && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teal-800 font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* As-of Date Selector for Aging Reports */
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Aging Reference Date (As Of):
            </span>
            <input
              type="date"
              value={asOfDate || new Date().toISOString().split('T')[0]}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => onAsOfDateChange?.(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
            />
            {asOfDate && asOfDate !== new Date().toISOString().split('T')[0] && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Viewing historical ledger balance as of {asOfDate}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Row: Granularity & Drafts & Custom Range */}
      {!isAgingTab && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-gray-100 text-xs">
          {/* Custom Date Range */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 font-medium">Custom Range:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  onSelectPreset('custom');
                  onStartDateChange(e.target.value);
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  onSelectPreset('custom');
                  onEndDateChange(e.target.value);
                }}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Granularity & Options */}
          <div className="flex items-center gap-4 flex-wrap">
            {showGranularity && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 font-medium">Bucket:</span>
                <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                  {(['day', 'week', 'month', 'quarter'] as ReportGranularity[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => onGranularityChange(g)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition cursor-pointer ${
                        granularity === g
                          ? 'bg-white text-teal-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showDraftsToggle && (
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700">
                <input
                  type="checkbox"
                  checked={includeDrafts}
                  onChange={(e) => onIncludeDraftsChange(e.target.checked)}
                  className="w-4 h-4 rounded-sm border-gray-300 text-teal-700 focus:ring-teal-500"
                />
                <span className="text-xs font-medium">Include Draft Invoices</span>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
