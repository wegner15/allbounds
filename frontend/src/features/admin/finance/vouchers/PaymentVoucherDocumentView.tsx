import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PenTool,
  ArrowLeft,
  Calendar,
  Building2,
  Phone,
  Mail,
  User,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PaymentVoucher, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { financeApi } from '../../../../lib/api/finance';
import { DocumentHeader } from '../components/DocumentHeader';
import { DocumentStamp } from '../components/DocumentStamp';
import { SendEmailModal } from '../components/SendEmailModal';
import { usePdfDownload } from '../../../../lib/utils/pdfGenerator';
import '../components/PrintStyles.css';

interface PaymentVoucherDocumentViewProps {
  voucher: PaymentVoucher;
  settings?: CompanyFinanceSettings | null;
  onRefresh?: () => void;
  onUpdateStatus?: (newStatus: string) => void;
}

export const PaymentVoucherDocumentView: React.FC<PaymentVoucherDocumentViewProps> = ({
  voucher,
  settings,
  onRefresh,
  onUpdateStatus
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const { isGenerating, downloadPdf } = usePdfDownload();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleDownloadPdf = () => {
    downloadPdf(
      documentRef.current,
      `Payment-Voucher-${voucher.voucher_number || 'PV'}.pdf`
    );
  };

  const signingUrl = `${window.location.origin}/sign/voucher/${voucher.signing_token}`;
  const verificationUrl = `${window.location.origin}/verify/payment-voucher/${voucher.verification_code}`;

  const handleCopySigningLink = () => {
    navigator.clipboard.writeText(signingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const empName = voucher.employee_details?.name || 'Staff Member';
    const text = encodeURIComponent(
      `Hello ${empName}, please find and sign your Allbound Vacations payment & expense authorization voucher (${voucher.voucher_number}) for ${voucher.currency} ${voucher.amount.toLocaleString()}:\n${signingUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
      case 'reconciled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {status}
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
            Disbursed
          </span>
        );
      case 'authorized':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300 uppercase tracking-wider">
            Authorized
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
            Draft
          </span>
        );
    }
  };

  const employee = voucher.employee_details || {};

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/finance/vouchers"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>Voucher {voucher.voucher_number}</span>
              {getStatusBadge(voucher.voucher_status)}
            </h2>
            <p className="text-xs text-gray-500">
              Employee Expense & Disbursement Authorization
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Signing Link Button */}
          <button
            onClick={handleCopySigningLink}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
              copiedLink
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'Signing Link Copied!' : 'Copy Signing Link'}
          </button>

          {/* Email Signing Link */}
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition"
          >
            <Mail className="w-4 h-4" /> Email Signing Link
          </button>

          {/* Share on WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Share2 className="w-4 h-4" /> Share via WhatsApp
          </button>

          {/* Open Public Signing Page */}
          <a
            href={signingUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
          >
            <ExternalLink className="w-4 h-4" /> Open Signing Form
          </a>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="bg-gray-200 p-4 sm:p-8 rounded-2xl flex justify-center overflow-x-auto">
        <div
          ref={documentRef}
          className="print-document bg-white w-full max-w-[850px] min-h-[1100px] p-8 sm:p-12 shadow-2xl rounded-xl text-gray-900 flex flex-col justify-between"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          <div className="space-y-6">
            {/* Header with official logo */}
            <DocumentHeader
              title="PAYMENT & EXPENSE VOUCHER"
              subtitle="EMPLOYEE DISBURSEMENT & AUTHORIZATION"
              settings={settings}
              statusBadge={getStatusBadge(voucher.voucher_status)}
            />

            {/* Top Meta Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-teal-50/60 rounded-xl border border-teal-100 text-xs">
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Voucher Status</span>
                <div className="mt-1">{getStatusBadge(voucher.voucher_status)}</div>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Issue Date</span>
                <span className="font-semibold text-gray-900 text-sm mt-0.5 block">
                  {voucher.issue_date}
                </span>
                {voucher.due_date && (
                  <span className="text-[11px] text-gray-500">
                    Accountability Due: {voucher.due_date}
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Expense Category</span>
                <span className="font-bold text-teal-900 text-sm capitalize mt-0.5 block">
                  {voucher.category.replace(/_/g, ' ')}
                </span>
                {voucher.booking_id && (
                  <span className="text-[11px] text-gray-500">
                    Booking Ref: ABV-BK-{String(voucher.booking_id).padStart(5, '0')}
                  </span>
                )}
              </div>
            </div>

            {/* Recipient Details & Payment Terms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl border border-gray-200 bg-white">
              {/* Employee Column */}
              <div>
                <span className="text-xs font-bold uppercase text-teal-800 tracking-wider flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5" /> Authorized Payee / Staff Member
                </span>
                <div className="text-xs space-y-1">
                  <p className="text-sm font-bold text-gray-900">
                    {employee.name || employee.full_name || 'Staff Member'}
                  </p>
                  {employee.role && (
                    <p className="text-gray-600 font-medium">Role: {employee.role}</p>
                  )}
                  {employee.department && (
                    <p className="text-gray-500">Department: {employee.department}</p>
                  )}
                  {employee.phone && (
                    <p className="text-gray-500">Tel: {employee.phone}</p>
                  )}
                  {employee.email && (
                    <p className="text-gray-500">Email: {employee.email}</p>
                  )}
                  {employee.id_number && (
                    <p className="text-gray-500">ID / Staff No: {employee.id_number}</p>
                  )}
                </div>
              </div>

              {/* Disbursement Mode Column */}
              <div>
                <span className="text-xs font-bold uppercase text-teal-800 tracking-wider flex items-center gap-1.5 mb-2">
                  <CreditCard className="w-3.5 h-3.5" /> Disbursement Details
                </span>
                <div className="text-xs space-y-1">
                  <p className="text-gray-700">
                    <strong className="text-gray-900">Method:</strong>{' '}
                    <span className="capitalize">{voucher.disbursement_method.replace(/_/g, ' ')}</span>
                  </p>
                  {voucher.disbursed_from_account && (
                    <p className="text-gray-600">
                      <strong>Source Account:</strong> {voucher.disbursed_from_account}
                    </p>
                  )}
                  {voucher.disbursement_reference && (
                    <p className="text-gray-600">
                      <strong>Ref / Cheque #:</strong> {voucher.disbursement_reference}
                    </p>
                  )}
                  {voucher.disbursed_at && (
                    <p className="text-gray-600">
                      <strong>Disbursed At:</strong> {new Date(voucher.disbursed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Purpose / Title Box */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 text-xs space-y-1">
              <span className="font-bold text-gray-900 uppercase tracking-wider block text-[11px]">
                Authorized Purpose & Description
              </span>
              <p className="text-sm font-semibold text-gray-900">{voucher.title}</p>
              {voucher.description && (
                <p className="text-gray-600 leading-relaxed text-xs">{voucher.description}</p>
              )}
            </div>

            {/* Itemized Line Items Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-xs">
                <thead className="bg-teal-900 text-white uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5 text-left w-12">#</th>
                    <th className="px-3 py-2.5 text-left">Description / Particulars</th>
                    <th className="px-3 py-2.5 text-center w-16">Qty</th>
                    <th className="px-3 py-2.5 text-right w-28">Unit Rate</th>
                    <th className="px-3 py-2.5 text-right w-32">Total ({voucher.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {voucher.line_items && voucher.line_items.length > 0 ? (
                    voucher.line_items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {item.description}
                          {item.notes && (
                            <span className="block text-[11px] text-gray-400 font-normal">
                              {item.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-600">
                          {item.quantity || 1}
                        </td>
                        <td className="px-3 py-2 text-right text-gray-600 font-mono">
                          {(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900 font-mono">
                          {(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-4 text-center text-gray-400 italic">
                        No line items specified.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-teal-50/70 border-t-2 border-teal-800 text-xs font-bold text-gray-900">
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-right uppercase tracking-wider text-teal-900">
                      Total Authorized Amount:
                    </td>
                    <td className="px-3 py-3 text-right text-sm text-teal-950 font-mono">
                      {voucher.currency} {voucher.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Amount in words */}
            {voucher.amount_in_words && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs">
                <span className="font-bold text-amber-900 uppercase tracking-wide text-[10px] block">
                  Amount in Words:
                </span>
                <span className="italic font-medium text-amber-950 capitalize">
                  {voucher.amount_in_words}
                </span>
              </div>
            )}

            {/* TERMS & CONDITIONS / RECONCILIATION POLICY */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-500 leading-relaxed space-y-1">
              <span className="font-bold text-gray-700 uppercase tracking-wider block">
                Accountability & Retirement Notice:
              </span>
              <p>
                {voucher.terms_and_conditions ||
                  '1. All disbursements must be strictly accounted for with valid fiscal receipts, invoices, or signed acknowledgments within 3 working days of activity completion. 2. Any unspent balance must be surrendered back to Finance immediately. 3. Unauthorized excess expenditures will not be reimbursed without prior written management approval.'}
              </p>
            </div>

            {/* DUAL SIGNATURE BOXES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              {/* Management Authorization */}
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col justify-between min-h-[220px]">
                <div>
                  <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                    1. Authorized & Approved By
                  </span>
                  <p className="text-xs font-semibold text-gray-900 mt-1">
                    {voucher.authorized_by_name || 'Finance Director'}
                  </p>
                  <p className="text-[11px] text-gray-500">Allbound Vacations Management</p>
                </div>

                {/* Official Rubber Stamp */}
                <div className="my-2 flex justify-center">
                  <DocumentStamp
                    status="authorized"
                    documentNumber={voucher.voucher_number}
                    date={voucher.authorized_at || voucher.issue_date}
                    width={185}
                  />
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2 flex items-center justify-between text-[10px] text-gray-400">
                  <span>
                    Date: {voucher.authorized_at ? new Date(voucher.authorized_at).toLocaleDateString() : voucher.issue_date}
                  </span>
                  <span className="font-semibold text-teal-800">AUTHORIZED</span>
                </div>
              </div>

              {/* Employee Acceptance Signature */}
              <div
                className={`p-4 rounded-xl border flex flex-col justify-between min-h-[220px] ${
                  voucher.is_signed
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-amber-200 bg-amber-50/40'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                      2. Employee Acceptance & Signature
                    </span>
                    {voucher.is_signed ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending Signature
                      </span>
                    )}
                  </div>

                  {voucher.is_signed && voucher.signature_data ? (
                    <div className="my-2 flex flex-col items-center justify-center">
                      <img
                        src={voucher.signature_data}
                        alt="Employee Digital Signature"
                        className="h-20 max-w-full object-contain"
                      />
                      <p className="text-xs font-bold text-gray-900 mt-1">
                        {voucher.signed_by_name}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 text-center">
                      <p className="text-xs text-gray-500 italic">
                        Awaiting employee signature via digital link.
                      </p>
                      <div className="no-print mt-2 flex items-center justify-center gap-2">
                        <button
                          onClick={handleCopySigningLink}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-900 bg-white px-2 py-1 rounded-lg border border-teal-200 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy Link
                        </button>
                        <button
                          onClick={() => setIsEmailModalOpen(true)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 hover:text-teal-900 bg-white px-2 py-1 rounded-lg border border-teal-200 cursor-pointer"
                        >
                          <Mail className="w-3 h-3" /> Email Link
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-300 pt-2 flex items-center justify-between text-[10px] text-gray-400">
                  <span>
                    Signed:{' '}
                    {voucher.signed_at
                      ? new Date(voucher.signed_at).toLocaleString()
                      : 'Pending'}
                  </span>
                  {voucher.signed_ip_address && (
                    <span className="font-mono text-[9px]">IP: {voucher.signed_ip_address}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer QR & Verification */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <QRCodeSVG
                value={verificationUrl}
                size={54}
                bgColor="#ffffff"
                fgColor="#0f2922"
                level="M"
              />
              <div>
                <p className="text-[10px] uppercase font-bold text-teal-900">
                  Scan to Verify Authentic Document
                </p>
                <p className="text-[10px] font-mono text-gray-400">{verificationUrl}</p>
                <p className="text-[9px] text-gray-400">
                  Verification Code: <strong className="text-gray-700">{voucher.verification_code}</strong>
                </p>
              </div>
            </div>

            <div className="text-right text-[10px] text-gray-400">
              <p>Allbound Vacations Ltd • Official Financial Document</p>
              <p>Generated digitally with cryptographic verification token</p>
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title={`Email Voucher ${voucher.voucher_number}`}
        defaultEmail={employee.email || ''}
        defaultName={employee.name || employee.full_name || ''}
        onSend={async (data) => {
          await financeApi.sendPaymentVoucherEmail(voucher.id, data);
        }}
      />
    </div>
  );
};
