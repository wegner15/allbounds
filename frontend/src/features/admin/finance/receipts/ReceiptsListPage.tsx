import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Building,
  CheckCircle
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { PaymentReceipt } from '../../../../lib/types/finance';

export const ReceiptsListPage: React.FC = () => {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [skip, setSkip] = useState<number>(0);
  const limit = 20;

  useEffect(() => {
    async function loadReceipts() {
      try {
        setLoading(true);
        const res = await financeApi.getReceipts({ skip, limit });
        setReceipts(res.items);
        setTotalCount(res.total);
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load receipts');
      } finally {
        setLoading(false);
      }
    }
    loadReceipts();
  }, [skip]);

  return (
    <div className="max-w-7xl mx-auto my-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">Payment Receipts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Record and verify official electronic receipts issued for client payments
          </p>
        </div>
      </div>

      {/* Receipts Table Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">{error}</div>
        ) : receipts.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No payment receipts issued yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Record a payment from any invoice to generate a receipt automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Receipt No</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Payer / Client</th>
                  <th className="px-4 py-3 text-left">Invoice Ref</th>
                  <th className="px-4 py-3 text-left">Method & Provider</th>
                  <th className="px-4 py-3 text-left">Reference #</th>
                  <th className="px-4 py-3 text-right">Amount Received</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {receipts.map((rec) => {
                  const client = rec.received_from || {};
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-900 whitespace-nowrap">
                        <Link to={`/admin/finance/receipts/${rec.id}`} className="hover:underline">
                          {rec.receipt_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                        {new Date(rec.payment_date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900">
                          {client.company || client.name || 'Client'}
                        </p>
                        {client.email && <p className="text-[11px] text-gray-500">{client.email}</p>}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Link
                          to={`/admin/finance/invoices/${rec.invoice_id}`}
                          className="font-mono text-teal-700 hover:underline font-semibold"
                        >
                          Invoice #{rec.invoice_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="capitalize text-gray-800 font-medium">
                          {rec.payment_method.replace('_', ' ')}
                        </span>
                        {rec.payment_provider && (
                          <span className="text-[11px] text-gray-500 block">{rec.payment_provider}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-gray-600 whitespace-nowrap">
                        {rec.payment_reference}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-mono font-bold text-emerald-700">
                        {rec.currency} {rec.amount_received.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Cleared
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <Link
                          to={`/admin/finance/receipts/${rec.id}`}
                          className="inline-flex items-center px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-medium text-xs transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalCount > limit && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {skip + 1} to {Math.min(skip + limit, totalCount)} of {totalCount} receipts
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                disabled={skip === 0}
                onClick={() => setSkip(Math.max(0, skip - limit))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={skip + limit >= totalCount}
                onClick={() => setSkip(skip + limit)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
