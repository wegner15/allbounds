import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { MediaAssetSummary } from '../../lib/types/api';
import { getImageUrlWithFallback, IMAGE_VARIANTS } from '../../utils/imageUtils';

interface GallerySectionProps {
  images: MediaAssetSummary[];
  title: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ images, title }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="gallery" className="scroll-mt-20 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100">
        <h2 className="text-2xl md:text-3xl font-playfair font-bold text-charcoal mb-6">
          Photo Gallery
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((image, index) => {
            const imageId = image.image_id || image.storage_key || '';
            return (
              <div
                key={image.id || index}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                onClick={() => openModal(index)}
              >
                <img
                  src={getImageUrlWithFallback(imageId, IMAGE_VARIANTS.MEDIUM)}
                  alt={image.alt_text || `${title} - Image ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-md p-2 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={closeModal}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50"
            onClick={closeModal}
          >
            <XMarkIcon className="w-10 h-10" />
          </button>

          {images.length > 1 && (
            <>
              <button 
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 z-50"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeftIcon className="w-12 h-12" />
              </button>
              <button 
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 z-50"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRightIcon className="w-12 h-12" />
              </button>
            </>
          )}

          <div 
            className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={getImageUrlWithFallback(images[currentImageIndex].image_id || images[currentImageIndex].storage_key || '', IMAGE_VARIANTS.LARGE)}
              alt={images[currentImageIndex].alt_text || title}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-scale-in"
            />
            {(images[currentImageIndex].caption || images[currentImageIndex].title) && (
              <div className="mt-6 text-center text-white max-w-2xl animate-slide-up">
                {images[currentImageIndex].title && (
                  <h3 className="text-xl font-bold mb-2">{images[currentImageIndex].title}</h3>
                )}
                {images[currentImageIndex].caption && (
                  <p className="text-gray-300 text-lg leading-relaxed">{images[currentImageIndex].caption}</p>
                )}
                <div className="mt-4 text-sm text-gray-500 font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
