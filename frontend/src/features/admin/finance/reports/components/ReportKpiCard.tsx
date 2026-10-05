import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ReportKpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  deltaPercent?: number | null;
  deltaLabel?: string;
  variant?: 'teal' | 'emerald' | 'rose' | 'amber' | 'purple' | 'blue';
  icon?: React.ReactNode;
}

export const ReportKpiCard: React.FC<ReportKpiCardProps> = ({
  label,
  value,
  subtext,
  deltaPercent,
  deltaLabel,
  variant = 'teal',
  icon,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'emerald':
        return {
          border: 'border-l-emerald-600',
          bg: 'from-white to-emerald-50/20',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        };
      case 'rose':
        return {
          border: 'border-l-rose-600',
          bg: 'from-white to-rose-50/20',
          text: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
        };
      case 'amber':
        return {
          border: 'border-l-amber-600',
          bg: 'from-white to-amber-50/20',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
        };
      case 'purple':
        return {
          border: 'border-l-purple-600',
          bg: 'from-white to-purple-50/20',
          text: 'text-purple-700',
          badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
        };
      case 'blue':
        return {
          border: 'border-l-blue-600',
          bg: 'from-white to-blue-50/20',
          text: 'text-blue-700',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
        };
      case 'teal':
      default:
        return {
          border: 'border-l-teal-700',
          bg: 'from-white to-teal-50/20',
          text: 'text-gray-900',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-100',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <div
      className={`p-4 bg-gradient-to-b ${v.bg} rounded-xl border border-gray-200/80 border-l-4 ${v.border} shadow-xs flex flex-col justify-between transition-all`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="my-2">
        <p className={`text-xl sm:text-[22px] font-black tracking-tight ${v.text} tabular-nums truncate`}>
          {value}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
        <span className="truncate">{subtext || '—'}</span>
        {deltaPercent !== null && deltaPercent !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
              deltaPercent >= 0
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {deltaPercent >= 0 ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {deltaPercent >= 0 ? `+${deltaPercent}%` : `${deltaPercent}%`}
            {deltaLabel && ` ${deltaLabel}`}
          </span>
        )}
      </div>
    </div>
  );
};
