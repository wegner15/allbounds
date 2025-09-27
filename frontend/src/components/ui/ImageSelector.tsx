import React, { useState, useEffect } from 'react';
import CloudflareImageUpload from './CloudflareImageUpload';
import CloudflareImage from './CloudflareImage';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface ImageSelectorProps {
  initialImageId?: string;
  onImageSelected: (imageId: string) => void;
  variant?: string;
  label?: string;
  helperText?: string;
  className?: string;
  entityType?: string;
  entityId?: number;
  altText?: string;
  title?: string;
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
  entityType,
  entityId,
  altText,
  title,
}) => {
  const [imageId, setImageId] = useState<string>(initialImageId);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  // Get the delivery URL from environment variables
  const deliveryUrl = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL;

  // Update local state when initialImageId changes
  useEffect(() => {
    if (initialImageId !== imageId) {
      setImageId(initialImageId);
    }
  }, [initialImageId, imageId]);

  // Handle image upload completion
  const handleUploadComplete = (imageData: unknown) => {
    let imageId: string | null = null;

    if (imageData && typeof imageData === 'object') {
      // Check for MediaAsset structure (upload and create media)
      if ('id' in imageData && typeof imageData.id === 'number') {
        imageId = imageData.id.toString();
        console.log('Image upload complete with MediaAsset id:', imageId);
      }
      // Check for cloudflare_image structure
      else if ('cloudflare_image' in imageData && imageData.cloudflare_image && typeof imageData.cloudflare_image === 'object' && 'id' in imageData.cloudflare_image) {
        imageId = (imageData.cloudflare_image as { id: string }).id;
        console.log('Image upload complete with cloudflare_image.id:', imageId);
      }
      // Check for direct id field
      else if ('id' in imageData && typeof imageData.id === 'string') {
        imageId = imageData.id;
        console.log('Image upload complete with direct id:', imageId);
      }
    }

    if (imageId) {
      setImageId(imageId);
      onImageSelected(imageId);
      setUploadState({ isUploading: false, progress: 0, error: null });
    } else {
      const error = 'Invalid image data received - no valid id found';
      console.error(error, imageData);
      setUploadState(prev => ({ ...prev, isUploading: false, error }));
    }
  };

  // Handle upload error
  const handleUploadError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    console.error('Upload error:', error);
    setUploadState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
  };

  // Handle upload progress
  const handleUploadProgress = (progress: number) => {
    setUploadState(prev => ({
      ...prev,
      isUploading: progress > 0,
      progress,
      error: null
    }));
  };

  // Handle upload start
  const handleUploadStart = () => {
    setUploadState({ isUploading: true, progress: 0, error: null });
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
        onUploadError={handleUploadError}
        onProgress={handleUploadProgress}
        buttonText={imageId ? "Replace Image" : "Upload Image"}
        className="w-full"
        entityType={entityType}
        entityId={entityId}
        altText={altText}
        title={title}
      />

      {/* Upload status */}
      {uploadState.isUploading && (
        <div className="mt-2">
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">{uploadState.progress}%</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Uploading image...</p>
        </div>
      )}

      {uploadState.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadState.error}</p>
        </div>
      )}
      
      {/* Helper text */}
      {helperText && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default ImageSelector;
