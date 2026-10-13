import React from 'react';

export type StampStatus = 'invoice' | 'receipt' | 'paid' | 'received' | 'void';

interface DocumentStampProps {
  status: StampStatus | string;
  documentNumber?: string;
  /** ISO date string or Date; shown in red ink. Defaults to today. */
  date?: string | Date | null;
  width?: number;
  className?: string;
}

const BLUE = '#1f3a93';
const RED = '#c42828';

const LABELS: Record<string, string> = {
  invoice: 'INVOICE',
  receipt: 'RECEIPT',
  paid: 'PAID',
  received: 'RECEIVED',
  void: 'VOID',
};

const formatStampDate = (value?: string | Date | null): string => {
  const d = value ? new Date(value) : new Date();
  const safe = isNaN(d.getTime()) ? new Date() : d;
  const day = String(safe.getDate());
  const month = safe.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  return `${day} ${month} ${safe.getFullYear()}`;
};

/**
 * Rubber-stamp styled company stamp used on invoices and receipts.
 * Rendered as inline SVG so it prints, scales and is captured correctly by the PDF exporter.
 */
export const DocumentStamp: React.FC<DocumentStampProps> = ({
  status,
  documentNumber,
  date,
  width = 240,
  className = '',
}) => {
  const label = LABELS[String(status).toLowerCase()] || String(status).toUpperCase();
  const height = (width * 400) / 560;

  return (
    <svg
      role="img"
      aria-label={`Allbound Travel Services Ltd stamp: ${label}`}
      viewBox="0 0 560 400"
      width={width}
      height={height}
      className={`document-stamp select-none ${className}`}
      style={{ transform: 'rotate(-2deg)', opacity: 0.92, fontFamily: "'DejaVu Sans', 'Arial Black', Arial, sans-serif", fontWeight: 700 }}
    >
      {/* Double frame */}
      <rect x="8" y="8" width="544" height="384" rx="18" fill="none" stroke={BLUE} strokeWidth="5" />
      <rect x="20" y="20" width="520" height="360" rx="10" fill="none" stroke={BLUE} strokeWidth="2" />

      {/* Brand mark: circle with calendar-check glyph */}
      <circle cx="83" cy="77" r="37" fill={BLUE} />
      <rect x="64" y="62" width="38" height="32" rx="5" fill="none" stroke="#fff" strokeWidth="3" />
      <line x1="64" y1="72" x2="102" y2="72" stroke="#fff" strokeWidth="3" />
      <line x1="73" y1="57" x2="73" y2="66" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <line x1="93" y1="57" x2="93" y2="66" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <polyline points="72,83 80,90 94,77" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Company name */}
      <text x="332" y="82" textAnchor="middle" fontSize="50" fill={BLUE} letterSpacing="2">ALLBOUND</text>
      <text x="332" y="116" textAnchor="middle" fontSize="19" fill={BLUE} letterSpacing="1">TRAVEL SERVICES LTD</text>
      <line x1="46" y1="134" x2="514" y2="134" stroke={BLUE} strokeWidth="2" />

      {/* Dynamic status */}
      <text x="280" y="184" textAnchor="middle" fontSize="38" fill={BLUE} letterSpacing="6">{label}</text>

      {/* Document number */}
      {documentNumber && (
        <text x="280" y="222" textAnchor="middle" fontSize="22" fill={BLUE} letterSpacing="2">NO. {documentNumber}</text>
      )}

      {/* Date in red ink */}
      <text x="280" y={documentNumber ? 272 : 240} textAnchor="middle" fontSize="40" fill={RED} letterSpacing="5">
        {formatStampDate(date)}
      </text>

      {/* Contact lines */}
      <text x="280" y="322" textAnchor="middle" fontSize="18" fill={BLUE} letterSpacing="1">TEL: +256 782 594 008</text>
      <text x="280" y="350" textAnchor="middle" fontSize="18" fill={BLUE} letterSpacing="1">P.O.BOX 173469 KAMPALA GPO</text>
    </svg>
  );
};

export default DocumentStamp;
