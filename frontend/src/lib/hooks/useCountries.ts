import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Country, CountryWithDetails, CountryVisitInfo } from '../types/api';

// Re-export types for convenience
export type { Country, CountryWithDetails, CountryVisitInfo } from '../types/api';

// Hook for fetching all countries
export const useCountries = (params?: {
  region_id?: number;
  is_active?: boolean;
  skip?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `${endpoints.countries.list()}?${queryString}` : endpoints.countries.list();

  return useQuery<Country[]>({
    queryKey: ['countries', params],
    queryFn: async () => {
      return apiClient.get<Country[]>(endpoint);
    },
  });
};

// Hook for fetching a single country by slug
export const useCountryBySlug = (slug: string) => {
  return useQuery<Country>({
    queryKey: ['country', slug],
    queryFn: async () => {
      return apiClient.get<Country>(endpoints.countries.bySlug(slug));
    },
    enabled: !!slug,
  });
};

// Hook for fetching country details with all related data
export const useCountryDetails = (slug: string) => {
  return useQuery<CountryWithDetails>({
    queryKey: ['country-details', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Country slug is required');
      return apiClient.get<CountryWithDetails>(endpoints.countries.bySlugWithDetails(slug));
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - cache kept in memory for 10 minutes
    retry: 2,
  });
};

// Hook for fetching countries by region
export const useCountriesByRegion = (regionId: number) => {
  return useQuery<Country[]>({
    queryKey: ['countries', 'region', regionId],
    queryFn: async () => {
      return apiClient.get<Country[]>(endpoints.countries.byRegion(regionId));
    },
    enabled: !!regionId,
  });
};

// Hook for fetching countries by holiday type
export const useCountriesByHolidayType = (holidayTypeSlug: string) => {
  return useQuery<Country[]>({
    queryKey: ['countries', 'holidayType', holidayTypeSlug],
    queryFn: async () => {
      return apiClient.get<Country[]>(endpoints.countries.byHolidayType(holidayTypeSlug));
    },
    enabled: !!holidayTypeSlug,
  });
};

// Hook for fetching country visit info
export const useCountryVisitInfo = (countryId: number) => {
  return useQuery<CountryVisitInfo>({
    queryKey: ['country-visit-info', countryId],
    queryFn: async () => {
      return apiClient.get<CountryVisitInfo>(endpoints.countries.visitInfo(countryId));
    },
    enabled: !!countryId,
  });
};

// Hook for creating a new country (admin only)
export const useCreateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (countryData: Omit<Country, 'id' | 'created_at' | 'updated_at' | 'region'>) => {
      return apiClient.post<Country>(endpoints.countries.create(), countryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

// Hook for updating a country (admin only)
export const useUpdateCountry = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (countryData: Partial<Country>) => {
      return apiClient.put<Country>(endpoints.countries.update(id), countryData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['country', data.slug], data);
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['country-details'] });
    },
  });
};

// Hook for deleting a country (admin only)
export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(endpoints.countries.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      queryClient.invalidateQueries({ queryKey: ['country'] });
      queryClient.invalidateQueries({ queryKey: ['country-details'] });
    },
  });
};

// Hook for updating country visit info (admin only)
export const useUpdateCountryVisitInfo = (countryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (visitInfoData: Partial<CountryVisitInfo>) => {
      return apiClient.put<CountryVisitInfo>(
        endpoints.countries.updateVisitInfo(countryId),
        visitInfoData
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['country-visit-info', countryId] });
      queryClient.invalidateQueries({ queryKey: ['country-details'] });
    },
  });
};
