import React, { useRef } from 'react';
import { Download, Printer, X, FileText, Loader2, Sparkles, Check } from 'lucide-react';
import type { PackageDetailResponse, PriceChartDetail } from '../../../lib/types/api';
import { PackageBrochureDocument } from './PackageBrochureDocument';
import { usePackageBrochurePdf } from '../../../lib/hooks/usePackageBrochurePdf';

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

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      await generatePdf(renderTargetId, packageData.name);
    } catch (error) {
      console.error('Failed to download brochure:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brochure-modal-title"
    >
      <div className="bg-gray-100 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-300 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="brochure-modal-title" className="text-lg font-bold font-playfair text-gray-900">
                  Tour Package Brochure
                </h2>
                <span className="bg-teal-50 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200">
                  PDF Dossier
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate max-w-md">
                {packageData.name} • {packageData.duration_days} Days in {packageData.country?.name}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Direct Print Button */}
            <button
              type="button"
              onClick={printBrochure}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="Print directly or save as PDF via system printer"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Print / System PDF</span>
            </button>

            {/* Generate & Download PDF Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal hover:bg-teal-700 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>{statusMessage || `Generating PDF (${progress}%)`}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>Download PDF Brochure</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close brochure modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar when Generating */}
        {isGenerating && (
          <div className="w-full bg-gray-200 h-1.5 overflow-hidden flex-shrink-0">
            <div
              className="bg-gradient-to-r from-teal to-amber-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Document Preview Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gray-700/20 flex flex-col items-center gap-6">
          <div className="w-full max-w-[794px] flex items-center justify-between text-xs text-gray-500 px-1">
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-teal" />
              Live Publication Preview (A4 Standard)
            </span>
            <span>Formatted for High-Resolution Print & Digital Sharing</span>
          </div>

          {/* Actual Render Target Document (Captured by html2canvas) */}
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
            <PackageBrochureDocument
              id={renderTargetId}
              packageData={packageData}
              priceCharts={priceCharts}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageBrochureModal;
