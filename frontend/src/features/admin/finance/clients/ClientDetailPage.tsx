import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Building,
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
  Download,
  Loader2,
} from 'lucide-react';
import { clientsApi } from '../../../../lib/api/clients';
import type { Client, ClientStatement } from '../../../../lib/types/finance';
import { ClientEditorModal } from './ClientEditorModal';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);

  const [client, setClient] = useState<Client | null>(null);
  const [statement, setStatement] = useState<ClientStatement | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Statement date range filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // PDF Download
  const statementRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();

  const handleDownloadPdf = () => {
    if (!client) return;
    const cleanName = (client.display_name || 'Client').replace(/[^a-zA-Z0-9]/g, '-');
    downloadPdf(statementRef.current, `Statement-of-Account-${cleanName}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchClientData = async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      setError(null);
      const [clientRes, statementRes] = await Promise.all([
        clientsApi.getClient(clientId),
        clientsApi.getStatement(clientId, startDate || undefined, endDate || undefined),
      ]);
      setClient(clientRes);
      setStatement(statementRes);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load client profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [clientId, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-gray-100 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Client Not Found</h2>
        <p className="text-sm text-gray-500">{error || 'The requested client profile could not be loaded.'}</p>
        <Link
          to="/admin/finance/clients"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <Link
          to="/admin/finance/clients"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Clients Directory
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download PDF
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" /> Print
          </button>
          <Link
            to={`/admin/finance/invoices/new?client_id=${client.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Client Profile Header Card (Hidden during print) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 no-print print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-2xl">
              {client.display_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-gray-900">
                  {client.display_name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                    client.client_type === 'corporate'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {client.client_type === 'corporate' ? (
                    <>
                      <Building className="w-3 h-3" /> Corporate
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" /> Individual
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Client ID: #{client.id.toString().padStart(5, '0')} • Registered on{' '}
                {client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Email</span>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Mail className="w-4 h-4 text-teal-600 shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Phone</span>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Phone className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{client.phone || client.alt_phone || '—'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Origin / Country</span>
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{client.city ? `${client.city}, ` : ''}{client.country_of_origin || 'Uganda'}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
              {client.client_type === 'corporate' ? 'TIN / VAT' : 'Passport / ID'}
            </span>
            <div className="font-semibold text-gray-900">
              {client.tin_number || client.passport_number || '—'}
            </div>
          </div>
        </div>

        {/* Financial KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 bg-gray-50 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Billed</span>
            <p className="text-xl font-bold text-gray-900 mt-1">
              ${client.total_invoiced_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Total Paid</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">
              ${client.total_paid_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${
            client.outstanding_balance_usd > 0
              ? 'bg-amber-50 border-amber-200'
              : 'bg-gray-50 border-gray-100'
          }`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              client.outstanding_balance_usd > 0 ? 'text-amber-700' : 'text-gray-400'
            }`}>
              Outstanding Balance
            </span>
            <p className={`text-xl font-bold mt-1 ${
              client.outstanding_balance_usd > 0 ? 'text-amber-800' : 'text-gray-900'
            }`}>
              ${client.outstanding_balance_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Statement of Account Section */}
      <div
        ref={statementRef}
        className="print-container bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 print:p-0 print:border-none print:shadow-none"
      >
        {/* Printable Letterhead Header */}
        <div className="border-b border-gray-200 pb-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-teal-800">
              ALLBOUND VACATIONS LTD
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Plot 335 , Block 13 Najjanankumbi , Entebbe Road, Kampala Uganda</p>
            <p className="text-xs text-gray-500">finance@allboundvacations.com | +256 700 000 000</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold font-playfair text-gray-900">STATEMENT OF ACCOUNT</h3>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Client & Summary Banner */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Account / Client:</p>
            <p className="font-bold text-gray-900 text-base">{client.display_name}</p>
            {client.company_name && (
              <p className="text-xs text-gray-600 font-medium">{client.company_name}</p>
            )}
            <p className="text-xs text-gray-500">{client.email}</p>
            {client.phone && <p className="text-xs text-gray-500">{client.phone}</p>}
            {client.country_of_origin && (
              <p className="text-xs text-gray-500">{client.country_of_origin}</p>
            )}
          </div>
          <div className="p-4 bg-gray-50 rounded-xl space-y-1 text-right print:bg-gray-50">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Closing Balance Due</p>
            <p className={`text-2xl font-black ${
              client.outstanding_balance_usd > 0 ? 'text-amber-800' : 'text-emerald-700'
            }`}>
              ${(statement?.closing_balance ?? client.outstanding_balance_usd).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs text-gray-500">
              Total Billed: ${(statement?.total_billed ?? client.total_invoiced_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })} | Total Paid: ${(statement?.total_paid ?? client.total_paid_usd).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4 no-print print:hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Transaction History</h2>
            <p className="text-xs text-gray-500 mt-0.5">Chronological record of invoices issued and receipts collected</p>
          </div>

          {/* Date Range Controls */}
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-teal-700 hover:underline mt-4 font-semibold"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        {!statement || statement.transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto stroke-1" />
            <p className="text-sm font-medium">No transactions recorded for this client yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Debit (Billed)</th>
                  <th className="py-3 px-4 text-right">Credit (Paid)</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {statement.transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          tx.type === 'INVOICE'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {tx.reference_number}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {tx.debit > 0 ? `${tx.currency} ${tx.debit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {tx.credit > 0 ? `${tx.currency} ${tx.credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      ${tx.running_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50/75 font-bold text-gray-900 text-sm">
                <tr>
                  <td colSpan={4} className="py-3.5 px-4 text-right uppercase text-xs tracking-wider">
                    Total Statement Summary:
                  </td>
                  <td className="py-3.5 px-4 text-right text-gray-900">
                    ${statement.total_billed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700">
                    ${statement.total_paid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-800">
                    ${statement.closing_balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ClientEditorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={fetchClientData}
        clientToEdit={client}
      />
    </div>
  );
};
