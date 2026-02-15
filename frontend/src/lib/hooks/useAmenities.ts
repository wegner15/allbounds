import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { Amenity, AmenityCreate, AmenityUpdate, PaginatedResponse } from '../types/api';

const AMENITIES_KEY = 'amenities';

// Fetch all amenities
export function useAmenities(page = 1, limit = 10, includeInactive = false) {
  return useQuery({
    queryKey: [AMENITIES_KEY, page, limit, includeInactive],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      const response = await apiClient.get<PaginatedResponse<Amenity>>(`/amenities?${params.toString()}`);
      return response;
    },
  });
}

// Fetch a single amenity by ID
export function useAmenity(amenityId: number | undefined) {
  return useQuery({
    queryKey: [AMENITIES_KEY, amenityId],
    queryFn: async () => {
      if (!amenityId) return null;
      const response = await apiClient.get<Amenity>(`/amenities/${amenityId}`);
      return response;
    },
    enabled: !!amenityId,
  });
}

// Fetch amenities by category
export function useAmenitiesByCategory(category: string | undefined) {
  return useQuery({
    queryKey: [AMENITIES_KEY, 'category', category],
    queryFn: async () => {
      if (!category) return [];
      const response = await apiClient.get<Amenity[]>(`/amenities/category/${category}`);
      return response;
    },
    enabled: !!category,
  });
}

// Create amenity mutation
export function useCreateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AmenityCreate) => {
      const response = await apiClient.post<Amenity>('/amenities/', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMENITIES_KEY] });
    },
  });
}

// Update amenity mutation
export function useUpdateAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AmenityUpdate }) => {
      const response = await apiClient.put<Amenity>(`/amenities/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AMENITIES_KEY] });
      queryClient.invalidateQueries({ queryKey: [AMENITIES_KEY, variables.id] });
    },
  });
}

// Delete amenity mutation
export function useDeleteAmenity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<Amenity>(`/amenities/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AMENITIES_KEY] });
    },
  });
}
