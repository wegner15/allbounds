import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
  marginMm?: number;
  scale?: number;
  quality?: number;
  continuous?: boolean;
  contentWidth?: number;
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
    contentWidth = 1120,
  } = options;

  // 1. Wait for document fonts to be ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // 2. Create an isolated off-screen staging container with a fixed desktop print width (1120px).
  // This completely eliminates clipping from parent sidebar layouts, responsive downscaling on small
  // viewports, overflow-y scrollbars on <main>, and window scroll offsets.
  const stagingContainer = document.createElement('div');
  stagingContainer.style.position = 'fixed';
  stagingContainer.style.left = '-10000px';
  stagingContainer.style.top = '0';
  stagingContainer.style.width = `${contentWidth}px`;
  stagingContainer.style.background = '#ffffff';
  stagingContainer.style.zIndex = '-9999';
  stagingContainer.style.overflow = 'visible';

  // Deep clone the element to capture
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${contentWidth}px`;
  clone.style.maxWidth = `${contentWidth}px`;
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.padding = '24px 32px';
  clone.style.boxSizing = 'border-box';

  // Synchronize form inputs / textareas / selects if any
  const origInputs = element.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
  const clonedInputs = clone.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select');
  origInputs.forEach((orig, idx) => {
    const target = clonedInputs[idx];
    if (target) {
      target.value = orig.value;
      if ('checked' in orig && 'checked' in target) {
        (target as HTMLInputElement).checked = (orig as HTMLInputElement).checked;
      }
    }
  });

  // Synchronize canvas elements if any (e.g. dynamic charts or barcodes)
  const origCanvases = element.querySelectorAll<HTMLCanvasElement>('canvas');
  const clonedCanvases = clone.querySelectorAll<HTMLCanvasElement>('canvas');
  origCanvases.forEach((orig, idx) => {
    const target = clonedCanvases[idx];
    if (target) {
      const ctx = target.getContext('2d');
      if (ctx) {
        ctx.drawImage(orig, 0, 0);
      }
    }
  });

  // Ensure any table/overflow containers inside the clone render in full without clipping
  const overflowContainers = clone.querySelectorAll<HTMLElement>('.overflow-x-auto, .overflow-hidden');
  overflowContainers.forEach((el) => {
    el.style.overflow = 'visible';
  });

  stagingContainer.appendChild(clone);
  document.body.appendChild(stagingContainer);

  try {
    // Brief layout settle tick to allow browser to calculate full DOM layout
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 50)));

    const canvas = await html2canvas(clone, {
      scale: Math.max(scale, 2.5),
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: 0,
      windowWidth: contentWidth + 100,
      windowHeight: Math.max(1280, clone.scrollHeight + 200),
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
    // Clean up staging container from DOM
    if (stagingContainer.parentNode) {
      stagingContainer.parentNode.removeChild(stagingContainer);
    }
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
