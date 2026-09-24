import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  quality?: number;
}

/**
 * Capture an HTML DOM element and export it cleanly to an A4 PDF document.
 * Automatically slices long documents into multiple pages without clipping margins.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const {
    orientation = 'portrait',
    marginMm = 0,
    scale = 2.5,
  } = options;

  // Track original styling to restore cleanly in finally block
  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalBorderRadius = element.style.borderRadius;
  const originalPadding = element.style.padding;

  try {
    // 1. Wait for document fonts to be ready to avoid font-swap metrics shifts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Temporarily prepare element for high-fidelity capture:
    // Strip outer card decorations and set compact printable edge padding (~6-7mm)
    // to prevent excessive left/right whitespace that squeezes content
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    element.style.borderRadius = '0';
    element.style.padding = '20px 24px';

    // 3. Render DOM to high-res Canvas via html2canvas with lossless settings
    const captureWidth = Math.max(element.scrollWidth, 794);
    const canvas = await html2canvas(element, {
      scale: Math.max(scale, 2.5),
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: captureWidth,
      windowHeight: element.scrollHeight,
    });

    // 4. Setup jsPDF Document (A4 format)
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    const printableWidth = pageWidth - marginMm * 2;
    const printableHeight = pageHeight - marginMm * 2;

    // Calculate how tall the canvas would be in mm at printable width
    const totalImgHeightMm = (canvas.height * printableWidth) / canvas.width;

    // How many pixels on the canvas correspond to one printable page height
    const pageHeightInCanvasPx = (canvas.width * printableHeight) / printableWidth;
    const overflowRatio = canvas.height / pageHeightInCanvasPx;

    // 5. High-fidelity placement (use lossless PNG to avoid JPEG ringing distortion)
    // If within 8% of single-page height, fit onto single page cleanly
    if (overflowRatio <= 1.08) {
      const imgData = canvas.toDataURL('image/png');
      const renderHeightMm = Math.min(totalImgHeightMm, printableHeight);
      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        marginMm,
        printableWidth,
        renderHeightMm,
        undefined,
        'SLOW'
      );
    } else {
      const totalPages = Math.ceil(canvas.height / pageHeightInCanvasPx);
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage('a4', orientation);
        }

        const sourceY = i * pageHeightInCanvasPx;
        const sliceHeightPx = Math.min(pageHeightInCanvasPx, canvas.height - sourceY);

        // Create temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;

        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sliceHeightPx,
            0,
            0,
            canvas.width,
            sliceHeightPx
          );

          const pageImgData = pageCanvas.toDataURL('image/png');
          const sliceHeightMm = (sliceHeightPx * printableWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            'PNG',
            marginMm,
            marginMm,
            printableWidth,
            sliceHeightMm,
            undefined,
            'SLOW'
          );
        }
      }
    }

    // 6. Trigger download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF document:', error);
    throw error;
  } finally {
    // Restore styling
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalBorderRadius;
    element.style.padding = originalPadding;
  }
}

/**
 * React hook to manage PDF generation state and trigger download.
 */
export function usePdfDownload() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = useCallback(
    async (
      element: HTMLElement | null,
      filename: string,
      options?: PdfExportOptions
    ): Promise<boolean> => {
      if (!element) {
        console.warn('PDF Generator: No element provided for PDF capture.');
        return false;
      }

      setIsGenerating(true);
      setError(null);

      try {
        await exportElementToPdf(element, filename, options);
        return true;
      } catch (err: any) {
        setError(err?.message || 'Failed to generate PDF');
        return false;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    isGenerating,
    error,
    downloadPdf,
  };
}
