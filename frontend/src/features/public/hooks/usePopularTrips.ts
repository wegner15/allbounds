import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Package } from '../../../lib/types/api';

// Fetch popular trips (packages), optionally filtered by country
export const usePopularTrips = (countryName?: string) => {
  return useQuery<Package[], Error>({
    queryKey: ['popular-trips', countryName],
    queryFn: async () => {
      let url = `${endpoints.packages.list()}?popular=true`;
      if (countryName) {
        url += `&country=${countryName}`;
      }
      const response = await apiClient.get<Package[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
