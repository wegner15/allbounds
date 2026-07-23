import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { ContentTag, ContentTagCreate, ContentTagUpdate } from '../types/content-tag';

// ----- Queries -----

/** Fetch all tags, optionally filtered by category or active status */
export const useContentTags = (params?: {
  category?: string;
  include_inactive?: boolean;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.include_inactive) searchParams.set('include_inactive', 'true');
  const qs = searchParams.toString();

  return useQuery<ContentTag[]>({
    queryKey: ['contentTags', params],
    queryFn: () => apiClient.get<ContentTag[]>(`/tags/${qs ? `?${qs}` : ''}`),
    staleTime: 5 * 60 * 1000,
  });
};

/** Fetch a single tag by ID */
export const useContentTag = (id: number) => {
  return useQuery<ContentTag>({
    queryKey: ['contentTag', id],
    queryFn: () => apiClient.get<ContentTag>(`/tags/${id}`),
    enabled: !!id,
  });
};

// ----- Mutations -----

/** Create a new tag */
export const useCreateContentTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContentTagCreate) =>
      apiClient.post<ContentTag>('/tags/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTags'] });
    },
  });
};

/** Update an existing tag */
export const useUpdateContentTag = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ContentTagUpdate) =>
      apiClient.put<ContentTag>(`/tags/${id}`, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(['contentTag', id], updated);
      queryClient.invalidateQueries({ queryKey: ['contentTags'] });
    },
  });
};

/** Delete a tag */
export const useDeleteContentTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentTags'] });
    },
  });
};
