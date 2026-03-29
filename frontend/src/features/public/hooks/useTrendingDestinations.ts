import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { CountryWithDetails } from '../../../lib/types/api';

// Fetch trending destinations (countries with their related entities)
export const useTrendingDestinations = (limit: number = 20) => {
  return useQuery<CountryWithDetails[], Error>({
    queryKey: ['trending-destinations', limit],
    queryFn: async () => {
      // We'll fetch a list of countries and assume the API sorts them by popularity.
      // We'll also request the detailed view to get tour/activity counts.
      // Filter for favorites only as per user request.
      const response = await apiClient.get<CountryWithDetails[]>(`${endpoints.countries.list()}?limit=${limit}&details=true&is_favorite=true`);
      return response;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
