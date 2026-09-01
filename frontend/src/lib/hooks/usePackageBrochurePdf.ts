import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface UsePackageBrochurePdfOptions {
  packageName: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const usePackageBrochurePdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Helper to preload remote images and convert them into base64 data URIs to avoid CORS canvas taint
  const preloadImages = async (container: HTMLElement): Promise<void> => {
    const images = Array.from(container.querySelectorAll('img'));
    let loaded = 0;
    
    await Promise.all(
      images.map(async (img) => {
        try {
          if (!img.src || img.src.startsWith('data:')) {
            loaded++;
            return;
          }

          // Create a new image to ensure full load
          await new Promise<void>((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Resolve anyway on error to avoid blocking
            }
          });
        } catch {
          // Ignore individual image load failures
        } finally {
          loaded++;
          setProgress(Math.round((loaded / Math.max(images.length, 1)) * 30));
        }
      })
    );
  };

  const generatePdf = useCallback(
    async (elementOrId: HTMLElement | string, packageName: string = 'Tour-Package') => {
      try {
        setIsGenerating(true);
        setProgress(5);
        setStatusMessage('Preparing brochure layout...');

        let element: HTMLElement | null = null;
        if (typeof elementOrId === 'string') {
          element = document.getElementById(elementOrId);
        } else {
          element = elementOrId;
        }

        if (!element) {
          throw new Error('Brochure document container element not found.');
        }

        // Preload all images
        setStatusMessage('Loading high-resolution photos...');
        await preloadImages(element);
        setProgress(35);

        // Find individual A4 pages inside the container if present, or render page-by-page
        const pageElements = Array.from(element.querySelectorAll<HTMLElement>('.brochure-page'));
        const elementsToRender = pageElements.length > 0 ? pageElements : [element];

        // A4 dimensions in mm: 210 x 297
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        });

        // Set document metadata
        const safeTitle = packageName.replace(/[^\w\s-]/gi, '').trim() || 'AllBounds Tour Dossier';
        pdf.setProperties({
          title: `${safeTitle} - Official Tour Brochure`,
          subject: 'Comprehensive Tour Package Itinerary & Dossier',
          author: 'AllBounds Travel & Expeditions',
          keywords: 'safari, tour package, itinerary, travel brochure, AllBounds',
          creator: 'AllBounds Travel Platform',
        });

        const totalPages = elementsToRender.length;

        for (let i = 0; i < totalPages; i++) {
          const pageEl = elementsToRender[i];
          setStatusMessage(`Rendering page ${i + 1} of ${totalPages}...`);
          setProgress(35 + Math.round(((i + 1) / totalPages) * 55));

          const canvas = await html2canvas(pageEl, {
            scale: 2, // 2x DPI for crisp print quality
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 794, // Standard A4 pixel width @ 96 DPI
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.95);

          if (i > 0) {
            pdf.addPage('a4', 'portrait');
          }

          // Render canvas to full A4 page: 210mm x 297mm
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        }

        setStatusMessage('Finalizing PDF document...');
        setProgress(95);

        const cleanFilename = `AllBounds-${safeTitle.replace(/\s+/g, '-')}-Brochure.pdf`;
        pdf.save(cleanFilename);

        setProgress(100);
        setStatusMessage('Download complete!');
        return true;
      } catch (err: any) {
        console.error('Failed to generate PDF brochure:', err);
        setStatusMessage(err?.message || 'Error generating brochure');
        throw err;
      } finally {
        setTimeout(() => {
          setIsGenerating(false);
          setProgress(0);
          setStatusMessage('');
        }, 1200);
      }
    },
    []
  );

  const printBrochure = useCallback(() => {
    window.print();
  }, []);

  return {
    generatePdf,
    printBrochure,
    isGenerating,
    progress,
    statusMessage,
  };
};
