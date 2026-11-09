import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Plus, Trash2 } from 'lucide-react';
import {
  tourQuotesApi, type Quote, type QuoteWrite, type QuoteItem, type QuoteResult,
} from '../../../../lib/api/tourQuotes';
import { rateCardsApi, type RateCard } from '../../../../lib/api/rateCards';
import { clientsApi } from '../../../../lib/api/clients';
import { COST_BASES } from '../ratecards/RateCardModal';
import { STATUS_STYLE } from './QuotesListPage';

const COMPONENTS = ['accommodation', 'transport', 'activity', 'meal', 'park_fee', 'guide', 'flight', 'visa', 'insurance', 'operational', 'other'];
const SERVICE_TO_COMPONENT: Record<string, string> = { accommodation: 'accommodation', transport: 'transport', activity: 'activity', park_fee: 'park_fee', guide: 'guide', flight: 'flight', meal: 'meal' };

const blank = (): QuoteWrite => ({
  name: '', destination: '', category: '', client_id: null, client_name: '', lead_reference: '',
  start_date: '', end_date: '', currency: 'USD', pricing_method: 'markup', pricing_value: 20,
  contingency_percent: 0, tax_enabled: false, tax_name: 'VAT', tax_rate: 0, tax_inclusive: false, notes: '',
  scenarios: [{ label: '', pax: 2, foc_count: 0, rooms: 1 }], days: [], items: [], discounts: [],
});

