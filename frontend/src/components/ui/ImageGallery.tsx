import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface GalleryImage {
  id: number;
  filename: string;
  alt_text?: string;
  title?: string;
  caption?: string;
  width?: number;
  height?: number;
  file_path: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  coverImage?: string;
  title?: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  // coverImage is unused but kept for backward compatibility
  title = "Gallery",
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  const getImageUrl = (image: GalleryImage | string) => {
    if (typeof image === 'string') {
      return image.startsWith('http') ? image : `https://imagedelivery.net/your-account-hash/${image}/public`;
    }
    return image.file_path.startsWith('http') ? image.file_path : `https://imagedelivery.net/your-account-hash/${image.file_path}/public`;
  };

  return (
    <div className={`image-gallery ${className}`}>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {images.slice(0, 8).map((image, index) => (
          <div
            key={image.id}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
            onClick={() => openModal(index)}
          >
            <img
              src={getImageUrl(image)}
              alt={image.alt_text || `${title} image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300" />
            
            {/* Show count on last visible image if there are more */}
            {index === 7 && images.length > 8 && (
              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  +{images.length - 8} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Main Image */}
          <div
            className="max-w-4xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(images[currentImageIndex])}
              alt={images[currentImageIndex].alt_text || `${title} image ${currentImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Image Info */}
            <div className="mt-4 text-center text-white">
              {images[currentImageIndex].title && (
                <h3 className="text-lg font-semibold mb-1">
                  {images[currentImageIndex].title}
                </h3>
              )}
              {images[currentImageIndex].caption && (
                <p className="text-sm text-gray-300 mb-2">
                  {images[currentImageIndex].caption}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {currentImageIndex + 1} of {images.length}
              </p>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex
                      ? 'border-white'
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <img
                    src={getImageUrl(image)}
                    alt={image.alt_text || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
