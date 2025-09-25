import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';

// Types for Cloudflare Images
export interface DirectUploadRequest {
  require_signed_urls?: boolean;
  metadata?: Record<string, unknown>;
  expiry_minutes?: number;
}

export interface DirectUploadResponse {
  id: string;
  upload_url: string;
}

export interface ImageUploadResponse {
  id: string;
  filename: string;
  uploaded: string;
  require_signed_urls: boolean;
  variants: string[];
  metadata?: Record<string, unknown>;
}

export interface ImageListResponse {
  images: ImageUploadResponse[];
  total_count: number;
  page_count: number;
  page_size: number;
  current_page: number;
}

export interface VariantOptions {
  width?: number | undefined;
  height?: number | undefined;
  fit?: 'scale-down' | 'contain' | 'cover' | 'crop' | 'pad';
  metadata?: 'none' | 'copyright' | 'keep';
}

export interface VariantRequest {
  id: string;
  options: VariantOptions;
  never_require_signed_urls?: boolean;
}

export interface VariantResponse {
  id: string;
  options: VariantOptions;
  never_require_signed_urls: boolean;
}

export interface SignedUrlRequest {
  image_id: string;
  variant_name?: string;
  expiry_minutes?: number;
}

export interface SignedUrlResponse {
  url: string;
  expires_at: string;
}

// Hook for getting a direct upload URL
export const useDirectUpload = () => {
  return useMutation({
    mutationFn: async (request: DirectUploadRequest) => {
      return apiClient.post<DirectUploadResponse>(endpoints.cloudflareImages.directUpload(), request);
    },
  });
};

// Hook for uploading an image
export const useImageUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ file, requireSignedUrls = true, metadata }: { file: File; requireSignedUrls?: boolean; metadata?: Record<string, unknown> }) => {
      // Create a new FormData object
      const formData = new FormData();
      
      // Important: Append the file with the correct field name 'file'
      // This must match exactly what the FastAPI endpoint expects
      formData.append('file', file, file.name);
      formData.append('require_signed_urls', requireSignedUrls.toString());
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Debug: Log FormData contents
      console.log('FormData contents for upload:');
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      });
      
      // Make the request with the FormData
      return apiClient.request<ImageUploadResponse>(
        endpoints.cloudflareImages.upload(),
        'POST',
        formData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-images'] });
    },
  });
};

// Hook for uploading an image and creating a MediaAsset record
export const useImageUploadAndCreateMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      file, 
      entityType = 'activity', 
      entityId, 
      altText, 
      title, 
      caption,
      requireSignedUrls = true, 
      metadata 
    }: { 
      file: File; 
      entityType?: string;
      entityId?: number;
      altText?: string;
      title?: string;
      caption?: string;
      requireSignedUrls?: boolean; 
      metadata?: Record<string, unknown> 
    }) => {
      // Create a new FormData object
      const formData = new FormData();
      
      // Append all the fields
      formData.append('file', file, file.name);
      formData.append('entity_type', entityType);
      if (entityId) formData.append('entity_id', entityId.toString());
      if (altText) formData.append('alt_text', altText);
      if (title) formData.append('title', title);
      if (caption) formData.append('caption', caption);
      formData.append('require_signed_urls', requireSignedUrls.toString());
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Make the request with the FormData
      try {
        console.log('Sending upload request to:', endpoints.cloudflareImages.uploadAndCreateMedia());
        const response = await apiClient.request<unknown>(
          endpoints.cloudflareImages.uploadAndCreateMedia(),
          'POST',
          formData
        );
        console.log('Upload response:', response);
        return response;
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-images'] });
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
    },
  });
};

// Hook for getting image details
export const useImage = (id: string) => {
  return useQuery({
    queryKey: ['cloudflare-images', id],
    queryFn: async () => {
      return apiClient.get<ImageUploadResponse>(endpoints.cloudflareImages.get(id));
    },
    enabled: !!id,
  });
};

// Hook for listing images
export const useImages = (page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['cloudflare-images', 'list', page, perPage],
    queryFn: async () => {
      return apiClient.get<ImageListResponse>(
        `${endpoints.cloudflareImages.list()}?page=${page}&per_page=${perPage}`
      );
    },
  });
};

// Hook for deleting an image
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(endpoints.cloudflareImages.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-images'] });
    },
  });
};

// Hook for creating a variant
export const useCreateVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (request: VariantRequest) => {
      return apiClient.post<VariantResponse>(endpoints.cloudflareImages.variants(), request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-images', 'variants'] });
    },
  });
};

// Hook for listing variants
export const useVariants = () => {
  return useQuery({
    queryKey: ['cloudflare-images', 'variants'],
    queryFn: async () => {
      return apiClient.get<VariantResponse[]>(endpoints.cloudflareImages.variants());
    },
  });
};

// Hook for deleting a variant
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(endpoints.cloudflareImages.variant(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cloudflare-images', 'variants'] });
    },
  });
};

// Hook for generating a signed URL
export const useSignedUrl = () => {
  return useMutation({
    mutationFn: async (request: SignedUrlRequest) => {
      return apiClient.post<SignedUrlResponse>(endpoints.cloudflareImages.signedUrl(), request);
    },
  });
};
