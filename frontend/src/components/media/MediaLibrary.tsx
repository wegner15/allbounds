import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../lib/api';
import type { MediaAsset } from '../../lib/types/api';

interface MediaLibraryProps {
  onSelect: (media: MediaAsset) => void;
  selectedId?: number | null;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, selectedId }) => {
  const { data: media, isLoading, error } = useQuery<MediaAsset[]>({
    queryKey: ['admin-media'],
    queryFn: () => apiClient.get(endpoints.media.list()),
  });

  return (
    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg max-h-96 overflow-y-auto">
      {isLoading && <p>Loading media...</p>}
      {error && <p className="text-red-500">Failed to load media</p>}
      {media?.map(asset => (
        <div 
          key={asset.id} 
          className={`relative border-2 rounded-lg overflow-hidden cursor-pointer ${selectedId === asset.id ? 'border-blue-500' : 'border-transparent'}`}
          onClick={() => onSelect(asset)}
        >
          <img src={asset.file_path} alt={asset.alt_text || asset.filename} className="w-full h-32 object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
            {asset.filename}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaLibrary;
