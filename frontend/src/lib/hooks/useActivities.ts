import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { ActivityResponse } from '../types/api';

export const useActivities = () => {
  return useQuery<ActivityResponse[]>({
    queryKey: ['activities'],
    queryFn: () => apiClient.get(endpoints.activities.list()),
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