const inp = 'w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none';
const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const QuoteEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<QuoteWrite>(blank());
  const [results, setResults] = useState<QuoteResult[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [cards, setCards] = useState<RateCard[]>([]);
  const [pickerFor, setPickerFor] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const locked = !!quote && (quote.status === 'approved' || quote.status === 'converted');

  const hydrate = (q: Quote) => { setQuote(q); setForm({ ...blank(), ...q }); setResults(q.results); };

  useEffect(() => {
    clientsApi.getClients({ limit: 200 }).then((r) => setClients(r.items)).catch(() => {});
    rateCardsApi.list({ limit: 200 }).then(setCards).catch(() => {});
    if (id) tourQuotesApi.get(Number(id)).then(hydrate).catch((e) => setError(e?.response?.data?.detail || 'Failed to load quote'));
  }, [id]);

  // Live preview (debounced) from the unsaved form
  const timer = useRef<number>();
  useEffect(() => {
    if (locked || form.scenarios.length === 0) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      tourQuotesApi.preview(clean(form)).then((r) => { setResults(r); setError(null); })
        .catch((e) => setError(typeof e?.response?.data?.detail === 'string' ? e.response.data.detail : null));
    }, 400);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line
  }, [form, locked]);

  const clean = (f: QuoteWrite): QuoteWrite => ({
    ...f,
    start_date: f.start_date || null, end_date: f.end_date || null,
    items: f.items.filter((i) => i.description.trim()),
  });

  const set = <K extends keyof QuoteWrite>(k: K, v: QuoteWrite[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setItem = (i: number, p: Partial<QuoteItem>) => set('items', form.items.map((it, x) => (x === i ? { ...it, ...p } : it)));

  const addItem = (day: number | null, extra: Partial<QuoteItem> = {}) =>
    set('items', [...form.items, {
      day_number: day, component_type: 'other', description: '', cost_basis: 'per_person', unit_cost: 0,
      tax_amount: 0, qty: 1, is_optional: false, sort_order: form.items.length, ...extra,
    }]);

  const addDay = () => set('days', [...form.days, { day_number: form.days.length + 1, title: '', description: '' }]);
  const removeDay = (n: number) => setForm((f) => ({
    ...f,
    days: f.days.filter((d) => d.day_number !== n).map((d) => ({ ...d, day_number: d.day_number > n ? d.day_number - 1 : d.day_number })),
    items: f.items.filter((i) => i.day_number !== n).map((i) => ({ ...i, day_number: i.day_number && i.day_number > n ? i.day_number - 1 : i.day_number })),
  }));

  const pickRate = (card: RateCard, rateIdx: number) => {
    const r = card.items[rateIdx];
    const day = pickerFor;
    addItem(day === 0 ? null : day, {
      component_type: SERVICE_TO_COMPONENT[card.service_type] || 'other',
      description: `${card.supplier_name ? card.supplier_name + ' - ' : ''}${r.name}`,
      cost_basis: r.cost_basis, unit_cost: r.rate, tax_amount: r.tax_amount, capacity: r.capacity ?? null,
      supplier_id: card.supplier_id, rate_card_item_id: r.id ?? null,
    });
    if (card.currency !== form.currency) setNotice(`Rate card currency is ${card.currency}, quote is ${form.currency}. Rates were copied as entered; convert if needed.`);
    setPickerFor(null);
  };

  const save = async () => {
    if (!form.name.trim()) return setError('Quote name is required');
    try {
      setSaving(true); setError(null);
      const body = clean(form);
      const q = quote ? await tourQuotesApi.update(quote.id, body) : await tourQuotesApi.create(body);
      if (!quote) navigate(`/admin/finance/quotes/${q.id}`, { replace: true });
      hydrate(q); setNotice('Saved');
    } catch (e: any) {
      const d = e?.response?.data?.detail;
      setError(typeof d === 'string' ? d : e?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const transition = async (s: 'submitted' | 'approved' | 'rejected' | 'draft') => {
    if (!quote) return;
    try { setError(null); hydrate(await tourQuotesApi.setStatus(quote.id, s)); }
    catch (e: any) { setError(e?.response?.data?.detail || 'Status change failed'); }
  };

  const convert = async () => {
    if (!quote) return;
    const sid = quote.scenarios.length === 1 ? quote.scenarios[0].id
      : Number(window.prompt(`Group size to invoice? Enter: ${quote.scenarios.map((s) => `${s.pax} pax = ${s.id}`).join(', ')}`));
    if (!sid) return;
    try {
      const inv = await tourQuotesApi.convert(quote.id, { scenario_id: sid });
      navigate(`/admin/finance/invoices/${inv.id}`);
    } catch (e: any) { setError(e?.response?.data?.detail || 'Conversion failed'); }
  };

  const dayItems = (d: number | null) => form.items.map((it, idx) => ({ it, idx })).filter((x) => x.it.day_number === d);

  const itemRows = (d: number | null) => dayItems(d).map(({ it, idx }) => (
    <tr key={idx} className="align-top">
      <td className="pr-2 pb-2 min-w-[200px]"><input disabled={locked} className={inp} value={it.description} placeholder="Description" onChange={(e) => setItem(idx, { description: e.target.value })} /></td>
      <td className="pr-2 pb-2"><select disabled={locked} className={inp} value={it.component_type} onChange={(e) => setItem(idx, { component_type: e.target.value })}>{COMPONENTS.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}</select></td>
      <td className="pr-2 pb-2"><select disabled={locked} className={inp} value={it.cost_basis} onChange={(e) => setItem(idx, { cost_basis: e.target.value as QuoteItem['cost_basis'] })}>{COST_BASES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></td>
      <td className="pr-2 pb-2 w-28"><input disabled={locked} type="number" min={0} step="0.01" className={inp} value={it.unit_cost} onChange={(e) => setItem(idx, { unit_cost: Number(e.target.value) })} /></td>
      <td className="pr-2 pb-2 w-20"><input disabled={locked} type="number" min={0} step="any" className={inp} title="Nights / days / transfers" value={it.qty} onChange={(e) => setItem(idx, { qty: Number(e.target.value) })} /></td>
      <td className="pr-2 pb-2 w-20">{it.cost_basis === 'per_vehicle' && <input disabled={locked} type="number" min={1} className={inp} placeholder="seats" value={it.capacity ?? ''} onChange={(e) => setItem(idx, { capacity: e.target.value ? Number(e.target.value) : null })} />}</td>
      <td className="pr-2 pb-2 text-center"><input disabled={locked} type="checkbox" checked={it.is_optional} onChange={(e) => setItem(idx, { is_optional: e.target.checked })} /></td>
      <td className="pb-2">{!locked && <button className="text-red-500 p-1" onClick={() => set('items', form.items.filter((_, x) => x !== idx))}><Trash2 className="w-4 h-4" /></button>}</td>
    </tr>
  ));

  const itemTable = (d: number | null) => (
    <div className="overflow-x-auto">
      {dayItems(d).length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-gray-500"><tr><th>Cost line</th><th>Type</th><th>Basis</th><th>Unit cost</th><th>Qty</th><th>Seats</th><th>Optional</th><th></th></tr></thead>
          <tbody>{itemRows(d)}</tbody>
        </table>)}
      {!locked && (
        <div className="flex gap-3 text-sm mt-1">
          <button className="text-emerald-700 inline-flex items-center gap-1" onClick={() => addItem(d)}><Plus className="w-4 h-4" /> Add cost</button>
          <button className="text-blue-700 inline-flex items-center gap-1" onClick={() => setPickerFor(d ?? 0)}><BookOpen className="w-4 h-4" /> From rate card</button>
        </div>)}
    </div>
  );

  const comps = useMemo(() => Array.from(new Set(results.flatMap((r) => Object.keys(r.cost_by_component)))), [results]);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Link to="/admin/finance/quotes" className="text-sm text-gray-500">← Tour quotes</Link>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {quote ? quote.quote_number : 'New tour quote'}
            {quote && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[quote.status]}`}>{quote.status}</span>}
          </h1>
        </div>
        <div className="flex gap-2 text-sm">
          {!locked && <button disabled={saving} onClick={save} className="px-4 py-2 bg-emerald-600 text-white rounded-md disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>}
          {quote?.status === 'draft' && <button onClick={() => transition('submitted')} className="px-4 py-2 border rounded-md">Submit for approval</button>}
          {quote?.status === 'submitted' && <>
            <button onClick={() => transition('approved')} className="px-4 py-2 bg-emerald-600 text-white rounded-md">Approve</button>
            <button onClick={() => transition('rejected')} className="px-4 py-2 border border-red-300 text-red-600 rounded-md">Reject</button></>}
          {(quote?.status === 'approved' || quote?.status === 'rejected' || quote?.status === 'submitted') && <button onClick={() => transition('draft')} className="px-4 py-2 border rounded-md">Reopen as draft</button>}
          {quote?.status === 'approved' && <button onClick={convert} className="px-4 py-2 bg-blue-600 text-white rounded-md">Convert to invoice</button>}
          {quote?.invoice_id && <Link to={`/admin/finance/invoices/${quote.invoice_id}`} className="px-4 py-2 border rounded-md text-blue-600">View invoice</Link>}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}
      {notice && <div className="bg-emerald-50 text-emerald-800 text-sm rounded-md px-3 py-2" onClick={() => setNotice(null)}>{notice}</div>}
      {locked && <div className="bg-blue-50 text-blue-800 text-sm rounded-md px-3 py-2">This quote is {quote!.status} and locked. {quote!.status === 'approved' && 'Reopen it as a draft to edit.'}</div>}

      <fieldset disabled={locked} className="space-y-6">
        <section className="bg-white border rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="text-sm md:col-span-2">Package name<input className={inp} value={form.name} placeholder="e.g. Murchison Falls 4-day Safari" onChange={(e) => set('name', e.target.value)} /></label>
          <label className="text-sm">Currency<input className={inp} maxLength={10} value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} /></label>
          <label className="text-sm">Client
            <select className={inp} value={form.client_id ?? ''} onChange={(e) => {
              const c = clients.find((x) => x.id === Number(e.target.value));
              setForm((f) => ({ ...f, client_id: c?.id ?? null, client_name: c ? (c.company_name || [c.first_name, c.last_name].filter(Boolean).join(' ')) : f.client_name }));
            }}><option value="">- walk-in / enter name -</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email}</option>)}</select></label>
          <label className="text-sm">Client / group name<input className={inp} value={form.client_name ?? ''} onChange={(e) => set('client_name', e.target.value)} /></label>
          <label className="text-sm">Destination<input className={inp} value={form.destination ?? ''} onChange={(e) => set('destination', e.target.value)} /></label>
          <label className="text-sm">Category<input className={inp} value={form.category ?? ''} placeholder="Safari, beach, family..." onChange={(e) => set('category', e.target.value)} /></label>
          <label className="text-sm">Start date<input type="date" className={inp} value={form.start_date ?? ''} onChange={(e) => set('start_date', e.target.value)} /></label>
          <label className="text-sm">End date<input type="date" className={inp} value={form.end_date ?? ''} onChange={(e) => set('end_date', e.target.value)} /></label>
        </section>

        <section className="bg-white border rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center"><h2 className="font-semibold">Group sizes</h2>
            <button className="text-sm text-emerald-700 inline-flex items-center gap-1" onClick={() => set('scenarios', [...form.scenarios, { label: '', pax: 4, foc_count: 0, rooms: 2 }])}><Plus className="w-4 h-4" /> Add group size</button></div>
          <p className="text-xs text-gray-500">Each group size is costed separately. Rooms and free-of-charge (FOC) places are entered by hand; FOC cost is spread over paying travellers.</p>
          {form.scenarios.map((s, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 items-end">
              <label className="text-xs">Label<input className={inp} value={s.label ?? ''} onChange={(e) => set('scenarios', form.scenarios.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} /></label>
              <label className="text-xs">Travellers<input type="number" min={1} className={inp} value={s.pax} onChange={(e) => set('scenarios', form.scenarios.map((x, k) => k === i ? { ...x, pax: Number(e.target.value) } : x))} /></label>
              <label className="text-xs">FOC places<input type="number" min={0} className={inp} value={s.foc_count} onChange={(e) => set('scenarios', form.scenarios.map((x, k) => k === i ? { ...x, foc_count: Number(e.target.value) } : x))} /></label>
              <label className="text-xs">Rooms<input type="number" min={0} className={inp} value={s.rooms} onChange={(e) => set('scenarios', form.scenarios.map((x, k) => k === i ? { ...x, rooms: Number(e.target.value) } : x))} /></label>
              <button className="text-red-500 p-2 justify-self-start" disabled={form.scenarios.length === 1} onClick={() => set('scenarios', form.scenarios.filter((_, k) => k !== i))}><Trash2 className="w-4 h-4" /></button>
            </div>))}
        </section>

        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Itinerary and costs</h2>
          <p className="text-xs text-gray-500">Basis: <b>per person</b> = rate × qty × travellers · <b>per group</b> = rate × qty · <b>per room</b> = rate × qty × rooms · <b>per vehicle</b> = rate × qty × vehicles needed (travellers ÷ seats). Qty is nights, days or transfers.</p>
          <div className="border rounded-lg p-3"><div className="text-sm font-medium mb-2">Trip-wide costs (shared)</div>{itemTable(null)}</div>
          {form.days.map((d) => (
            <div key={d.day_number} className="border rounded-lg p-3 space-y-2">
              <div className="flex gap-3 items-center">
                <span className="font-medium text-sm whitespace-nowrap">Day {d.day_number}</span>
                <input className={inp} placeholder="Title" value={d.title ?? ''} onChange={(e) => set('days', form.days.map((x) => x.day_number === d.day_number ? { ...x, title: e.target.value } : x))} />
                {!locked && <button className="text-red-500" onClick={() => removeDay(d.day_number)}><Trash2 className="w-4 h-4" /></button>}
              </div>
              <textarea className={inp} rows={2} placeholder="What happens today: activities, services, arrangements" value={d.description ?? ''} onChange={(e) => set('days', form.days.map((x) => x.day_number === d.day_number ? { ...x, description: e.target.value } : x))} />
              {itemTable(d.day_number)}
            </div>))}
          {!locked && <button className="text-sm text-emerald-700 inline-flex items-center gap-1" onClick={addDay}><Plus className="w-4 h-4" /> Add day</button>}
        </section>

        <section className="bg-white border rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <h2 className="font-semibold md:col-span-4">Pricing</h2>
          <label className="text-sm">Method<select className={inp} value={form.pricing_method} onChange={(e) => set('pricing_method', e.target.value as 'markup' | 'margin')}><option value="markup">Markup on cost</option><option value="margin">Target profit margin</option></select></label>
          <label className="text-sm">{form.pricing_method === 'markup' ? 'Markup %' : 'Target margin %'}<input type="number" min={0} step="0.1" className={inp} value={form.pricing_value} onChange={(e) => set('pricing_value', Number(e.target.value))} /></label>
          <label className="text-sm">Contingency %<input type="number" min={0} step="0.1" className={inp} value={form.contingency_percent} onChange={(e) => set('contingency_percent', Number(e.target.value))} /></label>
          <div />
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.tax_enabled} onChange={(e) => set('tax_enabled', e.target.checked)} /> Apply tax</label>
          {form.tax_enabled && <>
            <label className="text-sm">Tax name<input className={inp} value={form.tax_name ?? ''} onChange={(e) => set('tax_name', e.target.value)} /></label>
            <label className="text-sm">Rate %<input type="number" min={0} step="0.1" className={inp} value={form.tax_rate} onChange={(e) => set('tax_rate', Number(e.target.value))} /></label>
            <label className="text-sm flex items-end gap-2 pb-2"><input type="checkbox" checked={form.tax_inclusive} onChange={(e) => set('tax_inclusive', e.target.checked)} /> Price already includes tax</label></>}

          <div className="md:col-span-4 space-y-2">
            <div className="flex justify-between items-center"><h3 className="font-medium text-sm">Discounts (adjust any price differences, e.g. children)</h3>
              <button className="text-sm text-emerald-700 inline-flex items-center gap-1" onClick={() => set('discounts', [...form.discounts, { label: '', mode: 'percent', value: 0, scope: 'total' }])}><Plus className="w-4 h-4" /> Add discount</button></div>
            {form.discounts.map((d, i) => (
              <div key={i} className="grid grid-cols-5 gap-3 items-center">
                <input className={`${inp} col-span-2`} placeholder="Reason" value={d.label} onChange={(e) => set('discounts', form.discounts.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} />
                <select className={inp} value={d.mode} onChange={(e) => set('discounts', form.discounts.map((x, k) => k === i ? { ...x, mode: e.target.value as 'percent' | 'amount' } : x))}><option value="percent">% of price</option><option value="amount">Amount</option></select>
                <input type="number" min={0} step="0.01" className={inp} value={d.value} onChange={(e) => set('discounts', form.discounts.map((x, k) => k === i ? { ...x, value: Number(e.target.value) } : x))} />
                <div className="flex gap-2 items-center">
                  {d.mode === 'amount' && <select className={inp} value={d.scope} onChange={(e) => set('discounts', form.discounts.map((x, k) => k === i ? { ...x, scope: e.target.value as 'total' | 'per_person' } : x))}><option value="total">Total</option><option value="per_person">Per person</option></select>}
                  <button className="text-red-500" onClick={() => set('discounts', form.discounts.filter((_, k) => k !== i))}><Trash2 className="w-4 h-4" /></button></div>
              </div>))}
          </div>
          <label className="text-sm md:col-span-4">Notes<textarea className={inp} rows={2} value={form.notes ?? ''} onChange={(e) => set('notes', e.target.value)} /></label>
        </section>
      </fieldset>

      <section className="bg-white border rounded-xl p-5 overflow-x-auto">
        <h2 className="font-semibold mb-3">Summary by group size</h2>
        {results.length === 0 ? <p className="text-sm text-gray-500">Add a group size and cost lines to see prices.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500"><th className="py-1">{form.currency}</th>{results.map((r, i) => <th key={i} className="text-right">{r.label || `${r.pax} pax`}<div className="font-normal">{r.paying_pax} paying{r.foc_count ? ` + ${r.foc_count} FOC` : ''}</div></th>)}</tr></thead>
            <tbody>
              {comps.map((c) => <tr key={c} className="border-t"><td className="py-1 capitalize">{c.replace('_', ' ')}</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r.cost_by_component[c] ?? 0)}</td>)}</tr>)}
              {([['Direct cost', 'direct_cost'], ['Contingency', 'contingency'], ['Total cost', 'total_cost'], ['Price before discount', 'selling_price_before_discount'], ['Discounts', 'discount_total'], ['Price before tax', 'price_before_tax'], ['Tax', 'tax_amount']] as const).map(([l, k]) => (
                <tr key={k} className="border-t text-gray-700"><td className="py-1">{l}</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r[k] as number)}</td>)}</tr>))}
              <tr className="border-t font-semibold"><td className="py-1">Total price</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r.final_total)}</td>)}</tr>
              <tr className="font-semibold bg-emerald-50"><td className="py-1">Price per person</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r.price_per_person)}</td>)}</tr>
              <tr className="border-t"><td className="py-1">Price per room</td>{results.map((r, i) => <td key={i} className="text-right">{r.price_per_room != null ? fmt(r.price_per_room) : '-'}</td>)}</tr>
              <tr className="border-t"><td className="py-1">Expected profit</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r.expected_profit)}</td>)}</tr>
              <tr><td className="py-1">Profit margin / markup</td>{results.map((r, i) => <td key={i} className="text-right">{r.profit_margin_percent}% / {r.effective_markup_percent}%</td>)}</tr>
              {results.some((r) => r.optional_cost > 0) && <tr className="border-t"><td className="py-1">Optional extras (per person, not included)</td>{results.map((r, i) => <td key={i} className="text-right">{fmt(r.optional_price_per_person)}</td>)}</tr>}
            </tbody>
          </table>)}
      </section>

      {pickerFor !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4" onClick={() => setPickerFor(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl my-8 p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-3">Pick from supplier rate cards</h3>
            {cards.length === 0 && <p className="text-sm text-gray-500">No rate cards yet.</p>}
            {cards.map((c) => (
              <div key={c.id} className="mb-3">
                <div className="text-sm font-medium">{c.supplier_name} · {c.name} <span className="text-xs text-gray-500">({c.currency}{c.valid_from || c.valid_to ? `, ${c.valid_from ?? '…'} → ${c.valid_to ?? '…'}` : ''})</span></div>
                {c.items.filter((i) => i.is_active).map((r, ri) => (
                  <button key={r.id} onClick={() => pickRate(c, ri)} className="w-full text-left text-sm px-3 py-1.5 hover:bg-emerald-50 rounded flex justify-between">
                    <span>{r.name}</span><span className="text-gray-500">{c.currency} {r.rate.toLocaleString()} · {r.cost_basis.replace('_', ' ')}</span></button>))}
              </div>))}
            <button className="text-sm border rounded-md px-3 py-1.5 mt-2" onClick={() => setPickerFor(null)}>Close</button>
          </div>
        </div>)}
    </div>
  );
};
