import React from 'react';
import { GalleryImage } from './ImageGallery';

interface GalleryThumbnailsProps {
  images: GalleryImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

const GalleryThumbnails: React.FC<GalleryThumbnailsProps> = ({
  images,
  selectedIndex,
  onSelect,
  className = '',
}) => {
  if (!images || images.length <= 1) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <div 
        className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => onSelect(index)}
            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all duration-200 ${
              index === selectedIndex
                ? 'ring-2 ring-green-600 ring-offset-2 scale-105 shadow-lg'
                : 'hover:ring-2 hover:ring-gray-300 hover:ring-offset-1 hover:scale-105 shadow'
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={image.file_path}
              alt={image.alt_text || `Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {index !== selectedIndex && (
              <div className="absolute inset-0 bg-black/10"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GalleryThumbnails;
