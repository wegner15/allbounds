import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';
import type { CompanyFinanceSettings } from '../../../../lib/types/finance';

interface DocumentHeaderProps {
  title: string;
  subtitle?: string;
  settings?: CompanyFinanceSettings | null;
  statusBadge?: React.ReactNode;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  subtitle,
  settings,
  statusBadge
}) => {
  const companyName = settings?.company_name || 'Allbound Vacations';
  const legalName = settings?.legal_company_name || 'ALLBOUND TRAVEL SERVICES LIMITED';
  const tagline = settings?.tagline || 'Your Dream Holiday. Designed. Booked. Perfected.';
  const address = settings?.physical_address || 'Plot 335 , Block 13 Najjanankumbi , Entebbe Road, Kampala Uganda';
  const phone = settings?.phone || '+256 782 594 008';
  const email = settings?.email || 'bookings@allboundvacations.com';
  const rawWebsite = settings?.website || 'allboundvacations.com';
  const website = rawWebsite.replace(/^https?:\/\//, '');
  const tin = settings?.tin_number || '1054173942';
  const regNo = settings?.company_registration_number || '80020003146317';
  const vat = settings?.vat_number || '-';

  return (
    <div className="mb-6">
      {/* 3-Column Header Section */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-5 sm:gap-0">
        
        {/* ======================================================== */}
        {/* COLUMN 1: BRAND IDENTITY & LEGAL DETAILS                 */}
        {/* ======================================================== */}
        <div className="w-full sm:w-[44%] flex-shrink-0 flex flex-col justify-between sm:pr-6">
          <div>
            {/* Logo Lockup: Perfect Vector / High-Res Brand Mark */}
            <div className="flex items-center">
              <img
                src="/logo/allbound_logo_header_2x.png"
                alt="Allbound Vacations"
                className="h-14 sm:h-[62px] w-auto max-w-full object-contain object-left block"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('brand_mark')) {
                    target.src = '/logo/brand_mark_2x.png';
                  }
                }}
              />
            </div>

            {/* Legal Company Name & Trading Name */}
            <div className="mt-3.5">
              <p className="text-[12px] sm:text-[13px] font-bold text-[#0c4a52] uppercase tracking-[0.05em] leading-snug whitespace-nowrap">
                {legalName}
              </p>
              <p className="text-xs sm:text-[12.5px] italic text-teal-800 mt-0.5 font-normal">
                Trading as: {companyName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          </div>

          {/* Short Gold Accent Bar & Tagline (Matching Image 1) */}
          <div className="mt-3">
            <div className="w-12 h-[2.5px] bg-[#c59b27] rounded-full my-2" />
            <p className="text-xs sm:text-[12.5px] italic font-serif text-[#b88628] leading-tight">
              {tagline.replace(/^["']|["']$/g, '')}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VERTICAL DIVIDER 1                                       */}
        {/* ======================================================== */}
        <div className="hidden sm:block w-[1.5px] bg-[#c59b27]/60 self-stretch my-0.5 flex-shrink-0" />

        {/* ======================================================== */}
        {/* COLUMN 2: LOCATION, CONTACT & TAX / REGISTRATION DETAILS */}
        {/* ======================================================== */}
        <div className="w-full sm:w-[33%] flex-shrink-0 flex flex-col justify-between sm:px-6">
          {/* Contact Details with Brand Teal Icons */}
          <div className="space-y-2 text-[11.5px] text-gray-700">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-3.5 h-3.5 text-teal-700 flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-tight text-gray-700 font-normal">
                {address}
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="text-gray-700">{phone}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="text-gray-700">{email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Globe className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
              <span className="text-gray-700">
                {website.startsWith('www.') ? website : `www.${website}`}
              </span>
            </div>
          </div>

          {/* Brand Divider & Tax / Registration Grid */}
          <div className="mt-3">
            <div className="border-t border-teal-700/25 my-2 w-full" />
            <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-0.5 text-[11px]">
              <span className="text-gray-500 font-medium">TIN:</span>
              <span className="text-gray-800 font-semibold">{tin}</span>
              <span className="text-gray-500 font-medium">Reg. No.:</span>
              <span className="text-gray-800 font-semibold">{regNo}</span>
              <span className="text-gray-500 font-medium">VAT No.:</span>
              <span className="text-gray-800 font-semibold">{vat}</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VERTICAL DIVIDER 2                                       */}
        {/* ======================================================== */}
        <div className="hidden sm:block w-[1.5px] bg-[#c59b27]/60 self-stretch my-0.5 flex-shrink-0" />

        {/* ======================================================== */}
        {/* COLUMN 3: DOCUMENT TITLE & STATUS BADGE                  */}
        {/* ======================================================== */}
        <div className="w-full sm:w-[23%] flex-shrink-0 flex flex-col justify-between items-start sm:items-center text-left sm:text-center sm:pl-6">
          <div className="pt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-teal-900 font-playfair uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] font-semibold text-teal-700/80 mt-1 uppercase tracking-[0.18em]">
                {subtitle}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-4 self-start sm:self-center">
            {statusBadge}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* FULL-WIDTH BRAND TEAL ACCENT DIVIDER RULE                */}
      {/* ======================================================== */}
      <div className="border-b-2 border-teal-700 mt-5 mb-6 w-full" />
    </div>
  );
};
