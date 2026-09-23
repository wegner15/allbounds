import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier, SupplierBill } from '../../../../lib/types/finance';
import { SupplierBillModal } from './SupplierBillModal';
import { SupplierPaymentModal } from './SupplierPaymentModal';

export const SupplierBillsPage: React.FC = () => {
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const limit = 25;

  // Modals
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<SupplierBill | null>(null);

  const fetchBillsAndSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [billsRes, suppliersRes] = await Promise.all([
        suppliersApi.getBills({
          skip,
          limit,
          search: search.trim() || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        suppliersApi.getSuppliers({ limit: 200 }),
      ]);
      setBills(billsRes.items);
      setTotalCount(billsRes.total);
      setSuppliers(suppliersRes.items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load supplier bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillsAndSuppliers();
  }, [skip, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchBillsAndSuppliers();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Check className="w-3 h-3" /> Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock className="w-3 h-3" /> Partial
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
            Pending
          </span>
        );
    }
  };

  // Aggregates
  const totalBilled = bills.reduce((acc, b) => acc + (b.amount_billed * (b.exchange_rate_to_usd || 1)), 0);
  const totalPaid = bills.reduce((acc, b) => acc + (b.amount_paid * (b.exchange_rate_to_usd || 1)), 0);
  const totalPayable = bills.reduce((acc, b) => acc + (b.balance_payable * (b.exchange_rate_to_usd || 1)), 0);
  const overdueCount = bills.filter((b) => b.status === 'overdue').length;

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
            Accounts Payable & Supplier Bills
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track inbound vendor invoices from lodges, airlines, park permits, and execute payment disbursements
          </p>
        </div>
        <button
          onClick={() => setIsBillModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Record Inbound Bill
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Bills</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Billed Volume (USD)</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Disbursed (Paid)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-0.5">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Balance Payable</p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5">
              ${totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {overdueCount > 0 && (
              <span className="text-xs text-rose-500 font-semibold block mt-0.5">
                {overdueCount} overdue bill{overdueCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by bill #, supplier reference, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSkip(0);
            }}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p>{error}</p>
          </div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <FileText className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-base font-medium">No bills found matching your criteria.</p>
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="text-teal-700 hover:underline text-sm font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Record your first supplier bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Bill #</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4">Vendor Inv #</th>
                  <th className="py-3.5 px-4">Bill Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount Billed</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-800 text-xs">
                      {bill.bill_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/admin/finance/suppliers/${bill.supplier_id}`}
                        className="font-semibold text-gray-900 hover:text-teal-700 transition-colors inline-flex items-center gap-1"
                      >
                        {bill.supplier_name || `Supplier #${bill.supplier_id}`}
                        <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                      {bill.supplier_reference || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{bill.bill_date}</td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">{bill.due_date}</td>
                    <td className="py-3.5 px-4 text-xs capitalize text-gray-600">
                      {bill.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                      {bill.currency} {bill.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      {bill.currency} {bill.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold">
                      {bill.balance_payable > 0 ? (
                        <span className="text-rose-600">
                          {bill.currency} {bill.balance_payable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400">$0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(bill.status)}</td>
                    <td className="py-3.5 px-4 text-center">
                      {bill.balance_payable > 0 ? (
                        <button
                          onClick={() => setSelectedBillForPayment(bill)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-1 mx-auto"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Pay Bill
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalCount > limit && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} bills
            </span>
            <div className="flex gap-2">
              <button
                disabled={skip === 0}
                onClick={() => setSkip((s) => Math.max(0, s - limit))}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                Previous
              </button>
              <button
                disabled={skip + limit >= totalCount}
                onClick={() => setSkip((s) => s + limit)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Inbound Bill Modal */}
      <SupplierBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        suppliers={suppliers}
        onSaved={() => {
          setIsBillModalOpen(false);
          fetchBillsAndSuppliers();
        }}
      />

      {/* Record Payment Disbursement Modal */}
      {selectedBillForPayment && (
        <SupplierPaymentModal
          isOpen={Boolean(selectedBillForPayment)}
          onClose={() => setSelectedBillForPayment(null)}
          bill={selectedBillForPayment}
          onSaved={() => {
            setSelectedBillForPayment(null);
            fetchBillsAndSuppliers();
          }}
        />
      )}
    </div>
  );
};
