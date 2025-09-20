import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { HolidayType } from '../types/api';

// Hook for fetching all holiday types
export const useHolidayTypes = () => {
  return useQuery<HolidayType[]>({
    queryKey: ['holidayTypes'],
    queryFn: async () => {
      const response = await apiClient.get<HolidayType[]>('/holiday-types');
      return response;
    }
  });
};

// Hook for fetching a single holiday type by ID
export const useHolidayType = (id: number) => {
  return useQuery({
    queryKey: ['holidayType', id],
    queryFn: async () => {
      return apiClient.get<HolidayType>(endpoints.holidayTypes.detail(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for fetching a single holiday type by slug
export const useHolidayTypeBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['holidayType', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<HolidayType>(endpoints.holidayTypes.bySlug(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// Hook for creating a new holiday type (admin only)
export const useCreateHolidayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holidayType: Omit<HolidayType, 'id' | 'created_at' | 'updated_at'>) => {
      return apiClient.post<HolidayType>(endpoints.holidayTypes.list(), holidayType);
    },
    onSuccess: () => {
      // Invalidate the holiday types list query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['holidayTypes'] });
    },
  });
};

// Hook for updating a holiday type (admin only)
export const useUpdateHolidayType = (id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (holidayType: Partial<HolidayType>) => {
      return apiClient.put<HolidayType>(endpoints.holidayTypes.detail(id), holidayType);
    },
    onSuccess: (data) => {
      // Update the cache for this specific holiday type
      queryClient.setQueryData(['holidayType', id], data);
      // Invalidate the holiday types list query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['holidayTypes'] });
    },
  });
};

// Hook for deleting a holiday type (admin only)
export const useDeleteHolidayType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete<HolidayType>(endpoints.holidayTypes.detail(id));
    },
    onSuccess: () => {
      // Invalidate the holiday types list query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['holidayTypes'] });
    },
  });
};
