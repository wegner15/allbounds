import { useState, useCallback } from 'react';
import React from 'react';
import { pdf } from '@react-pdf/renderer';

export const usePackageBrochurePdf = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  /**
   * Generate and download a PDF brochure using @react-pdf/renderer.
   * Accepts a React element (the PDF Document component) so the hook is
   * decoupled from any specific brochure layout.
   */
  const generatePdf = useCallback(
    async (pdfElement: React.ReactElement, packageName: string = 'Tour-Package') => {
      try {
        setIsGenerating(true);
        setProgress(10);
        setStatusMessage('Preparing PDF document…');

        setProgress(30);
        setStatusMessage('Building pages…');

        const blob = await pdf(pdfElement).toBlob();

        setProgress(90);
        setStatusMessage('Downloading brochure…');

        const url = URL.createObjectURL(blob);
        const safeTitle = packageName.replace(/[^\w\s-]/gi, '').trim() || 'AllBounds-Tour';
        const filename = `AllBounds-${safeTitle.replace(/\s+/g, '-')}-Brochure.pdf`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

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
        }, 1500);
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
