import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  FileText,
  Info,
  Sliders,
  X,
  ArrowRight
} from 'lucide-react';

export interface SeasonalPricingTableProps {
  priceCharts?: any[];
  basePrice?: number;
  durationDays?: number;
  title?: string;
  subtitle?: string;
  currency?: string;
  depositPercentage?: number | string;
  onEnquire?: (tierOrChart?: any) => void;
  onCustomize?: () => void;
}

interface PricingRowData {
  id: string | number;
  category: string;
  travelPeriod: string;
  price2Pax: number;
  price4Pax: number;
  price6Pax: number;
  deposit: string;
  availability: string;
  notes?: string;
  rawChart?: any;
}

export const SeasonalPricingTable: React.FC<SeasonalPricingTableProps> = ({
  priceCharts,
  basePrice,
  durationDays,
  title = "Seasonal Rates & Pricing",
  subtitle = "Compare package rates, inclusions and payment options for your selected travel period.",
  currency = "USD",
  depositPercentage = "25%",
  onEnquire,
  onCustomize
}) => {
  const [selectedNoteChart, setSelectedNoteChart] = useState<any | null>(null);

  // Determine current year for fallback dates
  const currentYear = new Date().getFullYear();

  // Helper to format currency
  const formatPrice = (val: number) => {
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Build rows from priceCharts or standard 3-tier matrix (Luxury, Mid-Range, Budget)
  const rows: PricingRowData[] = React.useMemo(() => {
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
          price2Pax: p2,
          price4Pax: p4,
          price6Pax: p6,
          deposit: depositText,
          availability: chart.availability || 'Available',
          notes: chart.notes,
          rawChart: chart
        };
      });
    }

    // Default 3-tier breakdown if no charts provided (matching design spec)
    const midBase = basePrice && basePrice > 0 ? basePrice : 2065;
    const luxuryBase = Math.round(midBase * 1.605);
    const budgetBase = Math.round(midBase * 0.55);

    const defaultTravelPeriod = `Jan 01 – Dec 31, ${currentYear}`;

    return [
      {
        id: 'tier-luxury',
        category: 'Luxury',
        travelPeriod: defaultTravelPeriod,
        price2Pax: luxuryBase,
        price4Pax: Math.round(luxuryBase * 0.864),
        price6Pax: Math.round(luxuryBase * 0.758),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
      },
      {
        id: 'tier-midrange',
        category: 'Mid-Range',
        travelPeriod: defaultTravelPeriod,
        price2Pax: midBase,
        price4Pax: Math.round(midBase * 0.864),
        price6Pax: Math.round(midBase * 0.748),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
      },
      {
        id: 'tier-budget',
        category: 'Budget',
        travelPeriod: defaultTravelPeriod,
        price2Pax: budgetBase,
        price4Pax: Math.round(budgetBase * 0.867),
        price6Pax: Math.round(budgetBase * 0.762),
        deposit: typeof depositPercentage === 'number' ? `${depositPercentage}%` : depositPercentage,
        availability: 'Available',
      }
    ];
  }, [priceCharts, basePrice, currentYear, depositPercentage]);

  const handleEnquire = (row: PricingRowData) => {
    if (onEnquire) {
      onEnquire(row.rawChart || row);
    } else if (onCustomize) {
      onCustomize();
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

      {/* Main Pricing Table Container */}
      <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-xs">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            {/* Top Header Row */}
            <tr className="bg-gray-50 border-b border-gray-300 text-xs font-bold text-gray-800 tracking-wider">
              <th scope="col" rowSpan={2} className="py-3 px-4 border-r border-gray-300 uppercase text-center md:text-left align-middle font-bold text-gray-900 bg-gray-100/70">
                PACKAGE<br />CATEGORY
              </th>
              <th scope="col" rowSpan={2} className="py-3 px-4 border-r border-gray-300 uppercase text-center align-middle font-bold text-gray-900 bg-gray-100/70">
                TRAVEL<br />PERIOD
              </th>
              <th scope="col" colSpan={3} className="py-2.5 px-4 border-r border-gray-300 uppercase text-center font-bold text-gray-900 bg-gray-100/90">
                PRICE FROM ({currency} PER PERSON)
              </th>
              <th scope="col" rowSpan={2} className="py-3 px-4 border-r border-gray-300 uppercase text-center align-middle font-bold text-gray-900 bg-gray-100/70">
                BOOKING<br />DEPOSIT
              </th>
              <th scope="col" rowSpan={2} className="py-3 px-4 border-r border-gray-300 uppercase text-center align-middle font-bold text-gray-900 bg-gray-100/70">
                AVAILABILITY
              </th>
              <th scope="col" rowSpan={2} className="py-3 px-4 uppercase text-center align-middle font-bold text-gray-900 bg-gray-100/70">
                ACTION
              </th>
            </tr>

            {/* Sub Header for PAX Tiers */}
            <tr className="bg-gray-50/90 border-b border-gray-300 text-xs font-bold text-gray-800 tracking-wider">
              <th scope="col" className="py-2 px-3 border-r border-gray-300 text-center bg-gray-50 font-bold">
                2 PAX
              </th>
              <th scope="col" className="py-2 px-3 border-r border-gray-300 text-center bg-gray-50 font-bold">
                4 PAX
              </th>
              <th scope="col" className="py-2 px-3 border-r border-gray-300 text-center bg-gray-50 font-bold">
                6 PAX
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-300 text-sm">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-teal/5 transition-colors duration-150 group"
              >
                {/* Package Category */}
                <td className="py-4 px-4 border-r border-gray-300 font-bold text-gray-900 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-serif">{row.category}</span>
                    {row.notes && (
                      <button
                        type="button"
                        onClick={() => setSelectedNoteChart(row.rawChart || row)}
                        className="p-1 text-teal hover:text-teal-dark hover:bg-teal/10 rounded transition-colors"
                        title="View details & notes"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>

                {/* Travel Period */}
                <td className="py-4 px-4 border-r border-gray-300 text-center text-gray-700 font-medium whitespace-nowrap">
                  {row.travelPeriod}
                </td>

                {/* 2 PAX Price */}
                <td className="py-4 px-3 border-r border-gray-300 text-center font-bold text-gray-900 whitespace-nowrap">
                  <span>{formatPrice(row.price2Pax)}</span>
                  <span className="text-xs text-gray-500 font-normal ml-1">pp</span>
                </td>

                {/* 4 PAX Price */}
                <td className="py-4 px-3 border-r border-gray-300 text-center font-bold text-gray-900 whitespace-nowrap">
                  <span>{formatPrice(row.price4Pax)}</span>
                  <span className="text-xs text-gray-500 font-normal ml-1">pp</span>
                </td>

                {/* 6 PAX Price */}
                <td className="py-4 px-3 border-r border-gray-300 text-center font-bold text-gray-900 whitespace-nowrap">
                  <span>{formatPrice(row.price6Pax)}</span>
                  <span className="text-xs text-gray-500 font-normal ml-1">pp</span>
                </td>

                {/* Booking Deposit */}
                <td className="py-4 px-4 border-r border-gray-300 text-center font-semibold text-gray-800 whitespace-nowrap">
                  {row.deposit}
                </td>

                {/* Availability */}
                <td className="py-4 px-4 border-r border-gray-300 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {row.availability}
                  </span>
                </td>

                {/* Action CTA */}
                <td className="py-4 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleEnquire(row)}
                    className="inline-flex items-center justify-center text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline uppercase tracking-wider py-1.5 px-3 rounded hover:bg-teal/10 transition-colors cursor-pointer border border-transparent hover:border-teal/20"
                  >
                    ENQUIRE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notice below Table */}
      <p className="mt-4 text-xs md:text-sm text-gray-700 leading-relaxed font-sans">
        <span className="font-bold text-gray-900">Please Note:</span> Prices are per person and vary based on the number of travelers. Larger groups enjoy lower per-person rates.
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
            <span>Final pricing may vary according to travel dates, hotel availability, seasonality, room type, and selected inclusions.</span>
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
          onClick={() => onCustomize ? onCustomize() : (onEnquire && onEnquire({ type: 'custom' }))}
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
                <span>Rate Notes & Conditions</span>
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
