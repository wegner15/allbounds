import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { ActivityResponse } from '../types/api';

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
