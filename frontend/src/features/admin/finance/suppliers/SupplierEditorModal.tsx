import React, { useState, useEffect } from 'react';
import { X, Building, Mail, Phone, MapPin, Globe, CreditCard, Star } from 'lucide-react';
import { suppliersApi } from '../../../../lib/api/suppliers';
import type { Supplier } from '../../../../lib/types/finance';

interface SupplierEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (supplier: Supplier) => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierEditorModal: React.FC<SupplierEditorModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  supplierToEdit
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('lodge_hotel');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [taxPin, setTaxPin] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoName, setMomoName] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supplierToEdit) {
      setName(supplierToEdit.name || '');
      setCategory(supplierToEdit.category || 'lodge_hotel');
      setContactPerson(supplierToEdit.contact_person || '');
      setEmail(supplierToEdit.email || '');
      setPhone(supplierToEdit.phone || '');
      setWhatsapp(supplierToEdit.whatsapp || '');
      setCountry(supplierToEdit.country || 'Uganda');
      setAddress(supplierToEdit.physical_address || '');
      setCurrency(supplierToEdit.currency || 'USD');
      setPaymentTerms(supplierToEdit.payment_terms || 'Net 30');
      setTaxPin(supplierToEdit.tax_pin_number || '');
      setBankName(supplierToEdit.bank_details?.bank_name || '');
      setAccountNumber(supplierToEdit.bank_details?.account_number || '');
      setAccountName(supplierToEdit.bank_details?.account_name || '');
      setMomoNumber(supplierToEdit.mobile_money_details?.number || '');
      setMomoName(supplierToEdit.mobile_money_details?.account_name || '');
      setNotes(supplierToEdit.notes || '');
    } else {
      setName('');
      setCategory('lodge_hotel');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setWhatsapp('');
      setCountry('Uganda');
      setAddress('');
      setCurrency('USD');
      setPaymentTerms('Net 30');
      setTaxPin('');
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setMomoNumber('');
      setMomoName('');
      setNotes('');
    }
    setError(null);
  }, [supplierToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: Partial<Supplier> = {
        name,
        category,
        contact_person: contactPerson,
        email,
        phone,
        whatsapp,
        country,
        physical_address: address,
        currency,
        payment_terms: paymentTerms,
        tax_pin_number: taxPin,
        bank_details: bankName ? { bank_name: bankName, account_number: accountNumber, account_name: accountName } : {},
        mobile_money_details: momoNumber ? { number: momoNumber, account_name: momoName } : {},
        notes,
      };

      let res: Supplier;
      if (supplierToEdit) {
        res = await suppliersApi.updateSupplier(supplierToEdit.id, payload);
      } else {
        res = await suppliersApi.createSupplier(payload);
      }

      onSaved(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save supplier profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-charcoal text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-playfair">
              {supplierToEdit ? 'Edit Supplier Profile' : 'Add New Supplier / Partner'}
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Register safari lodges, transporters, airlines, and service vendors
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Supplier Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Supplier / Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chobe Safari Lodge / Matoke Tours"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="lodge_hotel">Safari Lodge / Hotel</option>
                <option value="safari_operator">DMC / Safari Operator</option>
                <option value="transporter">Transport & 4x4 Hire</option>
                <option value="airline">Airline / Flight Charters</option>
                <option value="park_authority">Wildlife / Park Permits</option>
                <option value="guide">Tour Guide</option>
                <option value="other">Other Service</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Reservations Manager"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reservations@lodge.com"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+256 700 000000"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Payment Terms & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-white"
              >
                <option value="Net 30">Net 30 Days</option>
                <option value="Net 15">Net 15 Days</option>
                <option value="On Confirmation">100% on Confirmation</option>
                <option value="50% Deposit">50% Deposit, Balance on Arrival</option>
                <option value="Pre-arrival">Pre-arrival</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">TIN / Tax ID</label>
              <input
                type="text"
                value={taxPin}
                onChange={(e) => setTaxPin(e.target.value)}
                placeholder="1000293847"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
          </div>

          {/* Bank Account Details */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-200">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 block">
              Supplier Bank Settlement Info
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Stanbic Bank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="9030012345678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Chobe Lodge Ltd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Special Notes / Contracts</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Contract rate agreement valid through Dec 2026."
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
              className="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 hover:bg-black disabled:opacity-50 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {submitting ? 'Saving...' : supplierToEdit ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
