import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Attraction } from '../../../lib/types/api';

// Fetch trending attractions, optionally filtered by country
export const useTrendingAttractions = (countryName?: string) => {
  return useQuery<Attraction[], Error>({
    queryKey: ['trending-attractions', countryName],
    queryFn: async () => {
      let url = `${endpoints.attractions.list()}?trending=true`;
      if (countryName) {
        url += `&country=${countryName}`;
      }
      const response = await apiClient.get<Attraction[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
