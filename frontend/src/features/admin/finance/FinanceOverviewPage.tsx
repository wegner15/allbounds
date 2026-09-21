import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  FileText,
  Compass,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { financeApi } from '../../../lib/api/finance';
import type { FinanceDashboardStats } from '../../../lib/types/finance';

export const FinanceOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<FinanceDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await financeApi.getStats();
        setStats(res);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load financial statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
            Finance & Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Executive financial hub for billing, receipts, supplier vouchers, and currency exchange
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/finance/invoices/new"
            className="inline-flex items-center px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
          </Link>
          <Link
            to="/admin/finance/vouchers/new"
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Compass className="w-4 h-4 mr-1.5 text-teal-700" /> Issue Voucher
          </Link>
          <Link
            to="/admin/finance/settings"
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
          >
            Settings & Currencies
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Invoiced */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Invoiced (USD)
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-700">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono text-gray-900 mt-2">
              ${stats.total_invoiced_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <Link
              to="/admin/finance/invoices"
              className="text-xs text-teal-700 font-semibold hover:underline mt-3 inline-flex items-center"
            >
              View Invoices <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Total Collected */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Total Collected
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono text-emerald-700 mt-2">
              ${stats.total_collected_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <Link
              to="/admin/finance/receipts"
              className="text-xs text-emerald-700 font-semibold hover:underline mt-3 inline-flex items-center"
            >
              View Receipts <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Outstanding Receivables */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Outstanding Balance
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono text-amber-700 mt-2">
              ${stats.total_outstanding_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <span className="text-xs text-gray-500 mt-3 block">
              Active accounts receivable
            </span>
          </div>

          {/* Overdue / Operational */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                Overdue Invoices
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-700">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold font-mono text-red-700 mt-2">
              {stats.overdue_invoices_count}
            </p>
            <Link
              to="/admin/finance/invoices?status=overdue"
              className="text-xs text-red-700 font-semibold hover:underline mt-3 inline-flex items-center"
            >
              Review Overdue <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Invoice Status Distribution */}
      {stats?.invoices_by_status && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">
            Invoice Status Breakdown
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            {Object.entries(stats.invoices_by_status).map(([st, count]) => (
              <div key={st} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 capitalize font-medium block">
                  {st.replace('_', ' ')}
                </span>
                <span className="text-xl font-bold font-mono text-gray-900 mt-1 block">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Invoices & Recent Receipts Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-teal-800" /> Recent Invoices
            </h3>
            <Link
              to="/admin/finance/invoices"
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>
          {stats?.recent_invoices && stats.recent_invoices.length > 0 ? (
            <div className="divide-y divide-gray-100 text-xs">
              {stats.recent_invoices.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      to={`/admin/finance/invoices/${inv.id}`}
                      className="font-mono font-bold text-teal-900 hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                    <p className="text-gray-600 mt-0.5 font-medium">
                      {inv.client_details?.company_name || inv.client_details?.full_name || 'Client'}
                    </p>
                    <span className="text-[11px] text-gray-400">Due: {inv.due_date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-gray-900">
                      {inv.currency} {inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 capitalize">
                      {inv.invoice_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No invoices yet.</p>
          )}
        </div>

        {/* Recent Payment Receipts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-gray-900 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-emerald-600" /> Recent Receipts
            </h3>
            <Link
              to="/admin/finance/receipts"
              className="text-xs text-teal-700 font-semibold hover:underline"
            >
              View All &rarr;
            </Link>
          </div>
          {stats?.recent_receipts && stats.recent_receipts.length > 0 ? (
            <div className="divide-y divide-gray-100 text-xs">
              {stats.recent_receipts.map((rec) => (
                <div key={rec.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link
                      to={`/admin/finance/receipts/${rec.id}`}
                      className="font-mono font-bold text-teal-900 hover:underline"
                    >
                      {rec.receipt_number}
                    </Link>
                    <p className="text-gray-600 mt-0.5 font-medium">
                      {rec.received_from?.company || rec.received_from?.name || 'Payer'}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(rec.payment_date).toLocaleDateString()} &bull; {rec.payment_method.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-emerald-700">
                      +{rec.currency} {rec.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-gray-400 font-mono block mt-1">
                      {rec.payment_reference}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">No receipts recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
