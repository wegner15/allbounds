import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Download,
} from 'lucide-react';
import { tourQuotesApi, type QuoteListItem, type QuoteStatus } from '../../../../lib/api/tourQuotes';

export const STATUS_STYLE: Record<QuoteStatus, string> = {
  draft: 'bg-gray-100 text-gray-700 border border-gray-200',
  submitted: 'bg-amber-50 text-amber-800 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
  converted: 'bg-blue-50 text-blue-800 border border-blue-200',
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
      setLoading(true);
      setError(null);
      setRows(
        await tourQuotesApi.list({
          status,
          search: search.trim() || undefined,
          limit: 200,
        })
      );
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [status]);

  const del = async (q: QuoteListItem) => {
    if (!window.confirm(`Delete quote ${q.quote_number}?`)) return;
    try {
      await tourQuotesApi.remove(q.id);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Delete failed');
    }
  };

  const sel =
    'border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white';

  const totalQuotes = rows.length;
  const draftCount = rows.filter((r) => r.status === 'draft').length;
  const approvedCount = rows.filter((r) => r.status === 'approved').length;
  const convertedCount = rows.filter((r) => r.status === 'converted').length;

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tour & Holiday Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cost and price tour packages across various group sizes, with automatic markup calculations and seamless invoice conversion.
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/finance/quotes/new')}
          className="inline-flex items-center gap-2 bg-teal-800 hover:bg-teal-900 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> New Tour Quote
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Total Quotes</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalQuotes}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <p className="text-xs uppercase font-semibold text-amber-600 tracking-wider">Draft Proposals</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{draftCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <p className="text-xs uppercase font-semibold text-emerald-600 tracking-wider">Approved Quotes</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-xs">
          <p className="text-xs uppercase font-semibold text-blue-600 tracking-wider">Converted to Invoice</p>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{convertedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border rounded-xl p-4 shadow-xs">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              className={`${sel} pl-9 w-full`}
              placeholder="Search by quote number, package title, client name, or destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {(Object.keys(STATUS_STYLE) as QuoteStatus[]).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md text-sm transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white border rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500 border-b">
            <tr>
              <th className="p-4">Quote Reference & Package</th>
              <th className="p-4">Client / Group</th>
              <th className="p-4">Travel Dates</th>
              <th className="p-4">Investment by Group Size</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  Loading quotes...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  No tour quotations found. Click <strong>"New Tour Quote"</strong> to start costing.
                </td>
              </tr>
            ) : (
              rows.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4">
                    <Link
                      to={`/admin/finance/quotes/${q.id}`}
                      className="font-bold text-teal-800 hover:text-teal-900 text-base flex items-center gap-1.5"
                    >
                      {q.quote_number}
                    </Link>
                    <div className="font-semibold text-gray-900 mt-0.5">{q.name}</div>
                    {q.destination && (
                      <div className="text-xs text-gray-500 mt-0.5">{q.destination}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-gray-900">
                      {q.client_name || <span className="text-gray-400">Walk-in</span>}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {q.start_date || <span className="text-gray-400">Open</span>}
                  </td>
                  <td className="p-4">
                    {q.scenario_summaries.length === 0 ? (
                      <span className="text-xs text-gray-400">No prices configured</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {q.scenario_summaries.map((s) => (
                          <span
                            key={s.pax}
                            className="inline-flex items-center gap-1 text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-800"
                          >
                            <span className="text-gray-500 font-medium">{s.pax} pax:</span>
                            <strong className="text-teal-800 font-mono">
                              {q.currency} {s.price_per_person.toLocaleString()}
                            </strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        STATUS_STYLE[q.status]
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        to={`/admin/finance/quotes/${q.id}`}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        View / Edit
                      </Link>

                      {q.invoice_id && (
                        <Link
                          to={`/admin/finance/invoices/${q.invoice_id}`}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" /> Invoice
                        </Link>
                      )}

                      {q.status !== 'converted' && (
                        <button
                          className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete quote"
                          onClick={() => del(q)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
