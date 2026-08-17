import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Hotel, Country } from '../../../lib/types/api';

// Fetch countries that have hotels (optionally featured only)
export const useCountriesWithHotels = (featured?: boolean) => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-hotels', featured],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withHotels(featured));
      return response;
    },
  });
};

// Fetch countries that have packages (optionally filtered by package type and featured status)
export const useCountriesWithPackages = (packageType?: string, featured?: boolean) => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-packages', packageType, featured],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withPackages(packageType, featured));
      return response;
    },
  });
};

// Fetch countries that have activities (optionally featured only)
export const useCountriesWithActivities = (featured?: boolean) => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-activities', featured],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withActivities(featured));
      return response;
    },
  });
};

// Fetch countries that have attractions (optionally featured only)
export const useCountriesWithAttractions = (featured?: boolean) => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-attractions', featured],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withAttractions(featured));
      return response;
    },
  });
};

// Fetch recommended hotels (featured hotels), optionally filtered by country
export const useRecommendedHotels = (countryName?: string) => {
  return useQuery<Hotel[], Error>({
    queryKey: ['recommended-hotels', countryName],
    queryFn: async () => {
      // Use the dedicated featured endpoint with optional country filter
      let url = endpoints.hotels.featured();
      if (countryName) {
        url += `?country=${countryName}`;
      }
      const response = await apiClient.get<Hotel[]>(url);
      return response;
    },
    enabled: !!countryName, // Only fetch when a country is selected
  });
};
