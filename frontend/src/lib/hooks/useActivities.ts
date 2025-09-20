import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { ActivityResponse } from '../types/api';

export const useActivities = () => {
  return useQuery<ActivityResponse[]>({
    queryKey: ['activities'],
    queryFn: () => apiClient.get(endpoints.activities.list()),
  });
};
