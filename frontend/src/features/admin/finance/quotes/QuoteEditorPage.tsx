import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  MapPin,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  tourQuotesApi,
  type Quote,
  type QuoteWrite,
  type QuoteItem,
  type QuoteResult,
  type CatalogueItem,
} from '../../../../lib/api/tourQuotes';
import { rateCardsApi, type RateCard } from '../../../../lib/api/rateCards';
import { clientsApi } from '../../../../lib/api/clients';
import { financeApi } from '../../../../lib/api/finance';
import type { CompanyFinanceSettings } from '../../../../lib/types/finance';
import { COST_BASES } from '../ratecards/RateCardModal';
import { STATUS_STYLE } from './QuotesListPage';
import { QuoteDocumentView } from './QuoteDocumentView';
import { QuoteImageInput } from './QuoteImageInput';
import { CatalogueCombobox } from './CatalogueCombobox';
import { CatalogueBrowserModal } from './CatalogueBrowserModal';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';

const COMPONENTS = [
  'accommodation',
  'transport',
  'activity',
  'meal',
  'park_fee',
  'guide',
  'flight',
  'visa',
  'insurance',
  'operational',
  'other',
];

const SERVICE_TO_COMPONENT: Record<string, string> = {
  accommodation: 'accommodation',
  transport: 'transport',
  activity: 'activity',
  park_fee: 'park_fee',
  guide: 'guide',
  flight: 'flight',
  meal: 'meal',
};

const blank = (): QuoteWrite => ({
  name: '',
  destination: '',
  category: '',
  client_id: null,
  client_name: '',
  lead_reference: '',
  start_date: '',
  end_date: '',
  currency: 'USD',
  pricing_method: 'markup',
  pricing_value: 20,
  contingency_percent: 0,
  tax_enabled: false,
  tax_name: 'VAT',
  tax_rate: 0,
  tax_inclusive: false,
  notes: '',
  scenarios: [{ label: '', pax: 2, foc_count: 0, rooms: 1 }],
  days: [],
  items: [],
  discounts: [],
});

