import React from 'react';

export interface GalleryImage {
  id: string | number;
  file_path: string;
  alt_text?: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
  onImageClick?: (index: number) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = '',
  onImageClick,
}) => {
  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-lg aspect-[16/9] flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Handle image click
  const handleImageClick = (index: number) => {
    if (onImageClick) {
      onImageClick(index);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {images.length === 1 ? (
        // Single image view
        <div 
          className="relative rounded-lg overflow-hidden cursor-pointer aspect-[16/9]"
          onClick={() => handleImageClick(0)}
        >
          <img 
            src={images[0].file_path} 
            alt={images[0].alt_text || 'Gallery image'} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        // Mosaic gallery view
        <div className="grid grid-cols-4 gap-2">
          {/* Large main image */}
          <div 
            className="col-span-4 md:col-span-2 rounded-lg overflow-hidden cursor-pointer relative aspect-[16/9]"
            onClick={() => handleImageClick(0)}
          >
            <img 
              src={images[0].file_path} 
              alt={images[0].alt_text || 'Main gallery image'} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300" />
          </div>
          
          {/* Smaller secondary images */}
          <div className="col-span-4 md:col-span-2 grid grid-cols-2 gap-2">
            {images.slice(1, 5).map((image, idx) => (
              <div 
                key={image.id}
                className="relative rounded-lg overflow-hidden cursor-pointer aspect-square"
                onClick={() => handleImageClick(idx + 1)}
              >
                <img 
                  src={image.file_path} 
                  alt={image.alt_text || `Gallery image ${idx + 2}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                
                {/* Show "View All" overlay on the last visible image if there are more */}
                {idx === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <p className="text-white font-medium">+{images.length - 5} more</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Photo count badge */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
          {images.length} photos
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
