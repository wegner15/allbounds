import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryImage } from './ImageGallery';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrev,
  onNext,
}) => {
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>
      
      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            disabled={currentIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      
      {/* Main image */}
      <div className="w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center p-4">
        <img
          src={currentImage.file_path}
          alt={currentImage.alt_text || `Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {/* Caption */}
      {currentImage.caption && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-2xl w-full px-4">
          <p className="text-white text-center bg-black bg-opacity-50 p-2 rounded">
            {currentImage.caption}
          </p>
        </div>
      )}
      
      {/* Counter */}
      <div className="absolute bottom-4 right-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default LightboxModal;
