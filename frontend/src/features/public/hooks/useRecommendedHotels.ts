import { useQuery } from '@tanstack/react-query';
import { apiClient, endpoints } from '../../../lib/api';
import type { Hotel, Country } from '../../../lib/types/api';

// Fetch countries that have hotels
export const useCountriesWithHotels = () => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-hotels'],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withHotels());
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

// Fetch countries that have activities
export const useCountriesWithActivities = () => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-activities'],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withActivities());
      return response;
    },
  });
};

// Fetch countries that have attractions
export const useCountriesWithAttractions = () => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-attractions'],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withAttractions());
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
