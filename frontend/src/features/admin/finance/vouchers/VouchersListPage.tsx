import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Share2,
  DollarSign,
  Briefcase,
  Users,
  ShieldCheck,
  ArrowRight,
  Mail
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { TravelVoucher, PaymentVoucher } from '../../../../lib/types/finance';
import { PaymentVoucherCreateModal } from './PaymentVoucherCreateModal';
import { SendEmailModal } from '../components/SendEmailModal';

export const VouchersListPage: React.FC = () => {
  const navigate = useNavigate();

  // Tab Hub: 'travel' (Supplier Service Vouchers) vs 'payment' (Employee Expense & Disbursement Vouchers)
  const [activeHub, setActiveHub] = useState<'travel' | 'payment'>('travel');

  // Travel Vouchers State
  const [travelVouchers, setTravelVouchers] = useState<TravelVoucher[]>([]);
  const [travelTotalCount, setTravelTotalCount] = useState<number>(0);
  const [travelLoading, setTravelLoading] = useState<boolean>(true);
  const [travelTypeFilter, setTravelTypeFilter] = useState<string>('all');
  const [travelStatusFilter, setTravelStatusFilter] = useState<string>('all');

  // Payment Vouchers State
  const [paymentVouchers, setPaymentVouchers] = useState<PaymentVoucher[]>([]);
  const [paymentTotalCount, setPaymentTotalCount] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [paymentCategoryFilter, setPaymentCategoryFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Shared state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [skip, setSkip] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [emailVoucher, setEmailVoucher] = useState<PaymentVoucher | null>(null);
  const limit = 20;

  // Fetch Travel Vouchers
  const fetchTravelVouchers = async () => {
    try {
      setTravelLoading(true);
      setError(null);
      const res = await financeApi.getVouchers({
        skip,
        limit,
        voucher_type: travelTypeFilter,
        status: travelStatusFilter,
        supplier_search: searchQuery.trim() || undefined
      });
      setTravelVouchers(res.items);
      setTravelTotalCount(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load travel vouchers');
    } finally {
      setTravelLoading(false);
    }
  };

  // Fetch Payment Vouchers
  const fetchPaymentVouchers = async () => {
    try {
      setPaymentLoading(true);
      setError(null);
      const res = await financeApi.getPaymentVouchers({
        skip,
        limit,
        category: paymentCategoryFilter === 'all' ? undefined : paymentCategoryFilter,
        status: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
        search: searchQuery.trim() || undefined
      });
      setPaymentVouchers(res.items);
      setPaymentTotalCount(res.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load payment vouchers');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (activeHub === 'travel') {
      fetchTravelVouchers();
    } else {
      fetchPaymentVouchers();
    }
  }, [
    activeHub,
    skip,
    travelTypeFilter,
    travelStatusFilter,
    paymentCategoryFilter,
    paymentStatusFilter
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    if (activeHub === 'travel') {
      fetchTravelVouchers();
    } else {
      fetchPaymentVouchers();
    }
  };

  const handleCopySigningLink = (pv: PaymentVoucher) => {
    const url = `${window.location.origin}/sign/voucher/${pv.signing_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pv.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppShare = (pv: PaymentVoucher) => {
    const url = `${window.location.origin}/sign/voucher/${pv.signing_token}`;
    const empName = pv.employee_details?.name || 'Staff Member';
    const text = encodeURIComponent(
      `Hello ${empName}, please review and sign your Allbound Vacations payment voucher (${pv.voucher_number}) for ${pv.currency} ${pv.amount.toLocaleString()}:\n${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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

  const getStatusBadge = (status: string, version?: number) => {
    switch (status) {
      case 'confirmed':
      case 'signed':
      case 'reconciled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-0.5" /> {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Disbursed
          </span>
        );
      case 'authorized':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
            Authorized
          </span>
        );
      case 'amended':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            Amended {version ? `(v${version})` : ''}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Pending
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Header & Main Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">Vouchers Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Operational service vouchers for suppliers & expense/payment authorization for employees
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeHub === 'travel' ? (
            <Link
              to="/admin/finance/vouchers/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Travel Voucher
            </Link>
          ) : (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Authorize Employee Voucher
            </button>
          )}
        </div>
      </div>

      {/* PRIMARY HUB TOGGLE: Travel vs Payment */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveHub('travel');
            setSkip(0);
          }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
            activeHub === 'travel'
              ? 'border-teal-800 text-teal-950 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Supplier Travel Vouchers</span>
          <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full font-mono">
            {travelTotalCount}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveHub('payment');
            setSkip(0);
          }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition ${
            activeHub === 'payment'
              ? 'border-teal-800 text-teal-950 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Employee Payment & Expense Vouchers</span>
          <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-mono">
            {paymentTotalCount}
          </span>
        </button>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {activeHub === 'travel' ? (
            /* Travel Voucher Filters */
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              {['all', 'accommodation', 'transportation', 'safari', 'activity', 'flight'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTravelTypeFilter(t);
                    setSkip(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                    travelTypeFilter === t
                      ? 'bg-white text-teal-900 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          ) : (
            /* Payment Voucher Filters */
            <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'safari_advance', label: 'Safari Advance' },
                { id: 'per_diem', label: 'Per Diem' },
                { id: 'fuel_transport', label: 'Fuel / Transport' },
                { id: 'field_allowance', label: 'Field Allowance' },
                { id: 'staff_salary', label: 'Salary / Wages' },
                { id: 'reimbursement', label: 'Reimbursement' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setPaymentCategoryFilter(c.id);
                    setSkip(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition ${
                    paymentCategoryFilter === c.id
                      ? 'bg-white text-teal-900 shadow-sm font-bold'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeHub === 'travel'
                    ? 'Search supplier, guest, vch #...'
                    : 'Search employee, title, vch #...'
                }
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs w-64 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* CONTENT LISTING */}
      {activeHub === 'travel' ? (
        /* TRAVEL VOUCHERS TABLE */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {travelLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-sm">{error}</div>
          ) : travelVouchers.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No travel vouchers found.</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Issue a new service voucher or adjust your search filters.
              </p>
              <Link
                to="/admin/finance/vouchers/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Issue Travel Voucher
              </Link>
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
                  {travelVouchers.map((vch) => {
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

          {/* Travel Pagination */}
          {travelTotalCount > limit && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {skip + 1} to {Math.min(skip + limit, travelTotalCount)} of {travelTotalCount} vouchers
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
                  disabled={skip + limit >= travelTotalCount}
                  onClick={() => setSkip(skip + limit)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PAYMENT & EXPENSE VOUCHERS TABLE */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {paymentLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-sm">{error}</div>
          ) : paymentVouchers.length === 0 ? (
            <div className="text-center p-12 text-gray-500">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No payment vouchers found.</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Authorize payments for safari guides, fuel, advances or staff allowances.
              </p>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Authorize Employee Voucher
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Voucher No</th>
                    <th className="px-4 py-3 text-left">Staff / Payee</th>
                    <th className="px-4 py-3 text-left">Category & Purpose</th>
                    <th className="px-4 py-3 text-left">Issue Date</th>
                    <th className="px-4 py-3 text-right">Authorized Amount</th>
                    <th className="px-4 py-3 text-center">Digital Sign</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {paymentVouchers.map((pv) => {
                    const emp = pv.employee_details || {};
                    return (
                      <tr key={pv.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-teal-900 whitespace-nowrap">
                          <Link
                            to={`/admin/finance/payment-vouchers/${pv.id}`}
                            className="hover:underline"
                          >
                            {pv.voucher_number}
                          </Link>
                          {pv.booking_id && (
                            <span className="text-[10px] text-gray-400 block font-normal">
                              BK #{pv.booking_id}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-gray-900">
                            {emp.name || emp.full_name || 'Staff Member'}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {emp.role || emp.department || 'Field Staff'}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="font-medium text-gray-900 truncate">{pv.title}</p>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 capitalize">
                            {pv.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                          {pv.issue_date}
                          {pv.due_date && (
                            <span className="text-[10px] text-amber-600 block">
                              Due: {pv.due_date}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-teal-950">
                          {pv.currency} {pv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {pv.is_signed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCopySigningLink(pv)}
                              title="Copy link to sign on mobile"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {copiedId === pv.id ? 'Copied!' : 'Copy Sign Link'}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          {getStatusBadge(pv.voucher_status)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right space-x-1.5">
                          <button
                            onClick={() => handleCopySigningLink(pv)}
                            className="p-1.5 text-gray-500 hover:text-teal-800 hover:bg-gray-100 rounded-lg transition"
                            title="Copy Signing Link"
                          >
                            <Copy className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => setEmailVoucher(pv)}
                            className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-lg transition"
                            title="Email Signing Link to Employee"
                          >
                            <Mail className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => handleWhatsAppShare(pv)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Share on WhatsApp"
                          >
                            <Share2 className="w-4 h-4 inline" />
                          </button>
                          <Link
                            to={`/admin/finance/payment-vouchers/${pv.id}`}
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

          {/* Payment Pagination */}
          {paymentTotalCount > limit && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {skip + 1} to {Math.min(skip + limit, paymentTotalCount)} of {paymentTotalCount} vouchers
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
                  disabled={skip + limit >= paymentTotalCount}
                  onClick={() => setSkip(skip + limit)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payment Voucher Create Modal */}
      <PaymentVoucherCreateModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onCreated={(newVoucher) => {
          fetchPaymentVouchers();
          navigate(`/admin/finance/payment-vouchers/${newVoucher.id}`);
        }}
      />

      {/* Send Email Modal */}
      {emailVoucher && (
        <SendEmailModal
          isOpen={!!emailVoucher}
          onClose={() => setEmailVoucher(null)}
          title={`Email Voucher ${emailVoucher.voucher_number}`}
          defaultEmail={emailVoucher.employee_details?.email || ''}
          defaultName={emailVoucher.employee_details?.name || emailVoucher.employee_details?.full_name || ''}
          onSend={async (data) => {
            await financeApi.sendPaymentVoucherEmail(emailVoucher.id, data);
          }}
        />
      )}
    </div>
  );
};
