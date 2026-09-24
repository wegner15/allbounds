import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Mail,
  Edit,
  DollarSign,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Building,
  ArrowLeft,
  Download,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Invoice, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { DocumentHeader } from '../components/DocumentHeader';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';
import '../components/PrintStyles.css';

interface InvoiceDocumentViewProps {
  invoice: Invoice;
  settings?: CompanyFinanceSettings | null;
  onRecordPayment?: () => void;
  onSendEmail?: () => void;
  isPublicView?: boolean;
}

export const InvoiceDocumentView: React.FC<InvoiceDocumentViewProps> = ({
  invoice,
  settings,
  onRecordPayment,
  onSendEmail,
  isPublicView = false
}) => {
  const [activeTab, setActiveTab] = useState<'document' | 'receipts'>('document');
  const documentRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();

  const handleDownloadPdf = () => {
    if (activeTab !== 'document') {
      setActiveTab('document');
      setTimeout(() => {
        downloadPdf(documentRef.current, `Invoice-${invoice.invoice_number || 'INV'}.pdf`);
      }, 100);
    } else {
      downloadPdf(documentRef.current, `Invoice-${invoice.invoice_number || 'INV'}.pdf`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-[#e6f7f5] text-[#0f766e] border border-teal-300 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#0f766e]" /> Paid
          </span>
        );
      case 'partially_paid':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 mr-1" /> Partially Paid
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 mr-1" /> Issued
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Overdue
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-200 text-gray-800 border border-gray-300 uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 uppercase tracking-wider">
            Draft
          </span>
        );
    }
  };

  const client = invoice.client_details || {};
  const trip = invoice.trip_summary || {};
  const paymentMethods = invoice.payment_methods_snapshot || {
    bank_accounts: settings?.bank_accounts || [],
    mobile_money_accounts: settings?.mobile_money_accounts || [],
    card_payment_info: settings?.card_payment_info || ''
  };

  const verificationUrl = `${window.location.origin}/verify/invoice/${invoice.verification_token}`;

  return (
    <div className="max-w-5xl mx-auto my-6 print:m-0 print:max-w-none">
      {/* Top Action Bar (Hidden during print) */}
      <div className="no-print print:hidden mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {!isPublicView ? (
          <div className="flex items-center space-x-3">
            <Link
              to="/admin/finance/invoices"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
            </Link>
            <span className="text-gray-300">|</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('document')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition cursor-pointer ${
                  activeTab === 'document'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Invoice View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('receipts')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition cursor-pointer ${
                  activeTab === 'receipts'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Payments & Receipts ({invoice.receipts?.length || 0})
              </button>
            </div>
          </div>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            Official Allbound Vacations Invoice
          </span>
        )}

        <div className="flex items-center space-x-2">
          {invoice.invoice_status !== 'paid' && invoice.invoice_status !== 'cancelled' && onRecordPayment && !isPublicView && (
            <button
              type="button"
              onClick={onRecordPayment}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium shadow-sm transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4 mr-1.5" /> Record Payment
            </button>
          )}
          {onSendEmail && !isPublicView && (
            <button
              type="button"
              onClick={onSendEmail}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-1.5 text-gray-500" /> Send Email
            </button>
          )}
          {!isPublicView && (
            <Link
              to={`/admin/finance/invoices/${invoice.id}/edit`}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition"
            >
              <Edit className="w-4 h-4 mr-1.5 text-gray-500" /> Edit
            </Link>
          )}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPdf}
            className="inline-flex items-center px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-1.5" /> Download PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-1.5 text-gray-500" /> Print
          </button>
        </div>
      </div>

      {/* Tab: Receipts List */}
      {activeTab === 'receipts' && !isPublicView ? (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-teal-700" /> Payment History & Receipts
          </h3>
          {invoice.receipts && invoice.receipts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Receipt No</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-right">Amount Received</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {invoice.receipts.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-teal-900">
                        {rec.receipt_number}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(rec.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700 capitalize">
                        {rec.payment_method.replace('_', ' ')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {rec.payment_reference}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        {rec.currency} {rec.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          to={`/admin/finance/receipts/${rec.id}`}
                          className="text-teal-700 hover:text-teal-900 font-medium text-xs underline"
                        >
                          View Receipt
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-4">
              No payments have been recorded for this invoice yet.
            </p>
          )}
        </div>
      ) : (
        /* Document Card */
        <div ref={documentRef} className="print-container bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-200 print:shadow-none print:border-none print:p-0">
          {/* A. Header */}
          <DocumentHeader
            title="INVOICE"
            subtitle="Official Billing Document"
            settings={settings}
            statusBadge={getStatusBadge(invoice.invoice_status)}
          />

          {/* B. Identification & C. Bill To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 py-4 border-b border-gray-200 text-sm">
            {/* Bill To */}
            <div>
              <h3 className="text-xs font-bold text-[#0c3b44] uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                {invoice.client_type === 'corporate' ? (
                  <Building className="w-4 h-4 text-[#c59b27]" />
                ) : (
                  <User className="w-4 h-4 text-[#c59b27]" />
                )}
                <span className="text-[#c59b27] font-light">|</span>
                <span>Bill To: {invoice.client_type === 'corporate' ? 'Corporate Client' : 'Individual Traveller'}</span>
              </h3>
              <div className="bg-[#f4f9fa] p-4 rounded-xl border border-[#e2eff2] space-y-1">
                {invoice.client_type === 'corporate' ? (
                  <>
                    <p className="font-bold text-gray-900 text-base">
                      {client.company_name || client.full_name || 'Corporate Account'}
                    </p>
                    {client.contact_person && (
                      <p className="text-gray-700"><span className="text-gray-500">Attn:</span> {client.contact_person}</p>
                    )}
                    {client.tin_vat && (
                      <p className="text-gray-700"><span className="text-gray-500">TIN/VAT:</span> {client.tin_vat}</p>
                    )}
                    {client.purchase_order_number && (
                      <p className="text-gray-700"><span className="text-gray-500">PO #:</span> {client.purchase_order_number}</p>
                    )}
                  </>
                ) : (
                  <p className="font-bold text-gray-900 text-base">
                    {client.full_name || 'Guest'}
                  </p>
                )}
                {client.email && <p className="text-gray-600">{client.email}</p>}
                {client.telephone && <p className="text-gray-600">{client.telephone}</p>}
                {client.address && <p className="text-gray-600">{client.address}</p>}
                {client.country && <p className="text-gray-600 font-medium">{client.country}</p>}
              </div>
            </div>

            {/* Invoice Meta */}
            <div>
              <h3 className="text-xs font-bold text-[#0c3b44] uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#c59b27]" />
                <span className="text-[#c59b27] font-light">|</span>
                <span>Invoice Details</span>
              </h3>
              <div className="bg-[#f4f9fa] p-4 rounded-xl border border-[#e2eff2] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Number:</span>
                  <span className="font-mono font-bold text-gray-900">{invoice.invoice_number}</span>
                </div>
                {invoice.booking_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Booking Reference:</span>
                    <span className="font-mono text-gray-900 font-semibold">ABV-BK-{String(invoice.booking_id).padStart(5, '0')}</span>
                  </div>
                )}
                {invoice.quote_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quote Number:</span>
                    <span className="font-mono text-gray-800">{invoice.quote_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Date:</span>
                  <span className="text-gray-900 font-medium">{invoice.invoice_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Due Date:</span>
                  <span className="text-[#c59b27] font-bold">{invoice.due_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-bold text-gray-900">{invoice.currency}</span>
                </div>
                {invoice.consultant_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Consultant:</span>
                    <span className="text-gray-900">{invoice.consultant_name}</span>
                  </div>
                )}
                {invoice.payment_terms && (
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Terms:</span>
                    <span className="text-gray-800 font-medium text-right">{invoice.payment_terms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* D. Trip / Booking Summary */}
          {(trip.tour_package_name || trip.destinations || trip.travel_type) && (
            <div className="mb-6 bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 text-xs sm:text-sm">
              <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" /> Trip / Booking Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-700">
                {trip.tour_package_name && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block text-[11px]">Tour / Package</span>
                    <span className="font-bold text-gray-900">{trip.tour_package_name}</span>
                  </div>
                )}
                {trip.travel_type && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Travel Type</span>
                    <span className="font-semibold">{trip.travel_type}</span>
                  </div>
                )}
                {trip.destinations && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Destination(s)</span>
                    <span className="font-semibold">{trip.destinations}</span>
                  </div>
                )}
                {(trip.adults !== undefined || trip.children !== undefined) && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Travellers</span>
                    <span>
                      {trip.adults || 1} Adults{trip.children ? `, ${trip.children} Children` : ''}
                      {trip.infants ? `, ${trip.infants} Infants` : ''}
                    </span>
                  </div>
                )}
                {(trip.duration_days || trip.duration_nights) && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Duration</span>
                    <span>
                      {trip.duration_days ? `${trip.duration_days} Days` : ''}{' '}
                      {trip.duration_nights ? `(${trip.duration_nights} Nights)` : ''}
                    </span>
                  </div>
                )}
                {trip.accommodation_category && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Accommodation</span>
                    <span>{trip.accommodation_category}</span>
                  </div>
                )}
                {trip.meal_plan && (
                  <div>
                    <span className="text-gray-500 block text-[11px]">Meal Plan</span>
                    <span>{trip.meal_plan}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* E. Invoice Line Items Table */}
          <div className="my-6">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Itemized Services
            </h3>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">#</th>
                    <th className="px-4 py-3 text-left">Item / Description</th>
                    <th className="px-4 py-3 text-center">Category</th>
                    <th className="px-4 py-3 text-center">Date</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    {invoice.discount_amount > 0 && <th className="px-4 py-3 text-right">Disc</th>}
                    {invoice.vat_amount > 0 && <th className="px-4 py-3 text-right">Tax</th>}
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {invoice.line_items && invoice.line_items.length > 0 ? (
                    invoice.line_items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{item.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 capitalize">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-gray-600">
                          {item.travel_date || '-'}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-700">
                          {item.unit_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        {invoice.discount_amount > 0 && (
                          <td className="px-4 py-3 text-right font-mono text-red-600 text-xs">
                            {item.discount > 0 ? `-${item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                          </td>
                        )}
                        {invoice.vat_amount > 0 && (
                          <td className="px-4 py-3 text-right font-mono text-gray-600 text-xs">
                            {item.tax_amount > 0 ? item.tax_amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                          {item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">
                        No line items entered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* F. Financial Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 my-6">
            {/* Callout box on the left */}
            <div className="w-full sm:w-1/2 space-y-4">
              <div className="bg-teal-900 text-white p-5 rounded-xl shadow-sm">
                <p className="text-xs uppercase tracking-wider text-teal-200 font-semibold">
                  Amount Due
                </p>
                <p className="text-3xl font-extrabold font-mono mt-1">
                  {invoice.currency} {invoice.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-3 pt-3 border-t border-teal-700/60 flex justify-between text-xs">
                  <span className="text-teal-200">Payment Due By:</span>
                  <span className="font-bold text-white">{invoice.due_date}</span>
                </div>
              </div>

              {/* Invoice notes preview */}
              {invoice.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
                  <p className="font-bold text-gray-800 mb-1">Invoice Notes:</p>
                  <p className="whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>

            {/* Financial breakdown table on the right */}
            <div className="w-full sm:w-1/2">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">
                    {invoice.currency} {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600 text-xs">
                    <span>Discount Applied:</span>
                    <span className="font-mono">
                      -{invoice.currency} {invoice.discount_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {invoice.promotional_discount > 0 && (
                  <div className="flex justify-between text-red-600 text-xs">
                    <span>Promo Discount:</span>
                    <span className="font-mono">
                      -{invoice.currency} {invoice.promotional_discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {invoice.vat_amount > 0 && (
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>VAT / Tax:</span>
                    <span className="font-mono">
                      +{invoice.currency} {invoice.vat_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {invoice.service_fee > 0 && (
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Service Fee:</span>
                    <span className="font-mono">
                      +{invoice.currency} {invoice.service_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total Invoice Value:</span>
                  <span className="font-mono text-teal-900">
                    {invoice.currency} {invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-emerald-700 text-xs pt-1">
                  <span>Amount Paid to Date:</span>
                  <span className="font-mono font-bold">
                    {invoice.currency} {invoice.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {invoice.credit_applied > 0 && (
                  <div className="flex justify-between text-emerald-700 text-xs">
                    <span>Credit Applied:</span>
                    <span className="font-mono">
                      {invoice.currency} {invoice.credit_applied.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t-2 border-gray-900 flex justify-between font-extrabold text-base text-gray-900">
                  <span>Balance Due:</span>
                  <span className="font-mono text-red-700">
                    {invoice.currency} {invoice.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* G. Payment Information */}
          <div className="my-6 border border-gray-200 rounded-xl p-5 bg-white">
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-3">
              Payment Instructions & Bank Transfer
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-700">
              {paymentMethods.bank_accounts && paymentMethods.bank_accounts.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">
                    {paymentMethods.bank_accounts[0].bank_name}
                  </p>
                  <p><span className="text-gray-500">Account Name:</span> {paymentMethods.bank_accounts[0].account_name}</p>
                  <p><span className="text-gray-500">Account Number:</span> <span className="font-mono font-bold text-gray-900">{paymentMethods.bank_accounts[0].account_number}</span></p>
                  {paymentMethods.bank_accounts[0].branch && (
                    <p><span className="text-gray-500">Branch:</span> {paymentMethods.bank_accounts[0].branch}</p>
                  )}
                  {paymentMethods.bank_accounts[0].swift_bic && (
                    <p><span className="text-gray-500">SWIFT / BIC:</span> <span className="font-mono font-semibold">{paymentMethods.bank_accounts[0].swift_bic}</span></p>
                  )}
                  <p><span className="text-gray-500">Currency:</span> {paymentMethods.bank_accounts[0].currency || invoice.currency}</p>
                </div>
              )}

              {paymentMethods.mobile_money_accounts && paymentMethods.mobile_money_accounts.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                  <p className="font-bold text-gray-900 text-sm">
                    Mobile Money Payments
                  </p>
                  {paymentMethods.mobile_money_accounts.map((momo: any, mIdx: number) => (
                    <div key={mIdx} className="pt-1">
                      <p><span className="font-semibold text-gray-800">{momo.network}:</span></p>
                      <p><span className="text-gray-500">Merchant Code:</span> <span className="font-mono font-bold text-gray-900">{momo.merchant_number}</span></p>
                      <p><span className="text-gray-500">Account Name:</span> {momo.account_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {paymentMethods.card_payment_info && (
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-semibold text-gray-700">Card Payments:</span> {paymentMethods.card_payment_info}
              </p>
            )}
          </div>

          {/* H. Invoice Terms & I. Footer */}
          <div className="border-t-2 border-gray-200 pt-6 mt-6">
            {invoice.terms_and_conditions && (
              <div className="mb-4 text-[11px] text-gray-500 space-y-1">
                <p className="font-bold uppercase tracking-wider text-gray-700">Terms & Conditions:</p>
                <p className="whitespace-pre-line leading-relaxed">{invoice.terms_and_conditions}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center sm:text-left">
                <p className="font-bold text-gray-800">Thank you for travelling with Allbound Vacations!</p>
                <p className="mt-0.5">This is a system-generated invoice and does not require a physical signature.</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  Generated on {new Date().toLocaleString()} &bull; Verification Ref: {invoice.verification_token}
                </p>
              </div>

              {/* QR Code */}
              <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <QRCodeSVG value={verificationUrl} size={60} level="M" />
                <div className="text-[10px] text-gray-500 text-left">
                  <p className="font-bold text-gray-700">Scan to Verify</p>
                  <p>Or visit online portal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
