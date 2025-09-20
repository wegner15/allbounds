import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import type { GalleryImage } from '../../lib/types/api';

interface GalleryManagerProps {
  entityType: 'hotel' | 'package' | 'group_trip' | 'attraction' | 'holiday_type';
  entityId?: number;
  images: GalleryImage[];
  coverImageId?: number | null;
  onImagesChange: (images: GalleryImage[]) => void;
  onCoverImageChange: (imageId: number | null) => void;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({
  entityType,
  entityId,
  images,
  coverImageId,
  onImagesChange,
  onCoverImageChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch existing images when component mounts or entityId changes
  useEffect(() => {
    const fetchImages = async () => {
      if (!entityId) return;
      
      setIsLoading(true);
      try {
        const response = await apiClient.get<GalleryImage[]>(`/api/v1/media/?entity_type=${entityType}&entity_id=${entityId}`);
        onImagesChange(response);
      } catch (error) {
        console.error('Failed to fetch images:', error);
        setError('Failed to load existing images');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [entityId, entityType, onImagesChange]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !entityId) {
      if (!entityId) {
        setError('Please save the entity first before adding images');
      }
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    
    let uploadedCount = 0;
    
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entity_type', entityType);
        formData.append('entity_id', entityId.toString());
        formData.append('alt_text', file.name.split('.')[0]);

        // Upload image
        const response = await apiClient.post<GalleryImage>('/api/v1/media/upload', formData);

        // Add to images list
        onImagesChange([...images, response]);
        
        // Set as cover image if it's the first image
        if (images.length === 0 && !coverImageId) {
          // Set as cover image locally
          onCoverImageChange(response.id);
          
          // Also update the cover image on the server if we have entity info
          if (entityId) {
            try {
              console.log(`Setting first uploaded image as cover for ${entityType} ${entityId}:`, response.id);
              
              // Different endpoints for different entity types
              let endpoint = '';
              if (entityType === 'package') {
                endpoint = `/api/v1/packages/${entityId}/cover-image`;
              } else if (entityType === 'holiday_type') {
                endpoint = `/api/v1/holiday-types/${entityId}/cover-image`;
              } else if (entityType === 'hotel') {
                endpoint = `/api/v1/hotels/${entityId}/cover-image`;
              } else if (entityType === 'attraction') {
                endpoint = `/api/v1/attractions/${entityId}/cover-image`;
              } else if (entityType === 'group_trip') {
                endpoint = `/api/v1/group-trips/${entityId}/cover-image`;
              }
              
              if (endpoint) {
                await apiClient.post(endpoint, {
                  image_id: response.id.toString()
                });
                console.log(`First image set as cover for ${entityType} successfully`);
              }
            } catch (coverError) {
              console.error(`Error setting first image as cover for ${entityType}:`, coverError);
            }
          }
        }

        uploadedCount++;

      } catch (error) {
        console.error('Upload failed:', error);
        setError(`Failed to upload ${file.name}. Please try again.`);
      }
    }
    
    if (uploadedCount > 0) {
      setSuccess(`Successfully uploaded ${uploadedCount} image${uploadedCount > 1 ? 's' : ''}`);
      setTimeout(() => setSuccess(null), 3000);
    }
    
    setIsUploading(false);
    // Reset input
    event.target.value = '';
  };

  const handleRemoveImage = async (imageId: number) => {
    try {
      await apiClient.delete(`/api/v1/media/${imageId}`);
      const updatedImages = images.filter(img => img.id !== imageId);
      onImagesChange(updatedImages);
      
      // If removed image was cover, set first remaining as cover
      if (coverImageId === imageId) {
        onCoverImageChange(updatedImages.length > 0 ? updatedImages[0].id : null);
      }
      
      setSuccess('Image removed successfully');
      setTimeout(() => setSuccess(null), 2000);
    } catch (error) {
      console.error('Failed to remove image:', error);
      setError('Failed to remove image. Please try again.');
    }
  };

  const handleSetCover = async (imageId: number) => {
    // Update the local state
    onCoverImageChange(imageId);
    
    // If we have entity info, immediately update the cover image on the server
    if (entityId) {
      try {
        console.log(`Immediately setting cover image for ${entityType} ${entityId} to:`, imageId);
        
        // Different endpoints for different entity types
        let endpoint = '';
        if (entityType === 'package') {
          endpoint = `/api/v1/packages/${entityId}/cover-image`;
        } else if (entityType === 'holiday_type') {
          endpoint = `/api/v1/holiday-types/${entityId}/cover-image`;
        } else if (entityType === 'hotel') {
          endpoint = `/api/v1/hotels/${entityId}/cover-image`;
        } else if (entityType === 'attraction') {
          endpoint = `/api/v1/attractions/${entityId}/cover-image`;
        } else if (entityType === 'group_trip') {
          endpoint = `/api/v1/group-trips/${entityId}/cover-image`;
        }
        
        if (endpoint) {
          const response = await apiClient.post(endpoint, {
            image_id: imageId.toString()
          });
          console.log(`Cover image for ${entityType} updated successfully:`, response);
          setSuccess('Cover image updated successfully');
          setTimeout(() => setSuccess(null), 2000);
        }
      } catch (error) {
        console.error(`Error setting cover image for ${entityType}:`, error);
        setError('Failed to set cover image. Please try again.');
      }
    }
  };

  const handleUpdateMetadata = async (imageId: number, field: string, value: string) => {
    try {
      const updatedImage = await apiClient.put<GalleryImage>(`/api/v1/media/${imageId}`, {
        [field]: value,
      });
      
      const updatedImages = images.map(img => 
        img.id === imageId ? updatedImage : img
      );
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Failed to update image metadata:', error);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(fromIndex, 1);
    reorderedImages.splice(toIndex, 0, removed);
    onImagesChange(reorderedImages);
  };

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
          <span>{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          id="gallery-upload"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          disabled={!entityId || isUploading}
        />
        <label htmlFor="gallery-upload" className="cursor-pointer">
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-gray-600">
              <p>Click to select images or drag & drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB each</p>
              {!entityId && (
                <p className="text-sm text-red-500 mt-2">Save the entity first to upload images</p>
              )}
            </div>
          </div>
        </label>
      </div>

      {/* Loading State */}
      {(isUploading || isLoading) && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500 mr-2"></div>
            <span className="text-gray-600">
              {isUploading ? 'Uploading images...' : 'Loading images...'}
            </span>
          </div>
        </div>
      )}

      {/* Gallery Images */}
      {images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Gallery Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={image.file_path}
                    alt={image.alt_text || ''}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Cover Badge */}
                  {coverImageId === image.id && (
                    <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Cover
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-white/80 hover:bg-white text-gray-700 p-1 rounded text-xs"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-white/80 hover:bg-white text-gray-700 p-1 rounded text-xs"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    {coverImageId !== image.id && (
                      <button
                        onClick={() => handleSetCover(image.id)}
                        className="bg-white/80 hover:bg-white text-gray-700 p-1 rounded text-xs"
                        title="Set as cover"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="bg-red-500/80 hover:bg-red-500 text-white p-1 rounded text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Alt text"
                    value={image.alt_text || ''}
                    onChange={(e) => handleUpdateMetadata(image.id, 'alt_text', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Caption"
                    value={image.caption || ''}
                    onChange={(e) => handleUpdateMetadata(image.id, 'caption', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && !isUploading && (
        <div className="text-center py-8 text-gray-500">
          No images uploaded yet. Add some images to create a gallery.
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
