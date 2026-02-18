import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { ActivityResponse, ActivityTripsResponse } from '../types/api';

export const useActivities = (countryId?: number) => {
  return useQuery<ActivityResponse[]>({
    queryKey: ['activities', countryId],
    queryFn: () => {
      const endpoint = countryId
        ? endpoints.activities.byCountry(countryId)
        : endpoints.activities.list();
      return apiClient.get(endpoint);
    },
  });
};

export const useActivityBySlug = (slug: string) => {
  return useQuery<ActivityResponse>({
    queryKey: ['activity', slug],
    queryFn: () => apiClient.get(endpoints.activities.bySlug(slug)),
    enabled: !!slug,
  });
};

export const useActivityTrips = (slug: string) => {
  return useQuery<ActivityTripsResponse>({
    queryKey: ['activity-trips', slug],
    queryFn: () => apiClient.get(endpoints.activities.trips(slug)),
    enabled: !!slug,
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(endpoints.activities.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
    },
  });
};
