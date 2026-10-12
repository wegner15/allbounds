import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { PaymentVoucher, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { PaymentVoucherDocumentView } from './PaymentVoucherDocumentView';

export const PaymentVoucherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState<PaymentVoucher | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoucher = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [vData, sData] = await Promise.all([
        financeApi.getPaymentVoucher(Number(id)),
        financeApi.getSettings().catch(() => null)
      ]);
      setVoucher(vData);
      setSettings(sData);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load payment voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoucher();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!voucher) return;
    try {
      const updated = await financeApi.updatePaymentVoucher(voucher.id, {
        voucher_status: newStatus
      });
      setVoucher(updated);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update voucher status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-teal-700 animate-spin mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading payment voucher...</p>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-red-200 text-center shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Voucher Not Found</h2>
        <p className="text-sm text-gray-600">{error || 'Could not find payment voucher.'}</p>
        <Link
          to="/admin/finance/vouchers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-semibold shadow transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vouchers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto my-6 px-4">
      <PaymentVoucherDocumentView
        voucher={voucher}
        settings={settings}
        onRefresh={fetchVoucher}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
