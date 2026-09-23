import React, { useState } from 'react';
import { X, DollarSign, Calendar, CreditCard, Building } from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { SupplierBill, SupplierPayment } from '../../../../lib/types/finance';

interface SupplierPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (payment: SupplierPayment) => void;
  bill: SupplierBill;
}

export const SupplierPaymentModal: React.FC<SupplierPaymentModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  bill,
}) => {
  const [amountPaid, setAmountPaid] = useState<number | ''>(bill.balance_payable);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [referenceCode, setReferenceCode] = useState('');
  const [disbursedFrom, setDisbursedFrom] = useState('Stanbic Bank USD Account');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || Number(amountPaid) <= 0) {
      setError('Please enter a valid disbursement amount.');
      return;
    }
    if (!referenceCode.trim()) {
      setError('Please enter the bank transaction reference or confirmation code.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const pmt = await suppliersApi.createPayment({
        supplier_bill_id: bill.id,
        payment_date: paymentDate,
        amount_paid: Number(amountPaid),
        currency: bill.currency,
        exchange_rate_to_usd: bill.exchange_rate_to_usd,
        payment_method: paymentMethod,
        reference_code: referenceCode,
        disbursed_from_account: disbursedFrom,
        notes,
      });

      onSaved(pmt);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to record supplier payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-playfair">Record Supplier Payment</h2>
            <p className="text-xs text-emerald-200 mt-0.5">
              Settling {bill.bill_number} for {bill.supplier_name || 'Supplier'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Bill Summary Banner */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-gray-400 block font-semibold">Bill Amount:</span>
              <span className="font-bold text-gray-900 text-sm">
                {bill.currency} {bill.amount_billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block font-semibold">Remaining Payable:</span>
              <span className="font-bold text-amber-700 text-sm">
                {bill.currency} {bill.balance_payable.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Amount to Pay */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Disbursement Amount ({bill.currency}) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.01"
                  max={bill.balance_payable}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl font-bold text-emerald-800 text-base"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          {/* Payment Method & Bank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm bg-white"
              >
                <option value="bank_transfer">Bank Wire / EFT</option>
                <option value="mobile_money">Mobile Money (MTN/Airtel)</option>
                <option value="card">Company Credit Card</option>
                <option value="cash">Petty Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Disbursed From Account</label>
              <input
                type="text"
                value={disbursedFrom}
                onChange={(e) => setDisbursedFrom(e.target.value)}
                placeholder="Stanbic Bank USD"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Transaction Ref */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Bank Ref / Mobile Money Txn ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="e.g. EFT-982347102 or MOMO-918239"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Payment confirmation emailed to lodge reservations."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
