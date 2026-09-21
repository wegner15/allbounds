import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { financeApi } from '../../../../lib/api/finance';
import type { Invoice, CompanyFinanceSettings, PaymentReceipt } from '../../../../lib/types/finance';
import { InvoiceDocumentView } from './InvoiceDocumentView';
import { ReceiptEditorModal } from '../receipts/ReceiptEditorModal';
import { SendEmailModal } from '../components/SendEmailModal';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  const fetchInvoiceData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [inv, compSettings] = await Promise.all([
        financeApi.getInvoice(parseInt(id, 10)),
        financeApi.getSettings()
      ]);
      setInvoice(inv);
      setSettings(compSettings);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [id]);

  const handlePaymentRecorded = (receipt: PaymentReceipt) => {
    // Refresh invoice data to show updated balance and newly recorded receipt
    fetchInvoiceData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
        <h3 className="font-bold text-lg mb-2">Error Loading Invoice</h3>
        <p>{error || 'Invoice not found.'}</p>
      </div>
    );
  }

  return (
    <>
      <InvoiceDocumentView
        invoice={invoice}
        settings={settings}
        onRecordPayment={() => setIsReceiptModalOpen(true)}
        onSendEmail={() => setIsEmailModalOpen(true)}
      />

      {/* Record Payment Modal */}
      {isReceiptModalOpen && (
        <ReceiptEditorModal
          invoice={invoice}
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          onSuccess={handlePaymentRecorded}
        />
      )}

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <SendEmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          title={`Send Invoice #${invoice.invoice_number}`}
          defaultEmail={invoice.client_details?.email || ''}
          defaultName={invoice.client_details?.full_name || invoice.client_details?.contact_person || ''}
          onSend={async (data) => {
            await financeApi.sendInvoiceEmail(invoice.id, data);
          }}
        />
      )}
    </>
  );
};
