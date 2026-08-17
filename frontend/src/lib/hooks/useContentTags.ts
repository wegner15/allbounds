import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { ContentTag, ContentTagCreate, ContentTagUpdate, PaginatedContentTagResponse } from '../types/content-tag';

// ----- Queries -----

/** Fetch paginated tags for Admin table */
export const usePaginatedContentTags = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  include_inactive?: boolean;
  order_by?: string;
  order?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/tags/paginated?${queryString}` : '/tags/paginated';

  return useQuery<PaginatedContentTagResponse>({
    queryKey: ['contentTags', 'paginated', params],
    queryFn: () => apiClient.get<PaginatedContentTagResponse>(endpoint),
  });
};

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
export const useUpdateContentTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContentTagUpdate }) =>
      apiClient.put<ContentTag>(`/tags/${id}`, data),
    onSuccess: (_updated, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contentTag', variables.id] });
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
