import React, { useState } from 'react';
import { X, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type { Invoice, PaymentReceipt } from '../../../../lib/types/finance';

interface ReceiptEditorModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (receipt: PaymentReceipt) => void;
}

export const ReceiptEditorModal: React.FC<ReceiptEditorModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const remaining = Math.max(0, invoice.total_amount - invoice.amount_paid - invoice.credit_applied);

  const [amountReceived, setAmountReceived] = useState<number>(remaining);
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [paymentProvider, setPaymentProvider] = useState<string>('');
  const [receiptDate, setReceiptDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const newBalance = Math.max(0, remaining - (amountReceived || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentReference.trim()) {
      setError('Please provide a payment reference number (e.g. Bank Txn ID or MoMo Ref).');
      return;
    }
    if (amountReceived <= 0) {
      setError('Amount received must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await financeApi.createReceipt({
        invoice_id: invoice.id,
        booking_id: invoice.booking_id,
        payment_reference: paymentReference.trim(),
        receipt_date: receiptDate,
        payment_date: new Date().toISOString(),
        amount_received: Number(amountReceived),
        currency: invoice.currency,
        exchange_rate_to_usd: invoice.exchange_rate_to_usd,
        payment_method: paymentMethod,
        payment_provider: paymentProvider.trim() || undefined,
        payment_status: 'completed',
        received_from: invoice.client_details,
        notes: notes.trim() || undefined
      });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to record payment receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Modal Header */}
        <div className="bg-teal-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-teal-300" />
            <h3 className="font-bold text-lg">Record Payment / Issue Receipt</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-teal-200 hover:text-white rounded-lg p-1 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Invoice Summary Banner */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-gray-500 block">Invoice Total</span>
              <span className="font-mono font-bold text-gray-900">
                {invoice.currency} {invoice.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Already Paid</span>
              <span className="font-mono font-bold text-emerald-700">
                {invoice.currency} {invoice.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Balance Due</span>
              <span className="font-mono font-bold text-red-700">
                {invoice.currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Amount to Record */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Amount Received ({invoice.currency}) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-gray-500 text-sm">
                {invoice.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remaining * 1.5}
                value={amountReceived}
                onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg text-lg font-mono font-bold focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>
            <div className="flex justify-between text-[11px] text-gray-500 mt-1">
              <button
                type="button"
                onClick={() => setAmountReceived(remaining)}
                className="text-teal-700 font-semibold hover:underline"
              >
                Set to Full Balance ({invoice.currency} {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })})
              </button>
              <span>Updated Balance Remaining: <strong className={newBalance === 0 ? 'text-green-700' : 'text-gray-800'}>{invoice.currency} {newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
            </div>
          </div>

          {/* Payment Method & Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="bank_transfer">Bank Wire / Transfer</option>
                <option value="mobile_money">Mobile Money (MTN/Airtel)</option>
                <option value="card">Credit / Debit Card</option>
                <option value="cash">Cash Settlement</option>
                <option value="eft">Electronic Funds Transfer (EFT)</option>
                <option value="cheque">Bank Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Provider / Bank Name
              </label>
              <input
                type="text"
                value={paymentProvider}
                onChange={(e) => setPaymentProvider(e.target.value)}
                placeholder="e.g. Stanbic Bank, MTN MoMo"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Reference & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Transaction / Reference # *
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. FT260901234567"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Receipt Date *
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Receipt Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 50% deposit received via wire transfer..."
              className="w-full p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Issue Receipt
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
