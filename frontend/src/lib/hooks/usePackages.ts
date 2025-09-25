import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, endpoints } from '../api';
import type { Package } from '../types/api';

// Hook for fetching all packages
export const usePackages = (params?: {
  country_id?: number;
  holiday_type_id?: number;
  min_price?: number;
  max_price?: number;
  min_duration?: number;
  max_duration?: number;
  skip?: number;
  limit?: number;
  order_by?: string;
  order?: string;
}) => {
  // Build query string from params
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `${endpoints.packages.list()}?${queryString}` : endpoints.packages.list();

  return useQuery<Package[]>({
    queryKey: ['packages', params],
    queryFn: async () => {
      return apiClient.get<Package[]>(endpoint);
    },
  });
};

// Hook for fetching featured packages
export const useFeaturedPackages = (limit: number = 10) => {
  return useQuery<Package[]>({
    queryKey: ['packages', 'featured', limit],
    queryFn: async () => {
      return apiClient.get<Package[]>(`${endpoints.packages.featured()}?limit=${limit}`);
    },
  });
};

// Hook for fetching packages by country
export const usePackagesByCountry = (countryId: number) => {
  return useQuery({
    queryKey: ['packages', 'country', countryId],
    queryFn: async () => {
      return apiClient.get<Package[]>(endpoints.packages.byCountry(countryId));
    },
    enabled: !!countryId, // Only run the query if countryId is provided
  });
};

// Hook for fetching packages by holiday type
export const usePackagesByHolidayType = (holidayTypeId: number) => {
  return useQuery({
    queryKey: ['packages', 'holidayType', holidayTypeId],
    queryFn: async () => {
      return apiClient.get<Package[]>(endpoints.packages.byHolidayType(holidayTypeId));
    },
    enabled: !!holidayTypeId, // Only run the query if holidayTypeId is provided
  });
};

// Hook for fetching a single package by ID
export const usePackage = (id: number) => {
  return useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      return apiClient.get<Package>(endpoints.packages.detail(id));
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for fetching a single package by slug
export const usePackageBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['package', 'slug', slug],
    queryFn: async () => {
      return apiClient.get<Package>(endpoints.packages.bySlug(slug));
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// Hook for fetching package details with gallery by slug
export const usePackageDetailsBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['package-details', slug],
    queryFn: async () => {
      return apiClient.get<any>(`/api/v1/packages/details/${slug}`);
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
};

// Hook for fetching package details with gallery by ID
export const usePackageDetailsById = (id: number) => {
  return useQuery({
    queryKey: ['package-details', 'id', id],
    queryFn: async () => {
      // First get the basic package to get its slug
      const packageData = await apiClient.get<Package>(endpoints.packages.detail(id));
      // Then get the full details with gallery and relationships
      const detailsData = await apiClient.get<any>(`/api/v1/packages/details/${packageData.slug}`);
      // Merge the basic data with details data, ensuring we have all fields needed for editing
      return {
        ...packageData,
        ...detailsData,
        // Ensure we have the country_id from the basic package data
        country_id: packageData.country_id,
        // Map holiday_types to the format expected by the form
        holiday_types: detailsData.holiday_types || []
      };
    },
    enabled: !!id, // Only run the query if id is provided
  });
};

// Hook for creating a new package (admin only)
export const useCreatePackage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packageData: Omit<Package, 'id' | 'created_at' | 'updated_at' | 'country' | 'holiday_types'>) => {
      return apiClient.post<Package>(endpoints.packages.list(), packageData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages', 'country', data.country_id] });
    },
  });
};

// Hook for updating a package (admin only)
export const useUpdatePackage = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packageData: Partial<Package>) => {
      return apiClient.put<Package>(endpoints.packages.detail(id), packageData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['package', id], data);
      // Invalidate all packages queries
      queryClient.invalidateQueries({ queryKey: ['packages'], exact: false });
      // Also invalidate package details queries
      queryClient.invalidateQueries({ queryKey: ['package-details'], exact: false });
    },
  });
};
