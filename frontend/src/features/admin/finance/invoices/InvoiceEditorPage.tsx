import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Building,
  User,
  DollarSign,
  FileCheck,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import { suppliersApi } from '../../../../lib/api/suppliers';
import { apiClient } from '../../../../lib/api';
import type {
  Invoice,
  InvoiceLineItem,
  Currency,
  CompanyFinanceSettings,
  Supplier
} from '../../../../lib/types/finance';

export const InvoiceEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Settings & Currencies
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [availableBookings, setAvailableBookings] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [invoiceStatus, setInvoiceStatus] = useState<string>('draft');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1.0);
  const [loadingInvoiceNumber, setLoadingInvoiceNumber] = useState<boolean>(false);
  const [consultantName, setConsultantName] = useState<string>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('');

  // Client Details
  const [clientType, setClientType] = useState<'individual' | 'corporate'>('individual');
  const [fullName, setFullName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [contactPerson, setContactPerson] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [tinVat, setTinVat] = useState<string>('');
  const [poNumber, setPoNumber] = useState<string>('');

  // Trip Summary
  const [leadTraveller, setLeadTraveller] = useState<string>('');
  const [destinations, setDestinations] = useState<string>('');
  const [travelType, setTravelType] = useState<string>('Safari');
  const [travelStartDate, setTravelStartDate] = useState<string>('');
  const [travelEndDate, setTravelEndDate] = useState<string>('');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number | ''>('');
  const [durationNights, setDurationNights] = useState<number | ''>('');
  const [accommodationCategory, setAccommodationCategory] = useState<string>('Luxury / Mid-Range');
  const [mealPlan, setMealPlan] = useState<string>('Full Board');
  const [transportationType, setTransportationType] = useState<string>('Private 4x4 Safari Land Cruiser');
  const [tourPackageName, setTourPackageName] = useState<string>('');

  // Line Items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      category: 'accommodation',
      title: 'Safari Package & Accommodation',
      description: 'Standard safari itinerary with full board lodge accommodation.',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      tax_rate: 0,
      tax_amount: 0,
      total_amount: 0,
      sort_order: 0
    }
  ]);

  // Financial Extra adjustments
  const [promotionalDiscount, setPromotionalDiscount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [otherTaxesAmount, setOtherTaxesAmount] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [bookingFee, setBookingFee] = useState<number>(0);
  const [creditApplied, setCreditApplied] = useState<number>(0);

  // Notes & Terms
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('');

  // Load initial currencies, settings, and invoice if editing
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [currList, compSettings, bookingsRes, suppliersRes] = await Promise.all([
          financeApi.getCurrencies(),
          financeApi.getSettings(),
          apiClient.get<any[]>('/bookings/type/package').catch(() => []),
          suppliersApi.getSuppliers({ is_active: true, limit: 200 }).catch(() => ({ items: [] }))
        ]);

        setCurrencies(currList);
        setSettings(compSettings);
        setAvailableBookings(bookingsRes || []);
        setSuppliers(suppliersRes?.items || []);

        if (!isEditing) {
          // Default to base currency from settings
          const baseCurr = currList.find((c) => c.is_base_currency);
          if (baseCurr) {
            setSelectedCurrency(baseCurr.code);
            setExchangeRate(baseCurr.exchange_rate_to_usd);
          } else if (currList.length > 0) {
            setSelectedCurrency(currList[0].code);
            setExchangeRate(currList[0].exchange_rate_to_usd);
          } else {
            setSelectedCurrency('USD');
          }

          // Fetch auto-generated invoice number
          setLoadingInvoiceNumber(true);
          try {
            const numRes = await financeApi.getNextInvoiceNumber();
            setInvoiceNumber(numRes.invoice_number);
          } catch {
            // fallback: leave blank so backend generates on save
          } finally {
            setLoadingInvoiceNumber(false);
          }
        }

        if (compSettings && !isEditing) {
          setNotes(compSettings.default_invoice_notes || '');
          setTerms(compSettings.default_invoice_terms || '');
        }

        if (isEditing && id) {
          const inv = await financeApi.getInvoice(parseInt(id, 10));
          setInvoiceNumber(inv.invoice_number);
          setBookingId(inv.booking_id || null);
          setQuoteNumber(inv.quote_number || '');
          setInvoiceStatus(inv.invoice_status);
          setInvoiceDate(inv.invoice_date);
          setBookingDate(inv.booking_date || '');
          setDueDate(inv.due_date);
          setSelectedCurrency(inv.currency);
          setExchangeRate(inv.exchange_rate_to_usd || 1.0);
          setConsultantName(inv.consultant_name || '');
          setPaymentTerms(inv.payment_terms || '');
          setClientType(inv.client_type || 'individual');

          const c = inv.client_details || {};
          setFullName(c.full_name || '');
          setCompanyName(c.company_name || '');
          setContactPerson(c.contact_person || '');
          setEmail(c.email || '');
          setTelephone(c.telephone || '');
          setAddress(c.address || '');
          setCountry(c.country || '');
          setTinVat(c.tin_vat || '');
          setPoNumber(c.purchase_order_number || '');

          const t = inv.trip_summary || {};
          setLeadTraveller(t.lead_traveller || '');
          setDestinations(t.destinations || '');
          setTravelType(t.travel_type || 'Safari');
          setTravelStartDate(t.travel_start_date || '');
          setTravelEndDate(t.travel_end_date || '');
          setAdults(t.adults || 1);
          setChildren(t.children || 0);
          setInfants(t.infants || 0);
          setDurationDays(t.duration_days || '');
          setDurationNights(t.duration_nights || '');
          setAccommodationCategory(t.accommodation_category || '');
          setMealPlan(t.meal_plan || '');
          setTransportationType(t.transportation_type || '');
          setTourPackageName(t.tour_package_name || '');

          setPromotionalDiscount(inv.promotional_discount || 0);
          setVatAmount(inv.vat_amount || 0);
          setOtherTaxesAmount(inv.other_taxes_amount || 0);
          setServiceFee(inv.service_fee || 0);
          setBookingFee(inv.booking_fee || 0);
          setCreditApplied(inv.credit_applied || 0);

          setNotes(inv.notes || '');
          setTerms(inv.terms_and_conditions || '');
          setLineItems(inv.line_items || []);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load initial invoice data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  // Update exchange rate when currency changes
  const handleCurrencyChange = (code: string) => {
    setSelectedCurrency(code);
    const curr = currencies.find((c) => c.code === code);
    if (curr) {
      setExchangeRate(curr.exchange_rate_to_usd);
    }
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems];
    const item = { ...updated[index], [field]: value };

    const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
    const price = field === 'unit_price' ? parseFloat(value) || 0 : item.unit_price;
    const disc = field === 'discount' ? parseFloat(value) || 0 : item.discount;
    const tax = field === 'tax_amount' ? parseFloat(value) || 0 : item.tax_amount;

    item.total_amount = Math.max(0, qty * price - disc + tax);
    updated[index] = item;
    setLineItems(updated);
  };

  const addItem = () => {
    setLineItems([
      ...lineItems,
      {
        category: 'other',
        title: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: 0,
        sort_order: lineItems.length
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // 1-Click Import from Booking
  const handleImportBooking = (bId: string) => {
    const parsedId = parseInt(bId, 10);
    if (!parsedId) return;

    const b = availableBookings.find((item) => item.id === parsedId);
    if (!b) return;

    setBookingId(b.id);
    setFullName(b.contact_name || '');
    setEmail(b.contact_email || '');
    setTelephone(b.contact_phone || '');
    setCountry(b.country_of_origin || '');
    setLeadTraveller(b.contact_name || '');
    setAdults(b.number_of_adults || 1);
    setChildren(b.number_of_children || 0);
    setTourPackageName((b.entity_slug || '').replace(/-/g, ' ').toUpperCase());
    setAccommodationCategory(b.selected_room_type || 'Standard');
    setMealPlan(b.selected_meal_plan || 'Full Board');
    setDurationNights(b.number_of_nights || '');

    const price = b.calculated_total_price || 0;
    setLineItems([
      {
        category: 'accommodation',
        title: `${(b.entity_slug || 'Tour').replace(/-/g, ' ').toUpperCase()} Package`,
        description: `Booking #${b.id} for ${b.number_of_adults} adults and ${b.number_of_children} children. Hotel: ${b.selected_hotel_name || 'Selected accommodation'}`,
        quantity: 1,
        unit_price: price,
        discount: 0,
        tax_rate: 0,
        tax_amount: 0,
        total_amount: price,
        sort_order: 0
      }
    ]);
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const itemsDiscount = lineItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const totalDiscount = itemsDiscount + (promotionalDiscount || 0);
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const totalAmount =
    taxableAmount +
    (vatAmount || 0) +
    (otherTaxesAmount || 0) +
    (serviceFee || 0) +
    (bookingFee || 0);
  const balanceDue = Math.max(0, totalAmount - (creditApplied || 0));

  const handleSave = async (statusOverride?: string) => {
    if (!fullName && !companyName) {
      setError('Please provide client name or company name.');
      return;
    }
    if (lineItems.length === 0 || !lineItems[0].title) {
      setError('Please add at least one line item with a title.');
      return;
    }

    setSaving(true);
    setError(null);

    const clientDetails = {
      full_name: fullName,
      company_name: companyName,
      contact_person: contactPerson,
      email,
      telephone,
      address,
      country,
      tin_vat: tinVat,
      purchase_order_number: poNumber
    };

    const tripSummary = {
      lead_traveller: leadTraveller || fullName,
      destinations,
      travel_type: travelType,
      travel_start_date: travelStartDate || null,
      travel_end_date: travelEndDate || null,
      adults,
      children,
      infants,
      duration_days: durationDays ? Number(durationDays) : null,
      duration_nights: durationNights ? Number(durationNights) : null,
      accommodation_category: accommodationCategory,
      meal_plan: mealPlan,
      transportation_type: transportationType,
      tour_package_name: tourPackageName
    };

    const payload = {
      // Leave invoice_number undefined for new invoices so backend generates it
      invoice_number: isEditing ? invoiceNumber : undefined,
      booking_id: bookingId,
      quote_number: quoteNumber || undefined,
      invoice_status: statusOverride || invoiceStatus,
      invoice_date: invoiceDate,
      booking_date: bookingDate || undefined,
      due_date: dueDate,
      currency: selectedCurrency,
      exchange_rate_to_usd: exchangeRate,
      consultant_name: consultantName || undefined,
      payment_terms: paymentTerms || undefined,
      client_type: clientType,
      client_details: clientDetails,
      trip_summary: tripSummary,
      subtotal,
      discount_amount: itemsDiscount,
      promotional_discount: promotionalDiscount || 0,
      taxable_amount: taxableAmount,
      vat_amount: vatAmount || 0,
      other_taxes_amount: otherTaxesAmount || 0,
      service_fee: serviceFee || 0,
      booking_fee: bookingFee || 0,
      payment_processing_fee: 0,
      total_amount: totalAmount,
      credit_applied: creditApplied || 0,
      notes: notes || undefined,
      terms_and_conditions: terms || undefined,
      line_items: lineItems
    };

    try {
      if (isEditing && id) {
        await financeApi.updateInvoice(parseInt(id, 10), payload as any);
        navigate(`/admin/finance/invoices/${id}`);
      } else {
        const created = await financeApi.createInvoice(payload as any);
        navigate(`/admin/finance/invoices/${created.id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save invoice');
    } finally {
      setSaving(false);
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
    <div className="max-w-5xl mx-auto my-6 px-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/finance/invoices"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-playfair text-gray-900">
              {isEditing ? `Edit Invoice #${invoiceNumber}` : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-gray-500">
              Complete invoice details, client information, and itemized travel services
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('issued')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Issue Invoice'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* 1-Click Import from Booking banner */}
      {!isEditing && availableBookings.length > 0 && (
        <div className="mb-6 p-4 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-teal-900 text-sm">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <span>
              <strong>1-Click Quick Fill:</strong> Populate invoice directly from a website booking
            </span>
          </div>
          <select
            onChange={(e) => handleImportBooking(e.target.value)}
            className="text-xs p-2 rounded-lg border border-teal-300 bg-white font-medium text-teal-900"
            defaultValue=""
          >
            <option value="" disabled>
              Select Booking to Import...
            </option>
            {availableBookings.map((b) => (
              <option key={b.id} value={b.id}>
                Booking #{b.id} — {b.contact_name} ({b.entity_slug})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-6">
        {/* Section 1: Basic Identifiers & Currency */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            1. Invoice Identification & Currency
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Invoice Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={invoiceNumber}
                  readOnly
                  className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg text-xs font-mono text-gray-600 cursor-not-allowed"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 border border-teal-200 bg-teal-50 rounded-lg text-xs font-mono font-bold text-teal-800 tracking-wider">
                    {loadingInvoiceNumber ? (
                      <span className="text-gray-400 animate-pulse">Generating...</span>
                    ) : (
                      invoiceNumber || 'Auto-generated on save'
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">Auto-generated</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Quote Number</label>
              <input
                type="text"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                placeholder="Optional (e.g. QT-4821)"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Currency *</label>
              <select
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold text-teal-900 bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} ({c.symbol}) — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Exchange Rate to USD</label>
              <input
                type="number"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1.0)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Invoice Date *</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Payment Due Date *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs text-red-700 font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Sales / Tour Consultant</label>
              <input
                type="text"
                value={consultantName}
                onChange={(e) => setConsultantName(e.target.value)}
                placeholder="e.g. Travel Specialist"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Payment Terms</label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 50% deposit, balance 30 days prior"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bill To Client Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider">
              2. Bill To — Client Information
            </h2>
            {/* Toggle Individual vs Corporate */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setClientType('individual')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  clientType === 'individual' ? 'bg-white shadow-sm text-teal-900' : 'text-gray-600'
                }`}
              >
                Individual Traveller
              </button>
              <button
                type="button"
                onClick={() => setClientType('corporate')}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  clientType === 'corporate' ? 'bg-white shadow-sm text-teal-900' : 'text-gray-600'
                }`}
              >
                Corporate Client
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {clientType === 'corporate' ? (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Safari Enterprises Ltd"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Purchase Order (PO) #</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-2026-981"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">TIN / VAT Number</label>
                  <input
                    type="text"
                    value={tinVat}
                    onChange={(e) => setTinVat(e.target.value)}
                    placeholder="e.g. 1004829102"
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Traveller Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Telephone / WhatsApp</label>
              <input
                type="text"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Country of Residence</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United Kingdom"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Physical / Billing Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Postal Code"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Trip Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            3. Trip / Booking Summary
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Tour / Package Name</label>
              <input
                type="text"
                value={tourPackageName}
                onChange={(e) => setTourPackageName(e.target.value)}
                placeholder="e.g. 7-Day Gorilla & Chimpanzee Safari"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Travel Type</label>
              <select
                value={travelType}
                onChange={(e) => setTravelType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
              >
                <option value="Safari">Safari</option>
                <option value="Holiday">Holiday</option>
                <option value="Hotel">Hotel</option>
                <option value="Flight">Flight</option>
                <option value="Transfer">Transfer</option>
                <option value="Activity">Activity</option>
                <option value="MICE">MICE</option>
                <option value="Honeymoon">Honeymoon</option>
                <option value="Group Tour">Group Tour</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Destination(s)</label>
              <input
                type="text"
                value={destinations}
                onChange={(e) => setDestinations(e.target.value)}
                placeholder="e.g. Bwindi, Queen Elizabeth, Entebbe"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Adults</label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value, 10) || 1)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Children</label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Infants</label>
              <input
                type="number"
                min="0"
                value={infants}
                onChange={(e) => setInfants(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Duration (Nights)</label>
              <input
                type="number"
                min="0"
                value={durationNights}
                onChange={(e) => setDurationNights(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Accommodation Category</label>
              <input
                type="text"
                value={accommodationCategory}
                onChange={(e) => setAccommodationCategory(e.target.value)}
                placeholder="e.g. Luxury Lodge / Safari Camp"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Meal Plan</label>
              <input
                type="text"
                value={mealPlan}
                onChange={(e) => setMealPlan(e.target.value)}
                placeholder="e.g. Full Board"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Transportation Type</label>
              <input
                type="text"
                value={transportationType}
                onChange={(e) => setTransportationType(e.target.value)}
                placeholder="e.g. 4x4 Safari Land Cruiser with Pop-up Roof"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Itemized Services (Line Items) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider">
              4. Invoice Line Items ({selectedCurrency})
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service Item
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 relative group"
              >
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={lineItems.length <= 1}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 disabled:opacity-30 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 text-xs">
                  <div className="sm:col-span-1">
                    <label className="block text-gray-500 font-medium mb-1">Category</label>
                    <select
                      value={item.category}
                      onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
                    >
                      <option value="accommodation">Accommodation</option>
                      <option value="transportation">Transportation</option>
                      <option value="activities">Activities & Permits</option>
                      <option value="flights">Flights</option>
                      <option value="other">Other Services</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-gray-500 font-medium mb-1">Service Title *</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Gorilla Tracking Permit, Bwindi"
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 font-medium mb-1">Travel / Service Date</label>
                    <input
                      type="date"
                      value={item.travel_date || ''}
                      onChange={(e) => handleItemChange(idx, 'travel_date', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-500 font-medium mb-1 text-xs">Description / Inclusions</label>
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Details about hotel lodge, room category, park fees, flight route, etc."
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                {/* Pricing row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Qty</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Unit Price ({selectedCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Discount ({selectedCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.discount}
                      onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono text-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Tax Amount ({selectedCurrency})</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.tax_amount}
                      onChange={(e) => handleItemChange(idx, 'tax_amount', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-medium mb-1">Line Total</label>
                    <div className="p-2 bg-gray-100 rounded-lg font-mono font-bold text-gray-900 text-xs">
                      {selectedCurrency} {item.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Internal Cost & Supplier (Staff Only - Hidden from Client) */}
                <div className="pt-2.5 border-t border-gray-200 mt-2 bg-teal-50/50 p-3 rounded-lg border border-teal-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-700" /> Internal Cost & Supplier (Staff Only - Invisible to Client)
                    </span>
                    {item.unit_price > 0 && (item.cost_price || 0) > 0 && (
                      <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Line Margin: {selectedCurrency} {((item.unit_price - (item.cost_price || 0)) * item.quantity).toFixed(2)} ({(((item.unit_price - (item.cost_price || 0)) / item.unit_price) * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-600 font-medium mb-1 text-[11px]">Linked Supplier</label>
                      <select
                        value={item.supplier_id || ''}
                        onChange={(e) => handleItemChange(idx, 'supplier_id', e.target.value ? Number(e.target.value) : null)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white"
                      >
                        <option value="">-- No Supplier Linked --</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.category.replace('_', ' ').toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-600 font-medium mb-1 text-[11px]">Unit Cost Price ({selectedCurrency})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.cost_price || ''}
                        onChange={(e) => handleItemChange(idx, 'cost_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Financial Summary Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            5. Financial Adjustments & Totals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Promotional Discount ({selectedCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={promotionalDiscount}
                  onChange={(e) => setPromotionalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono text-red-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">VAT / Taxes ({selectedCurrency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={vatAmount}
                    onChange={(e) => setVatAmount(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Service / Booking Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Credit Applied ({selectedCurrency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={creditApplied}
                  onChange={(e) => setCreditApplied(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono text-emerald-700"
                />
              </div>
            </div>

            {/* Calculated Summary Box */}
            <div className="bg-teal-50/70 p-5 rounded-xl border border-teal-200 text-sm space-y-2 self-start">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">
                  {selectedCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-600 text-xs">
                  <span>Total Discount:</span>
                  <span className="font-mono">
                    -{selectedCurrency} {totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {vatAmount > 0 && (
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>VAT / Taxes:</span>
                  <span className="font-mono">
                    +{selectedCurrency} {vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {serviceFee > 0 && (
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Fees:</span>
                  <span className="font-mono">
                    +{selectedCurrency} {serviceFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-teal-200 flex justify-between font-bold text-gray-900 text-base">
                <span>Total Invoice Value:</span>
                <span className="font-mono text-teal-900">
                  {selectedCurrency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t-2 border-teal-800 flex justify-between font-extrabold text-base text-gray-900">
                <span>Balance Due:</span>
                <span className="font-mono text-red-700">
                  {selectedCurrency} {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Notes & Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Invoice Notes (Visible to Client)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Terms & Conditions
            </label>
            <textarea
              rows={4}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex justify-end items-center gap-3 pt-4 pb-12">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-xl text-sm font-semibold shadow-2xs transition-all cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave('issued')}
            disabled={saving}
            className="inline-flex items-center gap-2 px-7 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-150 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Issue Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};
