import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type {
  TravelGuideCategory,
  TravelGuideCategoryCreate,
  TravelGuideCategoryUpdate,
  DestinationGuideItem,
  DestinationGuideItemCreate,
  DestinationGuideItemUpdate,
} from '../types/travel-guide';

export const useTravelGuideCategories = (includeInactive: boolean = false) => {
  return useQuery<TravelGuideCategory[]>({
    queryKey: ['travel-guide-categories', includeInactive],
    queryFn: () => apiClient.get<TravelGuideCategory[]>(endpoints.travelGuides.categories(includeInactive)),
  });
};

export const useDestinationGuideItems = (params?: {
  countryId?: number;
  countrySlug?: string;
  categoryId?: number;
  includeInactive?: boolean;
}) => {
  return useQuery<DestinationGuideItem[]>({
    queryKey: ['travel-guide-items', params],
    queryFn: () =>
      apiClient.get<DestinationGuideItem[]>(
        endpoints.travelGuides.items({
          country_id: params?.countryId,
          country_slug: params?.countrySlug,
          category_id: params?.categoryId,
          include_inactive: params?.includeInactive,
        })
      ),
    enabled: !!(params?.countryId || params?.countrySlug),
  });
};

export const useCreateTravelGuideCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TravelGuideCategoryCreate) =>
      apiClient.post<TravelGuideCategory>('/travel-guides/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-categories'] });
    },
  });
};

export const useUpdateTravelGuideCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TravelGuideCategoryUpdate }) =>
      apiClient.put<TravelGuideCategory>(`/travel-guides/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-categories'] });
    },
  });
};

export const useDeleteTravelGuideCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/travel-guides/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-categories'] });
    },
  });
};

export const useCreateDestinationGuideItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DestinationGuideItemCreate) =>
      apiClient.post<DestinationGuideItem>('/travel-guides/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-items'] });
    },
  });
};

export const useUpdateDestinationGuideItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DestinationGuideItemUpdate }) =>
      apiClient.put<DestinationGuideItem>(`/travel-guides/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-items'] });
    },
  });
};

export const useDeleteDestinationGuideItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`/travel-guides/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travel-guide-items'] });
    },
  });
};
