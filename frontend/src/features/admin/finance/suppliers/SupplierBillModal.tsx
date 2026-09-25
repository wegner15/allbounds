import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier, SupplierBill } from '../../../../lib/types/finance';

interface SupplierBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (bill: SupplierBill) => void;
  defaultSupplierId?: number;
  defaultInvoiceId?: number;
  invoiceNumber?: string;
  bookingId?: number;
  suppliers: Supplier[];
}

export const SupplierBillModal: React.FC<SupplierBillModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  defaultSupplierId,
  defaultInvoiceId,
  invoiceNumber,
  bookingId,
  suppliers
}) => {
  const [supplierId, setSupplierId] = useState<number>(defaultSupplierId || (suppliers[0]?.id || 0));
  const [supplierReference, setSupplierReference] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [amountBilled, setAmountBilled] = useState<number | ''>('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('accommodation');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultSupplierId) {
      setSupplierId(defaultSupplierId);
    } else if (suppliers.length > 0 && !supplierId) {
      setSupplierId(suppliers[0].id);
    }

    // Default due date to 30 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);
  }, [defaultSupplierId, suppliers, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      setError('Please select a supplier.');
      return;
    }
    if (!amountBilled || Number(amountBilled) <= 0) {
      setError('Please enter a valid bill amount.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const bill = await suppliersApi.createBill({
        supplier_id: supplierId,
        invoice_id: defaultInvoiceId,
        booking_id: bookingId,
        supplier_reference: supplierReference,
        bill_date: billDate,
        due_date: dueDate,
        service_date: serviceDate || undefined,
        amount_billed: Number(amountBilled),
        currency,
        category,
        description,
        notes,
      });

      onSaved(bill);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to create supplier bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-800 to-teal-950 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-playfair">
              {defaultInvoiceId ? 'Record Invoice Expense' : 'Enter Supplier Bill (Payable)'}
            </h2>
            <p className="text-xs text-teal-200 mt-0.5">
              {invoiceNumber
                ? `Recording supplier cost linked to Invoice #${invoiceNumber}`
                : 'Record an invoice or commitment due to a supplier/lodge'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {defaultInvoiceId && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
              <span className="font-semibold">Linked Invoice:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-teal-200 font-bold">
                {invoiceNumber || `#${defaultInvoiceId}`}
              </span>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Supplier Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Reference & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Supplier Invoice / Ref #
              </label>
              <input
                type="text"
                value={supplierReference}
                onChange={(e) => setSupplierReference(e.target.value)}
                placeholder="e.g. CHOBE-INV-892"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Service Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="accommodation">Accommodation / Lodge</option>
                <option value="transport">Transport / Vehicle Hire</option>
                <option value="permits">Park Permits / Gorilla Tracking</option>
                <option value="flight">Domestic / Charter Flight</option>
                <option value="guide">Guide / Driver Fees</option>
                <option value="activity">Boat Cruise / Tour Activity</option>
                <option value="other">Other Cost</option>
              </select>
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Amount Due <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amountBilled}
                  onChange={(e) => setAmountBilled(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm font-semibold text-gray-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="UGX">UGX (USh)</option>
                <option value="KES">KES (KSh)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bill Date</label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Service / Check-in Date</label>
              <input
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description / Booking Link</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 Nights Luxury Tent for Smith Family (Booking #1042)"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Internal Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Bank details confirmed, awaiting final pax room list."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
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
              className="px-6 py-2.5 text-sm font-bold text-white bg-teal-800 hover:bg-teal-900 disabled:opacity-50 rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Recording...' : 'Record Supplier Bill'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
