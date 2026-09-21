import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Users,
  CheckCircle,
  PhoneCall,
  ArrowRight
} from 'lucide-react';
import { financeApi } from '../../../lib/api/finance';
import type { PublicVoucherVerificationResponse } from '../../../lib/types/finance';

export const PublicVoucherVerificationPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [data, setData] = useState<PublicVoucherVerificationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!code) return;
      try {
        setLoading(true);
        const res = await financeApi.verifyVoucher(code);
        setData(res);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Invalid or unverified voucher code.');
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
            Supplier Digital Verification Portal
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
            <h2 className="text-xl font-bold text-gray-900">Verification Unsuccessful</h2>
            <p className="text-sm text-red-600">{error || 'This voucher code could not be verified in the Allbound system.'}</p>
            <p className="text-xs text-gray-500">
              Please contact Allbound Vacations Reservations directly at +(256) 782 594 008 or bookings@allboundvacations.com.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Authenticity Banner */}
            <div className={`p-6 text-white text-center ${data.is_valid ? 'bg-teal-900' : 'bg-red-800'}`}>
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-8 h-8 text-teal-300" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {data.is_valid ? 'Verified Official Travel Voucher' : 'Voucher Cancelled'}
              </h2>
              <p className="text-xs text-teal-100 mt-1">
                Issued by Allbound Travel Services Limited
              </p>
            </div>

            {/* Verification Content */}
            <div className="p-6 sm:p-8 space-y-5 text-sm">
              <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Voucher Number:</span>
                  <span className="font-mono font-bold text-teal-900 text-sm">{data.voucher_number}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Version:</span>
                  <span className="font-bold text-gray-800">Version {data.version}</span>
                </div>
                {data.booking_number && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Booking Number:</span>
                    <span className="font-mono font-semibold text-gray-800">{data.booking_number}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Service Category:</span>
                  <span className="capitalize font-semibold text-gray-900">{data.voucher_type}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Status:</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase">
                    <CheckCircle className="w-3 h-3 mr-1" /> {data.voucher_status}
                  </span>
                </div>
              </div>

              {/* Service & Supplier Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Designated Supplier / Property</span>
                    <span className="font-bold text-gray-900 text-base">{data.supplier_name}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Lead Guest & Passengers</span>
                    <span className="font-bold text-gray-900">{data.lead_traveller}</span>
                    <span className="text-xs text-gray-600 block">
                      Total Party: {data.passenger_count} Traveller(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-500 block">Confirmed Service Dates</span>
                    <span className="font-semibold text-gray-900">{data.service_dates}</span>
                  </div>
                </div>
              </div>

              {/* Notice for Supplier */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 space-y-1">
                <p className="font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                  Supplier Notice:
                </p>
                <p>This digital voucher confirms that arrangements have been booked and prepaid by Allbound Vacations.</p>
                <p>Please verify traveller ID at check-in. Do not charge the guest for prepaid services.</p>
              </div>

              {/* 24/7 Hotline */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-teal-900 font-semibold">
                  <PhoneCall className="w-4 h-4 text-teal-700" />
                  <span>24/7 Allbound Support: +(256) 782 594 008</span>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  Verified: {new Date(data.verification_timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
