import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Package } from '../../../lib/types/api';

// Fetch popular trips (packages), optionally filtered by country and packageType
export const usePopularTrips = (countryName?: string, packageType?: string) => {
  return useQuery<Package[], Error>({
    queryKey: ['popular-trips', countryName, packageType],
    queryFn: async () => {
      let url = `${endpoints.packages.list()}?popular=true`;
      if (countryName) {
        url += `&country=${encodeURIComponent(countryName)}`;
      }
      if (packageType) {
        url += `&package_type=${encodeURIComponent(packageType)}`;
      }
      const response = await apiClient.get<Package[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
