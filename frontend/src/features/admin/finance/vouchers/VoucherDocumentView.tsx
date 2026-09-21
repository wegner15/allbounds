import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Printer,
  Mail,
  Edit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building2,
  PhoneCall,
  UserCheck,
  Plane,
  Car,
  Compass,
  BedDouble,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TravelVoucher, CompanyFinanceSettings } from '../../../../lib/types/finance';
import { DocumentHeader } from '../components/DocumentHeader';
import '../components/PrintStyles.css';

interface VoucherDocumentViewProps {
  voucher: TravelVoucher;
  settings?: CompanyFinanceSettings | null;
  onSendEmail?: () => void;
  isPublicView?: boolean;
}

export const VoucherDocumentView: React.FC<VoucherDocumentViewProps> = ({
  voucher,
  settings,
  onSendEmail,
  isPublicView = false
}) => {
  const supplier = (voucher.supplier_details || {}) as any;
  const traveller = (voucher.traveller_details || {}) as any;
  const service = (voucher.service_details || {}) as any;
  const specialRequests = voucher.special_requests || [];
  const emergency = voucher.emergency_contacts || {
    office_phone: settings?.phone || '+(256) 782 594 008',
    whatsapp: settings?.whatsapp || '+(256) 782 594 008',
    emergency_24h: settings?.phone || '+(256) 782 594 008',
    email: settings?.email || 'bookings@allboundvacations.com'
  };

  const verificationUrl = `${window.location.origin}/verify/voucher/${voucher.verification_code}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300 uppercase tracking-wider">
            <Check className="w-3.5 h-3.5 mr-1" /> Confirmed
          </span>
        );
      case 'amended':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 uppercase tracking-wider">
            Amended (v{voucher.version})
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
            Pending Confirmation
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return <BedDouble className="w-5 h-5 text-teal-700" />;
      case 'transportation':
        return <Car className="w-5 h-5 text-teal-700" />;
      case 'flight':
        return <Plane className="w-5 h-5 text-teal-700" />;
      case 'safari':
      case 'activity':
      default:
        return <Compass className="w-5 h-5 text-teal-700" />;
    }
  };

  const getSpecialRequestBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
            Confirmed
          </span>
        );
      case 'subject_to_availability':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Subject to Availability
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            Requested
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6">
      {/* Action Bar (Hidden during print) */}
      {!isPublicView && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <Link
            to="/admin/finance/vouchers"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-teal-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Vouchers
          </Link>

          <div className="flex items-center space-x-2">
            {onSendEmail && (
              <button
                type="button"
                onClick={onSendEmail}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-2xs transition cursor-pointer"
              >
                <Mail className="w-4 h-4 mr-1.5 text-gray-500" /> Email Voucher
              </button>
            )}
            <Link
              to={`/admin/finance/vouchers/${voucher.id}/edit`}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-2xs transition cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-1.5 text-gray-500" /> Edit / Amend
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print / PDF
            </button>
          </div>
        </div>
      )}

      {/* Main Document Card */}
      <div className="print-container bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-gray-200">
        {/* A. Header */}
        <DocumentHeader
          title="TRAVEL VOUCHER"
          subtitle={`${voucher.voucher_type.toUpperCase()} SERVICE VOUCHER`}
          settings={settings}
          statusBadge={getStatusBadge(voucher.voucher_status)}
        />

        {/* B. Voucher Identification & Version */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 my-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-gray-500 block">Voucher Number:</span>
            <span className="font-mono font-bold text-teal-900 text-sm">{voucher.voucher_number}</span>
          </div>
          {voucher.booking_id && (
            <div>
              <span className="text-gray-500 block">Booking Number:</span>
              <span className="font-mono font-semibold text-gray-900">ABV-BK-{String(voucher.booking_id).padStart(5, '0')}</span>
            </div>
          )}
          {voucher.confirmation_number && (
            <div>
              <span className="text-gray-500 block">Confirmation Code:</span>
              <span className="font-mono font-semibold text-gray-900">{voucher.confirmation_number}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500 block">Version:</span>
            <span className="font-bold text-gray-800">Version {voucher.version}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Issue Date:</span>
            <span className="font-medium text-gray-900">{voucher.issue_date}</span>
          </div>
          {voucher.issued_by_name && (
            <div>
              <span className="text-gray-500 block">Issued By:</span>
              <span className="text-gray-800 font-medium">{voucher.issued_by_name}</span>
            </div>
          )}
        </div>

        {/* C. Supplier / Service Provider (CRITICAL) */}
        <div className="my-6 bg-teal-50/60 border-2 border-teal-600/30 rounded-xl p-5">
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="w-5 h-5 text-teal-800" />
            <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wider">
              Supplier / Service Provider (Must Present Voucher to Named Supplier)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-800">
            <div>
              <p className="font-bold text-base text-gray-900">
                {supplier.supplier_name || supplier.hotel_name || supplier.company_name || 'Designated Supplier'}
              </p>
              {supplier.contact_person && (
                <p className="text-gray-600 mt-1"><span className="font-semibold">Contact Person:</span> {supplier.contact_person}</p>
              )}
              {supplier.address && (
                <p className="text-gray-600 mt-0.5"><span className="font-semibold">Address:</span> {supplier.address}</p>
              )}
            </div>
            <div className="space-y-1">
              {supplier.supplier_confirmation_number && (
                <p><span className="text-gray-500 font-medium">Supplier Confirmation Ref:</span> <span className="font-mono font-bold text-teal-900">{supplier.supplier_confirmation_number}</span></p>
              )}
              {supplier.reservation_email && (
                <p><span className="text-gray-500 font-medium">Reservation Email:</span> {supplier.reservation_email}</p>
              )}
              {supplier.telephone && (
                <p><span className="text-gray-500 font-medium">Telephone:</span> {supplier.telephone}</p>
              )}
            </div>
          </div>
        </div>

        {/* D. Traveller Information */}
        <div className="my-6 border border-gray-200 rounded-xl p-5 bg-white">
          <div className="flex items-center space-x-2 mb-3">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Traveller Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-500 block">Lead Traveller:</span>
              <span className="font-bold text-sm text-gray-900">{traveller.lead_traveller || 'Guest'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Party Size:</span>
              <span className="font-medium text-gray-800">
                {traveller.adults || 1} Adults{traveller.children ? `, ${traveller.children} Children` : ''}
                {traveller.infants ? `, ${traveller.infants} Infants` : ''}
              </span>
            </div>
            {traveller.country_of_origin && (
              <div>
                <span className="text-gray-500 block">Nationality / Origin:</span>
                <span className="font-medium text-gray-800">{traveller.country_of_origin}</span>
              </div>
            )}
          </div>

          {/* Names list if multiple */}
          {traveller.travellers_list && traveller.travellers_list.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-500 font-semibold block mb-1">Named Passengers / Guests:</span>
              <div className="flex flex-wrap gap-2">
                {traveller.travellers_list.map((name: string, i: number) => (
                  <span key={i} className="inline-block px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-800 font-medium">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* E-I. Specific Service Details */}
        <div className="my-6 border border-teal-200 rounded-xl p-5 bg-teal-50/30">
          <div className="flex items-center space-x-2 mb-3">
            {getServiceTypeIcon(voucher.voucher_type)}
            <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Service Details ({voucher.voucher_type.toUpperCase()})
            </h3>
          </div>

          {/* Accommodation View */}
          {voucher.voucher_type === 'accommodation' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {service.property_name && (
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-gray-500 block">Property:</span>
                  <span className="font-bold text-sm text-gray-900">{service.property_name}</span>
                </div>
              )}
              {service.check_in_date && (
                <div>
                  <span className="text-gray-500 block">Check-in Date:</span>
                  <span className="font-bold text-gray-900">{service.check_in_date}</span>
                </div>
              )}
              {service.check_out_date && (
                <div>
                  <span className="text-gray-500 block">Check-out Date:</span>
                  <span className="font-bold text-gray-900">{service.check_out_date}</span>
                </div>
              )}
              {service.number_of_nights && (
                <div>
                  <span className="text-gray-500 block">Nights:</span>
                  <span className="font-bold text-gray-900">{service.number_of_nights} Nights</span>
                </div>
              )}
              {service.room_type && (
                <div>
                  <span className="text-gray-500 block">Room Category:</span>
                  <span className="font-semibold text-gray-900">{service.room_type}</span>
                </div>
              )}
              {service.number_of_rooms && (
                <div>
                  <span className="text-gray-500 block">Number of Rooms:</span>
                  <span className="font-medium text-gray-900">{service.number_of_rooms} Room(s)</span>
                </div>
              )}
              {service.meal_plan && (
                <div>
                  <span className="text-gray-500 block">Meal Plan / Board Basis:</span>
                  <span className="font-bold text-teal-900">{service.meal_plan}</span>
                </div>
              )}
            </div>
          )}

          {/* Transport View */}
          {voucher.voucher_type === 'transportation' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-gray-500 block">Pick-up Date & Time:</span>
                <span className="font-bold text-gray-900">{service.pickup_datetime || service.date || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Pick-up Location:</span>
                <span className="font-semibold text-gray-900">{service.pickup_location || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Drop-off Location:</span>
                <span className="font-semibold text-gray-900">{service.dropoff_location || '-'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Vehicle Type:</span>
                <span className="font-medium text-gray-900">{service.vehicle_type || 'Private Safari Van / 4x4 Cruiser'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Driver-Guide Contact:</span>
                <span className="font-medium text-gray-900">{service.driver_contact || 'Assigned on arrival'}</span>
              </div>
              {service.flight_number && (
                <div>
                  <span className="text-gray-500 block">Flight Number:</span>
                  <span className="font-mono font-bold text-teal-900">{service.flight_number}</span>
                </div>
              )}
            </div>
          )}

          {/* General / Safari / Activity View */}
          {voucher.voucher_type !== 'accommodation' && voucher.voucher_type !== 'transportation' && (
            <div className="text-xs space-y-2">
              {service.package_name && (
                <p className="text-sm font-bold text-gray-900">{service.package_name}</p>
              )}
              {service.activity_name && (
                <p className="text-sm font-bold text-gray-900">{service.activity_name}</p>
              )}
              {service.dates && (
                <p><span className="text-gray-500">Dates:</span> <strong className="text-gray-900">{service.dates}</strong></p>
              )}
              {service.description && (
                <p className="text-gray-700 whitespace-pre-line">{service.description}</p>
              )}
            </div>
          )}
        </div>

        {/* L. What's Included & M. What's Not Included */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {/* Included */}
          <div className="border border-green-200 rounded-xl p-4 bg-green-50/40">
            <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-700 mr-1.5" /> What's Included (Prepaid by Allbound)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-800">
              {voucher.inclusions && voucher.inclusions.length > 0 ? (
                voucher.inclusions.map((inc: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-green-600 font-bold mr-2">&#10003;</span>
                    <span>{inc}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">As specified in the booking confirmation.</li>
              )}
            </ul>
          </div>

          {/* Excluded */}
          <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/40">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center">
              <XCircle className="w-4 h-4 text-rose-700 mr-1.5" /> What's Not Included (Direct Client Settlement)
            </h4>
            <ul className="space-y-1.5 text-xs text-gray-800">
              {voucher.exclusions && voucher.exclusions.length > 0 ? (
                voucher.exclusions.map((exc: string, i: number) => (
                  <li key={i} className="flex items-start">
                    <span className="text-rose-600 font-bold mr-2">&#10005;</span>
                    <span>{exc}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic">Personal extras and gratuities unless indicated.</li>
              )}
            </ul>
          </div>
        </div>

        {/* N. Special Requests */}
        {specialRequests.length > 0 && (
          <div className="my-6 border border-amber-200 rounded-xl p-4 bg-amber-50/50">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 text-amber-700 mr-1.5" /> Special Requests
            </h4>
            <div className="space-y-2 text-xs">
              {specialRequests.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-amber-100">
                  <span className="text-gray-800 font-medium">{req.request}</span>
                  {getSpecialRequestBadge(req.status)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* J. Supplier Instructions (CRITICAL HIGHLIGHT) */}
        <div className="my-6 border-2 border-teal-800 bg-teal-900 text-white rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-300 mb-2 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-300" /> Supplier Instructions
          </h4>
          <div className="text-xs text-teal-100 leading-relaxed whitespace-pre-line space-y-1">
            {voucher.supplier_instructions || (
              <>
                <p>&bull; Please provide the services described above to the named traveller(s).</p>
                <p>&bull; Please verify traveller identity upon arrival.</p>
                <p>&bull; Any additional services requested directly by the traveller should be settled directly by the traveller unless otherwise authorized.</p>
                <p>&bull; <strong>DO NOT charge the traveller for services prepaid by Allbound Vacations.</strong></p>
                <p>&bull; Please contact Allbound Vacations immediately regarding any discrepancies.</p>
              </>
            )}
          </div>
        </div>

        {/* K. Client Instructions */}
        {voucher.client_instructions && (
          <div className="my-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider mb-1">
              Traveller Instructions:
            </h4>
            <p className="whitespace-pre-line">{voucher.client_instructions}</p>
          </div>
        )}

        {/* O. 24-Hour Assistance & Q. Verification QR Code */}
        <div className="border-t-2 border-gray-200 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-gray-600 text-center sm:text-left space-y-1">
            <p className="font-bold text-teal-900 text-sm flex items-center justify-center sm:justify-start">
              <PhoneCall className="w-4 h-4 mr-1.5 text-teal-700" /> ALLBOUND 24/7 TRAVEL ASSISTANCE
            </p>
            <p>Main Office: {emergency.office_phone} &bull; WhatsApp: {emergency.whatsapp}</p>
            <p>24h Emergency Hotline: <strong className="text-gray-900">{emergency.emergency_24h}</strong></p>
            <p className="text-[10px] text-gray-400 pt-1 font-mono">
              Voucher Verification Ref: {voucher.verification_code}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
            <QRCodeSVG value={verificationUrl} size={65} level="M" />
            <div className="text-[10px] text-gray-600 text-left">
              <p className="font-bold text-teal-900">Supplier QR Scan</p>
              <p>Scan to verify authenticity</p>
              <p className="font-mono text-[9px] text-gray-500 mt-0.5">{voucher.verification_code}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
