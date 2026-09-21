import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  ExternalLink,
  Filter
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { Invoice, FinanceDashboardStats } from '../../../../lib/types/finance';
import { ReceiptEditorModal } from '../receipts/ReceiptEditorModal';

export const InvoicesListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<FinanceDashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const limit = 20;

  // Selected invoice for quick payment recording
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [res, statsRes] = await Promise.all([
        financeApi.getInvoices({
          skip,
          limit,
          status: statusFilter,
          client_search: searchQuery.trim() || undefined,
          currency: currencyFilter || undefined
        }),
        financeApi.getStats()
      ]);
      setInvoices(res.items);
      setTotalCount(res.total);
      setStats(statsRes);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [skip, statusFilter, currencyFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchInvoices();
  };

  const handleDelete = async (invoiceId: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    try {
      await financeApi.deleteInvoice(invoiceId);
      fetchInvoices();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to delete invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Partially Paid
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <FileText className="w-3 h-3 mr-1" /> Issued
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" /> Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage client billing, payment balances, and issued travel invoices
          </p>
        </div>
        <Link
          to="/admin/finance/invoices/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Invoiced (USD eq.)</span>
            <p className="text-2xl font-extrabold font-mono text-gray-900 mt-1">
              ${stats.total_invoiced_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Collected</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
              ${stats.total_collected_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Outstanding Receivables</span>
            <p className="text-2xl font-extrabold font-mono text-amber-700 mt-1">
              ${stats.total_outstanding_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">Overdue Invoices</span>
            <p className="text-2xl font-extrabold font-mono text-red-700 mt-1">
              {stats.overdue_invoices_count}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs">
            {['all', 'draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setStatusFilter(st);
                  setSkip(0);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  statusFilter === st
                    ? 'bg-white text-teal-900 shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search client, company, inv #..."
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No invoices found.</p>
            <p className="text-xs text-gray-400 mt-1 mb-4">Try adjusting your filters or create a new invoice.</p>
            <Link
              to="/admin/finance/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Invoice No</th>
                  <th className="px-4 py-3 text-left">Client / Company</th>
                  <th className="px-4 py-3 text-left">Tour / Summary</th>
                  <th className="px-4 py-3 text-left">Invoice Date</th>
                  <th className="px-4 py-3 text-left">Due Date</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {invoices.map((inv) => {
                  const client = inv.client_details || {};
                  const trip = inv.trip_summary || {};
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-900 whitespace-nowrap">
                        <Link to={`/admin/finance/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">
                          {client.company_name || client.full_name || 'Guest'}
                        </p>
                        {client.email && <p className="text-[11px] text-gray-500">{client.email}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-800 font-medium">
                          {trip.tour_package_name || trip.travel_type || 'Travel Booking'}
                        </p>
                        {trip.destinations && (
                          <p className="text-[11px] text-gray-500">{trip.destinations}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">{inv.invoice_date}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap font-medium text-gray-800">
                        {inv.due_date}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-semibold text-gray-900">
                        {inv.currency} {inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-red-700">
                        {inv.currency} {inv.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {getStatusBadge(inv.invoice_status)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                        {inv.invoice_status !== 'paid' && inv.invoice_status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPayment(inv)}
                            className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition"
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4 inline" />
                          </button>
                        )}
                        <Link
                          to={`/admin/finance/invoices/${inv.id}`}
                          className="p-1 hover:bg-gray-100 text-teal-800 rounded transition"
                          title="View Document"
                        >
                          <ExternalLink className="w-4 h-4 inline" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(inv.id)}
                          className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalCount > limit && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} invoices
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={skip + limit >= totalCount}
                onClick={() => setSkip(skip + limit)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <ReceiptEditorModal
          invoice={selectedInvoiceForPayment}
          isOpen={Boolean(selectedInvoiceForPayment)}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onSuccess={() => {
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};
