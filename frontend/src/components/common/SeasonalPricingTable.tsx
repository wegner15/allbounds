import React from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, DollarSign, Info, ShieldCheck, Tag } from 'lucide-react';
import type { PriceChart } from '../../lib/hooks/usePackagePriceCharts';

interface SeasonalPricingTableProps {
  priceCharts?: any[];
  title?: string;
  subtitle?: string;
}


export const SeasonalPricingTable: React.FC<SeasonalPricingTableProps> = ({
  priceCharts,
  title = "Seasonal Rates & Pricing",
  subtitle = "View transparent seasonal rates, deposit options, and inclusions for upcoming travel periods."
}) => {
  if (!priceCharts || priceCharts.length === 0) return null;

  const activeCharts = priceCharts.filter(c => c.is_active !== false);
  if (activeCharts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 my-8">
      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-teal/10 rounded-xl text-teal">
          <Calendar className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl lg:text-2xl font-serif font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Desktop / Tablet Pricing Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">Season / Period</th>
              <th className="py-3.5 px-4">Date Range</th>
              <th className="py-3.5 px-4">Standard Rate</th>
              <th className="py-3.5 px-4">Booking Deposit</th>
              <th className="py-3.5 px-4 rounded-r-xl">Notes & Special Conditions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {activeCharts.map((chart) => {
              const bookingPrice = chart.booking_price ?? chart.price;
              const hasDepositDiscount = bookingPrice < chart.price;

              return (
                <tr key={chart.id} className="hover:bg-teal/5 transition-colors duration-150">
                  {/* Title */}
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-teal flex-shrink-0" />
                      <span>{chart.title}</span>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                    <span className="font-medium">{format(parseISO(chart.start_date), 'MMM dd, yyyy')}</span>
                    <span className="text-gray-400 mx-1 border-b border-gray-200"></span>
                    <span className="font-medium">{format(parseISO(chart.end_date), 'MMM dd, yyyy')}</span>
                  </td>

                  {/* Standard Price */}
                  <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                    ${chart.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>

                  {/* Booking Price */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1 font-bold text-teal">
                      <span>${bookingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      {hasDepositDiscount && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 rounded-full">
                          Deposit Special
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Notes */}
                  <td className="py-4 px-4 text-gray-600 text-xs leading-relaxed max-w-xs">
                    {chart.notes ? (
                      <div className="flex items-start space-x-1.5 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{chart.notes}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-normal">Standard terms apply</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-teal" /> Prices in USD. All rates guaranteed upon booking confirmation.
        </span>
      </div>
    </div>
  );
};

export default SeasonalPricingTable;
