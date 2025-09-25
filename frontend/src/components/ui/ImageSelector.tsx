import React, { useState, useEffect } from 'react';
import CloudflareImageUpload from './CloudflareImageUpload';
import CloudflareImage from './CloudflareImage';

interface ImageSelectorProps {
  initialImageId?: string;
  onImageSelected: (imageId: string) => void;
  variant?: string;
  label?: string;
  helperText?: string;
  className?: string;
}

/**
 * A component for selecting images from Cloudflare Images.
 * This component handles both uploading new images and displaying the selected image.
 */
const ImageSelector: React.FC<ImageSelectorProps> = ({
  initialImageId = '',
  onImageSelected,
  variant = 'medium', // Use 'medium' as default which doesn't require a token
  label = 'Image',
  helperText,
  className = '',
}) => {
  const [imageId, setImageId] = useState<string>(initialImageId);

  // Get the delivery URL from environment variables
  const deliveryUrl = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL;

  // Update local state when initialImageId changes
  useEffect(() => {
    if (initialImageId !== imageId) {
      setImageId(initialImageId);
    }
  }, [initialImageId]);

  // Handle image upload completion
  const handleUploadComplete = (imageData: any) => {
    if (imageData && imageData.cloudflare_image && imageData.cloudflare_image.id) {
      // For upload-and-create-media endpoint
      const id = imageData.cloudflare_image.id;
      console.log('Image upload complete with cloudflare_image.id:', id);
      setImageId(id);
      onImageSelected(id);
    } else if (imageData && imageData.id) {
      // For direct upload endpoint
      console.log('Image upload complete with id:', imageData.id);
      setImageId(imageData.id);
      onImageSelected(imageData.id);
    } else {
      console.error('Invalid image data received:', imageData);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setImageId('');
    onImageSelected('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {/* Image preview */}
      {imageId ? (
        <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
          <CloudflareImage
            imageId={imageId}
            variant={variant}
            alt={label}
            className="max-h-64 mx-auto object-contain"
            deliveryUrl={deliveryUrl}
          />
          <button
            type="button"
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            onClick={handleRemoveImage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : null}
      
      {/* Upload button */}
      <CloudflareImageUpload
        onUploadComplete={handleUploadComplete}
        onUploadError={(error) => console.error('Upload error:', error)}
        buttonText={imageId ? "Replace Image" : "Upload Image"}
        className="w-full"
      />
      
      {/* Helper text */}
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default ImageSelector;
