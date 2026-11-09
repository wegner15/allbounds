import React, { useEffect, useState } from 'react';
import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { rateCardsApi, type RateCard } from '../../../../lib/api/rateCards';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier } from '../../../../lib/types/finance';
import { RateCardModal, SERVICE_TYPES, COST_BASES } from './RateCardModal';

const basisLabel = (v: string) => COST_BASES.find((b) => b.value === v)?.label ?? v;

export const RateCardsPage: React.FC = () => {
  const [cards, setCards] = useState<RateCard[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [supplierId, setSupplierId] = useState('all');
  const [serviceType, setServiceType] = useState('all');
  const [validOn, setValidOn] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editing, setEditing] = useState<RateCard | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, s] = await Promise.all([
        rateCardsApi.list({
          search: search.trim() || undefined,
          supplier_id: supplierId !== 'all' ? Number(supplierId) : undefined,
          service_type: serviceType,
          valid_on: validOn || undefined,
          active_only: !showInactive,
          limit: 200,
        }),
        suppliers.length ? Promise.resolve({ items: suppliers }) : suppliersApi.getSuppliers({ limit: 200 }),
      ]);
      setCards(c);
      setSuppliers(s.items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supplierId, serviceType, validOn, showInactive]);

  const act = async (fn: () => Promise<unknown>) => {
    try { await fn(); await load(); } catch (err: any) { setError(err?.response?.data?.detail || err?.message || 'Action failed'); }
  };

  const sel = 'border border-gray-300 rounded-md px-3 py-2 text-sm';

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Rate Cards</h1>
          <p className="text-sm text-gray-500">Price lists reused when building tour quotes.</p>
        </div>
        <button disabled={!suppliers.length} onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50">
          <Plus className="w-4 h-4" /> New rate card
        </button>
      </div>

      <form className="flex flex-wrap gap-3 items-center" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input className={`${sel} pl-9`} placeholder="Search name or quote ref" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={sel} value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
          <option value="all">All suppliers</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className={sel} value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
          <option value="all">All services</option>
          {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <label className="text-sm flex items-center gap-2">Valid on
          <input type="date" className={sel} value={validOn} onChange={(e) => setValidOn(e.target.value)} />
        </label>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> Show inactive
        </label>
      </form>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Rate card</th><th className="p-3">Supplier</th><th className="p-3">Service</th>
              <th className="p-3">Validity</th><th className="p-3">Lines</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : cards.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">No rate cards found.</td></tr>
            ) : cards.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                  <td className="p-3">
                    <div className="font-medium">{c.name} {!c.is_active && <span className="text-xs text-gray-400">(inactive)</span>}</div>
                    <div className="text-xs text-gray-500">{[c.quote_reference, c.destination, c.currency].filter(Boolean).join(' · ')}</div>
                  </td>
                  <td className="p-3">{c.supplier_name}</td>
                  <td className="p-3 capitalize">{c.service_type.replace('_', ' ')}</td>
                  <td className="p-3">{c.valid_from || c.valid_to ? `${c.valid_from ?? '…'} → ${c.valid_to ?? '…'}` : 'Open'}</td>
                  <td className="p-3">{c.items.length}</td>
                  <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button title="Edit" className="p-1.5" onClick={() => setEditing(c)}><Pencil className="w-4 h-4" /></button>
                    <button title="Duplicate" className="p-1.5" onClick={() => act(() => rateCardsApi.duplicate(c.id))}><Copy className="w-4 h-4" /></button>
                    <button title="Delete" className="p-1.5 text-red-500"
                      onClick={() => window.confirm(`Delete "${c.name}"?`) && act(() => rateCardsApi.remove(c.id))}><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
                {expanded === c.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-6 py-3">
                      {c.items.length === 0 ? <span className="text-gray-500">No lines.</span> : (
                        <table className="w-full text-xs">
                          <thead className="text-left text-gray-500"><tr><th>Item</th><th>Basis</th><th>Unit</th><th className="text-right">Rate ({c.currency})</th><th className="text-right">Tax</th><th>Details</th></tr></thead>
                          <tbody>{c.items.map((i) => (
                            <tr key={i.id} className="border-t">
                              <td className="py-1">{i.name}</td><td>{basisLabel(i.cost_basis)}</td><td>{i.unit ?? '-'}</td>
                              <td className="text-right">{i.rate.toLocaleString()}</td><td className="text-right">{i.tax_amount ? i.tax_amount.toLocaleString() : '-'}</td>
                              <td>{[i.room_occupancy, i.meal_plan, i.capacity ? `cap ${i.capacity}` : null].filter(Boolean).join(' · ')}</td>
                            </tr>))}</tbody>
                        </table>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <RateCardModal card={editing} suppliers={suppliers}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); load(); }} />
      )}
    </div>
  );
};
