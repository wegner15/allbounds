import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api';

export interface Country {
  id: number;
  name: string;
  slug: string;
  code: string;
  region_id: number;
  region?: {
    id: number;
    name: string;
    slug: string;
  };
  description?: string;
  summary?: string;
  image_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Hook for fetching all countries
export const useCountries = () => {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await apiClient.get<Country[]>('/countries');
      return response;
    }
  });
};

// Hook for fetching a single country by ID
export const useCountry = (id: number) => {
  return useQuery({
    queryKey: ['countries', id],
    queryFn: async () => {
      const response = await apiClient.get(`/countries/${id}`);
      return response;
    },
    enabled: !!id,
  });
};

// Hook for fetching countries by region
export const useCountriesByRegion = (regionId: number) => {
  return useQuery({
    queryKey: ['countries', 'region', regionId],
    queryFn: async () => {
      const response = await apiClient.get(`/countries/region/${regionId}`);
      return response;
    },
    enabled: !!regionId,
  });
};
