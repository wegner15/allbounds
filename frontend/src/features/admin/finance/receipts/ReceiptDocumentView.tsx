import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Mail,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Building,
  User,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PaymentReceipt, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { DocumentHeader } from '../components/DocumentHeader';
import '../components/PrintStyles.css';

interface ReceiptDocumentViewProps {
  receipt: PaymentReceipt;
  settings?: CompanyFinanceSettings | null;
  onSendEmail?: () => void;
  isPublicView?: boolean;
}

export const ReceiptDocumentView: React.FC<ReceiptDocumentViewProps> = ({
  receipt,
  settings,
  onSendEmail,
  isPublicView = false
}) => {
  const client = receipt.received_from || {};
  const alloc = receipt.payment_allocation || {};
  const verificationUrl = `${window.location.origin}/verify/receipt/${receipt.verification_code}`;

  return (
    <div className="max-w-4xl mx-auto my-6">
      {/* Action Bar (Hidden during print) */}
      {!isPublicView && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <Link
            to="/admin/finance/receipts"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Receipts
          </Link>

          <div className="flex items-center space-x-2">
            {onSendEmail && (
              <button
                type="button"
                onClick={onSendEmail}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-2xs transition cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-1.5 text-gray-500" /> Send Email
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print / PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Document Card */}
      <div className="print-container bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-200">
        {/* A. Header */}
        <DocumentHeader
          title="PAYMENT RECEIPT"
          subtitle="Official Electronic Receipt"
          settings={settings}
          statusBadge={
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Completed
            </span>
          }
        />

        {/* B. Receipt Identification & C. Received From */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6 py-4 border-b border-gray-200 text-sm">
          {/* Received From */}
          <div>
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center">
              {client.company ? (
                <Building className="w-3.5 h-3.5 mr-1" />
              ) : (
                <User className="w-3.5 h-3.5 mr-1" />
              )}
              Received From
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1">
              <p className="font-bold text-gray-900 text-base">
                {client.company || client.name || 'Valued Client'}
              </p>
              {client.company && client.name && (
                <p className="text-gray-700"><span className="text-gray-500">Contact:</span> {client.name}</p>
              )}
              {client.email && <p className="text-gray-600">{client.email}</p>}
              {client.phone && <p className="text-gray-600">{client.phone}</p>}
              {client.country && <p className="text-gray-600 font-medium">{client.country}</p>}
            </div>
          </div>

          {/* Identification Details */}
          <div>
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
              Receipt Reference
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt Number:</span>
                <span className="font-mono font-bold text-teal-900">{receipt.receipt_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Reference:</span>
                <span className="font-mono font-bold text-gray-900">{receipt.payment_reference}</span>
              </div>
              {receipt.booking_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Booking Number:</span>
                  <span className="font-mono text-gray-900">ABV-BK-{String(receipt.booking_id).padStart(5, '0')}</span>
                </div>
              )}
              {receipt.invoice_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice ID / Ref:</span>
                  <span className="font-mono text-gray-900 font-semibold">#{receipt.invoice_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Receipt Date:</span>
                <span className="text-gray-900 font-medium">{receipt.receipt_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date & Time:</span>
                <span className="text-gray-900">{new Date(receipt.payment_date).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* D. Payment Details Highlight Banner */}
        <div className="my-6 bg-teal-900 text-white p-6 rounded-xl shadow-sm text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-teal-200 font-semibold">
              Amount Received
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold font-mono mt-1">
              {receipt.currency} {receipt.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs sm:text-sm text-teal-100 italic mt-1 font-medium">
              "{receipt.amount_in_words}"
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-teal-200 space-y-1 bg-teal-800/60 p-3 rounded-lg border border-teal-700/50">
            <p><span className="text-teal-300">Method:</span> <strong className="text-white capitalize">{receipt.payment_method.replace('_', ' ')}</strong></p>
            {receipt.payment_provider && (
              <p><span className="text-teal-300">Provider:</span> <strong className="text-white">{receipt.payment_provider}</strong></p>
            )}
            <p><span className="text-teal-300">Status:</span> <strong className="text-white uppercase">{receipt.payment_status}</strong></p>
          </div>
        </div>

        {/* E. Payment Allocation Table */}
        <div className="my-6">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Payment Allocation & Balances
          </h3>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-right">Invoice Amount</th>
                  <th className="px-4 py-3 text-right">Previously Paid</th>
                  <th className="px-4 py-3 text-right text-teal-900 font-bold">This Payment</th>
                  <th className="px-4 py-3 text-right">Balance Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {alloc.description || `Invoice #${receipt.invoice_id} Settlement`}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-700">
                    {receipt.currency} {(alloc.invoice_amount || receipt.amount_received).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-600">
                    {receipt.currency} {(alloc.previously_paid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-700">
                    {receipt.currency} {receipt.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-gray-900">
                    {receipt.currency} {(alloc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* F. Payment Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs my-6">
          <div>
            <span className="text-gray-500 block">Total Invoice</span>
            <span className="font-mono font-bold text-gray-900 text-sm">
              {receipt.currency} {(alloc.invoice_amount || receipt.amount_received).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Total Paid to Date</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {receipt.currency} {((alloc.total_paid !== undefined ? alloc.total_paid : (alloc.previously_paid || 0) + receipt.amount_received)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Current Payment</span>
            <span className="font-mono font-bold text-teal-800 text-sm">
              {receipt.currency} {receipt.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">Balance Remaining</span>
            <span className="font-mono font-bold text-red-700 text-sm">
              {receipt.currency} {(alloc.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* G. Confirmation Notice & H. Important Notice */}
        <div className="space-y-3 text-xs text-gray-600 bg-teal-50/60 p-4 rounded-xl border border-teal-100 my-6">
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-700 mt-0.5 flex-shrink-0" />
            <p className="font-semibold text-teal-900">
              Payment received with thanks. This receipt confirms that the above amount has been received by Allbound Vacations and allocated to the referenced booking/invoice.
            </p>
          </div>
          <div className="text-[11px] text-gray-500 pl-6 space-y-1">
            <p>&bull; This receipt confirms payment received only. It does not by itself guarantee unconfirmed supplier services until vouchers are issued.</p>
            <p>&bull; All services remain subject to supplier terms and conditions.</p>
            <p>&bull; Standard cancellation and refund policies apply.</p>
          </div>
        </div>

        {/* I. Footer & QR Code Verification */}
        <div className="border-t-2 border-gray-200 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <p className="font-bold text-gray-800">Allbound Vacations Customer Service</p>
            <p>24/7 Hotline: {settings?.phone || '+(256) 782 594 008'} &bull; Email: {settings?.email || 'bookings@allboundvacations.com'}</p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">
              Verification Code: {receipt.verification_code} &bull; Generated: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <QRCodeSVG value={verificationUrl} size={60} level="M" />
            <div className="text-[10px] text-gray-500 text-left">
              <p className="font-bold text-gray-700">Scan to Verify</p>
              <p className="font-mono text-[9px] text-teal-800">{receipt.verification_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
