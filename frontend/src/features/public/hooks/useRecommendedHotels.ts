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

// Fetch countries that have packages
export const useCountriesWithPackages = () => {
  return useQuery<Country[], Error>({
    queryKey: ['countries-with-packages'],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>(endpoints.countries.withPackages());
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
