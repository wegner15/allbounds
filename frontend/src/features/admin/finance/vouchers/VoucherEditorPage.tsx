import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { financeApi } from '../../../../lib/api/finance';
import { apiClient } from '../../../../lib/api';
import type {
  TravelVoucher,
  CompanyFinanceSettings,
  SpecialRequestItem
} from '../../../../lib/types/finance';

export const VoucherEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [settings, setSettings] = useState<CompanyFinanceSettings | null>(null);
  const [availableBookings, setAvailableBookings] = useState<any[]>([]);

  // Form Fields
  const [voucherNumber, setVoucherNumber] = useState<string>('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState<string>('');
  const [version, setVersion] = useState<number>(1);
  const [voucherStatus, setVoucherStatus] = useState<string>('confirmed');
  const [voucherType, setVoucherType] = useState<string>('accommodation');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [issuedByName, setIssuedByName] = useState<string>('');
  const [bumpVersion, setBumpVersion] = useState<boolean>(false);

  // Supplier Details
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierCompany, setSupplierCompany] = useState<string>('');
  const [supplierContact, setSupplierContact] = useState<string>('');
  const [supplierEmail, setSupplierEmail] = useState<string>('');
  const [supplierPhone, setSupplierPhone] = useState<string>('');
  const [supplierAddress, setSupplierAddress] = useState<string>('');
  const [supplierConfCode, setSupplierConfCode] = useState<string>('');

  // Traveller Details
  const [leadTraveller, setLeadTraveller] = useState<string>('');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [countryOfOrigin, setCountryOfOrigin] = useState<string>('');
  const [travellersList, setTravellersList] = useState<string[]>(['']);

  // Accommodation Service Details
  const [propertyName, setPropertyName] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [numNights, setNumNights] = useState<number>(1);
  const [numRooms, setNumRooms] = useState<number>(1);
  const [roomType, setRoomType] = useState<string>('Standard Cottage / Room');
  const [mealPlan, setMealPlan] = useState<string>('Full Board');

  // Transport Details
  const [pickupDatetime, setPickupDatetime] = useState<string>('');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropoffLocation, setDropoffLocation] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('4x4 Safari Land Cruiser');
  const [driverContact, setDriverContact] = useState<string>('');
  const [flightNumber, setFlightNumber] = useState<string>('');

  // General / Safari Details
  const [generalPackageName, setGeneralPackageName] = useState<string>('');
  const [generalDescription, setGeneralDescription] = useState<string>('');

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>([
    'Accommodation as specified',
    'Meal plan as specified',
    'All ground transportation in private 4x4 safari vehicle',
    'Park entry and conservation fees',
    'English-speaking driver-guide services'
  ]);
  const [newInclusion, setNewInclusion] = useState<string>('');

  const [exclusions, setExclusions] = useState<string[]>([
    'Personal expenses, laundry, and telephone calls',
    'Alcoholic beverages and premium drinks',
    'Gratuities and tips to driver-guide and hotel staff',
    'Travel and medical insurance',
    'International flights and entry visas'
  ]);
  const [newExclusion, setNewExclusion] = useState<string>('');

  // Special Requests
  const [specialRequests, setSpecialRequests] = useState<SpecialRequestItem[]>([]);
  const [newReqText, setNewReqText] = useState<string>('');
  const [newReqStatus, setNewReqStatus] = useState<'confirmed' | 'subject_to_availability' | 'requested'>('requested');

  // Instructions & Terms
  const [supplierInstructions, setSupplierInstructions] = useState<string>('');
  const [clientInstructions, setClientInstructions] = useState<string>('');
  const [voucherTerms, setVoucherTerms] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [compSettings, bookingsRes] = await Promise.all([
          financeApi.getSettings(),
          apiClient.get<any[]>('/bookings/type/package').catch(() => [])
        ]);

        setSettings(compSettings);
        setAvailableBookings(bookingsRes || []);

        if (compSettings && !isEditing) {
          setSupplierInstructions(compSettings.default_voucher_supplier_instructions || '');
          setClientInstructions(compSettings.default_voucher_client_instructions || '');
          setVoucherTerms(compSettings.default_voucher_terms || '');
        }

        if (isEditing && id) {
          const vch = await financeApi.getVoucher(parseInt(id, 10));
          setVoucherNumber(vch.voucher_number);
          setBookingId(vch.booking_id || null);
          setConfirmationNumber(vch.confirmation_number || '');
          setVersion(vch.version);
          setVoucherStatus(vch.voucher_status);
          setVoucherType(vch.voucher_type);
          setIssueDate(vch.issue_date);
          setIssuedByName(vch.issued_by_name || '');

          const s = (vch.supplier_details || {}) as any;
          setSupplierName(s.supplier_name || '');
          setSupplierCompany(s.company_name || '');
          setSupplierContact(s.contact_person || '');
          setSupplierEmail(s.reservation_email || '');
          setSupplierPhone(s.telephone || '');
          setSupplierAddress(s.address || '');
          setSupplierConfCode(s.supplier_confirmation_number || '');

          const t = (vch.traveller_details || {}) as any;
          setLeadTraveller(t.lead_traveller || '');
          setAdults(t.adults || 1);
          setChildren(t.children || 0);
          setInfants(t.infants || 0);
          setCountryOfOrigin(t.country_of_origin || '');
          setTravellersList(t.travellers_list || [t.lead_traveller || '']);

          const srv = (vch.service_details || {}) as any;
          setPropertyName(srv.property_name || '');
          setCheckInDate(srv.check_in_date || '');
          setCheckOutDate(srv.check_out_date || '');
          setNumNights(srv.number_of_nights || 1);
          setNumRooms(srv.number_of_rooms || 1);
          setRoomType(srv.room_type || 'Standard Room');
          setMealPlan(srv.meal_plan || 'Full Board');

          setPickupDatetime(srv.pickup_datetime || '');
          setPickupLocation(srv.pickup_location || '');
          setDropoffLocation(srv.dropoff_location || '');
          setVehicleType(srv.vehicle_type || '');
          setDriverContact(srv.driver_contact || '');
          setFlightNumber(srv.flight_number || '');

          setGeneralPackageName(srv.package_name || srv.activity_name || '');
          setGeneralDescription(srv.description || '');

          setInclusions(vch.inclusions || []);
          setExclusions(vch.exclusions || []);
          setSpecialRequests(vch.special_requests || []);

          setSupplierInstructions(vch.supplier_instructions || '');
          setClientInstructions(vch.client_instructions || '');
          setVoucherTerms(vch.voucher_terms || '');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load voucher data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  const handleImportBooking = (bId: string) => {
    const parsed = parseInt(bId, 10);
    if (!parsed) return;
    const b = availableBookings.find((item) => item.id === parsed);
    if (!b) return;

    setBookingId(b.id);
    setLeadTraveller(b.contact_name || '');
    setAdults(b.number_of_adults || 1);
    setChildren(b.number_of_children || 0);
    setCountryOfOrigin(b.country_of_origin || '');
    setConfirmationNumber(`ABV-BK-${String(b.id).padStart(5, '0')}`);

    const party = (b.travelers || []).map((t: any) => t.full_name);
    setTravellersList(party.length > 0 ? party : [b.contact_name]);

    if (b.selected_hotel_name) {
      setSupplierName(b.selected_hotel_name);
      setPropertyName(b.selected_hotel_name);
      setVoucherType('accommodation');
      setRoomType(b.selected_room_type || 'Standard Room');
      setMealPlan(b.selected_meal_plan || 'Full Board');
      setNumNights(b.number_of_nights || 1);
    } else {
      setGeneralPackageName((b.entity_slug || '').replace(/-/g, ' ').toUpperCase());
    }

    if (b.special_requests) {
      setSpecialRequests([{ request: b.special_requests, status: 'requested' }]);
    }
  };

  const handleAddInclusion = () => {
    if (!newInclusion.trim()) return;
    setInclusions([...inclusions, newInclusion.trim()]);
    setNewInclusion('');
  };

  const handleAddExclusion = () => {
    if (!newExclusion.trim()) return;
    setExclusions([...exclusions, newExclusion.trim()]);
    setNewExclusion('');
  };

  const handleAddSpecialRequest = () => {
    if (!newReqText.trim()) return;
    setSpecialRequests([...specialRequests, { request: newReqText.trim(), status: newReqStatus }]);
    setNewReqText('');
    setNewReqStatus('requested');
  };

  const handleSave = async () => {
    if (!supplierName.trim()) {
      setError('Please provide Supplier / Hotel Name.');
      return;
    }
    if (!leadTraveller.trim()) {
      setError('Please provide Lead Traveller Name.');
      return;
    }

    setSaving(true);
    setError(null);

    let serviceDetails: Record<string, any> = {};
    if (voucherType === 'accommodation') {
      serviceDetails = {
        property_name: propertyName || supplierName,
        check_in_date: checkInDate || null,
        check_out_date: checkOutDate || null,
        number_of_nights: numNights,
        number_of_rooms: numRooms,
        room_type: roomType,
        meal_plan: mealPlan
      };
    } else if (voucherType === 'transportation') {
      serviceDetails = {
        pickup_datetime: pickupDatetime,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        vehicle_type: vehicleType,
        driver_contact: driverContact,
        flight_number: flightNumber
      };
    } else {
      serviceDetails = {
        package_name: generalPackageName,
        description: generalDescription
      };
    }

    const payload = {
      voucher_number: voucherNumber || undefined,
      booking_id: bookingId,
      confirmation_number: confirmationNumber || undefined,
      version,
      voucher_status: voucherStatus,
      voucher_type: voucherType,
      issue_date: issueDate,
      issued_by_name: issuedByName || undefined,
      supplier_details: {
        supplier_name: supplierName,
        company_name: supplierCompany,
        contact_person: supplierContact,
        reservation_email: supplierEmail,
        telephone: supplierPhone,
        address: supplierAddress,
        supplier_confirmation_number: supplierConfCode
      },
      traveller_details: {
        lead_traveller: leadTraveller,
        travellers_list: travellersList.filter((n) => n.trim().length > 0),
        adults,
        children,
        infants,
        country_of_origin: countryOfOrigin
      },
      service_details: serviceDetails,
      supplier_instructions: supplierInstructions,
      client_instructions: clientInstructions,
      inclusions,
      exclusions,
      special_requests: specialRequests,
      voucher_terms: voucherTerms,
      bump_version: bumpVersion
    };

    try {
      if (isEditing && id) {
        await financeApi.updateVoucher(parseInt(id, 10), payload as any);
        navigate(`/admin/finance/vouchers/${id}`);
      } else {
        const created = await financeApi.createVoucher(payload as any);
        navigate(`/admin/finance/vouchers/${created.id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save travel voucher');
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
    <div className="max-w-5xl mx-auto my-6 px-4 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/finance/vouchers"
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-playfair text-gray-900">
              {isEditing ? `Edit Voucher #${voucherNumber}` : 'Issue Travel Voucher'}
            </h1>
            <p className="text-xs text-gray-500">
              Generate official service vouchers for accommodations, transfers, and safaris
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-sm font-semibold shadow-sm transition flex items-center"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? 'Saving...' : 'Save & Issue Voucher'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* 1-Click Import Banner */}
      {!isEditing && availableBookings.length > 0 && (
        <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-teal-900 text-sm">
            <Sparkles className="w-5 h-5 text-teal-700" />
            <span>
              <strong>1-Click Pre-populate:</strong> Select an active booking to pull guest details
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

      {/* Form sections */}
      <div className="space-y-6">
        {/* Section 1: Voucher Metadata */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            1. Voucher Category & Reference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Voucher Type *</label>
              <select
                value={voucherType}
                onChange={(e) => setVoucherType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white font-bold text-teal-900"
              >
                <option value="accommodation">Accommodation Voucher</option>
                <option value="transportation">Transportation Voucher</option>
                <option value="activity">Activity Voucher</option>
                <option value="safari">Safari Voucher</option>
                <option value="flight">Flight Voucher</option>
                <option value="general">General Travel Voucher</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Voucher Number</label>
              <input
                type="text"
                value={voucherNumber}
                onChange={(e) => setVoucherNumber(e.target.value)}
                placeholder="Auto-generated (VCH-2026-00001)"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Confirmation / Booking Code</label>
              <input
                type="text"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                placeholder="e.g. ABV-BK-00452"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Issue Date *</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Voucher Status</label>
              <select
                value={voucherStatus}
                onChange={(e) => setVoucherStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-xs bg-white capitalize"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="amended">Amended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Issued By Name</label>
              <input
                type="text"
                value={issuedByName}
                onChange={(e) => setIssuedByName(e.target.value)}
                placeholder="Consultant name"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            {isEditing && (
              <div className="sm:col-span-2 flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="bump_ver"
                  checked={bumpVersion}
                  onChange={(e) => setBumpVersion(e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="bump_ver" className="text-xs font-semibold text-gray-700">
                  Increment Version Number (Creates Version {version + 1})
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Supplier / Service Provider (CRITICAL) */}
        <div className="bg-teal-50/70 rounded-xl shadow-sm border border-teal-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4 flex items-center">
            <Building2 className="w-4 h-4 mr-1.5 text-teal-700" /> 2. Supplier / Service Provider
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Hotel / Supplier Name *</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder="e.g. Kibale Canopy Lodge"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Supplier Confirmation #</label>
              <input
                type="text"
                value={supplierConfCode}
                onChange={(e) => setSupplierConfCode(e.target.value)}
                placeholder="e.g. KCL-45892"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Contact Person</label>
              <input
                type="text"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                placeholder="e.g. Reservations Manager"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Reservation Email</label>
              <input
                type="email"
                value={supplierEmail}
                onChange={(e) => setSupplierEmail(e.target.value)}
                placeholder="reservations@supplier.com"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Telephone / Hotline</label>
              <input
                type="text"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
                placeholder="+256 700 000 000"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Property / Office Address</label>
              <input
                type="text"
                value={supplierAddress}
                onChange={(e) => setSupplierAddress(e.target.value)}
                placeholder="Fort Portal, Kibale National Park"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Traveller Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            3. Traveller Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs mb-4">
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-semibold mb-1">Lead Traveller Name *</label>
              <input
                type="text"
                value={leadTraveller}
                onChange={(e) => setLeadTraveller(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                required
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
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1 text-xs">
              All Named Travellers (One per line or comma-separated)
            </label>
            <input
              type="text"
              value={travellersList.join(', ')}
              onChange={(e) => setTravellersList(e.target.value.split(',').map((s) => s.trim()))}
              placeholder="e.g. Sarah Jenkins, Mark Jenkins, Emily Jenkins"
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        </div>

        {/* Section 4: Service Specific Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-teal-900 uppercase tracking-wider mb-4">
            4. Service Details ({voucherType.toUpperCase()})
          </h2>

          {voucherType === 'accommodation' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Number of Nights</label>
                <input
                  type="number"
                  min="1"
                  value={numNights}
                  onChange={(e) => setNumNights(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Room Category</label>
                <input
                  type="text"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  placeholder="e.g. Family Cottage / Deluxe Suite"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Number of Rooms</label>
                <input
                  type="number"
                  min="1"
                  value={numRooms}
                  onChange={(e) => setNumRooms(parseInt(e.target.value, 10) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Meal Plan / Board Basis</label>
                <input
                  type="text"
                  value={mealPlan}
                  onChange={(e) => setMealPlan(e.target.value)}
                  placeholder="e.g. Full Board"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-semibold text-teal-900"
                />
              </div>
            </div>
          )}

          {voucherType === 'transportation' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Pick-up Date & Time</label>
                <input
                  type="text"
                  value={pickupDatetime}
                  onChange={(e) => setPickupDatetime(e.target.value)}
                  placeholder="e.g. 24 Oct 2026 at 08:30 AM"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Pick-up Location</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Entebbe International Airport"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Drop-off Location</label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="e.g. Kampala Serena Hotel"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Vehicle Type</label>
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Flight Number (if applicable)</label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g. EK 729"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Driver Name / Contact</label>
                <input
                  type="text"
                  value={driverContact}
                  onChange={(e) => setDriverContact(e.target.value)}
                  placeholder="Assigned on arrival"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {voucherType !== 'accommodation' && voucherType !== 'transportation' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Package / Activity Name</label>
                <input
                  type="text"
                  value={generalPackageName}
                  onChange={(e) => setGeneralPackageName(e.target.value)}
                  placeholder="e.g. Gorilla Trekking Permit — Sector Rushaga"
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Detailed Service Instructions</label>
                <textarea
                  rows={3}
                  value={generalDescription}
                  onChange={(e) => setGeneralDescription(e.target.value)}
                  placeholder="Provide meeting point, briefing time, included guides and activities..."
                  className="w-full p-2 border border-gray-300 rounded-lg text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Included / Excluded Checklists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-1.5" /> What's Included (Prepaid)
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInclusion}
                onChange={(e) => setNewInclusion(e.target.value)}
                placeholder="Add included service..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddInclusion}
                className="px-3 py-1.5 bg-green-700 text-white rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {inclusions.map((inc, i) => (
                <li key={i} className="flex items-center justify-between text-xs p-1.5 bg-green-50 rounded">
                  <span className="text-gray-800 font-medium">&#10003; {inc}</span>
                  <button
                    type="button"
                    onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
            <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center">
              <XCircle className="w-4 h-4 text-rose-600 mr-1.5" /> What's Not Included
            </h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                placeholder="Add excluded item..."
                className="flex-1 p-2 border border-gray-300 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddExclusion}
                className="px-3 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {exclusions.map((exc, i) => (
                <li key={i} className="flex items-center justify-between text-xs p-1.5 bg-rose-50 rounded">
                  <span className="text-gray-800 font-medium">&#10005; {exc}</span>
                  <button
                    type="button"
                    onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    &times;
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 6: Special Requests Manager */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2">
            6. Special Requests & Guaranteed Status
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newReqText}
              onChange={(e) => setNewReqText(e.target.value)}
              placeholder="e.g. Twin beds requested / Vegetarian meal..."
              className="flex-1 p-2 border border-gray-300 rounded-lg text-xs"
            />
            <select
              value={newReqStatus}
              onChange={(e) => setNewReqStatus(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-lg text-xs bg-white font-medium"
            >
              <option value="requested">Requested</option>
              <option value="subject_to_availability">Subject to Availability</option>
              <option value="confirmed">Confirmed</option>
            </select>
            <button
              type="button"
              onClick={handleAddSpecialRequest}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
            >
              Add Request
            </button>
          </div>

          <div className="space-y-2 pt-2">
            {specialRequests.map((req, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              >
                <span className="font-medium text-gray-800">{req.request}</span>
                <div className="flex items-center space-x-2">
                  <span className="capitalize font-bold text-[11px] px-2 py-0.5 rounded bg-white border border-gray-200">
                    {req.status.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpecialRequests(specialRequests.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-600 ml-2"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 7: Instructions & Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Supplier Instructions
            </label>
            <textarea
              rows={4}
              value={supplierInstructions}
              onChange={(e) => setSupplierInstructions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Client / Traveller Instructions
            </label>
            <textarea
              rows={4}
              value={clientInstructions}
              onChange={(e) => setClientInstructions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
