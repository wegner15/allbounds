import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle,
  PenTool,
  RotateCcw,
  Calendar,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Receipt,
  Download,
  Printer,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { financeApi } from '../../../lib/api/finance';
import type { PublicPaymentVoucherSignView } from '../../../lib/types/finance';

export const PublicPaymentVoucherSignPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [voucher, setVoucher] = useState<PublicPaymentVoucherSignView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Signature Form State
  const [signerName, setSignerName] = useState<string>('');
  const [hasAgreed, setHasAgreed] = useState<boolean>(true);
  const [isCanvasDrawn, setIsCanvasDrawn] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  useEffect(() => {
    async function fetchVoucher() {
      if (!token) return;
      try {
        setLoading(true);
        const data = await financeApi.getPaymentVoucherForSigning(token);
        setVoucher(data);
        setSignerName(data.employee_name || '');
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'This signing link is invalid, expired, or has already been used.');
      } finally {
        setLoading(false);
      }
    }
    fetchVoucher();
  }, [token]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize for high-DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f2922'; // Deep teal
    ctx.lineWidth = 2.5;
  }, [loading, voucher?.is_signed]);

  // Canvas mouse & touch event handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (voucher?.is_signed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsCanvasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setIsCanvasDrawn(false);
  };

  const handleSubmitSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!signerName.trim()) {
      alert('Please enter your full name as the recipient.');
      return;
    }

    if (!isCanvasDrawn) {
      alert('Please provide your signature on the pad before submitting.');
      return;
    }

    if (!hasAgreed) {
      alert('Please acknowledge the declaration checkbox.');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureDataUrl = canvas.toDataURL('image/png');

    try {
      setSubmitting(true);
      setError(null);
      const updated = await financeApi.signPaymentVoucher(token, {
        signed_by_name: signerName.trim(),
        signature_data: signatureDataUrl,
        signer_declaration:
          'I confirm that I have received / been authorized for the stated funds and agree to account for all expenses per Allbound Vacations policies.'
      });
      setVoucher(updated);
      setSuccessMessage('Signature submitted successfully! Thank you.');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to submit signature. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-gray-900 to-gray-950 py-10 px-4 sm:px-6 lg:px-8 text-gray-800">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/15 text-white shadow-lg mb-3">
            <img
              src="/logo/brand_mark.png"
              alt="Allbound Vacations"
              className="w-7 h-7 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-playfair font-bold text-base tracking-wider uppercase text-amber-300">
              ALLBOUND VACATIONS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-playfair tracking-tight">
            Employee Payment & Expense Authorization
          </h1>
          <p className="text-sm text-teal-200 mt-1">
            Secure Digital Signing Portal for Staff, Field Guides & Drivers
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-10 text-center shadow-2xl border border-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto"></div>
            <p className="mt-4 text-sm font-medium text-gray-600">Loading voucher details...</p>
          </div>
        )}

        {/* Error State */}
        {error && !voucher && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl border border-red-200 space-y-4">
            <AlertTriangle className="w-14 h-14 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Unable to Load Voucher</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">{error}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-medium shadow-md transition"
            >
              Return to Allbound Homepage
            </Link>
          </div>
        )}

        {/* Success / Voucher Card */}
        {voucher && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
            {/* Voucher Header Ribbon */}
            <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-gray-900 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                    VOUCHER NUMBER
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">
                    {voucher.voucher_number}
                  </h2>
                </div>

                <div>
                  {voucher.is_signed ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <CheckCircle className="w-4 h-4 text-emerald-400" /> Digitally Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <PenTool className="w-4 h-4 text-amber-400" /> Awaiting Signature
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-200">
                <div>
                  <span className="text-white/60">Category: </span>
                  <span className="text-white font-semibold capitalize">
                    {voucher.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-white/60">Issued: </span>
                  <span className="text-white font-semibold">{voucher.issue_date}</span>
                </div>
                {voucher.due_date && (
                  <div>
                    <span className="text-white/60">Accountability Due: </span>
                    <span className="text-white font-semibold">{voucher.due_date}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recipient & Amount Highlight */}
            <div className="p-6 sm:p-8 bg-amber-50/40">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Authorized Payee / Staff Member
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">
                    {voucher.employee_name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
                    {voucher.employee_role && (
                      <span className="font-medium text-teal-800">{voucher.employee_role}</span>
                    )}
                    {voucher.employee_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {voucher.employee_phone}
                      </span>
                    )}
                    {voucher.employee_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {voucher.employee_email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:text-right bg-white p-4 rounded-2xl border border-amber-200/80 shadow-sm w-full sm:w-auto">
                  <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                    Total Authorized Amount
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-teal-950 font-mono mt-0.5">
                    {voucher.currency} {voucher.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {voucher.amount_in_words && (
                    <p className="text-[11px] text-gray-500 italic mt-0.5 max-w-xs capitalize">
                      {voucher.amount_in_words}
                    </p>
                  )}
                </div>
              </div>

              {/* Purpose / Description */}
              <div className="mt-5 p-4 bg-white rounded-xl border border-gray-200/80 text-xs text-gray-700">
                <span className="font-bold text-gray-900 block mb-1">
                  Purpose / Expenditure Description:
                </span>
                <p className="font-medium text-gray-800">{voucher.title}</p>
                {voucher.description && (
                  <p className="text-gray-600 mt-1 leading-relaxed">{voucher.description}</p>
                )}
              </div>
            </div>

            {/* Line Items Breakdown */}
            {voucher.line_items && voucher.line_items.length > 0 && (
              <div className="p-6 sm:p-8">
                <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-3">
                  Itemized Expenditure Schedule
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 text-gray-600 uppercase font-semibold border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2.5 text-left">Description</th>
                        <th className="px-3 py-2.5 text-center">Qty</th>
                        <th className="px-3 py-2.5 text-right">Unit Price</th>
                        <th className="px-3 py-2.5 text-right">Total ({voucher.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {voucher.line_items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-medium text-gray-900">
                            {item.description}
                            {item.notes && (
                              <span className="block text-[11px] text-gray-400 font-normal">
                                {item.notes}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center text-gray-600">
                            {item.quantity || 1}
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-600 font-mono">
                            {(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-gray-900 font-mono">
                            {(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Authorized By Information */}
            <div className="p-6 sm:p-8 bg-gray-50 text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-gray-400 uppercase font-bold block text-[10px]">
                  Management Authorization
                </span>
                <span className="font-bold text-gray-900 text-sm">
                  {voucher.authorized_by_name || 'Finance Director'}
                </span>
                <span className="text-gray-500 block">Allbound Vacations Finance Dept</span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-gray-400 uppercase font-bold block text-[10px]">
                  Digital Verification Code
                </span>
                <span className="font-mono font-bold text-teal-800">
                  {voucher.verification_code}
                </span>
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div className="p-6 sm:p-8">
              {voucher.is_signed ? (
                /* Already Signed View */
                <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-950 font-playfair">
                      Voucher Fully Signed & Accepted
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1">
                      Signed by{' '}
                      <strong className="text-emerald-950">{voucher.signed_by_name}</strong> on{' '}
                      {voucher.signed_at ? new Date(voucher.signed_at).toLocaleString() : 'Record'}
                    </p>
                  </div>

                  {voucher.signature_data && (
                    <div className="bg-white rounded-xl p-3 inline-block border border-emerald-200 shadow-sm max-w-xs mx-auto">
                      <img
                        src={voucher.signature_data}
                        alt="Digital Signature"
                        className="h-16 max-w-full object-contain mx-auto"
                      />
                      <span className="text-[10px] text-gray-400 block border-t border-gray-100 mt-1 pt-1 font-mono">
                        Secured Digital Signature
                      </span>
                    </div>
                  )}

                  <p className="text-[11px] text-emerald-700 max-w-md mx-auto">
                    A permanent audit record has been stored. You may keep this webpage for your
                    records.
                  </p>
                </div>
              ) : (
                /* Interactive Signing Pad Form */
                <form onSubmit={handleSubmitSignature} className="space-y-6">
                  {successMessage && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold">
                      {successMessage}
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-gray-900 font-playfair">
                      Employee Acceptance & Digital Signature
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Please write your signature on the pad below using your fingertip (on mobile) or mouse cursor.
                    </p>
                  </div>

                  {/* Signer Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name of Recipient / Employee *
                    </label>
                    <input
                      type="text"
                      required
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none"
                    />
                  </div>

                  {/* Signature Pad Canvas */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-teal-800" /> Draw Signature Below *
                      </label>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition font-medium"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear Pad
                      </button>
                    </div>

                    <div className="relative border-2 border-dashed border-teal-800/40 hover:border-teal-700 rounded-2xl bg-teal-50/20 p-1 touch-none">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-40 bg-white rounded-xl shadow-inner cursor-crosshair block"
                      />
                      {!isCanvasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs italic">
                          ✍️ Sign here with touch or mouse
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAgreed}
                        onChange={(e) => setHasAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 text-teal-700 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-gray-600 leading-relaxed select-none">
                        I hereby acknowledge receipt and authorization of the total sum of{' '}
                        <strong className="text-gray-900 font-mono">
                          {voucher.currency} {voucher.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </strong>{' '}
                        for the designated official duties. I undertake to submit valid receipts,
                        proper accounts, and refund any unspent balance in accordance with
                        Allbound Vacations financial procedures.
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting Digital Signature...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-amber-300" />
                        <span>Sign & Accept Payment Voucher</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Footer Notice */}
            <div className="p-4 bg-gray-100 text-center text-[11px] text-gray-500">
              Allbound Vacations Limited • Official Financial Disbursement System • Secure Audit Trail Recorded
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
