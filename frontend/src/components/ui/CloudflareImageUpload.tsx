import React, { useState, useRef, useCallback } from 'react';
import { useDirectUpload, useImageUpload, useImageUploadAndCreateMedia } from '../../lib/hooks/useCloudflareImages';

interface CloudflareImageUploadProps {
  onUploadComplete?: (imageData: unknown) => void;
  onUploadError?: (error: unknown) => void;
  requireSignedUrls?: boolean;
  metadata?: Record<string, unknown>;
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
  const [isDragOver, setIsDragOver] = useState(false);
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
      } catch (error: unknown) {
        const errorMessage = (error as Error).message || 'An error occurred during upload';
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      // Create a synthetic event
      const syntheticEvent = {
        target: { files: imageFiles },
        currentTarget: { files: imageFiles },
        preventDefault: () => {},
        stopPropagation: () => {},
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
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

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`mx-auto h-8 w-8 mb-2 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className={`text-sm font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
            {isUploading
              ? 'Uploading...'
              : isDragOver
                ? 'Drop image here'
                : buttonText
            }
          </p>
          {!isUploading && (
            <p className="text-xs text-gray-500 mt-1">
              or drag and drop here
            </p>
          )}
        </div>
      </div>

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
