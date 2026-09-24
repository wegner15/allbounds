import React from 'react';
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
  const companyName = settings?.company_name || 'ALLBOUND VACATIONS';
  const legalName = settings?.legal_company_name || 'Allbound Travel Services Limited';
  const tagline = settings?.tagline || 'Your Dream Holiday. Designed. Booked. Perfected.';
  const address = settings?.physical_address || 'Plot 335, Block 13 Najjanankumbi, Entebbe Road\nKampala Uganda';
  const phone = settings?.phone || '+(256) 782 594 008';
  const email = settings?.email || 'bookings@allboundvacations.com';
  const website = settings?.website || 'allboundvacations.com';
  const tin = settings?.tin_number || '1002345678';
  const regNo = settings?.company_registration_number || '800200034567';
  const vat = settings?.vat_number || 'VAT-UG-456789';

  return (
    <div className="border-b-2 border-teal-800/20 pb-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        {/* Company Identity */}
        <div className="flex items-start space-x-4">
          <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-teal-950">
            <img
              src="/favicon.svg"
              alt={companyName}
              className="h-full w-full object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('android-chrome')) {
                  target.src = '/logo/android-chrome-512x512.png';
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-playfair tracking-wide text-gray-900">
              {companyName}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-teal-800 uppercase tracking-wider">
              {legalName}
            </p>
            <p className="text-xs italic text-gray-500 mt-0.5">
              "{tagline}"
            </p>
            <div className="text-xs text-gray-600 mt-2 space-y-0.5">
              <p className="whitespace-pre-line">{address}</p>
              <p>
                <span className="font-medium">Tel:</span> {phone} &bull;{' '}
                <span className="font-medium">Email:</span> {email}
              </p>
              <p>
                <span className="font-medium">Web:</span> {website}
              </p>
              {(tin || regNo) && (
                <p className="text-[11px] text-gray-500 pt-0.5">
                  {tin && <span><span className="font-medium">TIN:</span> {tin} </span>}
                  {regNo && <span>&bull; <span className="font-medium">Reg:</span> {regNo} </span>}
                  {vat && <span>&bull; <span className="font-medium">VAT:</span> {vat}</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Document Title & Badge */}
        <div className="text-left sm:text-right flex-shrink-0 self-stretch sm:self-auto flex flex-col justify-between items-start sm:items-end">
          <div className="bg-teal-50 border border-teal-200 px-4 py-2 rounded-lg text-left sm:text-right shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-teal-900 font-playfair uppercase">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs font-medium text-teal-700 mt-0.5 tracking-wide uppercase">
                {subtitle}
              </p>
            )}
          </div>
          {statusBadge && <div className="mt-3">{statusBadge}</div>}
        </div>
      </div>
    </div>
  );
};
