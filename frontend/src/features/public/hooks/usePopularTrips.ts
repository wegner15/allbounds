import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Package } from '../../../lib/types/api';

// Fetch popular/featured trips (packages), optionally filtered by country and packageType
export const usePopularTrips = (countryName?: string, packageType?: string) => {
  return useQuery<Package[], Error>({
    queryKey: ['popular-trips', countryName, packageType],
    queryFn: async () => {
      let url = endpoints.packages.featured(packageType);
      if (countryName) {
        url += `${url.includes('?') ? '&' : '?'}country=${encodeURIComponent(countryName)}`;
      }
      const response = await apiClient.get<Package[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
