import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  quality?: number;
  continuous?: boolean;
}

/**
 * Capture an HTML DOM element and export it cleanly to a PDF document.
 * By default generates a continuous seamless PDF matching the exact content height,
 * completely eliminating awkward page cuts and box splitting.
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
    continuous = true,
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

    // 3. Render DOM to high-res Canvas via html2canvas with lossless settings.
    // NOTE:
    // - Do NOT pass `x` or `y` offsets manually: html2canvas already calculates the element's
    //   exact bounding box coordinates (left, top) within the cloned iframe. Passing manual x/y
    //   adds to these coordinates, shifting the canvas and clipping off the top and left portions!
    // - Setting `scrollX: 0` and `scrollY: 0` ensures window scroll position does not shift the capture.
    // - Providing an adequate desktop window width (>= 1280px) ensures full responsive layouts.
    const captureWidth = Math.max(
      document.documentElement.scrollWidth,
      document.documentElement.clientWidth,
      window.innerWidth,
      element.scrollWidth,
      1280
    );
    const captureHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
      window.innerHeight,
      element.scrollHeight,
      1280
    );

    const canvas = await html2canvas(element, {
      scale: Math.max(scale, 2.5),
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: captureWidth,
      windowHeight: captureHeight,
      onclone: (_clonedDoc, clonedElement) => {
        // Ensure any overflow containers inside the target element render in full without clipping
        const overflowEls = clonedElement.querySelectorAll('.overflow-x-auto, .overflow-hidden');
        overflowEls.forEach((el) => {
          (el as HTMLElement).style.overflow = 'visible';
        });
      },
    });

    const pageWidth = orientation === 'portrait' ? 210 : 297;
    const printableWidth = pageWidth - marginMm * 2;
    const totalImgHeightMm = (canvas.height * printableWidth) / canvas.width;

    // 4. CONTINUOUS SINGLE-PAGE PDF (Default)
    // Generates a seamless document matching exact content height without arbitrary page cuts
    if (continuous) {
      const pdfHeight = totalImgHeightMm + marginMm * 2;
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: [pageWidth, pdfHeight],
        compress: true,
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(
        imgData,
        'PNG',
        marginMm,
        marginMm,
        printableWidth,
        totalImgHeightMm,
        undefined,
        'SLOW'
      );

      const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      pdf.save(cleanFilename);
      return true;
    }

    // 5. FIXED A4 MULTI-PAGE FALLBACK (Only if continuous is explicitly set to false)
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageHeight = orientation === 'portrait' ? 297 : 210;
    const printableHeight = pageHeight - marginMm * 2;
    const pageHeightInCanvasPx = (canvas.width * printableHeight) / printableWidth;
    const overflowRatio = canvas.height / pageHeightInCanvasPx;

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
