import React, { useState, useRef, useCallback } from 'react';
import { useDirectUpload, useImageUpload, useImageUploadAndCreateMedia } from '../../lib/hooks/useCloudflareImages';

interface CloudflareImageUploadProps {
  onUploadComplete?: (imageData: any) => void;
  onUploadError?: (error: any) => void;
  requireSignedUrls?: boolean;
  metadata?: Record<string, any>;
  className?: string;
  buttonText?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
  useDirectUpload?: boolean;
  createMediaAsset?: boolean;
  entityType?: string;
  entityId?: number;
  altText?: string;
  title?: string;
  caption?: string;
}

const CloudflareImageUpload: React.FC<CloudflareImageUploadProps> = ({
  onUploadComplete,
  onUploadError,
  requireSignedUrls = true,
  metadata = {},
  className = '',
  buttonText = 'Upload Image',
  acceptedFileTypes = 'image/jpeg,image/png,image/gif,image/webp',
  maxSizeMB = 10,
  useDirectUpload: useDirectCreatorUpload = false,
  createMediaAsset = true,
  entityType = 'activity',
  entityId,
  altText,
  title,
  caption,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations for direct upload and regular upload
  const directUploadMutation = useDirectUpload();
  const imageUploadMutation = useImageUpload();
  const imageUploadAndCreateMediaMutation = useImageUploadAndCreateMedia();

  // Convert maxSizeMB to bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!acceptedFileTypes.includes(file.type)) {
        const error = `Invalid file type. Accepted types: ${acceptedFileTypes}`;
        setError(error);
        if (onUploadError) onUploadError(error);
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        const error = `File size exceeds the maximum limit of ${maxSizeMB}MB`;
        setError(error);
        if (onUploadError) onUploadError(error);
        return;
      }

      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        if (useDirectCreatorUpload) {
          // Get direct upload URL
          const directUploadResponse = await directUploadMutation.mutateAsync({
            require_signed_urls: requireSignedUrls,
            metadata,
          });

          // Upload file using direct upload URL
          const xhr = new XMLHttpRequest();
          xhr.open('POST', directUploadResponse.upload_url);

          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
            }
          });

          // Handle upload completion
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setIsUploading(false);
              if (onUploadComplete) {
                onUploadComplete({
                  id: directUploadResponse.id,
                  success: true,
                });
              }
            } else {
              throw new Error(`Upload failed with status ${xhr.status}`);
            }
          });

          // Handle upload error
          xhr.addEventListener('error', () => {
            const error = 'Upload failed due to a network error';
            setError(error);
            setIsUploading(false);
            if (onUploadError) onUploadError(error);
          });

          // Create form data and send the request
          const formData = new FormData();
          formData.append('file', file);
          xhr.send(formData);
        } else {
          // Use regular upload through our backend API
          if (createMediaAsset) {
            // Upload and create MediaAsset record
            const response = await imageUploadAndCreateMediaMutation.mutateAsync({
              file,
              entityType,
              entityId,
              altText,
              title,
              caption,
              requireSignedUrls,
              metadata,
            });

            setIsUploading(false);
            if (onUploadComplete) {
              console.log('Upload and create media response:', response);
              onUploadComplete(response);
            }
          } else {
            // Just upload to Cloudflare
            const response = await imageUploadMutation.mutateAsync({
              file,
              requireSignedUrls,
              metadata,
            });

            setIsUploading(false);
            if (onUploadComplete) {
              console.log('Regular upload response:', response);
              onUploadComplete(response);
            }
          }
        }
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred during upload';
        setError(errorMessage);
        setIsUploading(false);
        if (onUploadError) onUploadError(error);
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [
      directUploadMutation,
      imageUploadMutation,
      imageUploadAndCreateMediaMutation,
      maxSizeBytes,
      maxSizeMB,
      metadata,
      onUploadComplete,
      onUploadError,
      requireSignedUrls,
      acceptedFileTypes,
      useDirectCreatorUpload,
      createMediaAsset,
      entityType,
      entityId,
      altText,
      title,
      caption,
    ]
  );

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`cloudflare-image-upload ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isUploading ? 'Uploading...' : buttonText}
      </button>
      
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default CloudflareImageUpload;
