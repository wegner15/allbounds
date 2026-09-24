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
  const address = settings?.physical_address || 'Plot 335, Block 13 Najjanankumbi, Entebbe Road\nKampala, Uganda';
  const phone = settings?.phone || '+256 782 594 008';
  const email = settings?.email || 'bookings@allboundvacations.com';
  const rawWebsite = settings?.website || 'allboundvacations.com';
  const website = rawWebsite.replace(/^https?:\/\//, '');
  const tin = settings?.tin_number || '1002345678';
  const regNo = settings?.company_registration_number || '800200034567';
  const vat = settings?.vat_number || 'VAT-UG-456789';

  return (
    <div className="mb-6">
      {/* 3-Column Header Section */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-5 sm:gap-0">
        
        {/* ======================================================== */}
        {/* COLUMN 1: BRAND IDENTITY & LEGAL DETAILS                 */}
        {/* ======================================================== */}
        <div className="flex-1 sm:pr-6 flex flex-col justify-between">
          <div>
            {/* Logo Mark + Brand Typography */}
            <div className="flex items-center space-x-3.5">
              <div className="h-16 w-16 sm:h-[68px] sm:w-[68px] flex-shrink-0">
                <img
                  src="/favicon.svg"
                  alt="Allbound Vacations"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('android-chrome')) {
                      target.src = '/logo/android-chrome-512x512.png';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl sm:text-[34px] font-black tracking-tight text-[#367588] leading-none font-sans">
                  Allbound
                </h1>
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] font-semibold text-[#367588] mt-1.5 pl-0.5">
                  vacations
                </p>
              </div>
            </div>

            {/* Legal Company Name & Trading Name */}
            <div className="mt-3.5 pl-0.5">
              <p className="text-xs sm:text-[12.5px] font-bold text-[#0c2340] uppercase tracking-wider leading-snug">
                {legalName}
              </p>
              <p className="text-xs italic text-[#2c4c5e] mt-0.5">
                Trading as: {companyName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          </div>

          {/* Divider & Golden Tagline */}
          <div className="mt-3">
            <div className="border-t border-[#c59b27] my-2 w-full" />
            <p className="text-xs italic font-serif text-[#b8860b]">
              "{tagline}"
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VERTICAL DIVIDER 1                                       */}
        {/* ======================================================== */}
        <div className="hidden sm:block w-[1.5px] bg-[#c59b27] self-stretch my-0.5" />

        {/* ======================================================== */}
        {/* COLUMN 2: LOCATION, CONTACT & TAX / REGISTRATION DETAILS */}
        {/* ======================================================== */}
        <div className="flex-1 sm:px-6 flex flex-col justify-between">
          {/* Contact Details with Gold Icons */}
          <div className="space-y-2 text-[11.5px] text-gray-700">
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0 mt-0.5" />
              <div className="whitespace-pre-line leading-tight text-gray-700 font-normal">
                {address}
              </div>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span className="text-gray-700">{phone}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span className="text-gray-700">{email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Globe className="w-3.5 h-3.5 text-[#c59b27] flex-shrink-0" />
              <span className="text-gray-700">
                {website.startsWith('www.') ? website : `www.${website}`}
              </span>
            </div>
          </div>

          {/* Divider & Tax / Registration Grid */}
          <div className="mt-3">
            <div className="border-t border-[#c59b27] my-2 w-full" />
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
        <div className="hidden sm:block w-[1.5px] bg-[#c59b27] self-stretch my-0.5" />

        {/* ======================================================== */}
        {/* COLUMN 3: DOCUMENT TITLE & STATUS BADGE                  */}
        {/* ======================================================== */}
        <div className="w-full sm:w-[220px] sm:pl-6 flex flex-col justify-between items-start sm:items-center text-left sm:text-center">
          <div className="pt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0c3b44] font-playfair uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mt-1 uppercase tracking-[0.18em]">
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
      {/* FULL-WIDTH GOLD ACCENT DIVIDER RULE                      */}
      {/* ======================================================== */}
      <div className="border-b-2 border-[#c59b27] mt-5 mb-6 w-full" />
    </div>
  );
};
