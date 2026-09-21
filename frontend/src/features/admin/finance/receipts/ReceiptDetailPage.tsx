import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { financeApi } from '../../../../lib/api/finance';
import type { PaymentReceipt, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { ReceiptDocumentView } from './ReceiptDocumentView';
import { SendEmailModal } from '../components/SendEmailModal';

export const ReceiptDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadReceipt() {
      if (!id) return;
      try {
        setLoading(true);
        const [rec, compSettings] = await Promise.all([
          financeApi.getReceipt(parseInt(id, 10)),
          financeApi.getSettings()
        ]);
        setReceipt(rec);
        setSettings(compSettings);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    }
    loadReceipt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <h3 className="font-bold text-lg mb-2">Error Loading Receipt</h3>
        <p>{error || 'Receipt not found.'}</p>
      </div>
    );
  }

  return (
    <>
      <ReceiptDocumentView
        receipt={receipt}
        settings={settings}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />

      {isEmailModalOpen && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title={`Send Receipt #${receipt.receipt_number}`}
          defaultEmail={receipt.received_from?.email || ''}
          defaultName={receipt.received_from?.name || ''}
          onSend={async (data) => {
            await financeApi.sendReceiptEmail(receipt.id, data);
          }}
        />
      )}
    </>
  );
};
