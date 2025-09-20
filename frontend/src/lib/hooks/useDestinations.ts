import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Region, Country, RegionWithCountries } from '../types/api';

// ===== Region Hooks =====

// Hook for fetching all regions
export const useRegions = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      return apiClient.get<Region[]>(endpoints.regions.list());
    },
  });
};

// Hook for fetching all regions with their countries
export const useRegionsWithCountries = () => {
  return useQuery({
    queryKey: ['regions', 'with-countries'],
    queryFn: async () => {
      return apiClient.get<RegionWithCountries[]>(endpoints.regions.withCountries());
    },
  });
};

// Hook for fetching a single region by ID
export const useRegion = (id: number) => {
  return useQuery({
    queryKey: ['region', id],
    queryFn: async () => {
      return apiClient.get<Region>(endpoints.regions.detail(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for fetching a single region by ID with its countries
export const useRegionWithCountries = (id: number) => {
  return useQuery({
    queryKey: ['region', id, 'with-countries'],
    queryFn: async () => {
      return apiClient.get<RegionWithCountries>(endpoints.regions.detailWithCountries(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for fetching a single region by slug
export const useRegionBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['region', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<Region>(endpoints.regions.bySlug(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// Hook for fetching a single region by slug with its countries
export const useRegionBySlugWithCountries = (slug: string) => {
  return useQuery({
    queryKey: ['region', 'slug', slug, 'with-countries'],
    queryFn: async () => {
      return apiClient.get<RegionWithCountries>(endpoints.regions.bySlugWithCountries(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// ===== Country Hooks =====

// Hook for fetching all countries
export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      return apiClient.get<Country[]>(endpoints.countries.list());
    },
  });
};

// Hook for fetching countries by region
export const useCountriesByRegion = (regionId: number) => {
  return useQuery({
    queryKey: ['countries', 'region', regionId],
    queryFn: async () => {
      return apiClient.get<Country[]>(endpoints.countries.byRegion(regionId));
    },
    enabled: !!regionId, // Only run the query if regionId is provided
  });
};

// Hook for fetching a single country by ID
export const useCountry = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['country', id],
    queryFn: async () => {
      return apiClient.get<Country>(endpoints.countries.byId(id));
    },
    enabled: enabled && !!id, // Only run the query if id is provided and enabled is true
  });
};

// Hook for fetching a single country by slug
export const useCountryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['country', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<Country>(endpoints.countries.bySlug(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// ===== Admin Mutation Hooks =====

// Hook for creating a new region (admin only)
export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (region: Omit<Region, 'id' | 'created_at' | 'updated_at'>) => {
      return apiClient.post<Region>(endpoints.regions.list(), region);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// Hook for updating a region (admin only)
export const useUpdateRegion = (id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (region: Partial<Region>) => {
      return apiClient.put<Region>(endpoints.regions.detail(id), region);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['region', id], data);
      queryClient.invalidateQueries({ queryKey: ['regions'] });
    },
  });
};

// Hook for creating a new country (admin only)
export const useCreateCountry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (country: Omit<Country, 'id' | 'created_at' | 'updated_at' | 'region'>) => {
      return apiClient.post<Country>(endpoints.countries.list(), country);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['countries', 'region', data.region_id] });
    },
  });
};

// Hook for updating a country (admin only)
export const useUpdateCountry = (id: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (country: Partial<Country>) => {
      return apiClient.put<Country>(endpoints.countries.byId(id), country);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['country', id], data);
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['countries', 'region', data.region_id] });
    },
  });
};
