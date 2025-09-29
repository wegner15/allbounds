import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface ContentPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentPageCreateInput {
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  is_published?: boolean;
  is_active?: boolean;
}

export interface ContentPageUpdateInput {
  title?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  is_published?: boolean;
  is_active?: boolean;
}

// Hook for fetching all content pages (admin)
export const useContentPages = () => {
  return useQuery<ContentPage[]>({
    queryKey: ['content'],
    queryFn: async () => {
      const response = await apiClient.get<ContentPage[]>('/content/');
      return response;
    }
  });
};

// Hook for fetching published content pages (public)
export const usePublishedContentPages = () => {
  return useQuery<ContentPage[]>({
    queryKey: ['content', 'published'],
    queryFn: async () => {
      const response = await apiClient.get<ContentPage[]>('/content/published');
      return response;
    }
  });
};

// Hook for fetching a single content page by slug (public)
export const useContentBySlug = (slug: string) => {
  return useQuery<ContentPage>({
    queryKey: ['content', 'slug', slug],
    queryFn: async () => {
      const response = await apiClient.get<ContentPage>(`/content/slug/${slug}`);
      return response;
    },
    enabled: !!slug,
  });
};

// Hook for fetching a single content page by ID (admin)
export const useContent = (id: number) => {
  return useQuery<ContentPage>({
    queryKey: ['content', id],
    queryFn: async () => {
      const response = await apiClient.get<ContentPage>(`/content/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for creating a new content page
export const useCreateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContentPageCreateInput) => {
      const response = await apiClient.post('/content/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};

// Hook for updating a content page
export const useUpdateContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContentPageUpdateInput }) => {
      const response = await apiClient.put(`/content/${id}`, data);
      return response;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
  });
};

// Hook for deleting a content page
export const useDeleteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/content/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};

// Hook for publishing a content page
export const usePublishContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/content/${id}/publish`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
  });
};

// Hook for unpublishing a content page
export const useUnpublishContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post(`/content/${id}/unpublish`, {});
      return response;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
  });
};