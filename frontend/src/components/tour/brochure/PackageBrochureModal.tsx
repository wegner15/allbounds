import React, { useEffect } from 'react';
import { Download, Printer, X, FileText, Loader2, Sparkles } from 'lucide-react';
import type { PackageDetailResponse, PriceChartDetail } from '../../../lib/types/api';
import { PackageBrochureDocument } from './PackageBrochureDocument';
import { usePackageBrochurePdf } from '../../../lib/hooks/usePackageBrochurePdf';
// PDF component is lazy-imported inside handleDownload to keep the bundle lean

interface PackageBrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageData: PackageDetailResponse;
  priceCharts?: PriceChartDetail[];
}

export const PackageBrochureModal: React.FC<PackageBrochureModalProps> = ({
  isOpen,
  onClose,
  packageData,
  priceCharts = [],
}) => {
  const { generatePdf, printBrochure, isGenerating, progress, statusMessage } = usePackageBrochurePdf();
  const renderTargetId = `brochure-render-target-${packageData.id}`;

  // Keyboard close + body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const destinationSlug = packageData.country?.slug || 'destinations';
  const tourUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/packages/${destinationSlug}/${packageData.slug}`
      : `https://allboundvacations.com/packages/${destinationSlug}/${packageData.slug}`;

  const handleDownload = async () => {
    try {
      // Pre-generate QR code as a data URL (works in the pdf() renderer)
      let qrDataUrl: string | undefined;
      try {
        const QRCode = (await import('qrcode')).default;
        qrDataUrl = await QRCode.toDataURL(tourUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#042f2e', light: '#ffffff' },
        });
      } catch {
        console.warn('QR code generation skipped');
      }

      // Lazy import the react-pdf Document component
      const { PackageBrochurePdf } = await import('./PackageBrochurePdf');

      await generatePdf(
        <PackageBrochurePdf
          packageData={packageData}
          priceCharts={priceCharts}
          qrCodeDataUrl={qrDataUrl}
        />,
        packageData.name
      );
    } catch (error) {
      console.error('Failed to download brochure:', error);
    }
  };

  return (
    /**
     * Overlay sits below the navbar (top: 68px) and fills the rest of the viewport.
     * Clicking the darkened backdrop outside the panel closes the modal.
     */
    <div
      className="fixed inset-x-0 bottom-0 z-40 bg-gray-950/75 backdrop-blur-sm"
      style={{ top: '68px' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="brochure-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel — full height, max-width centred, all scrolling confined inside */}
      <div className="flex flex-col h-full mx-auto w-full max-w-5xl bg-gray-100 shadow-2xl border-x border-gray-300 overflow-hidden">

        {/* ── Sticky Header ──────────────────────────────────────────────── */}
        <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 id="brochure-modal-title" className="text-base font-bold font-playfair text-gray-900">
                  Tour Package Brochure
                </h2>
                <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 flex-shrink-0">
                  PDF Dossier
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">
                {packageData.name} • {packageData.duration_days} Days in {packageData.country?.name}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={printBrochure}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-60"
              title="Print directly or save as PDF via system printer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Print / System PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-teal hover:bg-teal-700 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>{statusMessage || `Generating… ${progress}%`}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close brochure preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {isGenerating && (
          <div className="w-full bg-gray-200 h-1 overflow-hidden flex-shrink-0">
            <div
              className="bg-gradient-to-r from-teal to-amber-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Scrollable Preview Area ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-700/20">
          {/* Hint strip */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-2 bg-gray-800/85 backdrop-blur-sm text-xs text-gray-300 border-b border-white/10">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Live Publication Preview (A4 Standard)
            </span>
            <span className="hidden sm:block opacity-70">Scroll to preview all pages ↓</span>
          </div>

          {/* Brochure — centred with padding */}
          <div className="flex flex-col items-center py-8 px-4">
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white ring-1 ring-black/10">
              <PackageBrochureDocument
                id={renderTargetId}
                packageData={packageData}
                priceCharts={priceCharts}
              />
            </div>
            <div className="h-10" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBrochureModal;
