import React from 'react';
import { formatUsd } from '../utils/formatters';

interface BarDataPoint {
  label: string;
  valueA: number;
  labelA?: string;
  valueB?: number;
  labelB?: string;
}

interface PeriodicBarChartProps {
  title: string;
  subtitle?: string;
  data: BarDataPoint[];
  colorA?: string;
  colorB?: string;
  height?: number;
}

export const PeriodicBarChart: React.FC<PeriodicBarChartProps> = ({
  title,
  subtitle,
  data,
  colorA = '#0d9488', // Teal
  colorB = '#10b981', // Emerald
  height = 180,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center py-10 text-gray-400 text-xs">
        No periodic chart data available.
      </div>
    );
  }

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.valueA || 0, d.valueB || 0)),
    100
  );

  const chartHeight = height;
  const paddingBottom = 28;
  const paddingTop = 16;
  const innerHeight = chartHeight - paddingBottom - paddingTop;

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: colorA }} />
            <span className="font-medium text-gray-600">
              {data[0]?.labelA || 'Primary'}
            </span>
          </div>
          {data[0]?.valueB !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: colorB }} />
              <span className="font-medium text-gray-600">
                {data[0]?.labelB || 'Secondary'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="w-full overflow-x-auto pt-2">
        <div className="min-w-[420px]">
          <svg
            className="w-full"
            height={chartHeight}
            viewBox={`0 0 ${data.length * 60 + 40} ${chartHeight}`}
            preserveAspectRatio="none"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.33, 0.66, 1].map((ratio, i) => {
              const y = paddingTop + innerHeight * (1 - ratio);
              return (
                <g key={i}>
                  <line
                    x1="30"
                    y1={y}
                    x2={data.length * 60 + 30}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray={ratio > 0 && ratio < 1 ? '4 4' : 'none'}
                    strokeWidth="1"
                  />
                  <text
                    x="24"
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    {formatUsd(maxVal * ratio, false)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, idx) => {
              const xCenter = 45 + idx * 60;
              const hasB = d.valueB !== undefined;
              const barWidth = hasB ? 14 : 22;

              const heightA = Math.max(3, (d.valueA / maxVal) * innerHeight);
              const yA = paddingTop + innerHeight - heightA;

              const heightB = hasB ? Math.max(3, ((d.valueB || 0) / maxVal) * innerHeight) : 0;
              const yB = paddingTop + innerHeight - heightB;

              return (
                <g key={idx} className="group cursor-pointer">
                  {/* Bar A */}
                  <rect
                    x={hasB ? xCenter - barWidth - 1 : xCenter - barWidth / 2}
                    y={yA}
                    width={barWidth}
                    height={heightA}
                    rx="3"
                    fill={colorA}
                    className="transition-all hover:opacity-85"
                  >
                    <title>{`${d.labelA || 'A'}: ${formatUsd(d.valueA)}`}</title>
                  </rect>

                  {/* Bar B */}
                  {hasB && (
                    <rect
                      x={xCenter + 1}
                      y={yB}
                      width={barWidth}
                      height={heightB}
                      rx="3"
                      fill={colorB}
                      className="transition-all hover:opacity-85"
                    >
                      <title>{`${d.labelB || 'B'}: ${formatUsd(d.valueB || 0)}`}</title>
                    </rect>
                  )}

                  {/* X-axis Label */}
                  <text
                    x={xCenter}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#64748b"
                    fontWeight="500"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

interface BreakdownProgressItem {
  label: string;
  count?: number;
  amount: number;
  percentage: number;
  highlight?: boolean;
}

interface BreakdownProgressListProps {
  title: string;
  subtitle?: string;
  items: BreakdownProgressItem[];
  color?: string;
}

export const BreakdownProgressList: React.FC<BreakdownProgressListProps> = ({
  title,
  subtitle,
  items,
  color = '#0d9488',
}) => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-xs text-gray-400 font-mono">{items.length} items</span>
      </div>

      <div className="space-y-3.5 pt-1">
        {items.length > 0 ? (
          items.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-800 truncate pr-2">{item.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.count !== undefined && (
                    <span className="text-gray-400 font-mono text-[11px]">
                      {item.count} {item.count === 1 ? 'doc' : 'docs'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-900 font-bold border border-teal-200/60 tabular-nums">
                    {formatUsd(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(2, item.percentage))}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 text-center py-6">No breakdown data available.</p>
        )}
      </div>
    </div>
  );
};
