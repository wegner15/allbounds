import React, { useRef } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Loader2,
  MapPin,
  Printer,
  Users,
  CheckCircle2,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Compass,
} from 'lucide-react';
import type { Quote, QuoteResult } from '../../../../lib/api/tourQuotes';
import type { CompanyFinanceSettings } from '../../../../lib/types/finance';
import { DocumentHeader } from '../components/DocumentHeader';
import { DocumentStamp } from '../components/DocumentStamp';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';
import { getCloudflareImageUrl } from '../../../../utils/cloudflareImageUtils';
import '../components/PrintStyles.css';

interface Props {
  quote: Quote;
  results: QuoteResult[];
  settings?: CompanyFinanceSettings | null;
  onEdit?: () => void;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (iso?: string | null) => {
  if (!iso) return '-';
  try {
    const [y, m, d] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[m - 1]} ${y}`;
  } catch {
    return iso;
  }
};

const calculateDaysNights = (start?: string | null, end?: string | null) => {
  if (!start || !end) return null;
  try {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) {
      return { days: diff + 1, nights: diff };
    }
  } catch {
    return null;
  }
  return null;
};

export const QuoteDocumentView: React.FC<Props> = ({ quote, results, settings, onEdit }) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();

  const duration = calculateDaysNights(quote.start_date, quote.end_date);
  const optionalItems = quote.items.filter((it) => it.is_optional);
  const includedItems = quote.items.filter((it) => !it.is_optional);

  const handleDownload = () => {
    downloadPdf(
      documentRef.current,
      `Quotation-${quote.quote_number || 'TQ'}-${(quote.name || 'Tour').replace(/\s+/g, '_')}.pdf`,
      { contentWidth: 1120 }
    );
  };

  const statusBadge = (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        quote.status === 'approved'
          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          : quote.status === 'converted'
          ? 'bg-blue-50 text-blue-800 border border-blue-200'
          : 'bg-amber-50 text-amber-800 border border-amber-200'
      }`}
    >
      <CheckCircle2 className="w-3.5 h-3.5" /> {quote.status}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Control Action Bar (Hidden during PDF export / print) */}
      <div className="bg-white border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm no-print">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Client-facing quotation view for</span>
          <span className="font-semibold text-gray-900">{quote.quote_number}</span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            Confidential supplier rates are hidden
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3.5 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded-md font-medium text-gray-700"
            >
              Back to Editor
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm border border-gray-300 hover:bg-gray-50 rounded-md font-medium text-gray-700"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-teal-800 hover:bg-teal-900 text-white rounded-md font-medium shadow-sm disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Quote PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Printable / Capturable Document Container */}
      <div
        ref={documentRef}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 sm:p-12 w-full print:shadow-none print:border-none print:p-0 print-container"
      >
        {/* Brand Header */}
        <DocumentHeader
          title="TOUR QUOTATION"
          subtitle="Tailor-made Travel Proposal"
          settings={settings}
          statusBadge={statusBadge}
        />

        {/* Quotation Meta Summary Box */}
        <div className="bg-gradient-to-br from-teal-50/60 to-gray-50 rounded-xl border border-teal-100 p-5 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Quote Reference</p>
              <p className="font-bold text-gray-900 mt-0.5 text-base">{quote.quote_number}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {formatDate(quote.created_at?.split('T')[0])}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Client / Group</p>
              <p className="font-semibold text-gray-900 mt-0.5">
                {quote.client_name || 'Valued Traveller(s)'}
              </p>
              {quote.lead_reference && (
                <p className="text-xs text-gray-500 mt-0.5">Ref: {quote.lead_reference}</p>
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Destination & Style</p>
              <p className="font-semibold text-gray-900 mt-0.5">
                {quote.destination || 'East Africa'}
              </p>
              <p className="text-xs text-teal-800 capitalize mt-0.5">
                {quote.category || 'Holiday Safari'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">Duration & Dates</p>
              <p className="font-semibold text-gray-900 mt-0.5">
                {quote.start_date ? formatDate(quote.start_date) : 'Open dates'}
                {quote.end_date && ` → ${formatDate(quote.end_date)}`}
              </p>
              {duration && (
                <p className="text-xs text-gray-600 font-medium mt-0.5">
                  {duration.days} Days / {duration.nights} Nights
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-teal-100/80 mt-4 pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
            <div>
              <span className="font-medium text-gray-700">Package:</span>{' '}
              <span className="font-semibold text-gray-900 text-sm">{quote.name}</span>
            </div>
            {quote.prepared_by && (
              <div>
                <span>Prepared by:</span>{' '}
                <span className="font-semibold text-gray-800">{quote.prepared_by}</span>
              </div>
            )}
          </div>
        </div>

        {/* Group Size Pricing Table */}
        <div className="mb-10 avoid-break">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-700" />
              Package Investment by Group Size
            </h3>
            <span className="text-xs text-gray-500">
              Prices quoted in <span className="font-semibold text-gray-800">{quote.currency}</span>
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-teal-900 text-white text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Group Size / Configuration</th>
                  <th className="py-3 px-4 font-semibold text-center">Travellers</th>
                  <th className="py-3 px-4 font-semibold text-center">Rooms</th>
                  <th className="py-3 px-4 font-semibold text-right">Price per Person</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Package Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Pricing is being finalized.
                    </td>
                  </tr>
                ) : (
                  results.map((r, i) => (
                    <tr
                      key={r.scenario_id || i}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'}
                    >
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        {r.label || `${r.pax} Travellers`}
                        {r.foc_count > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                            Includes {r.foc_count} FOC Leader
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-700 font-medium">
                        {r.pax} pax
                        {r.foc_count > 0 && (
                          <span className="block text-[11px] text-gray-500">
                            ({r.paying_pax} paying)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-700">
                        {r.rooms ? `${r.rooms} room(s)` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base font-bold text-teal-800">
                          {quote.currency} {fmt(r.price_per_person)}
                        </span>
                        <span className="block text-[11px] text-gray-500">per person sharing</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-gray-900 text-sm">
                          {quote.currency} {fmt(r.final_total)}
                        </span>
                        {quote.tax_enabled && (
                          <span className="block text-[10.5px] text-gray-500">
                            {quote.tax_inclusive
                              ? `Includes ${quote.tax_name || 'tax'}`
                              : `+ ${quote.tax_name || 'tax'} included in total`}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              * Costs are calculated based on sharing occupancy. Single room supplements available upon request.
            </span>
            {quote.tax_enabled && quote.tax_rate > 0 && (
              <span>
                {quote.tax_name || 'Tax'} ({quote.tax_rate}%) is fully accounted for in the quotation.
              </span>
            )}
          </div>
        </div>

        {/* Day-by-Day Itinerary Narrative */}
        {quote.days.length > 0 && (
          <div className="mb-10">
            <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-teal-700" />
              Detailed Day-by-Day Itinerary
            </h3>

            <div className="space-y-4">
              {quote.days.map((day) => {
                const dayCostItems = quote.items.filter(
                  (it) => it.day_number === day.day_number && !it.is_optional
                );
                return (
                  <div
                    key={day.day_number}
                    className="border border-gray-200 rounded-xl p-4 bg-white avoid-break hover:border-teal-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-800 text-white font-bold text-xs">
                          D{day.day_number}
                        </span>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {day.title || `Day ${day.day_number}: Safari & Exploration`}
                        </h4>
                      </div>
                    </div>

                    <div className={day.image_url ? 'grid grid-cols-1 md:grid-cols-12 gap-4 items-start' : ''}>
                      <div className={day.image_url ? 'md:col-span-8' : ''}>
                        {day.description ? (
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                            {day.description}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 italic mb-2">
                            Activities, sights, and arrangements as detailed below.
                          </p>
                        )}

                        {dayCostItems.length > 0 && (
                          <div className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 mt-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                              Arrangements & Included Services:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {dayCostItems.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 text-xs bg-white text-gray-800 px-2 py-1 rounded border border-gray-200 shadow-2xs"
                                >
                                  {it.image_url && (
                                    <img
                                      src={getCloudflareImageUrl(it.image_url, 'thumbnail')}
                                      alt={it.description}
                                      crossOrigin="anonymous"
                                      className="w-4 h-4 rounded object-cover flex-shrink-0"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <span className="font-medium text-teal-800 capitalize">
                                    {it.component_type.replace('_', ' ')}:
                                  </span>
                                  <span>{it.description}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {day.image_url && (
                        <div className="md:col-span-4 flex-shrink-0">
                          <img
                            src={getCloudflareImageUrl(day.image_url, 'medium')}
                            alt={day.title || `Day ${day.day_number}`}
                            crossOrigin="anonymous"
                            className="w-full h-36 md:h-40 object-cover rounded-lg border border-gray-200 shadow-xs"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/home-heros/hero1.jpeg';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Package Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 avoid-break">
          {/* Inclusions */}
          <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/30">
            <h4 className="font-bold text-emerald-900 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              What Is Included in This Package
            </h4>
            <ul className="space-y-2 text-xs text-gray-700">
              {includedItems.map((it, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  {it.image_url && (
                    <img
                      src={getCloudflareImageUrl(it.image_url, 'thumbnail')}
                      alt={it.description}
                      crossOrigin="anonymous"
                      className="w-5 h-5 rounded object-cover border border-gray-200 flex-shrink-0 shadow-2xs"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span>
                    <strong className="capitalize text-gray-900">
                      {it.component_type.replace('_', ' ')}:
                    </strong>{' '}
                    {it.description}
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>Dedicated 24/7 in-country emergency support and tour coordination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                <span>All government taxes, park admission levies and tourism regulatory fees</span>
              </li>
            </ul>
          </div>

          {/* Exclusions */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
            <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-600" />
              Package Exclusions
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>International flights (unless explicitly specified in your package)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>Entry visa fees and border processing charges</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>Comprehensive medical & travel insurance (highly recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>Personal expenses, laundry, telephone calls, alcoholic beverages & luxury items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>Driver-guide and lodge staff gratuities / tips</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 font-bold mt-0.5">✕</span>
                <span>Optional excursions and activities listed below</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Optional Excursions (if any) */}
        {optionalItems.length > 0 && (
          <div className="mb-10 avoid-break border border-amber-200 rounded-xl p-5 bg-amber-50/20">
            <h4 className="font-bold text-amber-950 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Optional Activities & Excursions (Available upon Request)
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              These activities can be seamlessly integrated into your itinerary. Prices are quoted separately and not included in the main package total.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-amber-200 text-gray-600 font-semibold">
                    <th className="py-1.5 px-2">Activity / Excursion</th>
                    <th className="py-1.5 px-2">Type</th>
                    <th className="py-1.5 px-2 text-right">Price per Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {optionalItems.map((opt, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 font-medium text-gray-900 flex items-center gap-2">
                        {opt.image_url && (
                          <img
                            src={getCloudflareImageUrl(opt.image_url, 'thumbnail')}
                            alt={opt.description}
                            crossOrigin="anonymous"
                            className="w-6 h-6 rounded object-cover border border-gray-200 flex-shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <span>{opt.description}</span>
                      </td>
                      <td className="py-2 px-2 capitalize text-gray-600">
                        {opt.component_type.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-amber-900">
                        {quote.currency} {fmt(opt.unit_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes & Booking Terms */}
        {quote.notes && (
          <div className="mb-8 avoid-break border-t border-gray-200 pt-5">
            <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
              Important Notes & Booking Conditions:
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-lg p-3 border border-gray-200">
              {quote.notes}
            </p>
          </div>
        )}

        {/* Banking Details Snapshot (for client payment) */}
        {settings?.bank_accounts && settings.bank_accounts.length > 0 && (
          <div className="mb-8 avoid-break bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-800" />
              Settlement & Bank Wire Instructions:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              {settings.bank_accounts.slice(0, 2).map((b, bi) => (
                <div key={bi} className="bg-white p-2.5 rounded border border-gray-200">
                  <p className="font-bold text-teal-900">{b.bank_name}</p>
                  <p>Account Name: <span className="font-semibold">{b.account_name}</span></p>
                  <p>Account No.: <span className="font-semibold">{b.account_number}</span></p>
                  {b.swift_bic && <p>SWIFT / BIC: <span className="font-semibold">{b.swift_bic}</span></p>}
                  {b.currency && <p>Currency: <span className="font-semibold">{b.currency}</span></p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Footer: Stamp & Sign-off */}
        <div className="border-t-2 border-teal-800 pt-6 mt-8 flex flex-wrap items-end justify-between gap-6 avoid-break">
          <div className="max-w-md text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-900 uppercase">Allbound Travel Services Limited</p>
            <p>Your Dream Holiday. Designed. Booked. Perfected.</p>
            <p>Entebbe Road, Plot 335, Block 13 Najjanankumbi, Kampala, Uganda</p>
            <p>Web: www.allboundvacations.com | Email: bookings@allboundvacations.com</p>
          </div>

          <div className="flex flex-col items-center sm:items-end">
            <DocumentStamp
              status={quote.status === 'approved' ? 'approved' : 'quote'}
              documentNumber={quote.quote_number}
              date={quote.approved_at || quote.created_at || new Date().toISOString()}
              width={200}
            />
            <p className="text-[10px] text-gray-400 mt-2 tracking-wider uppercase">
              Official Quotation Authorization
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
