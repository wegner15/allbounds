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
        {selectedMedia.length === 0 && (
          <div className="col-span-4 text-center text-gray-500 py-8">
            No media selected. Use the "Upload New Media" button above to add images.
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;
