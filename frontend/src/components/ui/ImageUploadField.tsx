import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import CloudflareImageUpload from './CloudflareImageUpload';
import CloudflareImage from './CloudflareImage';

interface ImageUploadFieldProps {
  name: string;
  label: string;
  helperText?: string;
  required?: boolean;
  defaultImageId?: string;
  variant?: string;
  className?: string;
}

/**
 * A form field component for uploading images to Cloudflare Images
 * and storing the image ID in a form field.
 */
const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  name,
  label,
  helperText,
  required = false,
  defaultImageId = '',
  variant = 'medium',
  className = '',
}) => {
  const { control, formState: { errors } } = useFormContext();
  const [previewImageId, setPreviewImageId] = useState<string>(defaultImageId);
  
  // Get the delivery URL from environment variables
  const deliveryUrl = import.meta.env.VITE_CLOUDFLARE_IMAGES_DELIVERY_URL;

  // Handle image upload completion
  const handleUploadComplete = (imageData: unknown, onChange: (value: string) => void) => {
    if (imageData && typeof imageData === 'object' && 'id' in imageData && typeof (imageData as any).id === 'string') {
      const id = (imageData as any).id;
      onChange(id);
      setPreviewImageId(id);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => {
          // Update preview when value changes
          if (value && value !== previewImageId) {
            setPreviewImageId(value);
          }

          return (
            <div className="space-y-4">
              {/* Image preview */}
              {previewImageId ? (
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 p-2">
                  <CloudflareImage
                    imageId={previewImageId}
                    variant={variant}
                    alt={label}
                    className="max-h-64 mx-auto object-contain"
                    deliveryUrl={deliveryUrl}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    onClick={() => {
                      onChange('');
                      setPreviewImageId('');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-50 border border-gray-200 border-dashed rounded-lg">
                  <div className="text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-1">No image uploaded</p>
                  </div>
                </div>
              )}
              
              {/* Upload button */}
              <CloudflareImageUpload
                onUploadComplete={(imageData) => handleUploadComplete(imageData, onChange)}
                onUploadError={(error) => console.error('Upload error:', error)}
                buttonText={previewImageId ? "Replace Image" : "Upload Image"}
                className="w-full"
              />
              
              {/* Hidden input to store the image ID */}
              <input 
                type="hidden" 
                name={name} 
                value={value || ''} 
              />
              
              {/* Error message */}
              {errors[name] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors[name]?.message?.toString() || 'This field is required'}
                </p>
              )}
              
              {/* Helper text */}
              {helperText && (
                <p className="mt-1 text-xs text-gray-500">{helperText}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default ImageUploadField;
