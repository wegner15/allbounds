import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { financeApi } from '../../../lib/api/finance';
import type { Invoice, CompanyFinanceSettings } from '../../../lib/types/finance';
import { InvoiceDocumentView } from '../../admin/finance/invoices/InvoiceDocumentView';

export const PublicInvoiceViewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!token) return;
      try {
        setLoading(true);
        const [inv, compSettings] = await Promise.all([
          financeApi.getInvoiceByToken(token),
          financeApi.getSettings()
        ]);
        setInvoice(inv);
        setSettings(compSettings);
      } catch (err: any) {
        setError(err?.response?.data?.detail || 'Invoice not found or verification link expired.');
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white border border-red-200 rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Available</h2>
          <p className="text-sm text-red-600 mb-4">{error || 'This invoice could not be located.'}</p>
          <p className="text-xs text-gray-500">
            Please contact Allbound Vacations Reservations at bookings@allboundvacations.com for assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <InvoiceDocumentView
        invoice={invoice}
        settings={settings}
        isPublicView={true}
      />
    </div>
  );
};
