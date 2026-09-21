import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { financeApi } from '../../../../lib/api/finance';
import type { TravelVoucher, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { VoucherDocumentView } from './VoucherDocumentView';
import { SendEmailModal } from '../components/SendEmailModal';

export const VoucherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [voucher, setVoucher] = useState<TravelVoucher | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadVoucher() {
      if (!id) return;
      try {
        setLoading(true);
        const [vch, compSettings] = await Promise.all([
          financeApi.getVoucher(parseInt(id, 10)),
          financeApi.getSettings()
        ]);
        setVoucher(vch);
        setSettings(compSettings);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load voucher');
      } finally {
        setLoading(false);
      }
    }
    loadVoucher();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !voucher) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <h3 className="font-bold text-lg mb-2">Error Loading Travel Voucher</h3>
        <p>{error || 'Voucher not found.'}</p>
      </div>
    );
  }

  return (
    <>
      <VoucherDocumentView
        voucher={voucher}
        settings={settings}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />

      {isEmailModalOpen && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title={`Email Travel Voucher #${voucher.voucher_number}`}
          defaultEmail={voucher.supplier_details?.reservation_email || ''}
          defaultName={voucher.supplier_details?.contact_person || voucher.supplier_details?.supplier_name || ''}
          onSend={async (data) => {
            await financeApi.sendVoucherEmail(voucher.id, data);
          }}
        />
      )}
    </>
  );
};
