import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  DollarSign,
  AlertCircle,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  ArrowUpRight,
  Filter,
  CheckCircle,
  Clock,
  Compass,
  Car,
  Plane,
  TreePine,
  UserCheck,
} from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier } from '../../../../lib/types/finance';
import { SupplierEditorModal } from './SupplierEditorModal';
import { SupplierBillModal } from './SupplierBillModal';

export const SuppliersListPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const limit = 25;

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedSupplierForBill, setSelectedSupplierForBill] = useState<number | undefined>(undefined);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await suppliersApi.getSuppliers({
        skip,
        limit,
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      setSuppliers(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load suppliers directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [skip, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchSuppliers();
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    if (!window.confirm(`Are you sure you want to deactivate ${supplier.name}?`)) return;
    try {
      await suppliersApi.deleteSupplier(supplier.id);
      fetchSuppliers();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to deactivate supplier');
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'lodge_hotel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
            <Building2 className="w-3 h-3" /> Lodge / Hotel
          </span>
        );
      case 'transporter':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            <Car className="w-3 h-3" /> Transporter
          </span>
        );
      case 'airline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
            <Plane className="w-3 h-3" /> Airline / Flight
          </span>
        );
      case 'park_authority':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            <TreePine className="w-3 h-3" /> Park Authority
          </span>
        );
      case 'guide':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
            <UserCheck className="w-3 h-3" /> Safari Guide
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100">
            <Compass className="w-3 h-3" /> {category.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  // Aggregates
  const totalBilled = suppliers.reduce((acc, s) => acc + (s.total_billed_usd || 0), 0);
  const totalPaid = suppliers.reduce((acc, s) => acc + (s.total_paid_usd || 0), 0);
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.balance_payable_usd || 0), 0);

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
            Suppliers & Accounts Payable
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage partner safari lodges, transporters, park authorities, inbound bills, and disbursements
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedSupplierForBill(undefined);
              setIsBillModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl shadow-sm transition-all font-semibold text-sm"
          >
            <FileText className="w-4 h-4 text-gray-500" />
            Record Bill
          </button>
          <button
            onClick={() => {
              setSupplierToEdit(null);
              setIsEditorOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Suppliers</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCount}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Inbound Bills</p>
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Disbursed</p>
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
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Balance Payable</p>
            <p className="text-2xl font-bold text-rose-700 mt-0.5">
              ${totalPayables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search suppliers by name, code, contact person, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-semibold text-gray-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSkip(0);
            }}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            <option value="lodge_hotel">Lodges & Hotels</option>
            <option value="safari_operator">Safari Operators</option>
            <option value="transporter">Transporters / 4x4 Fleets</option>
            <option value="airline">Airlines & Flights</option>
            <option value="park_authority">Park Authorities (UWA/KWS)</option>
            <option value="guide">Safari Guides</option>
            <option value="other">Other Service Partners</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
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
        ) : suppliers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-3">
            <Building2 className="w-12 h-12 mx-auto stroke-1" />
            <p className="text-base font-medium">No suppliers found matching the criteria.</p>
            <button
              onClick={() => {
                setSupplierToEdit(null);
                setIsEditorOpen(true);
              }}
              className="text-teal-700 hover:underline text-sm font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add your first supplier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Supplier Name / Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Contact & Location</th>
                  <th className="py-3.5 px-4">Payment Terms</th>
                  <th className="py-3.5 px-4 text-right">Total Billed (USD)</th>
                  <th className="py-3.5 px-4 text-right">Paid (USD)</th>
                  <th className="py-3.5 px-4 text-right">Payable Due</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="py-3.5 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-purple-100/60 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/admin/finance/suppliers/${s.id}`}
                            className="font-semibold text-gray-900 hover:text-teal-700 transition-colors block"
                          >
                            {s.name}
                          </Link>
                          <span className="text-xs text-gray-400 font-mono block">{s.supplier_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getCategoryBadge(s.category)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-500">
                      <div>{s.contact_person || '—'}</div>
                      <div className="text-gray-400">{s.email || s.phone || s.country || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                        {s.payment_terms || 'Net 30'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-700">
                      ${(s.total_billed_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                      ${(s.total_paid_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">
                      {(s.balance_payable_usd || 0) > 0 ? (
                        <span className="text-rose-600">
                          ${(s.balance_payable_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-gray-400">$0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSupplierForBill(s.id);
                            setIsBillModalOpen(true);
                          }}
                          title="Record Supplier Bill"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/finance/suppliers/${s.id}`}
                          title="View Profile & Statement"
                          className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setSupplierToEdit(s);
                            setIsEditorOpen(true);
                          }}
                          title="Edit Supplier"
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(s)}
                          title="Deactivate Supplier"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} suppliers
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

      {/* Editor Modal */}
      <SupplierEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        supplierToEdit={supplierToEdit}
        onSaved={() => {
          setIsEditorOpen(false);
          fetchSuppliers();
        }}
      />

      {/* Record Bill Modal */}
      <SupplierBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        suppliers={suppliers}
        defaultSupplierId={selectedSupplierForBill}
        onSaved={() => {
          setIsBillModalOpen(false);
          fetchSuppliers();
        }}
      />
    </div>
  );
};
