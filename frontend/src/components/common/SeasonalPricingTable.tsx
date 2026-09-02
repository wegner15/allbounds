import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  ArrowRight,
  Hotel as HotelIcon,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';
import type { PriceChartHotelOption } from '../../lib/types/api';

export interface SeasonalPricingTableProps {
  priceCharts?: any[];
  basePrice?: number;
  durationDays?: number;
  packageType?: string;
  title?: string;
  subtitle?: string;
  currency?: string;
  depositPercentage?: number | string;
  onEnquire?: (tierOrChart?: any, selectedHotel?: PriceChartHotelOption | null) => void;
  onCustomize?: (tierOrChart?: any, selectedHotel?: PriceChartHotelOption | null) => void;
}

interface SafariPricingRowData {
  id: string | number;
  category: string;
  travelPeriod: string;
  basePrice2Pax: number;
  basePrice4Pax: number;
  basePrice6Pax: number;
  deposit: string;
  availability: string;
  notes?: string;
  rawChart?: any;
  hotelOptions: PriceChartHotelOption[];
}

export const SeasonalPricingTable: React.FC<SeasonalPricingTableProps> = ({
  priceCharts,
  basePrice = 1245,
  durationDays = 8,
  packageType = 'holiday',
  title = "Seasonal Rates & Packages",
  subtitle = "Select your travel season for instant pricing and direct booking (rates based on min. 2 travellers sharing)",
  currency = "USD",
  depositPercentage = "25%",
  onEnquire,
  onCustomize
}) => {
  const [selectedNoteChart, setSelectedNoteChart] = useState<any | null>(null);
  const currentYear = new Date().getFullYear();

  // Active seasonal price charts
  const activePriceCharts = useMemo(() => {
    return (priceCharts || []).filter((pc: any) => pc.is_active !== false);
  }, [priceCharts]);

  // Extract unique hotel options / accommodation tiers across active charts (if configured)
  const uniqueHotelTiers = useMemo(() => {
    const tierMap = new Map<string, PriceChartHotelOption>();
    activePriceCharts.forEach((chart: any) => {
      if (Array.isArray(chart.hotel_options)) {
        chart.hotel_options.forEach((opt: PriceChartHotelOption) => {
          if (opt.is_active !== false) {
            const label = opt.room_type || opt.hotel?.name || 'Standard Accommodation';
            if (!tierMap.has(label)) {
              tierMap.set(label, opt);
            }
          }
        });
      }
    });
    return Array.from(tierMap.entries()).map(([label, opt]) => ({
      label,
      hotelId: opt.hotel_id,
      sampleOption: opt,
    }));
  }, [activePriceCharts]);

  // Helper to trigger booking / customize
  const handleSelectRate = (chart: any, hotelOption: PriceChartHotelOption | null = null) => {
    const finalPrice = hotelOption
      ? (chart.price || basePrice) + (hotelOption.price_supplement || 0)
      : (chart.price || basePrice);

    const payload = {
      ...chart,
      price: finalPrice,
      calculated_price: finalPrice,
      selectedHotel: hotelOption,
      price_chart_id: chart.id,
    };

    if (onCustomize) {
      onCustomize(payload, hotelOption);
    } else if (onEnquire) {
      onEnquire(payload, hotelOption);
    }
  };

  // Helper to trigger inquiry
  const handleInquireRate = (chart: any, hotelOption: PriceChartHotelOption | null = null) => {
    const finalPrice = hotelOption
      ? (chart.price || basePrice) + (hotelOption.price_supplement || 0)
      : (chart.price || basePrice);

    const payload = {
      ...chart,
      price: finalPrice,
      calculated_price: finalPrice,
      selectedHotel: hotelOption,
      price_chart_id: chart.id,
    };

    if (onEnquire) {
      onEnquire(payload, hotelOption);
    } else if (onCustomize) {
      onCustomize(payload, hotelOption);
    }
  };

  // =========================================================================
  // 1. HOTEL-STYLE MATRIX TABLE (For Holiday Packages & General Tour Packages)
  // =========================================================================
  const isHolidayPackage = packageType !== 'safari';

  // Compute true lowest starting from price across all active seasons and options
  const calculatedStartingPrice = useMemo(() => {
    const prices: number[] = [];
    activePriceCharts.forEach((chart: any) => {
      if (typeof chart.price === 'number' && chart.price > 0) {
        prices.push(chart.price);
      }
      if (Array.isArray(chart.hotel_options)) {
        chart.hotel_options.forEach((opt: any) => {
          if (opt.is_active !== false && typeof opt.price_supplement === 'number') {
            const p = (chart.price || 0) + opt.price_supplement;
            if (p > 0) prices.push(p);
          }
        });
      }
    });
    if (prices.length > 0) {
      return Math.min(...prices);
    }
    return basePrice || 0;
  }, [activePriceCharts, basePrice]);

  if (isHolidayPackage) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/90 p-5 sm:p-7 md:p-8 my-8 text-gray-800 animate-fade-in">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-teal-800 bg-teal/10 px-2.5 py-0.5 rounded-full border border-teal/20">
                Starting from USD {calculatedStartingPrice.toLocaleString()} / person
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-playfair tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {activePriceCharts.length > 0 ? (
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 shadow-2xs">
                {activePriceCharts.length} {activePriceCharts.length === 1 ? 'Season Rate' : 'Seasonal Rates'} Available
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                Inquiry Available
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              Min. 2 Pax
            </span>
          </div>
        </div>

        {/* Pricing Matrix Table */}
        {activePriceCharts.length > 0 ? (
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full border-collapse border border-gray-200 rounded-xl overflow-hidden text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th className="py-4 px-5 text-sm font-bold text-gray-900 min-w-[220px]">
                    Season / Travel Period
                  </th>

                  {/* If hotel options exist across charts, render tier columns */}
                  {uniqueHotelTiers.length > 0 ? (
                    uniqueHotelTiers.map((tier) => (
                      <th
                        key={tier.label}
                        className="py-4 px-4 text-sm font-bold text-gray-900 text-center whitespace-nowrap min-w-[170px]"
                      >
                        {tier.label}
                      </th>
                    ))
                  ) : (
                    <th className="py-4 px-4 text-sm font-bold text-gray-900 text-center min-w-[180px]">
                      Rate per Person (Min. 2 Pax)
                    </th>
                  )}

                  <th className="py-4 px-5 text-sm font-bold text-gray-900 text-right min-w-[130px]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {activePriceCharts.map((chart: any) => {
                  const startDateStr = chart.start_date
                    ? format(parseISO(chart.start_date), 'MMM dd, yyyy')
                    : '';
                  const endDateStr = chart.end_date
                    ? format(parseISO(chart.end_date), 'MMM dd, yyyy')
                    : '';

                  return (
                    <tr key={chart.id} className="hover:bg-teal/5 transition-colors group">
                      {/* Column 1: Season Title & Date Range */}
                      <td className="py-4 px-5 align-middle">
                        <div className="font-bold text-base text-gray-900 group-hover:text-teal transition-colors">
                          {chart.title}
                        </div>
                        {(startDateStr || endDateStr) && (
                          <div className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>
                              {startDateStr} – {endDateStr}
                            </span>
                          </div>
                        )}
                        {chart.notes && (
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 italic leading-tight">
                            {chart.notes}
                          </p>
                        )}
                      </td>

                      {/* Column(s): Pricing Tiers / Rates */}
                      {uniqueHotelTiers.length > 0 ? (
                        uniqueHotelTiers.map((tier, tIdx) => {
                          const matchOpt = (chart.hotel_options || []).find(
                            (opt: PriceChartHotelOption) =>
                              (opt.room_type === tier.label || opt.hotel?.name === tier.label) &&
                              opt.is_active !== false
                          );

                          // If the chart has NO attached hotel options at all (e.g. Winter with standard base rate),
                          // display the base seasonal rate in the primary column instead of an empty dash!
                          const shouldFallbackToBase = !matchOpt && (!chart.hotel_options || chart.hotel_options.length === 0) && tIdx === 0;

                          if (matchOpt || shouldFallbackToBase) {
                            const optToUse = matchOpt || null;
                            const finalPrice = optToUse
                              ? (chart.price || basePrice) + (optToUse.price_supplement || 0)
                              : (chart.price || basePrice);
                            const perDay = durationDays && durationDays > 0 ? Math.round(finalPrice / durationDays) : null;

                            return (
                              <td key={tier.label} className="py-4 px-3 text-center align-middle">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRate(chart, optToUse)}
                                  className="w-full p-3 rounded-xl border border-gray-200/80 bg-gray-50 hover:bg-white hover:border-teal hover:shadow-md transition-all duration-200 text-center group/cell cursor-pointer"
                                  title={`Book ${chart.title} - ${optToUse?.room_type || optToUse?.hotel?.name || 'Standard Rate'}`}
                                >
                                  <div className="text-base font-extrabold text-gray-900 group-hover/cell:text-teal transition-colors">
                                    USD {finalPrice.toLocaleString()}
                                    <span className="text-[11px] font-normal text-gray-500 ml-1">/ person</span>
                                  </div>
                                  {perDay && (
                                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                      ~${perDay}/day • {durationDays} Days
                                    </div>
                                  )}
                                  <div className="text-[10px] text-teal-800 font-semibold mt-0.5">
                                    Min. 2 travellers
                                  </div>
                                  {shouldFallbackToBase && (
                                    <div className="text-[10px] text-gray-500 italic mt-0.5">
                                      Standard Base Rate
                                    </div>
                                  )}
                                </button>
                              </td>
                            );
                          }

                          // Option not available for this specific tier
                          return (
                            <td key={tier.label} className="py-4 px-3 text-center align-middle text-gray-300 font-medium text-sm">
                              —
                            </td>
                          );
                        })
                      ) : (
                        /* Single Rate Column per Season */
                        <td className="py-4 px-4 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleSelectRate(chart, null)}
                            className="w-full p-3 rounded-xl border border-gray-200/80 bg-gray-50 hover:bg-white hover:border-teal hover:shadow-md transition-all duration-200 text-center group/cell cursor-pointer"
                            title={`Select ${chart.title} rate`}
                          >
                            <div className="text-base font-extrabold text-gray-900 group-hover/cell:text-teal transition-colors">
                              USD {(chart.price || basePrice).toLocaleString()}
                              <span className="text-[11px] font-normal text-gray-500 ml-1">/ person</span>
                            </div>
                            {durationDays && durationDays > 0 && (
                              <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                                ~${Math.round((chart.price || basePrice) / durationDays)}/day • {durationDays} Days
                              </div>
                            )}
                            <div className="text-[10px] text-teal-800 font-semibold mt-0.5">
                              Min. 2 travellers sharing
                            </div>
                          </button>
                        </td>
                      )}

                      {/* Column: Action Button */}
                      <td className="py-4 px-5 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => handleSelectRate(chart, chart.hotel_options?.[0] || null)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal hover:bg-teal-dark text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <span>Book Season</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Fallback when no active price charts configured */
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-teal" />
                <h4 className="font-bold text-gray-900 text-base font-playfair">
                  Tailored Rates & Seasonal Inquiries
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Rates for this tour start from{' '}
                <span className="font-bold text-gray-900">
                  USD {basePrice.toLocaleString()} per person
                </span>{' '}
                (minimum 2 travellers sharing). Flexible travel dates and custom group quotes available upon request.
              </p>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectRate({ price: basePrice })}
                className="px-5 py-2.5 bg-teal hover:bg-teal-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Book This Tour
              </button>
              <button
                type="button"
                onClick={() => handleInquireRate({ price: basePrice })}
                className="px-5 py-2.5 border border-gray-300 hover:border-gray-400 bg-white text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Request Quote
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. SAFARI-STYLE PAX TABLE (Fallback for packages explicitly tagged 'safari')
  // =========================================================================
  const rows: SafariPricingRowData[] = (activePriceCharts.length > 0
    ? activePriceCharts
    : [
        {
          id: 'tier-standard',
          title: 'Standard Safari Season',
          price: basePrice,
        },
      ]
  ).map((chart: any, idx: number) => {
    const startDate = chart.start_date
      ? format(parseISO(chart.start_date), 'MMM dd')
      : `Jan 01`;
    const endDate = chart.end_date
      ? format(parseISO(chart.end_date), 'MMM dd, yyyy')
      : `Dec 31, ${currentYear}`;
    const travelPeriod = `${startDate} – ${endDate}`;

    const p2 = chart.price_2pax ?? chart.price ?? basePrice;
    const p4 = chart.price_4pax ?? Math.round(p2 * 0.865);
    const p6 = chart.price_6pax ?? Math.round(p2 * 0.75);

    return {
      id: chart.id || `chart-${idx}`,
      category: chart.title || 'Standard Season',
      travelPeriod,
      basePrice2Pax: p2,
      basePrice4Pax: p4,
      basePrice6Pax: p6,
      deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
      availability: 'Available',
      notes: chart.notes,
      rawChart: chart,
      hotelOptions: (chart.hotel_options || []).filter((opt: PriceChartHotelOption) => opt.is_active !== false),
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 lg:p-10 my-8 text-gray-800">
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 italic text-sm md:text-base mt-1.5 leading-relaxed">
          {subtitle}
        </p>
      </div>

      <div className="space-y-6">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-gray-200 hover:border-teal/50 bg-white transition-all overflow-hidden shadow-xs hover:shadow-sm"
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50/90 to-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100">
              <div>
                <span className="text-lg font-serif font-bold text-gray-900">{row.category}</span>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Travel Period: <span className="text-gray-700 font-semibold">{row.travelPeriod}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-2xs">
                <div className="text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">2 PAX (Min)</div>
                  <div className="text-base font-bold text-gray-900">
                    ${row.basePrice2Pax.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                <div className="text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">4 PAX</div>
                  <div className="text-base font-bold text-gray-900">
                    ${row.basePrice4Pax.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                <div className="text-center">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">6 PAX</div>
                  <div className="text-base font-bold text-gray-900">
                    ${row.basePrice6Pax.toLocaleString()} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSelectRate(row.rawChart || row, null)}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-quote-btn hover:bg-quote-btn-dark text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <span>Book Package</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonalPricingTable;
