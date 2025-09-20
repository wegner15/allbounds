import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../lib/api';
import type { MediaAsset } from '../../lib/types/api';
import Button from '../ui/Button';

interface MediaGalleryProps {
  selectedIds: number[];
  onAdd: (media: MediaAsset) => void;
  onRemove: (mediaId: number) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ selectedIds, onAdd, onRemove }) => {
  const { data: media, isLoading, error } = useQuery<MediaAsset[]>({
    queryKey: ['admin-media'],
    queryFn: () => apiClient.get(endpoints.media.list()),
  });

  const selectedMedia = media?.filter(asset => selectedIds.includes(asset.id)) || [];
  const availableMedia = media?.filter(asset => !selectedIds.includes(asset.id)) || [];

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Gallery</h3>
      <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg mb-4 min-h-[8rem]">
        {selectedMedia.map(asset => (
          <div key={asset.id} className="relative border-2 rounded-lg overflow-hidden">
            <img src={asset.file_path} alt={asset.alt_text || asset.filename} className="w-full h-32 object-cover" />
            <Button 
              size="sm" 
              variant="outline" 
              className="absolute top-1 right-1"
              onClick={() => onRemove(asset.id)}
            >
              X
            </Button>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">Available Media</h3>
      <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg max-h-96 overflow-y-auto">
        {isLoading && <p>Loading media...</p>}
        {error && <p className="text-red-500">Failed to load media</p>}
        {availableMedia.map(asset => (
          <div 
            key={asset.id} 
            className="relative border-2 rounded-lg overflow-hidden cursor-pointer border-transparent"
            onClick={() => onAdd(asset)}
          >
            <img src={asset.file_path} alt={asset.alt_text || asset.filename} className="w-full h-32 object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              {asset.filename}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
