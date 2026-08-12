import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, FileText, Info, ShieldCheck, Tag, X } from 'lucide-react';

interface SeasonalPricingTableProps {
  priceCharts?: any[];
  title?: string;
  subtitle?: string;
}

export const SeasonalPricingTable: React.FC<SeasonalPricingTableProps> = ({
  priceCharts,
  title = "Seasonal Rates & Pricing",
  subtitle = "View transparent seasonal rates and deposit options for upcoming travel periods."
}) => {
  const [selectedNoteChart, setSelectedNoteChart] = useState<any | null>(null);

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
              <th className="py-3.5 px-4 rounded-r-xl">Booking Deposit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {activeCharts.map((chart) => {
              const bookingPrice = chart.booking_price ?? chart.price;

              return (
                <tr key={chart.id} className="hover:bg-teal/5 transition-colors duration-150">
                  {/* Title */}
                  <td className="py-4 px-4 font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-teal flex-shrink-0" />
                      <span>{chart.title}</span>
                    </div>
                  </td>

                  {/* Dates: From ... to ... */}
                  <td className="py-4 px-4 text-gray-700 whitespace-nowrap">
                    <span className="text-gray-500 font-normal mr-1">From</span>
                    <span className="font-semibold text-gray-900">{format(parseISO(chart.start_date), 'MMM dd, yyyy')}</span>
                    <span className="text-gray-500 font-normal mx-1.5">to</span>
                    <span className="font-semibold text-gray-900">{format(parseISO(chart.end_date), 'MMM dd, yyyy')}</span>
                  </td>

                  {/* Standard Price */}
                  <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span>${chart.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      {chart.notes && (
                        <button
                          type="button"
                          onClick={() => setSelectedNoteChart(chart)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-teal bg-teal/10 hover:bg-teal/20 rounded-full transition-colors cursor-pointer"
                          title="Click to view pricing notes"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Notes</span>
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Booking Price */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="font-bold text-teal">
                      ${bookingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </div>
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

      {/* Notes Modal */}
      {selectedNoteChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              type="button"
              onClick={() => setSelectedNoteChart(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-teal/10 text-teal rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-serif font-bold text-gray-900">{selectedNoteChart.title}</h4>
                <p className="text-xs text-gray-500">
                  From {format(parseISO(selectedNoteChart.start_date), 'MMM dd, yyyy')} to {format(parseISO(selectedNoteChart.end_date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed space-y-2">
              <div className="flex items-center space-x-2 text-teal font-semibold text-xs uppercase tracking-wider mb-1">
                <Info className="w-4 h-4" />
                <span>Rate Notes & Conditions</span>
              </div>
              <p className="whitespace-pre-line text-gray-800">{selectedNoteChart.notes}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNoteChart(null)}
                className="px-5 py-2 bg-teal hover:bg-teal-dark text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonalPricingTable;
