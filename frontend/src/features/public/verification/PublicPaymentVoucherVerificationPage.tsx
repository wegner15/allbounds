import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { financeApi } from '../../../lib/api/finance';

export const PublicPaymentVoucherVerificationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!code) return;
      try {
        setLoading(true);
        const res = await financeApi.verifyPaymentVoucher(code);
        setData(res);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Invalid or unverified payment voucher verification code.');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [code]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold font-playfair tracking-wide text-gray-900">
              ALLBOUND VACATIONS
            </h1>
          </Link>
          <p className="text-xs uppercase tracking-wider text-teal-800 font-semibold mt-1">
            Official Expense & Payment Voucher Verification
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Verifying voucher credentials...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">Verification Failed</h2>
            <p className="text-xs text-gray-600">{error || 'This voucher could not be verified in our financial system.'}</p>
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center text-xs font-semibold text-teal-800 hover:text-teal-900"
              >
                Go to Homepage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Status Banner */}
            <div
              className={`p-6 text-center text-white ${
                data.is_valid ? 'bg-teal-900' : 'bg-red-900'
              }`}
            >
              <div className="inline-flex p-3 bg-white/10 rounded-full mb-3">
                {data.is_valid ? (
                  <ShieldCheck className="w-8 h-8 text-amber-300" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-300" />
                )}
              </div>
              <h2 className="text-xl font-bold">
                {data.is_valid ? 'Authentic Payment Voucher' : 'Invalid or Voided Voucher'}
              </h2>
              <p className="text-xs text-teal-100 mt-1 font-mono">
                Verification Code: {code}
              </p>
            </div>

            {/* Voucher Metadata */}
            <div className="p-6 space-y-5 text-xs text-gray-700">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-gray-400 font-semibold block uppercase">Voucher Number</span>
                  <span className="text-base font-bold text-gray-900 font-mono">
                    {data.voucher_number}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-semibold block uppercase">Voucher Status</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 capitalize">
                    {data.voucher_status}
                  </span>
                </div>
              </div>

              {/* Employee & Amount */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase">Authorized Recipient</span>
                    <span className="text-sm font-bold text-gray-900">
                      {data.employee_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase">Category & Purpose</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {data.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-400 font-semibold block uppercase">Issue Date</span>
                    <span className="font-medium text-gray-900">
                      {data.issue_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Highlight */}
              <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 flex justify-between items-center">
                <div>
                  <span className="text-xs uppercase font-bold text-teal-800">
                    Authorized Disbursement Amount
                  </span>
                  <div className="text-xl font-bold text-teal-950 font-mono">
                    {data.currency} {Number(data.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Signatures status */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Authorized by Management:</span>
                  <span className="font-semibold text-gray-900">{data.authorized_by_name || 'Management'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Employee Digital Signature:</span>
                  {data.is_signed ? (
                    <span className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Signed ({data.signed_by_name})
                    </span>
                  ) : (
                    <span className="font-semibold text-amber-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Pending Employee Signature
                    </span>
                  )}
                </div>
              </div>

              {/* Timestamp */}
              <div className="pt-4 border-t border-gray-100 text-center text-[10px] text-gray-400">
                Verified live at: {new Date(data.verification_timestamp).toUTCString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
