import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  PhoneCall,
  DollarSign,
  User,
  Calendar
} from 'lucide-react';
import { financeApi } from '../../../lib/api/finance';
import type { PublicReceiptVerificationResponse } from '../../../lib/types/finance';

export const PublicReceiptVerificationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PublicReceiptVerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!code) return;
      try {
        setLoading(true);
        const res = await financeApi.verifyReceipt(code);
        setData(res);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Invalid or unverified receipt verification code.');
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
            Payment Authenticity Verification Portal
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Verifying payment receipt...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Receipt Not Found</h2>
            <p className="text-sm text-red-600">{error || 'This payment receipt code could not be verified in our records.'}</p>
            <p className="text-xs text-gray-500">
              Please contact Allbound Vacations Accounts at bookings@allboundvacations.com.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Authenticity Banner */}
            <div className="p-6 text-white text-center bg-teal-900">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8 text-teal-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Authentic Payment Receipt
              </h2>
              <p className="text-xs text-teal-100 mt-1">
                Verified Electronic Payment Record
              </p>
            </div>

            {/* Receipt Content */}
            <div className="p-6 sm:p-8 space-y-5 text-sm">
              <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Receipt Number:</span>
                  <span className="font-mono font-bold text-teal-900 text-sm">{data.receipt_number}</span>
                </div>
                {data.invoice_number && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Invoice Reference:</span>
                    <span className="font-mono font-semibold text-gray-800">{data.invoice_number}</span>
                  </div>
                )}
                {data.booking_number && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Booking Reference:</span>
                    <span className="font-mono font-semibold text-gray-800">{data.booking_number}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Receipt Date:</span>
                  <span className="font-medium text-gray-900">{data.receipt_date}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Payment Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">
                    <CheckCircle className="w-3 h-3 mr-1" /> {data.payment_status}
                  </span>
                </div>
              </div>

              {/* Amount Highlight */}
              <div className="p-5 bg-teal-900 text-white rounded-xl text-center">
                <span className="text-xs text-teal-200 uppercase tracking-wider font-semibold">
                  Confirmed Amount Received
                </span>
                <p className="text-3xl font-extrabold font-mono mt-1">
                  {data.currency} {data.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <span className="text-xs text-teal-100 block mt-1 capitalize">
                  Paid via {data.payment_method}
                </span>
              </div>

              {/* Payer Info */}
              <div className="flex items-start space-x-3 pt-2">
                <User className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-gray-500 block">Received From</span>
                  <span className="font-bold text-gray-900">{data.payer_name}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-teal-900 font-semibold">
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>+(256) 782 594 008</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  Verified: {new Date(data.verification_timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
