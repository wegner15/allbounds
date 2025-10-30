import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Package } from '../../../lib/types/api';

// Fetch special deal packages (featured packages)
export const useSpecialDeals = (limit: number = 6) => {
  return useQuery<Package[], Error>({
    queryKey: ['special-deals', limit],
    queryFn: async () => {
      // Use the dedicated featured endpoint
      const response = await apiClient.get<Package[]>(`${endpoints.packages.featured()}?limit=${limit}`);
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
