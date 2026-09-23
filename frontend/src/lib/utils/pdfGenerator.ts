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
    marginMm = 10,
    scale = 2,
    quality = 0.95,
  } = options;

  try {
    // 1. Temporarily prepare element for high-fidelity capture
    const originalShadow = element.style.boxShadow;
    const originalBorder = element.style.border;
    element.style.boxShadow = 'none';

    // 2. Render DOM to high-res Canvas via html2canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Restore styling
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;

    // 3. Setup jsPDF Document
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
    const totalPages = Math.ceil(canvas.height / pageHeightInCanvasPx);

    // 4. Multi-page slicing or single-page placement
    if (totalPages <= 1) {
      const imgData = canvas.toDataURL('image/jpeg', quality);
      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        marginMm,
        printableWidth,
        totalImgHeightMm,
        undefined,
        'FAST'
      );
    } else {
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

          const pageImgData = pageCanvas.toDataURL('image/jpeg', quality);
          const sliceHeightMm = (sliceHeightPx * printableWidth) / canvas.width;

          pdf.addImage(
            pageImgData,
            'JPEG',
            marginMm,
            marginMm,
            printableWidth,
            sliceHeightMm,
            undefined,
            'FAST'
          );
        }
      }
    }

    // 5. Trigger download
    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF document:', error);
    throw error;
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
