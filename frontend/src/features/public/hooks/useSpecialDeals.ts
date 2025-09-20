import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Package } from '../../../lib/types/api';

// Fetch special deal packages
export const useSpecialDeals = (limit: number = 6) => {
  return useQuery<Package[], Error>({
    queryKey: ['special-deals', limit],
    queryFn: async () => {
      // Assuming the API can filter for featured/special packages
      // and returns them sorted. If not, this can be adjusted.
      const response = await apiClient.get<Package[]>(`${endpoints.packages.list()}?featured=true&limit=${limit}`);
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
