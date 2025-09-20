import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Hotel } from '../../../lib/types/api';

// Fetch recommended hotels, optionally filtered by country
export const useRecommendedHotels = (countryName?: string) => {
  return useQuery<Hotel[], Error>({
    queryKey: ['recommended-hotels', countryName],
    queryFn: async () => {
      let url = `${endpoints.hotels.list()}?recommended=true`;
      if (countryName) {
        url += `&country=${countryName}`;
      }
      const response = await apiClient.get<Hotel[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
