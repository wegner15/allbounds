import React, { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Building,
  CreditCard,
  DollarSign,
  Smartphone,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import type {
  CompanyFinanceSettings,
  Currency,
  BankAccount,
  MobileMoneyAccount
} from '../../../../lib/types/finance';

export const FinanceSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings state
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  // Company Profile fields
  const [companyName, setCompanyName] = useState<string>('');
  const [legalName, setLegalName] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [website, setWebsite] = useState<string>('');
  const [tin, setTin] = useState<string>('');
  const [regNo, setRegNo] = useState<string>('');
  const [vat, setVat] = useState<string>('');

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Mobile Money Accounts
  const [momoAccounts, setMomoAccounts] = useState<MobileMoneyAccount[]>([]);

  // Default Templates
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');
  const [invoiceTerms, setInvoiceTerms] = useState<string>('');
  const [receiptNotice, setReceiptNotice] = useState<string>('');
  const [voucherSupplierInst, setVoucherSupplierInst] = useState<string>('');
  const [voucherClientInst, setVoucherClientInst] = useState<string>('');
  const [voucherTerms, setVoucherTerms] = useState<string>('');

  // New Currency modal / inputs
  const [showAddCurrency, setShowAddCurrency] = useState<boolean>(false);
  const [newCurrCode, setNewCurrCode] = useState<string>('');
  const [newCurrName, setNewCurrName] = useState<string>('');
  const [newCurrSymbol, setNewCurrSymbol] = useState<string>('');
  const [newCurrRate, setNewCurrRate] = useState<number>(1.0);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [s, cList] = await Promise.all([
        financeApi.getSettings(),
        financeApi.getCurrencies(false)
      ]);

      setSettings(s);
      setCurrencies(cList);

      setCompanyName(s.company_name || '');
      setLegalName(s.legal_company_name || '');
      setTagline(s.tagline || '');
      setAddress(s.physical_address || '');
      setPhone(s.phone || '');
      setWhatsapp(s.whatsapp || '');
      setEmail(s.email || '');
      setWebsite(s.website || '');
      setTin(s.tin_number || '');
      setRegNo(s.company_registration_number || '');
      setVat(s.vat_number || '');

      setBankAccounts(s.bank_accounts || []);
      setMomoAccounts(s.mobile_money_accounts || []);

      setInvoiceNotes(s.default_invoice_notes || '');
      setInvoiceTerms(s.default_invoice_terms || '');
      setReceiptNotice(s.default_receipt_notice || '');
      setVoucherSupplierInst(s.default_voucher_supplier_instructions || '');
      setVoucherClientInst(s.default_voucher_client_instructions || '');
      setVoucherTerms(s.default_voucher_terms || '');
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await financeApi.updateSettings({
        company_name: companyName,
        legal_company_name: legalName,
        tagline,
        physical_address: address,
        phone,
        whatsapp,
        email,
        website,
        tin_number: tin,
        company_registration_number: regNo,
        vat_number: vat,
        bank_accounts: bankAccounts,
        mobile_money_accounts: momoAccounts,
        default_invoice_notes: invoiceNotes,
        default_invoice_terms: invoiceTerms,
        default_receipt_notice: receiptNotice,
        default_voucher_supplier_instructions: voucherSupplierInst,
        default_voucher_client_instructions: voucherClientInst,
        default_voucher_terms: voucherTerms
      });
      setMessage({ type: 'success', text: 'Finance and company settings saved successfully!' });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.response?.data?.detail || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  // Add Bank Account
  const addBankAccount = () => {
    setBankAccounts([
      ...bankAccounts,
      {
        bank_name: '',
        account_name: legalName || 'Allbound Travel Services Limited',
        account_number: '',
        branch: '',
        swift_bic: '',
        currency: 'USD',
        is_primary: bankAccounts.length === 0
      }
    ]);
  };

  // Add Mobile Money
  const addMomoAccount = () => {
    setMomoAccounts([
      ...momoAccounts,
      {
        network: 'MTN Mobile Money',
        merchant_number: '',
        account_name: legalName || 'Allbound Travel Services Limited',
        currency: 'UGX',
        is_primary: momoAccounts.length === 0
      }
    ]);
  };

  // Add Currency
  const handleCreateCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurrCode.trim() || !newCurrName.trim() || !newCurrSymbol.trim()) return;

    try {
      await financeApi.createCurrency({
        code: newCurrCode.trim().toUpperCase(),
        name: newCurrName.trim(),
        symbol: newCurrSymbol.trim(),
        exchange_rate_to_usd: Number(newCurrRate) || 1.0,
        is_base_currency: false,
        is_active: true
      });
      setShowAddCurrency(false);
      setNewCurrCode('');
      setNewCurrName('');
      setNewCurrSymbol('');
      setNewCurrRate(1.0);
      const cList = await financeApi.getCurrencies(false);
      setCurrencies(cList);
      setMessage({ type: 'success', text: 'Currency added successfully!' });
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to create currency');
    }
  };

  const handleUpdateCurrencyRate = async (curr: Currency, newRate: number) => {
    try {
      await financeApi.updateCurrency(curr.id, { exchange_rate_to_usd: newRate });
      const cList = await financeApi.getCurrencies(false);
      setCurrencies(cList);
    } catch (err: any) {
      alert('Failed to update rate');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-6 px-4 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-gray-900">
            Finance Settings & Currencies
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure company legal info, wire instructions, mobile money numbers, and exchange rates
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      {/* SECTION 1: CURRENCY MANAGEMENT WITH EXCHANGE RATES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-teal-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-teal-700" /> Multi-Currency & USD Exchange Rates
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add currencies and define how many units convert to 1 USD. Invoices and receipts can be issued in any active currency.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddCurrency(true)}
            className="inline-flex items-center px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add New Currency
          </button>
        </div>

        {/* Currency Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Currency Name</th>
                <th className="px-4 py-3 text-center">Symbol</th>
                <th className="px-4 py-3 text-left">Units per 1 USD (Exchange Rate)</th>
                <th className="px-4 py-3 text-center">Base Currency</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {currencies.map((curr) => (
                <tr key={curr.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold text-teal-900 text-sm">{curr.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{curr.name}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{curr.symbol}</td>
                  <td className="px-4 py-3">
                    {curr.is_base_currency ? (
                      <span className="font-mono text-gray-500 font-bold">1.0000 (Base)</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          step="0.0001"
                          defaultValue={curr.exchange_rate_to_usd}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (val > 0 && val !== curr.exchange_rate_to_usd) {
                              handleUpdateCurrencyRate(curr, val);
                            }
                          }}
                          className="w-32 p-1 border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-teal-500"
                        />
                        <span className="text-[11px] text-gray-400">
                          (1 USD = {curr.exchange_rate_to_usd} {curr.code})
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {curr.is_base_currency ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        Base USD
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        curr.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {curr.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Currency Modal */}
        {showAddCurrency && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2">
              Add New Currency
            </h3>
            <form onSubmit={handleCreateCurrency} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-gray-600 mb-1">Currency Code (3-4 chars) *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={newCurrCode}
                  onChange={(e) => setNewCurrCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ZAR, AED, CAD"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Currency Name *</label>
                <input
                  type="text"
                  value={newCurrName}
                  onChange={(e) => setNewCurrName(e.target.value)}
                  placeholder="e.g. South African Rand"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Symbol *</label>
                <input
                  type="text"
                  value={newCurrSymbol}
                  onChange={(e) => setNewCurrSymbol(e.target.value)}
                  placeholder="e.g. R, د.إ, C$"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Rate to 1 USD *</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={newCurrRate}
                  onChange={(e) => setNewCurrRate(parseFloat(e.target.value) || 1.0)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                  required
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-800 text-white rounded-lg font-semibold hover:bg-teal-900 transition"
                >
                  Save Currency
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCurrency(false)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* SECTION 2: COMPANY LEGAL HEADER PROFILE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-teal-900 flex items-center">
          <Building className="w-5 h-5 mr-2 text-teal-700" /> Company Profile & Legal Registration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Trading Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Legal Company Name *</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs italic"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-semibold mb-1">Physical Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Telephone / Hotline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Official WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Billing / Reservations Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Website URL</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Tax Identification Number (TIN)</label>
            <input
              type="text"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Company Registration Number</label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">VAT Registration Number</label>
            <input
              type="text"
              value={vat}
              onChange={(e) => setVat(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: BANK WIRE ACCOUNTS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-teal-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-teal-700" /> Bank Wire Transfer Accounts
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              These details appear on invoices for clients settling payments via wire transfer
            </p>
          </div>
          <button
            type="button"
            onClick={addBankAccount}
            className="inline-flex items-center px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Bank Account
          </button>
        </div>

        <div className="space-y-3">
          {bankAccounts.map((b, idx) => (
            <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative">
              <button
                type="button"
                onClick={() => setBankAccounts(bankAccounts.filter((_, i) => i !== idx))}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Bank Name *</label>
                  <input
                    type="text"
                    value={b.bank_name}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].bank_name = e.target.value;
                      setBankAccounts(updated);
                    }}
                    placeholder="e.g. Stanbic Bank Uganda"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Account Name *</label>
                  <input
                    type="text"
                    value={b.account_name}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].account_name = e.target.value;
                      setBankAccounts(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Account Number *</label>
                  <input
                    type="text"
                    value={b.account_number}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].account_number = e.target.value;
                      setBankAccounts(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Branch</label>
                  <input
                    type="text"
                    value={b.branch || ''}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].branch = e.target.value;
                      setBankAccounts(updated);
                    }}
                    placeholder="Corporate Branch, Kampala"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    value={b.swift_bic || ''}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].swift_bic = e.target.value;
                      setBankAccounts(updated);
                    }}
                    placeholder="SBICUGKX"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-medium mb-1">Account Currency</label>
                  <select
                    value={b.currency}
                    onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[idx].currency = e.target.value;
                      setBankAccounts(updated);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white font-bold"
                  >
                    {currencies.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: MOBILE MONEY ACCOUNTS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-teal-900 flex items-center">
              <Smartphone className="w-5 h-5 mr-2 text-teal-700" /> Mobile Money Merchant Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Network codes and merchant pay numbers (MTN MoMo, Airtel Money, M-Pesa)
            </p>
          </div>
          <button
            type="button"
            onClick={addMomoAccount}
            className="inline-flex items-center px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Mobile Money
          </button>
        </div>

        <div className="space-y-3">
          {momoAccounts.map((m, idx) => (
            <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs relative">
              <button
                type="button"
                onClick={() => setMomoAccounts(momoAccounts.filter((_, i) => i !== idx))}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Network *</label>
                <input
                  type="text"
                  value={m.network}
                  onChange={(e) => {
                    const updated = [...momoAccounts];
                    updated[idx].network = e.target.value;
                    setMomoAccounts(updated);
                  }}
                  placeholder="e.g. MTN Mobile Money"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Merchant / Pay Number *</label>
                <input
                  type="text"
                  value={m.merchant_number}
                  onChange={(e) => {
                    const updated = [...momoAccounts];
                    updated[idx].merchant_number = e.target.value;
                    setMomoAccounts(updated);
                  }}
                  placeholder="e.g. 654321"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Account / Merchant Name *</label>
                <input
                  type="text"
                  value={m.account_name}
                  onChange={(e) => {
                    const updated = [...momoAccounts];
                    updated[idx].account_name = e.target.value;
                    setMomoAccounts(updated);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">Currency</label>
                <input
                  type="text"
                  value={m.currency || 'UGX'}
                  onChange={(e) => {
                    const updated = [...momoAccounts];
                    updated[idx].currency = e.target.value;
                    setMomoAccounts(updated);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: DEFAULT INVOICE & VOUCHER TEMPLATES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-bold text-teal-900 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-teal-700" /> Standard Notes & Terms Templates
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Default Invoice Notes</label>
            <textarea
              rows={3}
              value={invoiceNotes}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Default Invoice Terms & Conditions</label>
            <textarea
              rows={3}
              value={invoiceTerms}
              onChange={(e) => setInvoiceTerms(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Voucher Supplier Instructions</label>
            <textarea
              rows={3}
              value={voucherSupplierInst}
              onChange={(e) => setVoucherSupplierInst(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Voucher Client Instructions</label>
            <textarea
              rows={3}
              value={voucherClientInst}
              onChange={(e) => setVoucherClientInst(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
