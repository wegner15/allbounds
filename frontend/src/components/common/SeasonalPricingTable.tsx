import React, { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Info,
  Sliders,
  X,
  ArrowRight,
  Hotel as HotelIcon,
  Star,
  Check,
  Sparkles
} from 'lucide-react';
import type { PriceChartHotelOption } from '../../lib/types/api';

export interface SeasonalPricingTableProps {
  priceCharts?: any[];
  basePrice?: number;
  durationDays?: number;
  title?: string;
  subtitle?: string;
  currency?: string;
  depositPercentage?: number | string;
  onEnquire?: (tierOrChart?: any, selectedHotel?: PriceChartHotelOption | null) => void;
  onCustomize?: (tierOrChart?: any, selectedHotel?: PriceChartHotelOption | null) => void;
}

interface PricingRowData {
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
  basePrice,
  durationDays,
  title = "Seasonal Rates & Pricing",
  subtitle = "Compare package rates, inclusions, hotel accommodation options, and payment options for your selected travel period.",
  currency = "USD",
  depositPercentage = "25%",
  onEnquire,
  onCustomize
}) => {
  const [selectedNoteChart, setSelectedNoteChart] = useState<any | null>(null);
  const [selectedHotelsByChart, setSelectedHotelsByChart] = useState<Record<string | number, PriceChartHotelOption | null>>({});

  // Determine current year for fallback dates
  const currentYear = new Date().getFullYear();

  // Helper to format currency
  const formatPrice = (val: number) => {
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Build rows from priceCharts or fallback matrix
  const rows: PricingRowData[] = useMemo(() => {
    const activeCharts = (priceCharts || []).filter(c => c.is_active !== false);

    if (activeCharts.length > 0) {
      return activeCharts.map((chart, idx) => {
        const startDate = chart.start_date ? (typeof chart.start_date === 'string' && chart.start_date.includes('T') ? format(parseISO(chart.start_date), 'MMM dd') : chart.start_date) : `Jan 01`;
        const endDate = chart.end_date ? (typeof chart.end_date === 'string' && chart.end_date.includes('T') ? format(parseISO(chart.end_date), 'MMM dd, yyyy') : chart.end_date) : `Dec 31, ${currentYear}`;
        const travelPeriod = `${startDate} – ${endDate}`;

        const p2 = chart.price_2pax ?? chart.price ?? (basePrice || 2065);
        const p4 = chart.price_4pax ?? (chart.price ? Math.round(chart.price * 0.865) : (basePrice ? Math.round(basePrice * 0.865) : 1785));
        const p6 = chart.price_6pax ?? (chart.price ? Math.round(chart.price * 0.75) : (basePrice ? Math.round(basePrice * 0.75) : 1545));

        const depositText = chart.booking_price
          ? (chart.booking_price <= 100 ? `${chart.booking_price}%` : `$${chart.booking_price.toLocaleString()}`)
          : typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage;

        return {
          id: chart.id || `chart-${idx}`,
          category: chart.title || 'Standard',
          travelPeriod,
          basePrice2Pax: p2,
          basePrice4Pax: p4,
          basePrice6Pax: p6,
          deposit: depositText,
          availability: chart.availability || 'Available',
          notes: chart.notes,
          rawChart: chart,
          hotelOptions: (chart.hotel_options || []).filter((opt: PriceChartHotelOption) => opt.is_active !== false)
        };
      });
    }

    // Default 3-tier breakdown if no charts provided
    const midBase = basePrice && basePrice > 0 ? basePrice : 2065;
    const luxuryBase = Math.round(midBase * 1.605);
    const budgetBase = Math.round(midBase * 0.55);
    const defaultTravelPeriod = `Jan 01 – Dec 31, ${currentYear}`;

    return [
      {
        id: 'tier-luxury',
        category: 'Luxury',
        travelPeriod: defaultTravelPeriod,
        basePrice2Pax: luxuryBase,
        basePrice4Pax: Math.round(luxuryBase * 0.864),
        basePrice6Pax: Math.round(luxuryBase * 0.758),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
        hotelOptions: []
      },
      {
        id: 'tier-midrange',
        category: 'Mid-Range',
        travelPeriod: defaultTravelPeriod,
        basePrice2Pax: midBase,
        basePrice4Pax: Math.round(midBase * 0.864),
        basePrice6Pax: Math.round(midBase * 0.748),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
        hotelOptions: []
      },
      {
        id: 'tier-budget',
        category: 'Budget',
        travelPeriod: defaultTravelPeriod,
        basePrice2Pax: budgetBase,
        basePrice4Pax: Math.round(budgetBase * 0.867),
        basePrice6Pax: Math.round(budgetBase * 0.762),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
        hotelOptions: []
      }
    ];
  }, [priceCharts, basePrice, currentYear, depositPercentage]);

  // Helper to get active selected hotel for a row
  const getSelectedHotelForRow = (row: PricingRowData): PriceChartHotelOption | null => {
    if (selectedHotelsByChart[row.id] !== undefined) {
      return selectedHotelsByChart[row.id];
    }
    if (row.hotelOptions && row.hotelOptions.length > 0) {
      const defaultOpt = row.hotelOptions.find(opt => opt.is_default) || row.hotelOptions[0];
      return defaultOpt;
    }
    return null;
  };

  const handleSelectHotel = (rowId: string | number, opt: PriceChartHotelOption | null) => {
    setSelectedHotelsByChart(prev => ({
      ...prev,
      [rowId]: opt
    }));
  };

  const handleEnquire = (row: PricingRowData) => {
    const selectedHotel = getSelectedHotelForRow(row);
    const supplement = selectedHotel?.price_supplement || 0;
    const finalPayload = {
      ...(row.rawChart || row),
      selectedHotel,
      calculated_price: row.basePrice2Pax + supplement,
      price: row.basePrice2Pax + supplement,
      price_chart_id: row.rawChart?.id
    };

    if (onEnquire) {
      onEnquire(finalPayload, selectedHotel);
    } else if (onCustomize) {
      onCustomize(finalPayload, selectedHotel);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 md:p-8 lg:p-10 my-8 text-gray-800">
      {/* Header Section */}
      <div className="border-b border-gray-100 pb-5 mb-6">
        <h2 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900 tracking-tight">
          {title}
        </h2>
        <p className="text-gray-600 italic text-sm md:text-base mt-1.5 leading-relaxed">
          {subtitle}
        </p>

        {/* Pricing Basis & Currency */}
        <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-700">
          <div>
            <span className="font-bold text-gray-900">Pricing basis:</span>{' '}
            <span>
              Per Person (pp) • {durationDays ? `${durationDays} Days / ${Math.max(1, durationDays - 1)} Nights` : 'Package duration as specified'}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-900">Currency:</span>{' '}
            <span className="font-semibold text-teal-700 bg-teal/10 px-2 py-0.5 rounded text-xs tracking-wider">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Main Pricing Rows */}
      <div className="space-y-6">
        {rows.map((row) => {
          const selectedHotel = getSelectedHotelForRow(row);
          const supplement = selectedHotel?.price_supplement || 0;
          const p2 = row.basePrice2Pax + supplement;
          const p4 = row.basePrice4Pax + supplement;
          const p6 = row.basePrice6Pax + supplement;

          return (
            <div
              key={row.id}
              className="rounded-xl border border-gray-200 hover:border-teal/50 bg-white transition-all overflow-hidden shadow-xs hover:shadow-sm"
            >
              {/* Top Row Header & Prices Table */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50/90 to-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-serif font-bold text-gray-900">{row.category}</span>
                    {row.notes && (
                      <button
                        type="button"
                        onClick={() => setSelectedNoteChart(row.rawChart || row)}
                        className="p-1 text-teal hover:text-teal-dark hover:bg-teal/10 rounded transition-colors"
                        title="View details & inclusions"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {row.availability}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Travel Period: <span className="text-gray-700 font-semibold">{row.travelPeriod}</span>
                  </p>
                </div>

                {/* PAX Price Tiers */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-2xs">
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">2 PAX</div>
                    <div className="text-base font-bold text-gray-900">
                      {formatPrice(p2)} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">4 PAX</div>
                    <div className="text-base font-bold text-gray-900">
                      {formatPrice(p4)} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                    </div>
                  </div>
                  <div className="h-6 w-px bg-gray-200 hidden sm:block" />
                  <div className="text-center">
                    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">6 PAX</div>
                    <div className="text-base font-bold text-gray-900">
                      {formatPrice(p6)} <span className="text-[11px] text-gray-400 font-normal">pp</span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button
                  type="button"
                  onClick={() => handleEnquire(row)}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-teal hover:bg-teal-dark text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all"
                >
                  <span>Book / Enquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hotel Accommodation Options Selector */}
              {row.hotelOptions && row.hotelOptions.length > 0 && (
                <div className="p-4 bg-gray-50/60">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <HotelIcon className="w-4 h-4 text-teal" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Select Accommodation Option:
                    </span>
                    <span className="text-xs text-gray-400 ml-1">(Prices update in real time)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {row.hotelOptions.map((opt, oIdx) => {
                      const isSelected = selectedHotel?.hotel_id === opt.hotel_id;
                      const hotelObj = opt.hotel;

                      return (
                        <div
                          key={opt.hotel_id || oIdx}
                          onClick={() => handleSelectHotel(row.id, opt)}
                          className={`cursor-pointer rounded-xl p-3 border transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-white border-teal ring-2 ring-teal/30 shadow-xs'
                              : 'bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {hotelObj?.image_url || hotelObj?.cover_image ? (
                                <img
                                  src={hotelObj.image_url || hotelObj.cover_image}
                                  alt={hotelObj?.name || 'Hotel'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <HotelIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-gray-900 truncate">
                                  {hotelObj?.name || `Hotel Option #${opt.hotel_id}`}
                                </span>
                                {hotelObj?.stars && (
                                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-600 flex-shrink-0">
                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 mr-0.5" />
                                    {hotelObj.stars}★
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-500 truncate">
                                {opt.room_type || hotelObj?.city || 'Standard Accommodation'}
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            {opt.price_supplement > 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                +${opt.price_supplement} pp
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal/10 text-teal border border-teal/20">
                                Included
                              </span>
                            )}
                            <div className="mt-1 flex justify-end">
                              <div
                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                                  isSelected ? 'bg-teal border-teal text-white' : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notice below Table */}
      <p className="mt-4 text-xs md:text-sm text-gray-700 leading-relaxed font-sans">
        <span className="font-bold text-gray-900">Please Note:</span> Rates are per person based on group size. Accommodation tier upgrades automatically adjust per person rates and deposit totals.
      </p>

      {/* Flexible Payment Options Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 mb-2">
          Flexible Payment Options
        </h3>
        <p className="text-sm md:text-base text-gray-700 leading-relaxed">
          <span className="font-bold text-gray-900">{depositPercentage} deposit to secure your booking</span> • Balance payable according to package booking terms.
        </p>
      </div>

      {/* Pricing Information Bullet Points */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 mb-3">
          Pricing Information
        </h3>
        <ul className="space-y-2 text-sm md:text-base text-gray-700">
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-700 mt-2 mr-3 flex-shrink-0" />
            <span>Prices are quoted in {currency} and are subject to availability.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-700 mt-2 mr-3 flex-shrink-0" />
            <span>Rates are confirmed and locked once the required booking deposit has been received.</span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-700 mt-2 mr-3 flex-shrink-0" />
            <span>Final pricing includes chosen hotel tier supplements, park fees, and ground transport.</span>
          </li>
        </ul>
      </div>

      {/* Customize My Trip Banner / CTA */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg md:text-xl font-serif font-bold text-gray-900 mb-1">
          Need something different?
        </h3>
        <p className="text-sm md:text-base text-gray-700 mb-4">
          Tell us your preferred dates, number of travellers and budget and we'll create a package specifically for you.
        </p>

        <button
          type="button"
          onClick={() => onCustomize ? onCustomize({ type: 'custom' }) : (onEnquire && onEnquire({ type: 'custom' }))}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs md:text-sm tracking-wider uppercase rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
        >
          <Sliders className="w-4 h-4 text-gray-900" />
          <span>CUSTOMIZE MY TRIP</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
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
                <h4 className="text-lg font-serif font-bold text-gray-900">{selectedNoteChart.title || selectedNoteChart.category}</h4>
                <p className="text-xs text-gray-500">
                  {selectedNoteChart.travelPeriod || 'Seasonal Rate Details'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed space-y-2">
              <div className="flex items-center space-x-2 text-teal font-semibold text-xs uppercase tracking-wider mb-1">
                <Info className="w-4 h-4" />
                <span>Rate Notes & Inclusions</span>
              </div>
              <p className="whitespace-pre-line text-gray-800">{selectedNoteChart.notes || 'Standard seasonal rates apply.'}</p>
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
