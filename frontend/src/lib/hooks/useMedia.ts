import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Media } from '../types/api';

// Hook for fetching all media
export const useMedia = (params?: { 
  type?: string;
  skip?: number;
  limit?: number;
}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const queryString = queryParams.toString();
  const endpoint = queryString ? `${endpoints.media.list()}?${queryString}` : endpoints.media.list();
  
  return useQuery({
    queryKey: ['media', params],
    queryFn: async () => {
      return apiClient.get<Media[]>(endpoint);
    },
  });
};

// Hook for fetching a single media by ID
export const useMediaItem = (id: string) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async () => {
      return apiClient.get<Media>(endpoints.media.detail(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for uploading media
export interface UploadMediaParams {
  file: File;
  alt_text?: string;
  onProgress?: (progress: number) => void;
}

export const useUploadMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, alt_text, onProgress }: UploadMediaParams) => {
      const formData = new FormData();
      formData.append('file', file);
      
      if (alt_text) {
        formData.append('alt_text', alt_text);
      }
      
      // Custom implementation for file upload with progress tracking
      const url = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api/v1'}${endpoints.media.list()}`;
      
      // Get auth token if available
      const token = localStorage.getItem('auth_token');
      
      return new Promise<Media>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (onProgress && event.total) {
            const percentCompleted = Math.round((event.loaded * 100) / event.total);
            onProgress(percentCompleted);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };
        
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Hook for updating media metadata
export const useUpdateMedia = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mediaData: Partial<Media>) => {
      return apiClient.put<Media>(endpoints.media.detail(id), mediaData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['media', id], data);
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Hook for deleting media
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(endpoints.media.detail(id));
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ['media', id] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};
