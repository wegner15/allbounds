import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2 } from 'lucide-react';
import { tourQuotesApi, type QuoteListItem, type QuoteStatus } from '../../../../lib/api/tourQuotes';

export const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-700', submitted: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700', rejected: 'bg-red-50 text-red-700',
  converted: 'bg-blue-50 text-blue-700',
};

export const QuotesListPage: React.FC = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true); setError(null);
      setRows(await tourQuotesApi.list({ status, search: search.trim() || undefined, limit: 200 }));
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load quotes');
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const del = async (q: QuoteListItem) => {
    if (!window.confirm(`Delete ${q.quote_number}?`)) return;
    try { await tourQuotesApi.remove(q.id); load(); }
    catch (e: any) { setError(e?.response?.data?.detail || 'Delete failed'); }
  };

  const sel = 'border border-gray-300 rounded-md px-3 py-2 text-sm';
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tour Quotes</h1>
          <p className="text-sm text-gray-500">Cost and price tour packages for different group sizes. Approved quotes convert to invoices.</p>
        </div>
        <button onClick={() => navigate('/admin/finance/quotes/new')}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md text-sm">
          <Plus className="w-4 h-4" /> New quote
        </button>
      </div>

      <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); load(); }}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input className={`${sel} pl-9`} placeholder="Search number, name, client" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_STYLE) as QuoteStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </form>

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Quote</th><th className="p-3">Client</th><th className="p-3">Travel</th>
              <th className="p-3">Price per person</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">No quotes yet.</td></tr>
              : rows.map((q) => (
                <tr key={q.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <Link to={`/admin/finance/quotes/${q.id}`} className="font-medium text-emerald-700">{q.quote_number}</Link>
                    <div className="text-xs text-gray-500">{q.name}{q.destination ? ` · ${q.destination}` : ''}</div>
                  </td>
                  <td className="p-3">{q.client_name || '-'}</td>
                  <td className="p-3">{q.start_date || '-'}</td>
                  <td className="p-3 text-xs">
                    {q.scenario_summaries.length === 0 ? '-' : q.scenario_summaries.map((s) => (
                      <div key={s.pax}>{s.pax} pax: <b>{q.currency} {s.price_per_person.toLocaleString()}</b></div>))}
                  </td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[q.status]}`}>{q.status}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {q.invoice_id && <Link className="text-xs text-blue-600 mr-3" to={`/admin/finance/invoices/${q.invoice_id}`}>Invoice</Link>}
                    {q.status !== 'converted' && <button className="text-red-500 p-1" onClick={() => del(q)}><Trash2 className="w-4 h-4" /></button>}
                  </td>
                </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
