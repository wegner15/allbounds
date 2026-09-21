import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Compass,
  BedDouble,
  Car,
  Plane,
  FileCheck,
  ExternalLink,
  Edit,
  Check
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { TravelVoucher } from '../../../../lib/types/finance';

export const VouchersListPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<TravelVoucher[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);
  const limit = 20;

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getVouchers({
        skip,
        limit,
        voucher_type: typeFilter,
        status: statusFilter,
        supplier_search: searchQuery.trim() || undefined
      });
      setVouchers(res.items);
      setTotalCount(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [skip, typeFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchVouchers();
  };

  const getVoucherIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return <BedDouble className="w-4 h-4 text-teal-700" />;
      case 'transportation':
        return <Car className="w-4 h-4 text-teal-700" />;
      case 'flight':
        return <Plane className="w-4 h-4 text-teal-700" />;
      case 'safari':
      case 'activity':
      default:
        return <Compass className="w-4 h-4 text-teal-700" />;
    }
  };

  const getStatusBadge = (status: string, version: number) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-0.5" /> Confirmed
          </span>
        );
      case 'amended':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Amended (v{version})
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">Travel Vouchers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Operational supplier service vouchers for hotels, safaris, and transport
          </p>
        </div>
        <Link
          to="/admin/finance/vouchers/new"
          className="inline-flex items-center px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Issue Travel Voucher
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Tabs */}
          <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs">
            {['all', 'accommodation', 'transportation', 'safari', 'activity', 'flight'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTypeFilter(t);
                  setSkip(0);
                }}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  typeFilter === t
                    ? 'bg-white text-teal-900 shadow-sm font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplier, guest, vch #..."
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : vouchers.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No travel vouchers found.</p>
            <p className="text-xs text-gray-400 mt-1">
              Issue a new service voucher or adjust your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Voucher No</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Supplier / Property</th>
                  <th className="px-4 py-3 text-left">Lead Guest & Party</th>
                  <th className="px-4 py-3 text-left">Issue Date</th>
                  <th className="px-4 py-3 text-left">Supplier Ref</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {vouchers.map((vch) => {
                  const s = (vch.supplier_details || {}) as any;
                  const t = (vch.traveller_details || {}) as any;
                  return (
                    <tr key={vch.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-900 whitespace-nowrap">
                        <Link to={`/admin/finance/vouchers/${vch.id}`} className="hover:underline">
                          {vch.voucher_number}
                        </Link>
                        <span className="text-[10px] text-gray-400 block font-normal">
                          Ver {vch.version}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 capitalize text-gray-800 font-medium">
                          {getVoucherIcon(vch.voucher_type)}
                          <span>{vch.voucher_type}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">
                          {s.supplier_name || s.hotel_name || s.company_name || 'Supplier'}
                        </p>
                        {s.contact_person && (
                          <p className="text-[11px] text-gray-500">{s.contact_person}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{t.lead_traveller || 'Guest'}</p>
                        <p className="text-[11px] text-gray-500">
                          {t.adults || 1} Adults{t.children ? `, ${t.children} Children` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">{vch.issue_date}</td>
                      <td className="px-4 py-3.5 font-mono text-gray-700 whitespace-nowrap">
                        {s.supplier_confirmation_number || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        {getStatusBadge(vch.voucher_status, vch.version)}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-2">
                        <Link
                          to={`/admin/finance/vouchers/${vch.id}/edit`}
                          className="p-1 hover:bg-gray-100 text-gray-600 rounded transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </Link>
                        <Link
                          to={`/admin/finance/vouchers/${vch.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium text-xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
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
              Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} vouchers
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
    </div>
  );
};
