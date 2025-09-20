import React, { useState } from 'react';
import Dialog from '../ui/Dialog';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  thumbnail?: string;
}

export interface GalleryProps {
  images: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Gallery: React.FC<GalleryProps> = ({
  images,
  columns = 3,
  gap = 'md',
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
        {images.map((image) => (
          <div 
            key={image.id} 
            className="aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image.thumbnail || image.src} 
              alt={image.alt} 
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <Dialog 
        isOpen={!!selectedImage} 
        onClose={handleClose}
        className="max-w-3xl"
      >
        {selectedImage && (
          <div className="relative">
            <img 
              src={selectedImage.src} 
              alt={selectedImage.alt} 
              className="w-full h-auto rounded"
            />
            <p className="mt-2 text-sm text-gray-600">{selectedImage.alt}</p>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default Gallery;
