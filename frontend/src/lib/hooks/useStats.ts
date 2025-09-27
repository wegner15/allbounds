import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Stats } from '../types/api';

// Hook for fetching platform statistics
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      return apiClient.get<Stats>(endpoints.stats.get());
    },
  });
};