const inp =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow bg-white';
const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const QuoteEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'editor' | 'quotation' | 'matrix'>('editor');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<QuoteWrite>(blank());
  const [results, setResults] = useState<QuoteResult[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [cards, setCards] = useState<RateCard[]>([]);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [catalogueModalFor, setCatalogueModalFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const hiddenDocRef = useRef<HTMLDivElement>(null);
  const { isGenerating: isDirectGenerating, downloadPdf: directDownloadPdf } = usePdfDownload();

  const locked = !!quote && (quote.status === 'approved' || quote.status === 'converted');

  const hydrate = (q: Quote) => {
    setQuote(q);
    setForm({ ...blank(), ...q });
    setResults(q.results || []);
  };

  useEffect(() => {
    clientsApi.getClients({ limit: 200 }).then((r) => setClients(r.items)).catch(() => {});
    rateCardsApi.list({ limit: 200 }).then(setCards).catch(() => {});
    financeApi.getSettings().then(setSettings).catch(() => {});
    if (id) {
      tourQuotesApi
        .get(Number(id))
        .then(hydrate)
        .catch((e) => setError(e?.response?.data?.detail || 'Failed to load quote'));
    }
  }, [id]);

  // Live preview (debounced) from the unsaved form
  const timer = useRef<number>();
  useEffect(() => {
    if (locked || form.scenarios.length === 0) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      tourQuotesApi
        .preview(clean(form))
        .then((r) => {
          setResults(r);
          setError(null);
        })
        .catch((e) => setError(typeof e?.response?.data?.detail === 'string' ? e.response.data.detail : null));
    }, 350);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line
  }, [form, locked]);

  const clean = (f: QuoteWrite): QuoteWrite => ({
    ...f,
    start_date: f.start_date || null,
    end_date: f.end_date || null,
    items: f.items.filter((i) => i.description.trim()),
  });

  const set = <K extends keyof QuoteWrite>(k: K, v: QuoteWrite[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setItem = (i: number, p: Partial<QuoteItem>) =>
    set(
      'items',
      form.items.map((it, x) => (x === i ? { ...it, ...p } : it))
    );

  const addItem = (day: number | null, extra: Partial<QuoteItem> = {}) =>
    set('items', [
      ...form.items,
      {
        day_number: day,
        component_type: 'other',
        description: '',
        cost_basis: 'per_person',
        unit_cost: 0,
        tax_amount: 0,
        qty: 1,
        is_optional: false,
        sort_order: form.items.length,
        ...extra,
      },
    ]);

  const addDay = () =>
    set('days', [
      ...form.days,
      { day_number: form.days.length + 1, title: '', description: '' },
    ]);

  const removeDay = (n: number) =>
    setForm((f) => ({
      ...f,
      days: f.days
        .filter((d) => d.day_number !== n)
        .map((d) => ({ ...d, day_number: d.day_number > n ? d.day_number - 1 : d.day_number })),
      items: f.items
        .filter((i) => i.day_number !== n)
        .map((i) => ({
          ...i,
          day_number: i.day_number && i.day_number > n ? i.day_number - 1 : i.day_number,
        })),
    }));

  const pickRate = (card: RateCard, rateIdx: number) => {
    const r = card.items[rateIdx];
    const day = pickerFor;
    addItem(day === 0 ? null : day, {
      component_type: SERVICE_TO_COMPONENT[card.service_type] || 'other',
      description: `${card.supplier_name ? card.supplier_name + ' - ' : ''}${r.name}`,
      cost_basis: r.cost_basis,
      unit_cost: r.rate,
      tax_amount: r.tax_amount,
      capacity: r.capacity ?? null,
      supplier_id: card.supplier_id,
      rate_card_item_id: r.id ?? null,
    });
    if (card.currency !== form.currency) {
      setNotice(
        `Rate card currency is ${card.currency}, quote is ${form.currency}. Rates were copied as entered; convert if needed.`
      );
    }
    setPickerFor(null);
  };

  const handleAddCatalogueCostItem = (cat: CatalogueItem, dayNum: number | null) => {
    addItem(dayNum === 0 ? null : dayNum, {
      description: cat.name + (cat.stars ? ` (★${cat.stars})` : ''),
      component_type: cat.suggested_component_type,
      cost_basis: cat.suggested_cost_basis,
      image_url: cat.image_url || null,
      unit_cost: cat.default_price && cat.default_price > 0 ? cat.default_price : 0,
    });
  };

  const handleSetDayHighlight = (cat: CatalogueItem, dayNum: number) => {
    set(
      'days',
      form.days.map((x) => {
        if (x.day_number !== dayNum) return x;
        const currentDesc = x.description ? x.description.trim() : '';
        const catDesc = (cat.description || cat.summary || '').trim();
        const newDesc = currentDesc ? `${currentDesc}\n\n${catDesc}` : catDesc;
        const pickedImg = cat.image_url || x.image_url || null;
        return {
          ...x,
          title: x.title && x.title.trim() ? x.title : cat.name,
          description: newDesc,
          image_url: pickedImg,
          images: pickedImg ? [pickedImg] : (x.images || []),
        };
      })
    );
  };

  const save = async () => {
    if (!form.name.trim()) return setError('Quote name is required');
    try {
      setSaving(true);
      setError(null);
      const body = clean(form);
      const q = quote ? await tourQuotesApi.update(quote.id, body) : await tourQuotesApi.create(body);
      if (!quote) navigate(`/admin/finance/quotes/${q.id}`, { replace: true });
      hydrate(q);
      setNotice('Quote saved successfully');
    } catch (e: any) {
      const d = e?.response?.data?.detail;
      setError(typeof d === 'string' ? d : e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const transition = async (s: 'submitted' | 'approved' | 'rejected' | 'draft') => {
    if (!quote) return;
    try {
      setError(null);
      hydrate(await tourQuotesApi.setStatus(quote.id, s));
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Status change failed');
    }
  };

  const convert = async () => {
    if (!quote) return;
    const sid =
      quote.scenarios.length === 1
        ? quote.scenarios[0].id
        : Number(
            window.prompt(
              `Select scenario to invoice: \n${quote.scenarios
                .map((s) => `ID ${s.id}: ${s.pax} travellers (${s.label || ''})`)
                .join('\n')}`
            )
          );
    if (!sid) return;
    try {
      const inv = await tourQuotesApi.convert(quote.id, { scenario_id: sid });
      navigate(`/admin/finance/invoices/${inv.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Conversion failed');
    }
  };

  const handleQuickDownloadPdf = () => {
    if (activeTab === 'quotation') {
      // Already on the quotation view
      const doc = document.querySelector('.print-container') as HTMLElement;
      if (doc) {
        directDownloadPdf(
          doc,
          `Quotation-${quote?.quote_number || 'TQ'}-${(form.name || 'Tour').replace(/\s+/g, '_')}.pdf`,
          { contentWidth: 1120 }
        );
      }
    } else {
      setActiveTab('quotation');
      setTimeout(() => {
        const doc = document.querySelector('.print-container') as HTMLElement;
        if (doc) {
          directDownloadPdf(
            doc,
            `Quotation-${quote?.quote_number || 'TQ'}-${(form.name || 'Tour').replace(/\s+/g, '_')}.pdf`,
            { contentWidth: 1120 }
          );
        }
      }, 150);
    }
  };

  const dayItems = (d: number | null) =>
    form.items.map((it, idx) => ({ it, idx })).filter((x) => x.it.day_number === d);

  const itemRows = (d: number | null) =>
    dayItems(d).map(({ it, idx }) => (
      <tr key={idx} className="align-top hover:bg-gray-50/60">
        <td className="pr-2 pb-2 w-10 text-center align-middle">
          <QuoteImageInput
            mode="compact"
            value={it.image_url}
            disabled={locked}
            onChange={(url) => setItem(idx, { image_url: url })}
          />
        </td>
        <td className="pr-2 pb-2 min-w-[240px]">
          <CatalogueCombobox
            value={it.description}
            disabled={locked}
            destination={form.destination}
            onChange={(val) => setItem(idx, { description: val })}
            onSelectCatalogueItem={(cat) => {
              setItem(idx, {
                description: cat.name + (cat.stars ? ` (★${cat.stars})` : ''),
                component_type: cat.suggested_component_type,
                cost_basis: cat.suggested_cost_basis,
                image_url: cat.image_url || it.image_url,
                unit_cost: cat.default_price && cat.default_price > 0 ? cat.default_price : it.unit_cost,
              });
            }}
          />
        </td>
        <td className="pr-2 pb-2 min-w-[130px]">
          <select
            disabled={locked}
            className={inp}
            value={it.component_type}
            onChange={(e) => setItem(idx, { component_type: e.target.value })}
          >
            {COMPONENTS.map((c) => (
              <option key={c} value={c}>
                {c.replace('_', ' ')}
              </option>
            ))}
          </select>
        </td>
        <td className="pr-2 pb-2 min-w-[130px]">
          <select
            disabled={locked}
            className={inp}
            value={it.cost_basis}
            onChange={(e) => setItem(idx, { cost_basis: e.target.value as QuoteItem['cost_basis'] })}
          >
            {COST_BASES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </td>
        <td className="pr-2 pb-2 w-28">
          <input
            disabled={locked}
            type="number"
            min={0}
            step="0.01"
            className={inp}
            value={it.unit_cost}
            onChange={(e) => setItem(idx, { unit_cost: Number(e.target.value) })}
          />
        </td>
        <td className="pr-2 pb-2 w-20">
          <input
            disabled={locked}
            type="number"
            min={0}
            step="any"
            className={inp}
            title="Nights, days or transfer count"
            value={it.qty}
            onChange={(e) => setItem(idx, { qty: Number(e.target.value) })}
          />
        </td>
        <td className="pr-2 pb-2 w-20">
          {it.cost_basis === 'per_vehicle' && (
            <input
              disabled={locked}
              type="number"
              min={1}
              className={inp}
              placeholder="Seats"
              value={it.capacity ?? ''}
              onChange={(e) => setItem(idx, { capacity: e.target.value ? Number(e.target.value) : null })}
            />
          )}
        </td>
        <td className="pr-2 pb-2 text-center align-middle">
          <input
            disabled={locked}
            type="checkbox"
            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
            checked={it.is_optional}
            onChange={(e) => setItem(idx, { is_optional: e.target.checked })}
          />
        </td>
        <td className="pb-2 text-center align-middle">
          {!locked && (
            <button
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete cost line"
              onClick={() => set('items', form.items.filter((_, x) => x !== idx))}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>
    ));

  const itemTable = (d: number | null) => (
    <div className="overflow-x-auto">
      {dayItems(d).length > 0 && (
        <table className="w-full text-sm mb-2">
          <thead className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="pb-2 w-10 text-center">Photo</th>
              <th className="pb-2">Cost Line Description</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Cost Basis</th>
              <th className="pb-2">Unit Cost ({form.currency})</th>
              <th className="pb-2">Qty</th>
              <th className="pb-2">Capacity</th>
              <th className="pb-2 text-center">Optional</th>
              <th></th>
            </tr>
          </thead>
          <tbody>{itemRows(d)}</tbody>
        </table>
      )}
      {!locked && (
        <div className="flex flex-wrap gap-2 text-sm pt-1">
          <button
            className="text-teal-800 hover:text-teal-900 font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 transition-colors"
            onClick={() => addItem(d)}
          >
            <Plus className="w-4 h-4" /> Add cost line
          </button>
          <button
            className="text-blue-700 hover:text-blue-800 font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
            onClick={() => setPickerFor(d ?? 0)}
          >
            <BookOpen className="w-4 h-4" /> From supplier rate card
          </button>
          <button
            type="button"
            className="text-emerald-800 hover:text-emerald-900 font-medium inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors"
            onClick={() => setCatalogueModalFor(d ?? 0)}
            title="Browse existing Hotels, Attractions, and Activities"
          >
            <Sparkles className="w-4 h-4 text-emerald-700" /> Browse Catalogue
          </button>
        </div>
      )}
    </div>
  );

  const comps = useMemo(
    () => Array.from(new Set(results.flatMap((r) => Object.keys(r.cost_by_component)))),
    [results]
  );

  // Quick helper to construct a pseudo-quote object for preview in case of new/unsaved quote
  const previewQuote: Quote = useMemo(
    () => ({
      ...form,
      id: quote?.id || 0,
      quote_number: quote?.quote_number || 'TQ-DRAFT',
      status: quote?.status || 'draft',
      prepared_by: quote?.prepared_by || 'Staff Consultant',
      approved_by: quote?.approved_by || null,
      invoice_id: quote?.invoice_id || null,
      converted_scenario_id: quote?.converted_scenario_id || null,
      results,
    }),
    [quote, form, results]
  );

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white border rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link to="/admin/finance/quotes" className="hover:text-teal-700">
              Tour quotes
            </Link>
            <ChevronRight className="w-3 h-3 text-gray-400" />
            <span>{quote ? quote.quote_number : 'New Proposal'}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {quote ? quote.quote_number : 'New Tour Quote'}
            </h1>
            {quote && (
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  STATUS_STYLE[quote.status]
                }`}
              >
                {quote.status}
              </span>
            )}
            <span className="text-sm font-medium text-gray-500">
              {form.name || 'Untitled Package'}
            </span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {!locked && (
            <button
              disabled={saving}
              onClick={save}
              className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-md font-medium shadow-xs disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          )}

          <button
            onClick={handleQuickDownloadPdf}
            disabled={isDirectGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 hover:bg-gray-50 rounded-md font-medium text-gray-700 transition-colors disabled:opacity-50"
          >
            {isDirectGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-teal-700" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-teal-700" /> Download PDF
              </>
            )}
          </button>

          {quote?.status === 'draft' && (
            <button
              onClick={() => transition('submitted')}
              className="px-3.5 py-2 border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md font-medium transition-colors"
            >
              Submit for Approval
            </button>
          )}

          {quote?.status === 'submitted' && (
            <>
              <button
                onClick={() => transition('approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors"
              >
                Approve Quote
              </button>
              <button
                onClick={() => transition('rejected')}
                className="px-3.5 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors"
              >
                Reject
              </button>
            </>
          )}

          {(quote?.status === 'approved' ||
            quote?.status === 'rejected' ||
            quote?.status === 'submitted') && (
            <button
              onClick={() => transition('draft')}
              className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md font-medium transition-colors"
            >
              Reopen as Draft
            </button>
          )}

          {quote?.status === 'approved' && (
            <button
              onClick={convert}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-xs transition-colors"
            >
              Convert to Invoice
            </button>
          )}

          {quote?.invoice_id && (
            <Link
              to={`/admin/finance/invoices/${quote.invoice_id}`}
              className="px-4 py-2 border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium transition-colors"
            >
              View Converted Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-gray-200 gap-8">
        <button
          onClick={() => setActiveTab('editor')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'editor'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Compass className="w-4 h-4" /> Costing & Itinerary Editor
        </button>

        <button
          onClick={() => setActiveTab('quotation')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'quotation'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText className="w-4 h-4" /> Client Quotation (PDF Preview)
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'matrix'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Group Cost & Profit Matrix
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {notice && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 text-sm rounded-xl p-4 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-teal-700 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {locked && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-xl p-4">
          This quote is <strong>{quote!.status}</strong> and locked from editing.{' '}
          {quote!.status === 'approved' && 'Click "Reopen as Draft" above if you need to adjust numbers.'}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: FULL-WIDTH RESPONSIVE COSTING & ITINERARY EDITOR   */}
      {/* ========================================================= */}
      {activeTab === 'editor' && (
        <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Main Left Workspace: Details, Groups, Days & Costs (8 Columns) */}
          <div className="xl:col-span-8 space-y-6">
            {/* 1. Basic Package Information */}
            <section className="bg-white border rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-700" />
                Package Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="text-xs font-semibold text-gray-700 sm:col-span-2">
                  Package Name *
                  <input
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.name}
                    placeholder="e.g. 5-Day Murchison Falls & Chimpanzee Safari"
                    onChange={(e) => set('name', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Quote Currency
                  <input
                    disabled={locked}
                    className={`${inp} mt-1 font-semibold uppercase`}
                    maxLength={10}
                    value={form.currency}
                    onChange={(e) => set('currency', e.target.value.toUpperCase())}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Select Existing Client (Optional)
                  <select
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.client_id ?? ''}
                    onChange={(e) => {
                      const c = clients.find((x) => x.id === Number(e.target.value));
                      setForm((f) => ({
                        ...f,
                        client_id: c?.id ?? null,
                        client_name: c
                          ? c.company_name || [c.first_name, c.last_name].filter(Boolean).join(' ')
                          : f.client_name,
                      }));
                    }}
                  >
                    <option value="">- Enter manual client / walk-in -</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.company_name ||
                          [c.first_name, c.last_name].filter(Boolean).join(' ') ||
                          c.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Client / Lead Group Name
                  <input
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.client_name ?? ''}
                    placeholder="e.g. Henderson Family Group"
                    onChange={(e) => set('client_name', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Sales Enquiry / Lead Reference
                  <input
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.lead_reference ?? ''}
                    placeholder="e.g. INQ-2026-092"
                    onChange={(e) => set('lead_reference', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Destination(s)
                  <input
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.destination ?? ''}
                    placeholder="e.g. Uganda, Murchison Falls, Kibale"
                    onChange={(e) => set('destination', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Package Category
                  <input
                    disabled={locked}
                    className={`${inp} mt-1`}
                    value={form.category ?? ''}
                    placeholder="Safari, Beach, Honeymoon, Family..."
                    onChange={(e) => set('category', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Travel Departure Date
                  <input
                    disabled={locked}
                    type="date"
                    className={`${inp} mt-1`}
                    value={form.start_date ?? ''}
                    onChange={(e) => set('start_date', e.target.value)}
                  />
                </label>

                <label className="text-xs font-semibold text-gray-700">
                  Travel Return Date
                  <input
                    disabled={locked}
                    type="date"
                    className={`${inp} mt-1`}
                    value={form.end_date ?? ''}
                    onChange={(e) => set('end_date', e.target.value)}
                  />
                </label>
              </div>
            </section>

            {/* 2. Group Size Configurations (Scenarios) */}
            <section className="bg-white border rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-700" />
                    Target Group Sizes & Configurations
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Quoting for multiple group configurations at once. Fixed vehicle & guide charges are divided by paying travellers automatically.
                  </p>
                </div>
                {!locked && (
                  <button
                    onClick={() =>
                      set('scenarios', [
                        ...form.scenarios,
                        { label: '', pax: 4, foc_count: 0, rooms: 2 },
                      ])
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Group Size
                  </button>
                )}
              </div>

              <div className="space-y-2.5 pt-1">
                {form.scenarios.map((s, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 gap-3 items-center bg-gray-50/70 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="col-span-12 sm:col-span-4">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                        Configuration Label
                      </label>
                      <input
                        disabled={locked}
                        className={inp}
                        placeholder="e.g. 2 Pax (Couple), 4 Pax (Family)"
                        value={s.label ?? ''}
                        onChange={(e) =>
                          set(
                            'scenarios',
                            form.scenarios.map((x, k) => (k === i ? { ...x, label: e.target.value } : x))
                          )
                        }
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                        Total Travellers
                      </label>
                      <input
                        disabled={locked}
                        type="number"
                        min={1}
                        className={inp}
                        value={s.pax}
                        onChange={(e) =>
                          set(
                            'scenarios',
                            form.scenarios.map((x, k) =>
                              k === i ? { ...x, pax: Number(e.target.value) } : x
                            )
                          )
                        }
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                        FOC (Leader)
                      </label>
                      <input
                        disabled={locked}
                        type="number"
                        min={0}
                        title="Free of charge passengers (costs shared over paying guests)"
                        className={inp}
                        value={s.foc_count}
                        onChange={(e) =>
                          set(
                            'scenarios',
                            form.scenarios.map((x, k) =>
                              k === i ? { ...x, foc_count: Number(e.target.value) } : x
                            )
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                      <label className="text-[11px] font-semibold text-gray-600 block mb-0.5">
                        Rooms Required
                      </label>
                      <input
                        disabled={locked}
                        type="number"
                        min={0}
                        title="Number of accommodation rooms required for this group"
                        className={inp}
                        value={s.rooms}
                        onChange={(e) =>
                          set(
                            'scenarios',
                            form.scenarios.map((x, k) =>
                              k === i ? { ...x, rooms: Number(e.target.value) } : x
                            )
                          )
                        }
                      />
                    </div>
                    <div className="col-span-1 text-right">
                      {!locked && (
                        <button
                          disabled={form.scenarios.length === 1}
                          className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1.5"
                          title="Remove scenario"
                          onClick={() => set('scenarios', form.scenarios.filter((_, k) => k !== i))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Itinerary & Cost Components */}
            <section className="bg-white border rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-700" />
                    Day-by-Day Itinerary & Package Components
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Capture costs day-by-day. Mark items as <strong>Per Person</strong>, <strong>Per Group</strong>, <strong>Per Room</strong>, or <strong>Per Vehicle</strong>.
                  </p>
                </div>
                {!locked && (
                  <button
                    onClick={addDay}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Itinerary Day
                  </button>
                )}
              </div>

              {/* Shared Trip-Wide Costs */}
              <div className="border border-teal-100 bg-teal-50/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-teal-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    General & Shared Trip-Wide Costs (Entire Journey)
                  </span>
                  <span className="text-xs text-gray-500">
                    Vehicle hire, guides, planning fees, or general permits not tied to a single day
                  </span>
                </div>
                {itemTable(null)}
              </div>

              {/* Day-by-Day Accordion/Cards */}
              {form.days.map((d) => (
                <div
                  key={d.day_number}
                  className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-900 text-white font-bold text-xs flex-shrink-0">
                      D{d.day_number}
                    </span>
                    <input
                      disabled={locked}
                      className={`${inp} font-semibold`}
                      placeholder={`Day ${d.day_number} Title (e.g. Entebbe to Murchison Falls via Ziwa)`}
                      value={d.title ?? ''}
                      onChange={(e) =>
                        set(
                          'days',
                          form.days.map((x) =>
                            x.day_number === d.day_number ? { ...x, title: e.target.value } : x
                          )
                        )
                      }
                    />
                    {!locked && (
                      <button
                        type="button"
                        onClick={() => setCatalogueModalFor(d.day_number)}
                        className="text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors flex-shrink-0 whitespace-nowrap"
                        title="Import an existing attraction, park or hotel to set Day Theme, narrative, and photo"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Import Day Theme
                      </button>
                    )}
                    {!locked && (
                      <button
                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                        title="Delete day"
                        onClick={() => removeDay(d.day_number)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <textarea
                    disabled={locked}
                    className={inp}
                    rows={2}
                    placeholder="Client-facing itinerary narrative: activities, sights, accommodations, and arrangements for this day..."
                    value={d.description ?? ''}
                    onChange={(e) =>
                      set(
                        'days',
                        form.days.map((x) =>
                          x.day_number === d.day_number ? { ...x, description: e.target.value } : x
                        )
                      )
                    }
                  />

                  <QuoteImageInput
                    mode="banner"
                    value={d.image_url || (d.images && d.images[0]) || null}
                    disabled={locked}
                    label="Day Highlight Photo"
                    onChange={(url) =>
                      set(
                        'days',
                        form.days.map((x) =>
                          x.day_number === d.day_number
                            ? { ...x, image_url: url, images: url ? [url] : [] }
                            : x
                        )
                      )
                    }
                  />

                  <div className="pt-1">{itemTable(d.day_number)}</div>
                </div>
              ))}

              {!locked && (
                <button
                  onClick={addDay}
                  className="w-full py-2.5 border-2 border-dashed border-gray-300 hover:border-teal-600 rounded-xl text-sm font-semibold text-gray-600 hover:text-teal-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Next Itinerary Day
                </button>
              )}
            </section>
          </div>

          {/* Sticky Right Sidebar: Pricing Controls & Live Investment Matrix (4 Columns) */}
          <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-6 self-start">
            {/* Live Scenario Card Summary */}
            <div className="bg-gradient-to-br from-teal-900 to-teal-950 text-white rounded-xl p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-teal-800 pb-3">
                <h3 className="font-bold text-sm tracking-wide uppercase flex items-center gap-1.5 text-teal-200">
                  <TrendingUp className="w-4 h-4 text-teal-300" />
                  Live Investment Summary
                </h3>
                <span className="text-xs bg-teal-800/80 px-2 py-0.5 rounded font-mono">
                  {form.currency}
                </span>
              </div>

              {results.length === 0 ? (
                <p className="text-xs text-teal-200/80 italic py-2">
                  Add cost items to see live prices.
                </p>
              ) : (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div
                      key={r.scenario_id || i}
                      className="bg-teal-800/50 rounded-lg p-3 border border-teal-700/60"
                    >
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-teal-100">
                          {r.label || `${r.pax} Travellers`}
                        </span>
                        <span className="text-teal-300 font-mono text-[11px]">
                          {r.paying_pax} paying {r.foc_count > 0 && `+ ${r.foc_count} FOC`}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <div>
                          <span className="text-lg font-extrabold text-white">
                            {form.currency} {fmt(r.price_per_person)}
                          </span>
                          <span className="text-[11px] text-teal-300 block">per person</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-teal-200 block">
                            Total: <strong>{fmt(r.final_total)}</strong>
                          </span>
                          <span className="text-[10.5px] text-teal-400 block">
                            Profit: {fmt(r.expected_profit)} ({r.profit_margin_percent}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing Parameters & Controls */}
            <div className="bg-white border rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2">
                Pricing Method & Markups
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Pricing Formula</label>
                  <select
                    disabled={locked}
                    className={inp}
                    value={form.pricing_method}
                    onChange={(e) =>
                      set('pricing_method', e.target.value as 'markup' | 'margin')
                    }
                  >
                    <option value="markup">Markup on Direct Cost (Cost × (1 + %))</option>
                    <option value="margin">Target Profit Margin (Cost ÷ (1 − %))</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      {form.pricing_method === 'markup' ? 'Markup %' : 'Target Margin %'}
                    </label>
                    <input
                      disabled={locked}
                      type="number"
                      min={0}
                      step="0.1"
                      className={inp}
                      value={form.pricing_value}
                      onChange={(e) => set('pricing_value', Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Contingency %</label>
                    <input
                      disabled={locked}
                      type="number"
                      min={0}
                      step="0.1"
                      className={inp}
                      value={form.contingency_percent}
                      onChange={(e) => set('contingency_percent', Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Tax Option */}
                <div className="border-t pt-3 space-y-2.5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                    <input
                      disabled={locked}
                      type="checkbox"
                      className="w-4 h-4 text-teal-600 rounded border-gray-300"
                      checked={form.tax_enabled}
                      onChange={(e) => set('tax_enabled', e.target.checked)}
                    />
                    Enable Tax / VAT Treatment
                  </label>

                  {form.tax_enabled && (
                    <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-gray-600">Tax Name</label>
                          <input
                            disabled={locked}
                            className={inp}
                            value={form.tax_name ?? ''}
                            placeholder="VAT"
                            onChange={(e) => set('tax_name', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-600">Tax Rate (%)</label>
                          <input
                            disabled={locked}
                            type="number"
                            min={0}
                            step="0.1"
                            className={inp}
                            value={form.tax_rate}
                            onChange={(e) => set('tax_rate', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer pt-1">
                        <input
                          disabled={locked}
                          type="checkbox"
                          className="w-3.5 h-3.5 text-teal-600 rounded"
                          checked={form.tax_inclusive}
                          onChange={(e) => set('tax_inclusive', e.target.checked)}
                        />
                        Price is already tax-inclusive
                      </label>
                    </div>
                  )}
                </div>

                {/* Discounts & Price Discrepancies */}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">Discounts & Adjustments</span>
                    {!locked && (
                      <button
                        onClick={() =>
                          set('discounts', [
                            ...form.discounts,
                            { label: '', mode: 'percent', value: 0, scope: 'total' },
                          ])
                        }
                        className="text-[11px] text-teal-800 font-semibold hover:underline"
                      >
                        + Add discount
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Adjust price discrepancies (e.g. child discount, corporate concessions).
                  </p>

                  {form.discounts.map((d, i) => (
                    <div key={i} className="bg-gray-50 p-2.5 rounded border space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          disabled={locked}
                          className={`${inp} text-xs`}
                          placeholder="Reason / Discrepancy label"
                          value={d.label}
                          onChange={(e) =>
                            set(
                              'discounts',
                              form.discounts.map((x, k) => (k === i ? { ...x, label: e.target.value } : x))
                            )
                          }
                        />
                        {!locked && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => set('discounts', form.discounts.filter((_, k) => k !== i))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          disabled={locked}
                          className={`${inp} text-xs`}
                          value={d.mode}
                          onChange={(e) =>
                            set(
                              'discounts',
                              form.discounts.map((x, k) =>
                                k === i ? { ...x, mode: e.target.value as 'percent' | 'amount' } : x
                              )
                            )
                          }
                        >
                          <option value="percent">% of Total</option>
                          <option value="amount">Fixed Amount</option>
                        </select>
                        <input
                          disabled={locked}
                          type="number"
                          min={0}
                          step="0.01"
                          className={`${inp} text-xs`}
                          value={d.value}
                          onChange={(e) =>
                            set(
                              'discounts',
                              form.discounts.map((x, k) =>
                                k === i ? { ...x, value: Number(e.target.value) } : x
                              )
                            )
                          }
                        />
                        {d.mode === 'amount' && (
                          <select
                            disabled={locked}
                            className={`${inp} text-xs`}
                            value={d.scope}
                            onChange={(e) =>
                              set(
                                'discounts',
                                form.discounts.map((x, k) =>
                                  k === i ? { ...x, scope: e.target.value as 'total' | 'per_person' } : x
                                )
                              )
                            }
                          >
                            <option value="total">Total</option>
                            <option value="per_person">Per Person</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Notes */}
                <div className="border-t pt-3">
                  <label className="font-semibold text-gray-700 block mb-1">
                    Quotation Notes & Terms
                  </label>
                  <textarea
                    disabled={locked}
                    className={inp}
                    rows={3}
                    placeholder="Validity terms, deposit conditions, special arrangements..."
                    value={form.notes ?? ''}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CLIENT QUOTATION DOCUMENT VIEW (PRINT & PDF)       */}
      {/* ========================================================= */}
      {activeTab === 'quotation' && (
        <QuoteDocumentView
          quote={previewQuote}
          results={results}
          settings={settings}
          onEdit={() => setActiveTab('editor')}
        />
      )}

      {/* ========================================================= */}
      {/* TAB 3: DETAILED FINANCIAL COST & PROFIT MATRIX            */}
      {/* ========================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white border rounded-xl p-6 shadow-xs overflow-x-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Full Financial Cost & Profit Breakdown Matrix
              </h2>
              <p className="text-xs text-gray-500">
                Detailed comparison of supplier direct costs, contingency, pricing formulas, and net profit margins across each group size.
              </p>
            </div>
            <span className="text-xs bg-gray-100 font-semibold px-3 py-1 rounded">
              Currency: {form.currency}
            </span>
          </div>

          {results.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              Add cost items to generate the financial breakdown matrix.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold uppercase text-gray-600 border-b">
                  <th className="py-3 px-3 text-left">Cost Component / Metric</th>
                  {results.map((r, i) => (
                    <th key={i} className="py-3 px-3 text-right">
                      <div className="font-bold text-gray-900">{r.label || `${r.pax} Travellers`}</div>
                      <div className="font-normal text-[11px] text-gray-500">
                        {r.paying_pax} paying {r.foc_count > 0 && `(+${r.foc_count} FOC)`}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {comps.map((c) => (
                  <tr key={c} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 capitalize font-medium text-gray-800">
                      {c.replace('_', ' ')}
                    </td>
                    {results.map((r, i) => (
                      <td key={i} className="py-2.5 px-3 text-right font-mono text-xs text-gray-700">
                        {fmt(r.cost_by_component[c] ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="bg-gray-50/80 font-semibold border-t-2 border-gray-200">
                  <td className="py-2.5 px-3 text-gray-900">Total Direct Cost</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right font-mono text-gray-900">
                      {fmt(r.direct_cost)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2 px-3 text-gray-600">
                    Contingency ({form.contingency_percent}%)
                  </td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2 px-3 text-right font-mono text-xs text-gray-600">
                      {fmt(r.contingency)}
                    </td>
                  ))}
                </tr>

                <tr className="font-bold text-gray-900 bg-gray-100/60">
                  <td className="py-2.5 px-3">Total Cost (Delivered Trip)</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2.5 px-3 text-right font-mono">
                      {fmt(r.total_cost)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2 px-3 text-gray-600">Selling Price (Before Discounts)</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2 px-3 text-right font-mono text-xs text-gray-600">
                      {fmt(r.selling_price_before_discount)}
                    </td>
                  ))}
                </tr>

                {results.some((r) => r.discount_total > 0) && (
                  <tr>
                    <td className="py-2 px-3 text-red-600 font-medium">Applied Discounts</td>
                    {results.map((r, i) => (
                      <td key={i} className="py-2 px-3 text-right font-mono text-xs text-red-600">
                        − {fmt(r.discount_total)}
                      </td>
                    ))}
                  </tr>
                )}

                {form.tax_enabled && (
                  <tr>
                    <td className="py-2 px-3 text-gray-600">
                      {form.tax_name || 'Tax'} ({form.tax_rate}%)
                    </td>
                    {results.map((r, i) => (
                      <td key={i} className="py-2 px-3 text-right font-mono text-xs text-gray-600">
                        {fmt(r.tax_amount)}
                      </td>
                    ))}
                  </tr>
                )}

                <tr className="bg-teal-50/70 border-t-2 border-teal-200 font-bold text-teal-950">
                  <td className="py-3 px-3">Final Selling Package Price</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-3 text-right font-mono text-base text-teal-900">
                      {fmt(r.final_total)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-teal-100/70 font-extrabold text-teal-900">
                  <td className="py-3 px-3">Final Cost per Person</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-3 px-3 text-right font-mono text-lg text-teal-900">
                      {fmt(r.price_per_person)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2 px-3 text-gray-600">Cost per Room</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2 px-3 text-right font-mono text-xs text-gray-600">
                      {r.price_per_room != null ? fmt(r.price_per_room) : '-'}
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-gray-200">
                  <td className="py-2 px-3 text-emerald-700 font-semibold">Expected Gross Profit</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">
                      {fmt(r.expected_profit)}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="py-2 px-3 text-gray-600">Effective Profit Margin % / Markup %</td>
                  {results.map((r, i) => (
                    <td key={i} className="py-2 px-3 text-right font-mono text-xs text-gray-700">
                      {r.profit_margin_percent}% / {r.effective_markup_percent}%
                    </td>
                  ))}
                </tr>

                {results.some((r) => r.optional_cost > 0) && (
                  <tr className="border-t bg-amber-50/40 text-amber-900">
                    <td className="py-2 px-3 font-medium">
                      Optional Extras (Per Person, not in total)
                    </td>
                    {results.map((r, i) => (
                      <td key={i} className="py-2 px-3 text-right font-mono font-semibold text-xs">
                        + {fmt(r.optional_price_per_person)}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Supplier Rate Card Picker Modal */}
      {pickerFor !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4"
          onClick={() => setPickerFor(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-700" />
                Select from Supplier Rate Cards
              </h3>
              <button
                onClick={() => setPickerFor(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {cards.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">No active supplier rate cards found.</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-teal-950 text-sm">{c.supplier_name}</span>
                      <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium">
                        {c.service_type.replace('_', ' ')} · {c.currency}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {c.name} {c.destination && `· ${c.destination}`}
                    </div>

                    <div className="space-y-1 pt-1">
                      {c.items
                        .filter((i) => i.is_active)
                        .map((r, ri) => (
                          <button
                            key={r.id || ri}
                            onClick={() => pickRate(c, ri)}
                            className="w-full text-left text-xs bg-white hover:bg-teal-50 border border-gray-200 rounded-md p-2 flex items-center justify-between transition-colors group"
                          >
                            <span className="font-semibold text-gray-800 group-hover:text-teal-900">
                              {r.name}{' '}
                              {r.room_occupancy && (
                                <span className="font-normal text-gray-500">
                                  ({r.room_occupancy}
                                  {r.meal_plan ? `, ${r.meal_plan}` : ''})
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-bold text-teal-800 text-right">
                              {c.currency} {r.rate.toLocaleString()} ·{' '}
                              <span className="font-normal text-gray-500">
                                {r.cost_basis.replace('_', ' ')}
                              </span>
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t">
              <button
                className="px-4 py-2 text-sm border rounded-md font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setPickerFor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalogue Explorer Browser Modal */}
      <CatalogueBrowserModal
        isOpen={catalogueModalFor !== null}
        onClose={() => setCatalogueModalFor(null)}
        dayNumber={catalogueModalFor === 0 ? null : catalogueModalFor}
        destination={form.destination}
        onSelectCostItem={(cat) => handleAddCatalogueCostItem(cat, catalogueModalFor)}
        onSetDayHighlight={(cat) => {
          if (catalogueModalFor && catalogueModalFor > 0) {
            handleSetDayHighlight(cat, catalogueModalFor);
          }
        }}
      />
    </div>
  );
};
