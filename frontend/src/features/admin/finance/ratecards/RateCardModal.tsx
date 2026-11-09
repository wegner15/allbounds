import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { rateCardsApi, type RateCard, type RateCardItem, type CostBasis } from '../../../../lib/api/rateCards';
import type { Supplier } from '../../../../lib/types/finance';

export const SERVICE_TYPES = ['accommodation', 'transport', 'activity', 'park_fee', 'guide', 'flight', 'meal', 'other'];
export const COST_BASES: { value: CostBasis; label: string }[] = [
  { value: 'per_person', label: 'Per person' },
  { value: 'per_group', label: 'Per group' },
  { value: 'per_room', label: 'Per room' },
  { value: 'per_vehicle', label: 'Per vehicle' },
  { value: 'per_booking', label: 'Per booking' },
];

const blankItem = (n: number): RateCardItem => ({
  name: '', cost_basis: 'per_person', unit: '', rate: 0, tax_amount: 0, sort_order: n, is_active: true,
});

const input = 'w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none';

interface Props {
  card: RateCard | null; // null = create
  suppliers: Supplier[];
  onClose: () => void;
  onSaved: () => void;
}

export const RateCardModal: React.FC<Props> = ({ card, suppliers, onClose, onSaved }) => {
  const [form, setForm] = useState({
    supplier_id: card?.supplier_id ?? suppliers[0]?.id ?? 0,
    name: card?.name ?? '',
    quote_reference: card?.quote_reference ?? '',
    service_type: card?.service_type ?? 'accommodation',
    destination: card?.destination ?? '',
    currency: card?.currency ?? suppliers[0]?.currency ?? 'USD',
    valid_from: card?.valid_from ?? '',
    valid_to: card?.valid_to ?? '',
    notes: card?.notes ?? '',
    is_active: card?.is_active ?? true,
  });
  const [items, setItems] = useState<RateCardItem[]>(card?.items?.length ? card.items : [blankItem(0)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setF = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const setItem = (i: number, patch: Partial<RateCardItem>) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const num = (v: string) => (v === '' ? null : Number(v));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = items.filter((i) => i.name.trim());
    if (!form.name.trim()) return setError('Rate card name is required');
    if (!form.supplier_id) return setError('Select a supplier');
    if (form.valid_from && form.valid_to && form.valid_to < form.valid_from)
      return setError('"Valid to" must be on or after "Valid from"');
    const payload = {
      ...form,
      quote_reference: form.quote_reference || null,
      destination: form.destination || null,
      valid_from: form.valid_from || null,
      valid_to: form.valid_to || null,
      notes: form.notes || null,
    };
    try {
      setSaving(true);
      if (card) {
        const { supplier_id: _s, ...header } = payload;
        await rateCardsApi.update(card.id, header);
        const keep = new Set(clean.filter((i) => i.id).map((i) => i.id));
        for (const old of card.items) if (!keep.has(old.id)) await rateCardsApi.removeItem(card.id, old.id!);
        for (const [idx, it] of clean.entries()) {
          const body = { ...it, sort_order: idx };
          if (it.id) await rateCardsApi.updateItem(card.id, it.id, body);
          else await rateCardsApi.addItem(card.id, body);
        }
      } else {
        await rateCardsApi.create({ ...payload, items: clean.map((it, idx) => ({ ...it, sort_order: idx })) });
      }
      onSaved();
    } catch (err: any) {
      const d = err?.response?.data?.detail;
      setError(typeof d === 'string' ? d : err?.message || 'Failed to save rate card');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4">
      <form onSubmit={save} className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">{card ? 'Edit rate card' : 'New rate card'}</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="text-sm">Supplier
              <select className={input} value={form.supplier_id} disabled={!!card}
                onChange={(e) => {
                  const s = suppliers.find((x) => x.id === Number(e.target.value));
                  setF('supplier_id', Number(e.target.value));
                  if (s?.currency) setF('currency', s.currency);
                }}>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <label className="text-sm">Name
              <input className={input} value={form.name} placeholder="e.g. 2026 High Season" onChange={(e) => setF('name', e.target.value)} />
            </label>
            <label className="text-sm">Supplier quote ref
              <input className={input} value={form.quote_reference} onChange={(e) => setF('quote_reference', e.target.value)} />
            </label>
            <label className="text-sm">Service type
              <select className={input} value={form.service_type} onChange={(e) => setF('service_type', e.target.value)}>
                {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </label>
            <label className="text-sm">Destination
              <input className={input} value={form.destination} onChange={(e) => setF('destination', e.target.value)} />
            </label>
            <label className="text-sm">Currency
              <input className={input} value={form.currency} maxLength={10} onChange={(e) => setF('currency', e.target.value.toUpperCase())} />
            </label>
            <label className="text-sm">Valid from
              <input type="date" className={input} value={form.valid_from} onChange={(e) => setF('valid_from', e.target.value)} />
            </label>
            <label className="text-sm">Valid to
              <input type="date" className={input} value={form.valid_to} onChange={(e) => setF('valid_to', e.target.value)} />
            </label>
            <label className="text-sm flex items-end gap-2 pb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setF('is_active', e.target.checked)} /> Active
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-sm">Rates</h3>
              <button type="button" className="text-sm text-emerald-700 inline-flex items-center gap-1"
                onClick={() => setItems((a) => [...a, blankItem(a.length)])}>
                <Plus className="w-4 h-4" /> Add line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-gray-500">
                  <tr>
                    <th className="pr-2">Item</th><th className="pr-2">Basis</th><th className="pr-2">Unit</th>
                    <th className="pr-2">Rate</th><th className="pr-2">Tax / unit</th><th className="pr-2">Occupancy</th>
                    <th className="pr-2">Meal</th><th className="pr-2">Capacity</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id ?? `n${i}`} className="align-top">
                      <td className="pr-2 pb-2 min-w-[180px]"><input className={input} value={it.name} placeholder="Deluxe Double" onChange={(e) => setItem(i, { name: e.target.value })} /></td>
                      <td className="pr-2 pb-2"><select className={input} value={it.cost_basis} onChange={(e) => setItem(i, { cost_basis: e.target.value as CostBasis })}>
                        {COST_BASES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></td>
                      <td className="pr-2 pb-2 w-24"><input className={input} value={it.unit ?? ''} placeholder="night" onChange={(e) => setItem(i, { unit: e.target.value })} /></td>
                      <td className="pr-2 pb-2 w-28"><input type="number" min={0} step="0.01" className={input} value={it.rate} onChange={(e) => setItem(i, { rate: Number(e.target.value) })} /></td>
                      <td className="pr-2 pb-2 w-24"><input type="number" min={0} step="0.01" className={input} value={it.tax_amount} onChange={(e) => setItem(i, { tax_amount: Number(e.target.value) })} /></td>
                      <td className="pr-2 pb-2 w-28"><select className={input} value={it.room_occupancy ?? ''} onChange={(e) => setItem(i, { room_occupancy: e.target.value || null })}>
                        <option value="">-</option>{['single', 'double', 'twin', 'triple', 'family'].map((o) => <option key={o}>{o}</option>)}</select></td>
                      <td className="pr-2 pb-2 w-20"><select className={input} value={it.meal_plan ?? ''} onChange={(e) => setItem(i, { meal_plan: e.target.value || null })}>
                        <option value="">-</option>{['RO', 'BB', 'HB', 'FB', 'AI'].map((o) => <option key={o}>{o}</option>)}</select></td>
                      <td className="pr-2 pb-2 w-20"><input type="number" min={1} className={input} value={it.capacity ?? ''} onChange={(e) => setItem(i, { capacity: num(e.target.value) })} /></td>
                      <td className="pb-2"><button type="button" className="text-red-500 p-1" onClick={() => setItems((a) => a.filter((_, x) => x !== i))}><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <label className="text-sm block">Notes
            <textarea className={input} rows={2} value={form.notes} onChange={(e) => setF('notes', e.target.value)} />
          </label>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-md">Cancel</button>
          <button disabled={saving} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md disabled:opacity-50">
            {saving ? 'Saving...' : 'Save rate card'}
          </button>
        </div>
      </form>
    </div>
  );
};
