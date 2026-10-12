import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  DollarSign,
  User,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type {
  PaymentVoucher,
  PaymentVoucherCreateRequest,
  PaymentVoucherLineItem,
  Currency
} from '../../../../lib/types/finance';

interface PaymentVoucherCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (voucher: PaymentVoucher) => void;
}

export const PaymentVoucherCreateModal: React.FC<PaymentVoucherCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated
}) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [category, setCategory] = useState<string>('safari_advance');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  
  // Employee
  const [employeeName, setEmployeeName] = useState<string>('');
  const [employeeRole, setEmployeeRole] = useState<string>('Senior Safari Guide');
  const [employeePhone, setEmployeePhone] = useState<string>('');
  const [employeeEmail, setEmployeeEmail] = useState<string>('');
  const [employeeIdNumber, setEmployeeIdNumber] = useState<string>('');

  // Voucher details
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [disbursementMethod, setDisbursementMethod] = useState<string>('cash');
  const [disbursedFromAccount, setDisbursedFromAccount] = useState<string>('Operations Cash Safe');
  const [disbursementReference, setDisbursementReference] = useState<string>('');
  const [authorizedByName, setAuthorizedByName] = useState<string>('Finance Director');

  // Line items
  const [lineItems, setLineItems] = useState<PaymentVoucherLineItem[]>([
    {
      description: 'Field Operations Allowance',
      quantity: 1,
      unit_price: 150,
      amount: 150,
      notes: ''
    }
  ]);

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const list = await financeApi.getCurrencies(true);
        setCurrencies(list);
        const usd = list.find((c) => c.code === 'USD');
        if (usd) setCurrency(usd.code);
      } catch (err) {
        console.error('Failed to load currencies', err);
      }
    }
    if (isOpen) {
      loadCurrencies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate total amount
  const totalAmount = lineItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const handleLineItemChange = (index: number, field: keyof PaymentVoucherLineItem, value: any) => {
    const updated = [...lineItems];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unit_price') {
      const q = field === 'quantity' ? Number(value) || 0 : Number(current.quantity) || 0;
      const p = field === 'unit_price' ? Number(value) || 0 : Number(current.unit_price) || 0;
      current.amount = q * p;
    }
    updated[index] = current;
    setLineItems(updated);
  };

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        amount: 0,
        notes: ''
      }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setError('Please provide the employee / staff member name.');
      return;
    }
    if (!title.trim()) {
      setError('Please specify the voucher title or expenditure purpose.');
      return;
    }
    if (totalAmount <= 0) {
      setError('Total voucher amount must be greater than 0.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: PaymentVoucherCreateRequest = {
        category,
        issue_date: issueDate,
        due_date: dueDate || null,
        booking_id: bookingId ? parseInt(bookingId, 10) : null,
        employee_details: {
          name: employeeName.trim(),
          role: employeeRole.trim(),
          phone: employeePhone.trim(),
          email: employeeEmail.trim(),
          id_number: employeeIdNumber.trim()
        },
        amount: totalAmount,
        currency,
        exchange_rate_to_usd: exchangeRate,
        title: title.trim(),
        description: description.trim() || null,
        line_items: lineItems,
        authorized_by_name: authorizedByName.trim(),
        disbursement_method: disbursementMethod,
        disbursed_from_account: disbursedFromAccount.trim() || null,
        disbursement_reference: disbursementReference.trim() || null
      };

      const res = await financeApi.createPaymentVoucher(payload);
      onCreated(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create payment voucher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-gray-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-playfair">
                Authorize Employee Expense & Payment Voucher
              </h2>
              <p className="text-xs text-teal-200">
                Generate an official payment authorization with shareable digital signing link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-2 rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Category & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-teal-50/40 rounded-2xl border border-teal-100">
            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
              >
                <option value="safari_advance">Safari / Field Advance</option>
                <option value="per_diem">Per Diem / Daily Allowance</option>
                <option value="fuel_transport">Fuel & Vehicle Transport</option>
                <option value="field_allowance">Field Guide / Driver Allowance</option>
                <option value="staff_salary">Staff Salary / Wage Advance</option>
                <option value="commission">Tour Guide / Agent Commission</option>
                <option value="reimbursement">Expense Reimbursement</option>
                <option value="medical_emergency">Medical / Emergency Assistance</option>
                <option value="contingency">Field Contingency</option>
                <option value="other">Other Operations Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Retirement / Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Linked Booking ID (Opt)
              </label>
              <input
                type="number"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. 104"
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>
          </div>

          {/* SECTION 2: Employee Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Employee / Payee Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Staff / Payee Name *
                </label>
                <input
                  type="text"
                  required
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Alex Mukasa"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Role / Position
                </label>
                <input
                  type="text"
                  value={employeeRole}
                  onChange={(e) => setEmployeeRole(e.target.value)}
                  placeholder="e.g. Lead Safari Guide"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Phone / WhatsApp (For Link)
                </label>
                <input
                  type="text"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                  placeholder="e.g. +256 782 000 000"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  placeholder="staff@allboundvacations.com"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Staff ID / National ID
                </label>
                <input
                  type="text"
                  value={employeeIdNumber}
                  onChange={(e) => setEmployeeIdNumber(e.target.value)}
                  placeholder="e.g. ABV-EMP-014"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1 text-[10px] uppercase">
                  Authorized By (Manager)
                </label>
                <input
                  type="text"
                  value={authorizedByName}
                  onChange={(e) => setAuthorizedByName(e.target.value)}
                  placeholder="e.g. Operations Manager"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Purpose & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Voucher Purpose / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5-Day Bwindi Gorilla Safari Fuel & Park Guide Per Diem"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Detailed Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed explanation of activities, vehicle registration, itineraries, or receipt requirements..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl font-medium focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>
          </div>

          {/* SECTION 4: Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Itemized Expenditure Breakdown
              </h3>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-100 text-gray-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-center w-20">Qty</th>
                    <th className="px-3 py-2 text-right w-28">Unit Rate</th>
                    <th className="px-3 py-2 text-right w-32">Total ({currency})</th>
                    <th className="px-3 py-2 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Fuel allowance for Toyota Landcruiser"
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => handleLineItemChange(idx, 'unit_price', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded-lg text-xs text-right font-mono"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-right font-bold text-gray-900 font-mono">
                        {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          disabled={lineItems.length === 1}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-30 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 5: Currency, Total & Disbursement Method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-teal-900 text-white rounded-2xl">
            <div>
              <label className="block text-teal-200 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  const curr = currencies.find((c) => c.code === e.target.value);
                  if (curr) setExchangeRate(curr.exchange_rate_to_usd);
                }}
                className="w-full px-3 py-2 bg-teal-950 text-white border border-teal-700 rounded-xl font-bold outline-none"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-teal-200 font-bold uppercase tracking-wider mb-1 text-[10px]">
                Disbursement Method
              </label>
              <select
                value={disbursementMethod}
                onChange={(e) => setDisbursementMethod(e.target.value)}
                className="w-full px-3 py-2 bg-teal-950 text-white border border-teal-700 rounded-xl font-semibold outline-none"
              >
                <option value="cash">Cash in Hand</option>
                <option value="bank_transfer">Bank Transfer / EFT</option>
                <option value="mobile_money">Mobile Money (M-Pesa / MTN / Airtel)</option>
                <option value="cheque">Cheque</option>
                <option value="corporate_card">Corporate Visa / Card</option>
              </select>
            </div>

            <div className="text-right flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                Total Authorized Amount
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Voucher...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>Authorize & Generate Signing Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
