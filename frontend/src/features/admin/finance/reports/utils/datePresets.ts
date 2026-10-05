import type { ReportGranularity } from '../../../../../lib/types/finance';

export type DatePresetKey =
  | 'ytd'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'last_30d'
  | 'last_12m'
  | 'all_time'
  | 'custom';

export interface DatePreset {
  key: DatePresetKey;
  label: string;
  startDate: string;
  endDate: string;
  suggestedGranularity: ReportGranularity;
}

const toIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getDatePresets = (today: Date = new Date()): Record<DatePresetKey, DatePreset> => {
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-indexed

  // 1. This Month
  const thisMonthStart = new Date(y, m, 1);
  const thisMonthEnd = new Date(y, m + 1, 0);

  // 2. Last Month
  const lastMonthStart = new Date(y, m - 1, 1);
  const lastMonthEnd = new Date(y, m, 0);

  // 3. This Quarter
  const qStartMonth = Math.floor(m / 3) * 3;
  const thisQuarterStart = new Date(y, qStartMonth, 1);
  const thisQuarterEnd = new Date(y, qStartMonth + 3, 0);

  // 4. Last Quarter
  const lastQStartMonth = qStartMonth - 3;
  const lastQuarterStart = new Date(y, lastQStartMonth, 1);
  const lastQuarterEnd = new Date(y, lastQStartMonth + 3, 0);

  // 5. YTD
  const ytdStart = new Date(y, 0, 1);

  // 6. Last 30 Days
  const last30Start = new Date(today);
  last30Start.setDate(today.getDate() - 29);

  // 7. Last 12 Months
  const last12Start = new Date(y - 1, m, 1);

  return {
    ytd: {
      key: 'ytd',
      label: 'Year to Date',
      startDate: toIso(ytdStart),
      endDate: toIso(today),
      suggestedGranularity: 'month',
    },
    this_month: {
      key: 'this_month',
      label: 'This Month',
      startDate: toIso(thisMonthStart),
      endDate: toIso(thisMonthEnd),
      suggestedGranularity: 'day',
    },
    last_month: {
      key: 'last_month',
      label: 'Last Month',
      startDate: toIso(lastMonthStart),
      endDate: toIso(lastMonthEnd),
      suggestedGranularity: 'day',
    },
    this_quarter: {
      key: 'this_quarter',
      label: 'This Quarter',
      startDate: toIso(thisQuarterStart),
      endDate: toIso(thisQuarterEnd),
      suggestedGranularity: 'week',
    },
    last_quarter: {
      key: 'last_quarter',
      label: 'Last Quarter',
      startDate: toIso(lastQuarterStart),
      endDate: toIso(lastQuarterEnd),
      suggestedGranularity: 'week',
    },
    last_30d: {
      key: 'last_30d',
      label: 'Last 30 Days',
      startDate: toIso(last30Start),
      endDate: toIso(today),
      suggestedGranularity: 'day',
    },
    last_12m: {
      key: 'last_12m',
      label: 'Last 12 Months',
      startDate: toIso(last12Start),
      endDate: toIso(today),
      suggestedGranularity: 'month',
    },
    all_time: {
      key: 'all_time',
      label: 'All Time',
      startDate: '',
      endDate: '',
      suggestedGranularity: 'month',
    },
    custom: {
      key: 'custom',
      label: 'Custom Range',
      startDate: '',
      endDate: '',
      suggestedGranularity: 'month',
    },
  };
};
