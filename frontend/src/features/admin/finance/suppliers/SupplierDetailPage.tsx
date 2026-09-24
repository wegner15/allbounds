import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Printer,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  CreditCard,
  Edit2,
  Smartphone,
  Check,
  Compass,
  Download,
  Loader2,
} from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier, SupplierLedger, SupplierBill } from '../../../../lib/types/finance';
import { SupplierEditorModal } from './SupplierEditorModal';
import { SupplierBillModal } from './SupplierBillModal';
import { SupplierPaymentModal } from './SupplierPaymentModal';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';

export const SupplierDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const supplierId = Number(id);

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [ledger, setLedger] = useState<SupplierLedger | null>(null);
  const [bills, setBills] = useState<SupplierBill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab: 'ledger' | 'bills'
  const [activeTab, setActiveTab] = useState<'ledger' | 'bills'>('ledger');

  // Ledger date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<SupplierBill | null>(null);

  // PDF Download
  const ledgerRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();

  const handleDownloadPdf = () => {
    if (!supplier) return;
    const cleanName = (supplier.name || 'Supplier').replace(/[^a-zA-Z0-9]/g, '-');
    downloadPdf(ledgerRef.current, `Supplier-Statement-${cleanName}.pdf`);
  };

  const fetchSupplierData = async () => {
    if (!supplierId) return;
    try {
      setLoading(true);
      setError(null);
      const [supplierRes, ledgerRes, billsRes] = await Promise.all([
        suppliersApi.getSupplier(supplierId),
        suppliersApi.getLedger(supplierId, startDate || undefined, endDate || undefined),
        suppliersApi.getBills({ supplier_id: supplierId, limit: 100 }),
      ]);
      setSupplier(supplierRes);
      setLedger(ledgerRes);
      setBills(billsRes.items);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load supplier details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [supplierId, startDate, endDate]);

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Supplier Not Found</h2>
        <p className="text-sm text-gray-500">{error || 'The requested supplier profile could not be loaded.'}</p>
        <Link
          to="/admin/finance/suppliers"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Suppliers Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Top breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link
          to="/admin/finance/suppliers"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Suppliers Directory
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
            Edit Supplier
          </button>
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Inbound Bill
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Supplier Profile Card (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 no-print print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-2xl shrink-0 border border-purple-100">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-playfair text-gray-900">{supplier.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                  {supplier.supplier_code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100/60 text-purple-800">
                  {supplier.category.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-xs text-gray-500">
                {supplier.contact_person && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">Contact:</span>
                    <span>{supplier.contact_person}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <a href={`mailto:${supplier.email}`} className="text-teal-700 hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {(supplier.phone || supplier.whatsapp) && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{supplier.phone || supplier.whatsapp}</span>
                  </div>
                )}
                {supplier.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{supplier.country}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Terms:</span>
                  <span>{supplier.payment_terms || 'Net 30'}</span>
                </div>
                {supplier.tax_pin_number && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700">TIN / PIN:</span>
                    <span className="font-mono">{supplier.tax_pin_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Balance Box */}
          <div className="w-full md:w-auto p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-row md:flex-col justify-between items-center md:items-end gap-2 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Outstanding Payable
            </span>
            <span
              className={`text-2xl font-black ${
                (supplier.balance_payable_usd || 0) > 0 ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              ${(supplier.balance_payable_usd || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-xs text-gray-400">Base Currency: {supplier.currency}</span>
          </div>
        </div>

        {/* Banking / Mobile Money Settlement Details Accordion */}
        {(supplier.bank_details?.bank_name || supplier.mobile_money_details?.momo_number) && (
          <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {supplier.bank_details?.bank_name && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/60 flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-blue-900">Bank Settlement Details</p>
                  <p className="text-gray-600 mt-0.5">
                    <span className="font-medium">Bank:</span> {supplier.bank_details.bank_name} &bull;{' '}
                    <span className="font-medium">Account:</span> {supplier.bank_details.account_number}
                  </p>
                  {supplier.bank_details.account_name && (
                    <p className="text-gray-500">Name: {supplier.bank_details.account_name}</p>
                  )}
                </div>
              </div>
            )}
            {supplier.mobile_money_details?.momo_number && (
              <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/60 flex items-start gap-3">
                <Smartphone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-900">Mobile Money / Airtel / M-PESA</p>
                  <p className="text-gray-600 mt-0.5">
                    <span className="font-medium">Number:</span> {supplier.mobile_money_details.momo_number}
                  </p>
                  {supplier.mobile_money_details.momo_name && (
                    <p className="text-gray-500">Name: {supplier.mobile_money_details.momo_name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Financial Summary Cards (Hidden during print) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print print:hidden">
        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Inbound Billed</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              ${(supplier.total_billed_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Settled / Paid</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">
              ${(supplier.total_paid_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Balance Outstanding</p>
            <p className="text-xl font-bold text-rose-700 mt-0.5">
              ${(supplier.balance_payable_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 no-print print:hidden">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'ledger'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Vendor Statement & Ledger
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 ${
            activeTab === 'bills'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Inbound Bills ({bills.length})
        </button>
      </div>

      {/* TAB 1: LEDGER / STATEMENT VIEW */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Statement Date Range Filters */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Period:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-teal-700 hover:underline font-medium"
                >
                  Reset Period
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Showing statement as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Printable Statement Document */}
          <div
            ref={ledgerRef}
            className="print-container bg-white rounded-2xl border border-gray-100 shadow-sm p-8 print:p-0 print:border-none print:shadow-none space-y-6"
          >
            <div className="flex justify-between items-start border-b border-gray-100 pb-6">
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider text-teal-800">
                  ALLBOUND VACATIONS LTD
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Plot 335 , Block 13 Najjanankumbi , Entebbe Road, Kampala Uganda</p>
                <p className="text-xs text-gray-500">finance@allboundvacations.com | +256 700 000 000</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold font-playfair text-gray-900">SUPPLIER STATEMENT</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">
                  Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Vendor & Summary Block */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Vendor / Payee:</p>
                <p className="font-bold text-gray-900 text-base">{supplier.name}</p>
                <p className="text-xs text-gray-500">{supplier.physical_address || supplier.country}</p>
                <p className="text-xs text-gray-500 font-mono">Code: {supplier.supplier_code}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl space-y-1 text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Statement Balance Payable</p>
                <p className="text-2xl font-black text-rose-700">
                  ${(ledger?.closing_payable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">
                  Total Billed: ${(ledger?.total_billed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} | Total Paid: ${(ledger?.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/75 border-y border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Supplier Invoice #</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Billed Amount</th>
                    <th className="py-3 px-4 text-right">Disbursed (Paid)</th>
                    <th className="py-3 px-4 text-right">Running Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ledger?.transactions && ledger.transactions.length > 0 ? (
                    ledger.transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 text-xs font-medium text-gray-600">{tx.date}</td>
                        <td className="py-3 px-4 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold text-[11px] ${
                              tx.type === 'BILL'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-gray-900">
                          {tx.reference_number}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-500">
                          {tx.supplier_reference || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600 max-w-xs truncate">
                          {tx.description}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                          {tx.bill_amount > 0 ? `$${tx.bill_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-emerald-600">
                          {tx.paid_amount > 0 ? `$${tx.paid_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          ${tx.running_payable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400 text-sm">
                        No transactions found for this supplier in the selected period.
                      </td>
                    </tr>
                  )}
                </tbody>
                {ledger?.transactions && ledger.transactions.length > 0 && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold text-xs">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 uppercase text-gray-600">Closing Balance Payable:</td>
                      <td className="py-3 px-4 text-right text-gray-900">
                        ${(ledger?.total_billed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700">
                        ${(ledger?.total_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-700 text-sm">
                        ${(ledger?.closing_payable || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INBOUND BILLS VIEW */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-900">Bills from {supplier.name}</h3>
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Bill
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Bill #</th>
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
                {bills.length > 0 ? (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800 text-xs">
                        {bill.bill_number}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                        {bill.supplier_reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{bill.bill_date}</td>
                      <td className="py-3.5 px-4 text-xs text-gray-500">{bill.due_date}</td>
                      <td className="py-3.5 px-4 text-xs capitalize text-gray-600">
                        {bill.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-gray-800">
                        ${bill.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                        ${bill.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        {bill.balance_payable > 0 ? (
                          <span className="text-rose-600">
                            ${bill.balance_payable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(bill.status)}</td>
                      <td className="py-3.5 px-4 text-center">
                        {bill.balance_payable > 0 && (
                          <button
                            onClick={() => setSelectedBillForPayment(bill)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            Disburse
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-gray-400 text-sm">
                      No bills recorded yet for this supplier.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <SupplierEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplierToEdit={supplier}
        onSaved={() => {
          setIsEditModalOpen(false);
          fetchSupplierData();
        }}
      />

      {/* Record Bill Modal */}
      <SupplierBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        suppliers={[supplier]}
        defaultSupplierId={supplier.id}
        onSaved={() => {
          setIsBillModalOpen(false);
          fetchSupplierData();
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
            fetchSupplierData();
          }}
        />
      )}
    </div>
  );
};
